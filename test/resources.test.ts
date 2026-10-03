/**
 * Тесты ресурсов на подменённом `fetch`: каждый из 59 методов (обычный вызов и `withRawResponse`),
 * плюс особые случаи — PDF, CSV, изображения, таймауты операций.
 *
 * Таблица `CASES` написана руками, независимо от генератора: она проверяет, что сгенерированный
 * код шлёт ровно тот запрос, который ждёт сервер. Сигнатуры вызовов заодно проверяет `tsc`.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  APIResource,
  Atlorium,
  CronTemplateType,
  DayOfWeek,
  NotFoundError,
  type ApiResponse,
  type Egrul,
} from '../src/index';
import { fileFromPath } from '../src/node';
import { json, makeClient, recorder } from './helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

const NO_BODY = Symbol('no body');
const b64 = (text: string | Uint8Array) => Buffer.from(text).toString('base64');
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

interface Case {
  id: string;
  http: string;
  /** Маршрут как в спеке — для сверки покрытия. */
  route: string;
  /** Раскодированный путь запроса. */
  path: string;
  call: (client: Atlorium) => Promise<unknown>;
  query: Record<string, string>;
  body: unknown;
}

const c = (
  id: string,
  http: string,
  route: string,
  path: string,
  call: Case['call'],
  query: Record<string, string> = {},
  body: unknown = NO_BODY,
): Case => ({ id, http, route, path, call, query, body });

// prettier-ignore
const CASES: Case[] = [
  // ЕГРЮЛ
  c('egrul.get', 'GET', '/api/egrul/{query}', '/api/egrul/7707083893', (x) => x.egrul.get('7707083893', { extended: true }), { extended: 'true' }),
  c('egrul.search', 'GET', '/api/egrul/search', '/api/egrul/search', (x) => x.egrul.search('Сбербанк', { limit: 5 }), { query: 'Сбербанк', limit: '5' }),
  c('egrul.getExcerpt', 'GET', '/api/egrul/{query}/excerpt', '/api/egrul/7707083893/excerpt', (x) => x.egrul.getExcerpt('7707083893')),
  // БИК
  c('cbr.get', 'GET', '/api/cbr/{bik}', '/api/cbr/044525225', (x) => x.cbr.get('044525225')),
  c('cbr.search', 'GET', '/api/cbr/search', '/api/cbr/search', (x) => x.cbr.search('Сбер', { limit: 3 }), { query: 'Сбер', limit: '3' }),
  c('cbr.getStats', 'GET', '/api/cbr/stats', '/api/cbr/stats', (x) => x.cbr.getStats()),
  // SWIFT
  c('swift.get', 'GET', '/api/swift/{bic}', '/api/swift/SABRRUMM', (x) => x.swift.get('SABRRUMM')),
  c('swift.search', 'GET', '/api/swift/search', '/api/swift/search', (x) => x.swift.search('Sberbank'), { query: 'Sberbank' }),
  c('swift.validate', 'GET', '/api/swift/validate/{bic}', '/api/swift/validate/SABRRUMMXXX', (x) => x.swift.validate('SABRRUMMXXX')),
  c('swift.getStats', 'GET', '/api/swift/stats', '/api/swift/stats', (x) => x.swift.getStats()),
  // BIN
  c('bin.lookup', 'GET', '/api/bin/{bin}', '/api/bin/424242', (x) => x.bin.lookup('424242', { customerIp: '8.8.8.8' }), { customerIp: '8.8.8.8' }),
  c('bin.validate', 'GET', '/api/bin/validate/{bin}', '/api/bin/validate/424242', (x) => x.bin.validate('424242')),
  // AML
  c('aml.screen', 'POST', '/api/aml/screen', '/api/aml/screen', (x) => x.aml.screen('TXyz', 'TRX'), {}, { walletAddress: 'TXyz', blockchain: 'TRX' }),
  c('aml.validate', 'GET', '/api/aml/validate', '/api/aml/validate', (x) => x.aml.validate('TXyz', 'TRX'), { walletAddress: 'TXyz', blockchain: 'TRX' }),
  // IP
  c('ipinfo.lookup', 'GET', '/api/ipinfo/{ip}', '/api/ipinfo/8.8.8.8', (x) => x.ipinfo.lookup('8.8.8.8', { extended: false }), { extended: 'false' }),
  // ГАР
  c('gar.search', 'GET', '/api/gar/search', '/api/gar/search', (x) => x.gar.search('Москва Тверская', { limit: 2 }), { query: 'Москва Тверская', limit: '2' }),
  c('gar.suggest', 'GET', '/api/gar/suggest', '/api/gar/suggest', (x) => x.gar.suggest('Твер'), { query: 'Твер' }),
  c('gar.getObject', 'GET', '/api/gar/object/{guid}', '/api/gar/object/0c5b2444-70a0-4932-980c-b4dc0d3f02b5', (x) => x.gar.getObject('0c5b2444-70a0-4932-980c-b4dc0d3f02b5')),
  c('gar.getObjectById', 'GET', '/api/gar/object/id/{objectId}', '/api/gar/object/id/1234567', (x) => x.gar.getObjectById(1234567)),
  c('gar.getChildren', 'GET', '/api/gar/children/{parentObjectId}', '/api/gar/children/1405113', (x) => x.gar.getChildren(1405113, { limit: 10 }), { limit: '10' }),
  c('gar.getHierarchy', 'GET', '/api/gar/hierarchy/{objectId}', '/api/gar/hierarchy/1405113', (x) => x.gar.getHierarchy('1405113')),
  c('gar.getStats', 'GET', '/api/gar/stats', '/api/gar/stats', (x) => x.gar.getStats()),
  c('gar.listRegions', 'GET', '/api/gar/regions', '/api/gar/regions', (x) => x.gar.listRegions()),
  c('gar.getRegionStats', 'GET', '/api/gar/region/{regionCode}/stats', '/api/gar/region/77/stats', (x) => x.gar.getRegionStats('77')),
  // Стандартизация адреса, телефон, почта
  c('addressstd.standardize', 'GET', '/api/addressstd', '/api/addressstd', (x) => x.addressstd.standardize('москва тверская 1', { region: 77, bind: true, geocode: false }), { address: 'москва тверская 1', region: '77', bind: 'true', geocode: 'false' }),
  c('phone.validate', 'GET', '/api/phone/{number}', '/api/phone/+79161234567', (x) => x.phone.validate('+79161234567', { countryCode: 'RU' }), { countryCode: 'RU' }),
  c('email.validate', 'GET', '/api/emailvalidation', '/api/emailvalidation', (x) => x.email.validate('test@example.com'), { email: 'test@example.com' }),
  // OCR
  c('ocr.recognize', 'POST', '/api/ocr/image-to-text', '/api/ocr/image-to-text', (x) => x.ocr.recognize(png, { mode: 'auto' }), {}, { image: b64(png), mode: 'auto' }),
  // DNS
  c('dns.lookup', 'GET', '/api/dns/lookup', '/api/dns/lookup', (x) => x.dns.lookup('atlorium.com', { resolver: '1.1.1.1' }), { domain: 'atlorium.com', resolver: '1.1.1.1' }),
  c('dns.checkPropagation', 'GET', '/api/dns/propagation', '/api/dns/propagation', (x) => x.dns.checkPropagation('atlorium.com', { resolvers: ['1.1.1.1', '8.8.8.8'] }), { domain: 'atlorium.com', resolvers: '1.1.1.1,8.8.8.8' }),
  // CIDR
  c('cidr.calculate', 'GET', '/api/cidr/calculate', '/api/cidr/calculate', (x) => x.cidr.calculate('192.168.1.10', 24), { ip: '192.168.1.10', mask: '24' }),
  c('cidr.split', 'GET', '/api/cidr/subnets', '/api/cidr/subnets', (x) => x.cidr.split('10.0.0.0/24', 26), { cidr: '10.0.0.0/24', newMask: '26' }),
  c('cidr.check', 'GET', '/api/cidr/check', '/api/cidr/check', (x) => x.cidr.check('10.0.0.0/8', '10.1.2.3'), { cidr: '10.0.0.0/8', ip: '10.1.2.3' }),
  c('cidr.supernet', 'POST', '/api/cidr/supernet', '/api/cidr/supernet', (x) => x.cidr.supernet(['10.0.0.0/24', '10.0.1.0/24']), {}, { inputs: ['10.0.0.0/24', '10.0.1.0/24'] }),
  // Cron
  c('cron.evaluate', 'POST', '/api/cron/evaluate', '/api/cron/evaluate', (x) => x.cron.evaluate('*/15 * * * *', { timeZoneId: 'Europe/Moscow', take: 3 }), {}, { expression: '*/15 * * * *', timeZoneId: 'Europe/Moscow', take: 3 }),
  c('cron.build', 'POST', '/api/cron/build', '/api/cron/build', (x) => x.cron.build({ template: CronTemplateType.Weekly, timeOfDay: '09:30:00', weekDays: [DayOfWeek.Monday, DayOfWeek.Friday] }), {}, { template: 5, timeOfDay: '09:30:00', weekDays: [1, 5] }),
  // SSL
  c('certificate.check', 'GET', '/api/certificate', '/api/certificate', (x) => x.certificate.check('atlorium.com', { port: 443 }), { host: 'atlorium.com', port: '443' }),
  c('certificate.checkUrl', 'GET', '/api/certificate/url', '/api/certificate/url', (x) => x.certificate.checkUrl('https://atlorium.com'), { url: 'https://atlorium.com' }),
  c('certificate.checkBatch', 'GET', '/api/certificate/batch', '/api/certificate/batch', (x) => x.certificate.checkBatch(['a.ru', 'b.ru']), { hosts: 'a.ru,b.ru' }),
  // Погода
  c('weather.get', 'GET', '/api/weather', '/api/weather', (x) => x.weather.get(55.75, 37.62), { latitude: '55.75', longitude: '37.62' }),
  // ИИ-чат
  c('aichat.send', 'POST', '/api/aichat/send', '/api/aichat/send', (x) => x.aichat.send('Привет', { sessionId: 'abc' }), {}, { message: 'Привет', sessionId: 'abc' }),
  c('aichat.getSession', 'GET', '/api/aichat/session/{sessionId}', '/api/aichat/session/abc', (x) => x.aichat.getSession('abc')),
  c('aichat.deleteSession', 'DELETE', '/api/aichat/session/{sessionId}', '/api/aichat/session/abc', (x) => x.aichat.deleteSession('abc')),
  c('aichat.listModels', 'GET', '/api/aichat/models', '/api/aichat/models', (x) => x.aichat.listModels()),
  // Прямой геокодинг
  c('geocodeforward.search', 'GET', '/api/geocodeforward', '/api/geocodeforward', (x) => x.geocodeforward.search('Москва, Тверская 1', { size: 1, exactOnly: true }), { text: 'Москва, Тверская 1', size: '1', exactOnly: 'true' }),
  c('geocodeforward.searchStructured', 'GET', '/api/geocodeforward/structured', '/api/geocodeforward/structured', (x) => x.geocodeforward.searchStructured({ address: 'Тверская 1', locality: 'Москва', postalCode: '125009' }), { address: 'Тверская 1', locality: 'Москва', postalCode: '125009' }),
  c('geocodeforward.searchBatch', 'POST', '/api/geocodeforward/batch', '/api/geocodeforward/batch', (x) => x.geocodeforward.searchBatch(['Москва', 'Казань'], { sizePerQuery: 2 }), {}, { queries: ['Москва', 'Казань'], sizePerQuery: 2 }),
  c('geocodeforward.getPlace', 'GET', '/api/geocodeforward/place', '/api/geocodeforward/place', (x) => x.geocodeforward.getPlace('osm:123', { includeBoundary: true }), { placeId: 'osm:123', includeBoundary: 'true' }),
  c('geocodeforward.searchPostcode', 'GET', '/api/geocodeforward/postcode', '/api/geocodeforward/postcode', (x) => x.geocodeforward.searchPostcode('125009'), { code: '125009' }),
  // Обратный геокодинг
  c('geocodereverse.lookup', 'GET', '/api/geocodereverse', '/api/geocodereverse', (x) => x.geocodereverse.lookup(55.75, 37.62, { includeAdmin: true }), { lat: '55.75', lon: '37.62', includeAdmin: 'true' }),
  c('geocodereverse.nearby', 'GET', '/api/geocodereverse/nearby', '/api/geocodereverse/nearby', (x) => x.geocodereverse.nearby(55.75, 37.62, { radiusKm: 1.5, size: 5 }), { lat: '55.75', lon: '37.62', radiusKm: '1.5', size: '5' }),
  // Тестовые данные
  c('testdata.generate', 'GET', '/api/testdata', '/api/testdata', (x) => x.testdata.generate({ count: 2, fields: ['fullName', 'innPerson'], seed: 42 }), { count: '2', fields: 'fullName,innPerson', seed: '42' }),
  c('testdata.generateWithBody', 'POST', '/api/testdata', '/api/testdata', (x) => x.testdata.generateWithBody({ count: 2, fields: ['fullName'], gender: 'female' }), {}, { count: 2, fields: ['fullName'], gender: 'female' }),
  c('testdata.listFields', 'GET', '/api/testdata/fields', '/api/testdata/fields', (x) => x.testdata.listFields()),
  // Проверка ссылок
  c('urlcheck.check', 'GET', '/api/urlcheck', '/api/urlcheck', (x) => x.urlcheck.check('https://example.com'), { url: 'https://example.com' }),
  c('urlcheck.checkBatch', 'POST', '/api/urlcheck/batch', '/api/urlcheck/batch', (x) => x.urlcheck.checkBatch(['https://a.ru', 'https://b.ru']), {}, ['https://a.ru', 'https://b.ru']),
  // Аудит сайта
  c('pagespeed.audit', 'GET', '/api/pagespeed', '/api/pagespeed', (x) => x.pagespeed.audit('https://atlorium.com', { strategy: 'mobile', forceRefresh: true }), { url: 'https://atlorium.com', strategy: 'mobile', forceRefresh: 'true' }),
  c('pagespeed.auditBatch', 'POST', '/api/pagespeed/batch', '/api/pagespeed/batch', (x) => x.pagespeed.auditBatch(['https://a.ru'], { strategy: 'desktop' }), { strategy: 'desktop' }, ['https://a.ru']),
  // Модерация изображений
  c('imagecheck.analyze', 'POST', '/api/imagecheck', '/api/imagecheck', (x) => x.imagecheck.analyze(new TextEncoder().encode('img'), { includeWebSearch: true }), {}, { image: b64('img'), includeWebSearch: true }),
];

function specRoutes(): Set<string> {
  const routes = new Set<string>();
  const dir = new URL('../spec/', import.meta.url);
  for (const file of readdirSync(dir).filter((name) => name.endsWith('_ru.json'))) {
    const spec = JSON.parse(readFileSync(new URL(file, dir), 'utf8')) as { paths: Record<string, Record<string, unknown>> };
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const method of Object.keys(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) routes.add(`${method.toUpperCase()} ${path.toLowerCase()}`);
      }
    }
  }
  return routes;
}

/** Тот же клиент, но `client.<сервис>` отдаёт `withRawResponse`-вариант ресурса. */
function rawView(client: Atlorium): Atlorium {
  return new Proxy(client, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver);
      return value instanceof APIResource && 'withRawResponse' in value ? value.withRawResponse : value;
    },
  });
}

function checkRequest(testCase: Case, calls: ReturnType<typeof recorder>['calls']): void {
  expect(calls).toHaveLength(1);
  const request = calls[0]!;
  expect(request.method).toBe(testCase.http);
  expect(decodeURIComponent(request.url.pathname)).toBe(testCase.path);
  expect(Object.fromEntries(request.url.searchParams)).toEqual(testCase.query);
  expect(request.headers.get('Authorization')).toBe('Bearer ak_test');
  if (testCase.body === NO_BODY) {
    expect(request.body).toBeUndefined();
  } else {
    expect(request.headers.get('Content-Type')).toBe('application/json');
    expect(JSON.parse(request.body ?? '')).toEqual(testCase.body);
  }
}

describe('покрытие', () => {
  it('у каждой операции спеки есть тест', () => {
    expect(CASES).toHaveLength(59);
    expect(new Set(CASES.map((testCase) => `${testCase.http} ${testCase.route.toLowerCase()}`))).toEqual(specRoutes());
    expect(new Set(CASES.map((testCase) => testCase.id)).size).toBe(CASES.length);
  });
});

describe.each(CASES)('$id', (testCase) => {
  it('обычный вызов', async () => {
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch);
    await testCase.call(client);
    checkRequest(testCase, calls);
  });

  it('withRawResponse', async () => {
    const { calls, fetch } = recorder(() => json({ ok: true }, { headers: { 'X-Atlorium-Sandbox': 'true' } }));
    const { client } = makeClient(fetch);
    const raw = (await testCase.call(rawView(client))) as ApiResponse<unknown>;
    checkRequest(testCase, calls);
    expect(raw.status).toBe(200);
    expect(raw.isSandbox).toBe(true);
  });
});

describe('форма запросов', () => {
  it('сегменты пути экранируются', async () => {
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch);
    await client.phone.validate('+7 916 123-45-67');
    await client.egrul.get('ООО/Ромашка');
    expect(calls[0]?.url.pathname).toBe('/api/phone/%2B7%20916%20123-45-67');
    expect(calls[1]?.url.pathname.startsWith('/api/egrul/%D0%9E%D0%9E%D0%9E%2F')).toBe(true);
  });

  it('одна строка вместо массива не разбивается на символы', async () => {
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch);
    await client.urlcheck.checkBatch('https://a.ru');
    await client.certificate.checkBatch('a.ru');
    await client.cidr.supernet('10.0.0.0/24');
    expect(JSON.parse(calls[0]?.body ?? '')).toEqual(['https://a.ru']);
    expect(calls[1]?.url.searchParams.get('hosts')).toBe('a.ru');
    expect(JSON.parse(calls[2]?.body ?? '')).toEqual({ inputs: ['10.0.0.0/24'] });
  });

  it('необязательные параметры не отправляются', async () => {
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch);
    await client.geocodereverse.lookup(55.75, 37.62);
    await client.aichat.send('Привет');
    expect(Object.fromEntries(calls[0]!.url.searchParams)).toEqual({ lat: '55.75', lon: '37.62' });
    expect(JSON.parse(calls[1]?.body ?? '')).toEqual({ message: 'Привет' });
  });
});

describe('ответы', () => {
  const fixture = (name: string): unknown => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));

  it.each([
    ['egrul', 'CompanyLookupResult'],
    ['testdata', 'TestDataResponse'],
    ['aichat', 'AiChatResponse'],
    ['cron', 'CronEvaluationResult'],
    ['dns', 'DnsLookupResponse'],
  ])('живой ответ %s не содержит полей вне схемы %s', (service, schema) => {
    const spec = JSON.parse(readFileSync(new URL(`../spec/${service}_ru.json`, import.meta.url), 'utf8')) as {
      components: { schemas: Record<string, { properties: Record<string, unknown> }> };
    };
    const described = Object.keys(spec.components.schemas[schema]!.properties);
    expect(described).toEqual(expect.arrayContaining(Object.keys(fixture(service) as object)));
  });

  it('типизированный ответ из живой фикстуры', async () => {
    const { fetch } = recorder(() => json(fixture('egrul')));
    const { client } = makeClient(fetch);
    const card: Egrul.CompanyLookupResult = await client.egrul.get('7707083893');
    expect(card.inn).toBe('7707083893');
    expect(card.primaryOkved?.code).toBe('62.01');
  });

  it('выписка ЕГРЮЛ — байты PDF', async () => {
    const { fetch } = recorder(() => new Response('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf' } }));
    const { client } = makeClient(fetch);
    const pdf: Uint8Array = await client.egrul.getExcerpt('7707083893');
    expect(new TextDecoder().decode(pdf)).toBe('%PDF-1.7');
  });

  it("testdata: format 'csv' возвращает строку", async () => {
    const csv = 'fullName;innPerson\nИванов Иван;026881836682\n';
    const { calls, fetch } = recorder(() => new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } }));
    const { client } = makeClient(fetch);
    const fromQuery: string = await client.testdata.generate({ format: 'csv', count: 1 });
    const fromBody: string = await client.testdata.generateWithBody({ format: 'csv' });
    expect(fromQuery).toBe(csv);
    expect(fromBody).toBe(csv);
    expect(calls[0]?.url.searchParams.get('format')).toBe('csv');
    expect(JSON.parse(calls[1]?.body ?? '')).toEqual({ format: 'csv' });
  });

  it('testdata: JSON и сид в заголовке', async () => {
    const { fetch } = recorder(() => json(fixture('testdata'), { headers: { 'X-Atlorium-Seed': '42' } }));
    const { client } = makeClient(fetch);
    const result = await client.testdata.generate({ count: 2, seed: 42 });
    expect(result.records[0]?.fullName).toBeTruthy();
    const raw = await client.testdata.withRawResponse.generate({ count: 2, seed: 42 });
    expect(raw.headers.get('X-Atlorium-Seed')).toBe('42');
  });

  it.each([
    ['"Сессия удалена."', 'application/json; charset=utf-8'],
    ['Сессия удалена.', 'text/plain; charset=utf-8'],
  ])('deleteSession возвращает строку (%s)', async (content, contentType) => {
    const { fetch } = recorder(() => new Response(content, { headers: { 'Content-Type': contentType } }));
    const { client } = makeClient(fetch);
    await expect(client.aichat.deleteSession('abc')).resolves.toBe('Сессия удалена.');
  });

  it('ошибки ресурсов типизированы', async () => {
    const body = { error: 'not_found', title: 'Ничего не найдено', message: 'Организация не найдена в реестре' };
    const { fetch } = recorder(() => json(body, { status: 404 }));
    const { client } = makeClient(fetch);
    const error = await client.egrul.get('0000000000').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(NotFoundError);
    expect((error as NotFoundError).errorCode).toBe('not_found');
    expect((error as NotFoundError).message).toMatch(/не найдена/);
  });
});

describe('таймауты и файлы', () => {
  it.each([
    ['egrul.get', (x: Atlorium) => x.egrul.get('7707083893'), 30_000],
    ['ocr.recognize', (x: Atlorium) => x.ocr.recognize(png), 120_000],
    ['pagespeed.audit', (x: Atlorium) => x.pagespeed.audit('https://a.ru'), 120_000],
    ['pagespeed.auditBatch', (x: Atlorium) => x.pagespeed.auditBatch(['https://a.ru']), 600_000],
    ['aichat.send', (x: Atlorium) => x.aichat.send('Привет'), 660_000],
    ['imagecheck.analyze', (x: Atlorium) => x.imagecheck.analyze(png), 60_000],
  ])('таймаут по умолчанию %s', async (_, call, expected) => {
    const spy = vi.spyOn(globalThis, 'setTimeout');
    const { fetch } = recorder();
    const { client } = makeClient(fetch);
    await call(client);
    expect(spy.mock.calls.map((args) => args[1])).toEqual([expected]);
  });

  it('aichat.send: 660 с по умолчанию, явный timeout вызова важнее', async () => {
    const spy = vi.spyOn(globalThis, 'setTimeout');
    const { fetch } = recorder();
    const { client } = makeClient(fetch);
    await client.aichat.send('Привет');
    await client.aichat.send('Привет', { timeout: 1_000 });
    expect(spy.mock.calls.map((args) => args[1])).toEqual([660_000, 1_000]);
  });

  it('таймаут клиента и вызова перекрывают минимум операции', async () => {
    const spy = vi.spyOn(globalThis, 'setTimeout');
    const { fetch } = recorder();
    const { client } = makeClient(fetch, { timeout: 900_000 });
    await client.ocr.recognize(png);
    await client.ocr.recognize(png, { timeout: 5 });
    expect(spy.mock.calls.map((args) => args[1])).toEqual([900_000, 5]);
  });

  it('fileFromPath для OCR и модерации', async () => {
    const path = new URL('./fixtures/white.png', import.meta.url);
    const expected = readFileSync(path).toString('base64');
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch);
    await client.ocr.recognize(await fileFromPath(path));
    await client.imagecheck.analyze(await fileFromPath(path), { includeText: false });
    expect(JSON.parse(calls[0]?.body ?? '')).toEqual({ image: expected });
    expect(JSON.parse(calls[1]?.body ?? '')).toEqual({ image: expected, includeText: false });
  });

  it('ресурсы привязаны к своему клиенту', async () => {
    const first = recorder();
    const { client } = makeClient(first.fetch);
    const copy = client.withOptions({ maxRetries: 0 });
    expect(client.egrul.withRawResponse).toBe(client.egrul.withRawResponse);
    expect(copy.egrul).not.toBe(client.egrul);
    await copy.egrul.get('7707083893');
    expect(first.calls).toHaveLength(1);
  });
});
