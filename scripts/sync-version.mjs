/**
 * Переписывает `src/version.ts` по версии из `package.json` — версия задаётся в одном месте.
 *
 * Запускается сам из `npm version <patch|minor|major|…>` (npm-скрипт `version`), после чего
 * `src/version.ts` попадает в тот же коммит. Вручную: `node scripts/sync-version.mjs`.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Некорректная версия в package.json: ${version}`);
  process.exit(1);
}

const file = join(ROOT, 'src', 'version.ts');
const content =
  '/** Версия пакета. Не редактировать руками: файл пишет `scripts/sync-version.mjs` из `package.json`. */\n' +
  `export const VERSION = '${version}';\n`;
writeFileSync(file, content);
console.log(`src/version.ts → ${version}`);
