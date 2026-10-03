/**
 * Помощники для Node.js (и Bun/Deno с поддержкой `node:`-модулей). Отдельная точка входа, чтобы
 * основной пакет оставался без зависимостей от Node и работал в браузере и edge-средах.
 *
 * ```ts
 * import { Atlorium } from 'atlorium';
 * import { fileFromPath } from 'atlorium/node';
 *
 * const text = await new Atlorium().ocr.recognize(await fileFromPath('scan.png'));
 * ```
 */

import { readFile } from 'node:fs/promises';

/** Читает файл с диска — для `ocr.recognize` и `imagecheck.analyze`. */
export async function fileFromPath(path: string | URL): Promise<Uint8Array> {
  const buffer = await readFile(path);
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
