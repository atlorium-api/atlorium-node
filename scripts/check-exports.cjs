/**
 * Проверяет собранный пакет через CommonJS `require` по имени пакета.
 * Запускается после `npm run build`.
 */

const assert = require('node:assert/strict');
const {
  Atlorium,
  AtloriumError,
  CronTemplateType,
  DayOfWeek,
  NotFoundError,
  PermissionDeniedError,
  SANDBOX_API_KEY,
  ServerError,
  ServiceUnavailableError,
  VERSION,
} = require('atlorium');
const { fileFromPath } = require('atlorium/node');
const pkg = require('../package.json');

assert.equal(VERSION, pkg.version, 'VERSION должен совпадать с package.json');
assert.equal(typeof Atlorium, 'function');
assert.equal(typeof fileFromPath, 'function');
assert.equal(DayOfWeek.Monday, 1);
assert.equal(CronTemplateType.Daily, 4);
assert.ok(new NotFoundError('x') instanceof AtloriumError);
assert.ok(new PermissionDeniedError('x') instanceof AtloriumError);
assert.ok(new ServiceUnavailableError('x') instanceof ServerError);
assert.equal(typeof new Atlorium({ apiKey: SANDBOX_API_KEY }).cbr.search, 'function');

console.log('CJS: ok');
