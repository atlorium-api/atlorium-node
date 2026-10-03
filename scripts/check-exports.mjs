/**
 * Проверяет собранный пакет через ESM-импорт по имени пакета — так, как его увидит пользователь.
 * Запускается после `npm run build`.
 */

import assert from 'node:assert/strict';
import {
  Atlorium,
  AtloriumError,
  CronTemplateType,
  Egrul,
  NotFoundError,
  PermissionDeniedError,
  SANDBOX_API_KEY,
  ServerError,
  ServiceUnavailableError,
  VERSION,
} from 'atlorium';
import { fileFromPath } from 'atlorium/node';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(VERSION, pkg.version, 'VERSION должен совпадать с package.json');
assert.equal(typeof Atlorium, 'function');
assert.equal(typeof fileFromPath, 'function');
assert.equal(CronTemplateType.Weekly, 5);
assert.equal(typeof Egrul, 'object');
assert.ok(new NotFoundError('x') instanceof AtloriumError);
assert.ok(new PermissionDeniedError('x') instanceof AtloriumError);
assert.ok(new ServiceUnavailableError('x') instanceof ServerError);

const client = new Atlorium({ apiKey: SANDBOX_API_KEY });
assert.equal(client.isSandbox, true);
assert.equal(typeof client.egrul.get, 'function');
assert.equal(typeof client.imagecheck.withRawResponse.analyze, 'function');
assert.ok(!JSON.stringify(client).includes('ak_'), 'ключ не должен попадать в JSON');

console.log('ESM: ok');
