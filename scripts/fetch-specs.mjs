/**
 * Скачивает живые OpenAPI-спеки всех 23 сервисов Atlorium в каталог `spec/`.
 *
 * Спеки коммитятся в репозиторий, чтобы генерация типов (`npm run generate`) была
 * воспроизводимой без сети.
 *
 * Запуск:
 *   npm run fetch-specs                        # скачать с https://atlorium.com/openapi
 *   npm run fetch-specs -- --from <каталог>    # взять уже скачанные файлы <id>_<locale>.json без сети
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://atlorium.com/openapi';
const SPEC_IDS = [
  'egrul', 'cbr', 'swift', 'bin', 'aml', 'ipinfo', 'gar', 'addressstd', 'phone', 'email', 'ocr', 'dns',
  'cidr', 'cron', 'certificate', 'weather', 'aichat', 'geocodeforward', 'geocodereverse', 'testdata',
  'urlcheck', 'pagespeed', 'imagecheck',
];
const LOCALES = ['ru', 'en-US'];
const SPEC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'spec');

/** Записывает спеку в `spec/` в едином формате: отступ 2 пробела, перевод строки в конце. */
function writeSpec(name, spec) {
  writeFileSync(join(SPEC_DIR, name), `${JSON.stringify(spec, null, 2)}\n`);
}

const fromIndex = process.argv.indexOf('--from');
const fromDir = fromIndex === -1 ? null : process.argv[fromIndex + 1];
if (fromIndex !== -1 && !fromDir) {
  console.error('После --from укажите каталог со спеками');
  process.exit(2);
}

mkdirSync(SPEC_DIR, { recursive: true });
let failures = 0;
for (const id of SPEC_IDS) {
  for (const locale of LOCALES) {
    const name = `${id}_${locale}.json`;
    const source = fromDir ? join(resolve(fromDir), name) : `${BASE_URL}/${name}`;
    try {
      let spec;
      if (fromDir) {
        spec = JSON.parse(readFileSync(source, 'utf8'));
      } else {
        const response = await fetch(source, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        spec = await response.json();
      }
      writeSpec(name, spec);
      console.log(`ok   ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${source}: ${error.message}`);
    }
    // Спеки не тарифицируются, но слать запросы очередью без паузы незачем.
    if (!fromDir) await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
  }
}
process.exit(failures ? 1 : 0);
