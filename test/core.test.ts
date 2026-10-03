/** Тесты транспортного ядра на подменённом `fetch`. */

import { readFileSync } from 'node:fs';
import { inspect } from 'node:util';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { encodeFile } from '../src/core/files';
import { toBase64, userAgent } from '../src/core/runtime';
import {
  APIConnectionError,
  APITimeoutError,
  Atlorium,
  AtloriumError,
  AuthenticationError,
  InsufficientCreditsError,
  MAX_RETRY_DELAY_SECONDS,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  SANDBOX_API_KEY,
  ServerError,
  ServiceUnavailableError,
  ValidationError,
  VERSION,
} from '../src/index';
import { json, makeClient, recorder } from './helpers';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const get = (client: Atlorium, query: Record<string, unknown> = {}) =>
  client.request<unknown>({ method: 'GET', path: '/api/test', query: query as never });

describe('конфигурация', () => {
  it('ключ: аргумент → ATLORIUM_API_KEY → демо-ключ', () => {
    const { fetch } = recorder();
    vi.stubEnv('ATLORIUM_API_KEY', '');
    expect(new Atlorium({ fetch }).isSandbox).toBe(true);
    vi.stubEnv('ATLORIUM_API_KEY', 'ak_env_key');
    expect(new Atlorium({ fetch }).isSandbox).toBe(false);
    expect(new Atlorium({ fetch, apiKey: SANDBOX_API_KEY }).isSandbox).toBe(true);
  });

  it('без ключа — одно предупреждение о демо-режиме на процесс; явный ключ не предупреждает', async () => {
    vi.resetModules();
    const fresh = await import('../src/index');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fetch } = recorder();
    vi.stubEnv('ATLORIUM_API_KEY', '');
    new fresh.Atlorium({ fetch, apiKey: fresh.SANDBOX_API_KEY });
    new fresh.Atlorium({ fetch, apiKey: 'ak_explicit_key' }).withOptions({ timeout: 5_000 });
    expect(warn).not.toHaveBeenCalled();
    expect(new fresh.Atlorium({ fetch, apiKey: '  ' }).isSandbox).toBe(true);
    new fresh.Atlorium({ fetch });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('демо-ключе');
  });

  it('ключ не виден в JSON, inspect и ошибках', async () => {
    const { fetch } = recorder(() => json({ message: 'нет' }, { status: 401 }));
    const client = new Atlorium({ apiKey: 'ak_secret_value', fetch, maxRetries: 0 });
    expect(JSON.stringify(client)).not.toContain('ak_secret_value');
    expect(inspect(client, { depth: 5 })).not.toContain('ak_secret_value');
    const error = await get(client).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(String(error)).not.toContain('ak_secret_value');
  });

  it('адрес из ATLORIUM_BASE_URL, хвостовой слэш убирается', async () => {
    vi.stubEnv('ATLORIUM_BASE_URL', 'https://example.test/');
    const { calls, fetch } = recorder();
    await get(new Atlorium({ fetch }));
    expect(calls[0]?.url.origin).toBe('https://example.test');
  });

  it('некорректные настройки отклоняются', () => {
    const { fetch } = recorder();
    expect(() => new Atlorium({ fetch, maxRetries: -1 })).toThrow(RangeError);
    expect(() => new Atlorium({ fetch, timeout: 0 })).toThrow(RangeError);
  });

  it('VERSION совпадает с package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
    expect(VERSION).toBe(pkg.version);
  });
});

describe('запрос', () => {
  it('заголовки и сериализация query', async () => {
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch);
    await get(client, {
      flag: true,
      off: false,
      skip: undefined,
      nothing: null,
      items: ['a', 'b'],
      n: 5,
      x: 55.75,
      at: new Date('2026-01-02T03:04:05Z'),
    });
    const request = calls[0]!;
    expect(request.headers.get('Authorization')).toBe('Bearer ak_test');
    expect(request.headers.get('Accept')).toBe('application/json');
    expect(request.headers.get('User-Agent')).toMatch(new RegExp(`^atlorium-node/${VERSION} \\(node/`));
    expect(Object.fromEntries(request.url.searchParams)).toEqual({
      flag: 'true',
      off: 'false',
      items: 'a,b',
      n: '5',
      x: '55.75',
      at: '2026-01-02T03:04:05.000Z',
    });
  });

  it('User-Agent: Deno распознаётся раньше Node (в Deno 2 есть process.versions.node)', () => {
    vi.stubGlobal('Deno', { version: { deno: '2.5.0' } });
    try {
      expect(userAgent('1.2.3')).toBe('atlorium-node/1.2.3 (deno/2.5.0)');
    } finally {
      vi.unstubAllGlobals();
    }
    expect(userAgent('1.2.3')).toMatch(/^atlorium-node\/1\.2\.3 \(node\//);
  });

  it('тело — JSON в UTF-8', async () => {
    const { calls, fetch } = recorder((request) => json(JSON.parse(request.body ?? 'null')));
    const { client } = makeClient(fetch);
    const result = await client.request({ method: 'POST', path: '/api/x', body: { message: 'Привет' }, hasBody: true });
    expect(result).toEqual({ message: 'Привет' });
    expect(calls[0]?.headers.get('Content-Type')).toBe('application/json');
  });

  it('заголовки вызова добавляются, но Authorization не перекрывают', async () => {
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch, { defaultHeaders: { 'X-App': 'crm' } });
    await client.request({ method: 'GET', path: '/a', headers: { 'X-Trace': '1', Authorization: 'Bearer other' } });
    expect(calls[0]?.headers.get('X-App')).toBe('crm');
    expect(calls[0]?.headers.get('X-Trace')).toBe('1');
    expect(calls[0]?.headers.get('Authorization')).toBe('Bearer ak_test');
  });
});

describe('ошибки', () => {
  it.each([
    [400, ValidationError],
    [401, AuthenticationError],
    [402, InsufficientCreditsError],
    [403, PermissionDeniedError],
    [404, NotFoundError],
    [500, ServerError],
    [501, ServerError],
    [418, AtloriumError],
  ])('HTTP %i → %o, без повторов', async (status, ErrorClass) => {
    const body = { error: 'bad_request', title: 'Заголовок', message: 'Сообщение сервера', balance: 1.5 };
    const { calls, fetch } = recorder(() => json(body, { status, headers: { 'X-Request-Id': 'req-1' } }));
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    const error = (await get(client).catch((caught: unknown) => caught)) as AtloriumError;
    expect(error).toBeInstanceOf(ErrorClass);
    expect(calls).toHaveLength(1);
    expect(sleeps).toEqual([]);
    expect(error.status).toBe(status);
    expect(error.requestId).toBe('req-1');
    expect(error.errorCode).toBe('bad_request');
    expect(error.title).toBe('Заголовок');
    expect(error.message).toContain('Сообщение сервера');
    expect(error.name).toBe(ErrorClass.name);
    if (error instanceof InsufficientCreditsError) expect(error.balance).toBe(1.5);
  });

  it('403 service_not_in_account_terms → PermissionDeniedError, один запрос, сообщение с адресом поддержки', async () => {
    const { calls, fetch } = recorder(() => json({ error: 'service_not_in_account_terms' }, { status: 403 }));
    const { client, sleeps } = makeClient(fetch, { maxRetries: 3 });
    const error = (await get(client).catch((caught: unknown) => caught)) as PermissionDeniedError;
    expect(error).toBeInstanceOf(PermissionDeniedError);
    expect(error).toBeInstanceOf(AtloriumError);
    expect(error.errorCode).toBe('service_not_in_account_terms');
    expect(error.message).toContain('support@atlorium.com');
    expect(calls).toHaveLength(1);
    expect(sleeps).toEqual([]);
  });

  it('ServiceUnavailableError — наследник ServerError', () => {
    const error = new ServiceUnavailableError('x', { status: 503 });
    expect(error).toBeInstanceOf(ServerError);
    expect(error).toBeInstanceOf(AtloriumError);
    expect(error.name).toBe('ServiceUnavailableError');
  });

  it('retryAfter есть у любой ошибки, по умолчанию null', () => {
    expect(new AtloriumError('x').retryAfter).toBeNull();
    expect(new NotFoundError('x', { retryAfter: 5 }).retryAfter).toBe(5);
  });

  it('текстовое тело ошибки', async () => {
    const { fetch } = recorder(() => new Response('Hosts parameter is required.', { status: 400 }));
    const { client } = makeClient(fetch);
    await expect(get(client)).rejects.toThrow(/Hosts parameter is required/);
  });

  it('некорректный JSON в успешном ответе', async () => {
    const { fetch } = recorder(() => new Response('{oops', { headers: { 'Content-Type': 'application/json' } }));
    const { client } = makeClient(fetch);
    await expect(get(client)).rejects.toThrow(AtloriumError);
  });
});

describe('ретраи', () => {
  it('503 повторяется, потом успех', async () => {
    const responses = [new Response('down', { status: 503 }), new Response('down', { status: 503 }), json([1])];
    const { fetch } = recorder(() => responses.shift()!);
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    await expect(get(client)).resolves.toEqual([1]);
    expect(sleeps).toHaveLength(2);
    for (const delay of sleeps) expect(delay).toBeGreaterThan(0);
    for (const delay of sleeps) expect(delay).toBeLessThanOrEqual(10_000);
  });

  it('503 — сообщение о том, что деньги не списываются', async () => {
    const { fetch } = recorder(() => new Response('down', { status: 503 }));
    const { client, sleeps } = makeClient(fetch, { maxRetries: 1 });
    await expect(get(client)).rejects.toThrow(ServiceUnavailableError);
    await expect(get(client)).rejects.toThrow(/не списываются/);
    expect(sleeps).toHaveLength(2);
  });

  it.each(['service_disabled', 'maintenance'])('503 %s (плановые работы) не повторяется', async (code) => {
    const { calls, fetch } = recorder(() => json({ error: code }, { status: 503, headers: { 'Retry-After': '30' } }));
    const { client, sleeps } = makeClient(fetch, { maxRetries: 3 });
    const error = (await get(client).catch((caught: unknown) => caught)) as ServiceUnavailableError;
    expect(error).toBeInstanceOf(ServiceUnavailableError);
    expect(error).toBeInstanceOf(ServerError);
    expect(error.errorCode).toBe(code);
    expect(error.retryAfter).toBe(30);
    expect(calls).toHaveLength(1);
    expect(sleeps).toEqual([]);
  });

  it('503 с другим кодом повторяется до исчерпания попыток; retryAfter у ошибки', async () => {
    const { calls, fetch } = recorder(() =>
      json({ error: 'upstream_unavailable' }, { status: 503, headers: { 'Retry-After': '2' } }),
    );
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    const error = (await get(client).catch((caught: unknown) => caught)) as ServiceUnavailableError;
    expect(error).toBeInstanceOf(ServiceUnavailableError);
    expect(error).toBeInstanceOf(ServerError);
    expect(error.retryAfter).toBe(2);
    expect(calls).toHaveLength(3);
    expect(sleeps).toEqual([2000, 2000]);
  });

  it('заглушка сайта: 503 с долгим Retry-After — ServiceUnavailableError сразу', async () => {
    const wait = String(MAX_RETRY_DELAY_SECONDS + 1);
    const { calls, fetch } = recorder(() =>
      json({ error: 'ServiceUnavailable' }, { status: 503, headers: { 'Retry-After': wait } }),
    );
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    const error = (await get(client).catch((caught: unknown) => caught)) as ServiceUnavailableError;
    expect(error).toBeInstanceOf(ServiceUnavailableError);
    expect(error.retryAfter).toBe(Number(wait));
    expect(calls).toHaveLength(1);
    expect(sleeps).toEqual([]);
  });

  it('429 уважает Retry-After из заголовка', async () => {
    const responses = [new Response(null, { status: 429, headers: { 'Retry-After': '3' } }), json({ a: 1 })];
    const { fetch } = recorder(() => responses.shift()!);
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    await expect(get(client)).resolves.toEqual({ a: 1 });
    expect(sleeps).toEqual([3000]);
  });

  it('429 берёт задержку из тела', async () => {
    const responses = [json({ error: 'rate_limited_client', retryAfterSeconds: 2 }, { status: 429 }), json({})];
    const { fetch } = recorder(() => responses.shift()!);
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    await get(client);
    expect(sleeps).toEqual([2000]);
  });

  it('слишком долгий Retry-After — ошибка сразу', async () => {
    const wait = String(MAX_RETRY_DELAY_SECONDS + 1);
    const { fetch } = recorder(() => new Response(null, { status: 429, headers: { 'Retry-After': wait } }));
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    const error = (await get(client).catch((caught: unknown) => caught)) as RateLimitError;
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfter).toBe(Number(wait));
    expect(sleeps).toEqual([]);
  });

  it('429 исчерпывает попытки', async () => {
    const { calls, fetch } = recorder(() => new Response(null, { status: 429 }));
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    await expect(get(client)).rejects.toThrow(RateLimitError);
    expect(calls).toHaveLength(3);
    expect(sleeps).toHaveLength(2);
  });

  it('сетевые ошибки повторяются и превращаются в APIConnectionError', async () => {
    const { calls, fetch } = recorder(() => {
      throw new TypeError('fetch failed');
    });
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    const error = await get(client).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(APIConnectionError);
    expect((error as Error).cause).toBeInstanceOf(TypeError);
    expect(calls).toHaveLength(3);
    expect(sleeps).toHaveLength(2);
  });

  const post = (client: Atlorium) =>
    client.request<unknown>({ method: 'POST', path: '/api/test', body: {}, hasBody: true });

  const connectionFailure = (code: string) => () => {
    throw new TypeError('fetch failed', { cause: Object.assign(new Error(code), { code }) });
  };

  it('POST повторяется, только если соединение не установилось', async () => {
    let attempts = 0;
    const { fetch } = recorder((request) => {
      attempts += 1;
      if (attempts < 3) connectionFailure(attempts === 1 ? 'ECONNREFUSED' : 'UND_ERR_CONNECT_TIMEOUT')();
      return json({ ok: request.method });
    });
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    expect(await post(client)).toEqual({ ok: 'POST' });
    expect(sleeps).toHaveLength(2);
  });

  it('POST не повторяется после обрыва или таймаута: операция могла выполниться', async () => {
    for (const respond of [
      connectionFailure('ECONNRESET'),
      connectionFailure('UND_ERR_SOCKET'),
      () => {
        throw new TypeError('fetch failed');
      },
    ]) {
      const { calls, fetch } = recorder(respond);
      const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
      await expect(post(client)).rejects.toThrow(APIConnectionError);
      expect(calls).toHaveLength(1);
      expect(sleeps).toEqual([]);
    }

    const { calls, fetch } = recorder(
      (request) =>
        new Promise<Response>((_, reject) => {
          request.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        }),
    );
    const { client } = makeClient(fetch, { maxRetries: 2, timeout: 20 });
    await expect(post(client)).rejects.toThrow(APITimeoutError);
    expect(calls).toHaveLength(1);
  });

  it('POST повторяется на 429 и 503', async () => {
    const statuses = [429, 503, 200];
    const { calls, fetch } = recorder(() => json({}, { status: statuses[calls.length - 1] ?? 200 }));
    const { client, sleeps } = makeClient(fetch, { maxRetries: 2 });
    expect(await post(client)).toEqual({});
    expect(calls).toHaveLength(3);
    expect(sleeps).toHaveLength(2);
  });

  it('отмена во время паузы перед повтором прерывает ожидание', async () => {
    const controller = new AbortController();
    const { calls, fetch } = recorder(() => new Response(null, { status: 503, headers: { 'Retry-After': '60' } }));
    const client = new Atlorium({ apiKey: 'ak_test', fetch, maxRetries: 2 });
    const started = Date.now();
    const pending = client.request({ method: 'GET', path: '/a', signal: controller.signal }).catch((caught: unknown) => caught);
    setTimeout(() => controller.abort(new Error('стоп')), 20);
    const error = await pending;
    expect((error as Error).message).toBe('стоп');
    expect(calls).toHaveLength(1);
    expect(Date.now() - started).toBeLessThan(5_000);
  });

  it('таймаут → APITimeoutError', async () => {
    const { fetch } = recorder(
      (request) =>
        new Promise<Response>((_, reject) => {
          request.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        }),
    );
    const { client } = makeClient(fetch, { timeout: 20 });
    const error = await get(client).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(APITimeoutError);
    expect(error).toBeInstanceOf(APIConnectionError);
  });

  it('отмена через signal не повторяется и не оборачивается', async () => {
    const controller = new AbortController();
    const { calls, fetch } = recorder(
      (request) =>
        new Promise<Response>((_, reject) => {
          request.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
          controller.abort(new Error('пользователь передумал'));
        }),
    );
    const { client, sleeps } = makeClient(fetch, { maxRetries: 3 });
    const error = await client
      .request({ method: 'GET', path: '/a', signal: controller.signal })
      .catch((caught: unknown) => caught);
    expect(error).not.toBeInstanceOf(AtloriumError);
    expect((error as Error).message).toBe('пользователь передумал');
    expect(calls).toHaveLength(1);
    expect(sleeps).toEqual([]);
  });

  it('таймаут: вызов > минимум операции > клиент', async () => {
    const spy = vi.spyOn(globalThis, 'setTimeout');
    const { fetch } = recorder();
    const { client } = makeClient(fetch, { timeout: 10_000 });
    await client.request({ method: 'GET', path: '/a' });
    await client.request({ method: 'GET', path: '/a', defaultTimeout: 600_000 });
    await client.request({ method: 'GET', path: '/a', defaultTimeout: 600_000, timeout: 5 });
    expect(spy.mock.calls.map((call) => call[1])).toEqual([10_000, 600_000, 5]);
  });
});

describe('ответ', () => {
  it('requestRaw отдаёт метаданные', async () => {
    const headers = { 'X-Atlorium-Sandbox': 'true', 'X-RateLimit-Remaining': '7', 'X-RateLimit-Limit': '10' };
    const { fetch } = recorder(() => json({ found: true }, { headers }));
    const { client } = makeClient(fetch);
    const raw = await client.requestRaw<{ found: boolean }>({ method: 'GET', path: '/a' });
    expect(raw.data).toEqual({ found: true });
    expect(raw.status).toBe(200);
    expect(raw.isSandbox).toBe(true);
    expect(raw.rateLimit).toEqual({ limit: 10, remaining: 7, reset: null });
    expect(raw.requestId).toBeNull();
    expect(raw.retryAfter).toBeNull();
  });

  it('типы ответа: bytes, text, auto', async () => {
    const { fetch } = recorder(() => new Response('%PDF', { headers: { 'Content-Type': 'text/csv' } }));
    const { client } = makeClient(fetch);
    const bytes = await client.request<Uint8Array>({ method: 'GET', path: '/a', responseType: 'bytes' });
    expect(new TextDecoder().decode(bytes)).toBe('%PDF');
    await expect(client.request({ method: 'GET', path: '/a', responseType: 'auto' })).resolves.toBe('%PDF');
    await expect(client.request({ method: 'GET', path: '/a', responseType: 'text' })).resolves.toBe('%PDF');
  });

  it('пустое тело — null', async () => {
    const { fetch } = recorder(() => new Response(null, { status: 200 }));
    const { client } = makeClient(fetch);
    await expect(get(client)).resolves.toBeNull();
  });

  it('withOptions: те же ключ и fetch, другие настройки', async () => {
    const { calls, fetch } = recorder();
    const { client } = makeClient(fetch);
    const copy = client.withOptions({ timeout: 99, maxRetries: 5 });
    expect(copy.timeout).toBe(99);
    expect(copy.maxRetries).toBe(5);
    expect(copy.egrul).not.toBe(client.egrul);
    await get(copy);
    expect(calls[0]?.headers.get('Authorization')).toBe('Bearer ak_test');
  });
});

describe('изображения', () => {
  const png = new Uint8Array(readFileSync(new URL('./fixtures/white.png', import.meta.url)));
  const expected = Buffer.from(png).toString('base64');

  it('байты, буферы, Blob, потоки и строка', async () => {
    expect(await encodeFile(png)).toBe(expected);
    expect(await encodeFile(png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength))).toBe(expected);
    expect(await encodeFile(new DataView(png.buffer, png.byteOffset, png.byteLength))).toBe(expected);
    expect(await encodeFile(new Blob([png]))).toBe(expected);
    expect(await encodeFile(new Blob([png]).stream())).toBe(expected);
    async function* chunks(): AsyncGenerator<Uint8Array> {
      yield png.subarray(0, 10);
      yield png.subarray(10);
    }
    expect(await encodeFile(chunks())).toBe(expected);
    expect(await encodeFile(expected)).toBe(expected);
    expect(await encodeFile('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(await encodeFile('iVBORw0KGgo/AAAA+BBBB==')).toBe('iVBORw0KGgo/AAAA+BBBB==');
  });

  it('путь или ссылка вместо Base64 — понятная ошибка', async () => {
    for (const value of ['scan.png', './docs/scan.v2', 'C:\\docs\\scan', 'photo.JPG']) {
      await expect(encodeFile(value)).rejects.toThrow(/fileFromPath/);
    }
    await expect(encodeFile('https://example.com/a.png')).rejects.toThrow(/ссылку/);
  });

  it('текстовый поток отклоняется', async () => {
    async function* text(): AsyncGenerator<string> {
      yield 'не байты';
    }
    await expect(encodeFile(text() as never)).rejects.toThrow(/байты/);
  });

  it('Base64 без Buffer (браузер, edge)', () => {
    const saved = globalThis.Buffer;
    try {
      (globalThis as { Buffer?: unknown }).Buffer = undefined;
      expect(toBase64(png)).toBe(expected);
    } finally {
      globalThis.Buffer = saved;
    }
  });
});
