/**
 * Ручная проверка собранного SDK против живого API: по одному запросу на каждый из 23 сервисов.
 *
 * По умолчанию — только на публичном демо-ключе (ответы-моки, деньги не списываются).
 * Лимиты демо-режима равны лимитам пользователя, поэтому скрипт не повторяет запросы и
 * останавливается на первом 429. В CI по пушу не запускается.
 *
 * Запуск (после `npm run build`):
 *   npm run smoke
 *   npm run smoke -- --allow-live-key   # с ATLORIUM_API_KEY — ТРАТИТ КРЕДИТЫ
 */

import { Atlorium, AtloriumError, RateLimitError } from 'atlorium';
import { fileFromPath } from 'atlorium/node';

const png = await fileFromPath(new URL('../test/fixtures/white.png', import.meta.url));

const CHECKS = [
  ['egrul.get', (c) => c.egrul.withRawResponse.get('7707083893')],
  ['cbr.get', (c) => c.cbr.withRawResponse.get('044525225')],
  ['swift.get', (c) => c.swift.withRawResponse.get('SABRRUMM')],
  ['bin.lookup', (c) => c.bin.withRawResponse.lookup('424242')],
  ['aml.screen', (c) => c.aml.withRawResponse.screen('TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', 'TRX')],
  ['ipinfo.lookup', (c) => c.ipinfo.withRawResponse.lookup('8.8.8.8')],
  ['gar.search', (c) => c.gar.withRawResponse.search('Москва Тверская', { limit: 1 })],
  ['addressstd.standardize', (c) => c.addressstd.withRawResponse.standardize('Москва, Тверская 1')],
  ['phone.validate', (c) => c.phone.withRawResponse.validate('+79161234567')],
  ['email.validate', (c) => c.email.withRawResponse.validate('test@example.com')],
  ['ocr.recognize', (c) => c.ocr.withRawResponse.recognize(png)],
  ['dns.lookup', (c) => c.dns.withRawResponse.lookup('atlorium.com')],
  ['cidr.calculate', (c) => c.cidr.withRawResponse.calculate('192.168.1.10', 24)],
  ['cron.evaluate', (c) => c.cron.withRawResponse.evaluate('*/15 * * * *', { take: 3 })],
  ['certificate.check', (c) => c.certificate.withRawResponse.check('atlorium.com')],
  ['weather.get', (c) => c.weather.withRawResponse.get(55.7558, 37.6173)],
  ['aichat.send', (c) => c.aichat.withRawResponse.send('Привет')],
  ['geocodeforward.search', (c) => c.geocodeforward.withRawResponse.search('Москва, Тверская 1', { size: 1 })],
  ['geocodereverse.lookup', (c) => c.geocodereverse.withRawResponse.lookup(55.7558, 37.6173)],
  ['testdata.generate', (c) => c.testdata.withRawResponse.generate({ count: 2, seed: 42 })],
  ['urlcheck.check', (c) => c.urlcheck.withRawResponse.check('https://example.com')],
  ['pagespeed.audit', (c) => c.pagespeed.withRawResponse.audit('https://atlorium.com')],
  ['imagecheck.analyze', (c) => c.imagecheck.withRawResponse.analyze(png)],
];

const client = new Atlorium({ maxRetries: 0 });
if (!client.isSandbox && !process.argv.includes('--allow-live-key')) {
  console.log('Задан боевой ATLORIUM_API_KEY. Запуск с ним тратит кредиты — добавьте --allow-live-key.');
  process.exit(2);
}

let failures = 0;
for (const [name, check] of CHECKS) {
  try {
    const raw = await check(client);
    const kind = Array.isArray(raw.data) ? 'array' : typeof raw.data;
    console.log(`OK   ${name}: HTTP ${raw.status}, sandbox=${raw.isSandbox}, ${kind}`);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.log(`STOP ${name}: 429, повторить через ${error.retryAfter} с. Дальше не идём.`);
      process.exit(3);
    }
    if (!(error instanceof AtloriumError)) throw error;
    failures += 1;
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

console.log(`\nИтого: ${CHECKS.length - failures} из ${CHECKS.length} успешно.`);
process.exit(failures ? 1 : 0);
