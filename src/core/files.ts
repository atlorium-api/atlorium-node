/**
 * Приём изображений для OCR и модерации.
 *
 * API ждёт картинку строкой Base64 внутри JSON. SDK кодирует её сам — передайте то, что есть под
 * рукой. Путь к файлу на диске — через `fileFromPath` из `atlorium/node`.
 */

import { toBase64 } from './runtime';

/**
 * Изображение: байты (`Uint8Array`, `ArrayBuffer`, любой `ArrayBufferView`), `Blob`/`File`, поток
 * байтов (`ReadableStream` или асинхронный итератор) либо строка с уже готовым Base64 или data-URL
 * вида `data:image/png;base64,...` — строка уходит на сервер как есть.
 */
export type FileInput =
  | string
  | Uint8Array
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | ReadableStream<Uint8Array>
  | AsyncIterable<Uint8Array>;

function isReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return typeof value === 'object' && value !== null && typeof (value as ReadableStream).getReader === 'function';
}

function isAsyncIterable(value: unknown): value is AsyncIterable<Uint8Array> {
  return typeof value === 'object' && value !== null && Symbol.asyncIterator in value;
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function asBytes(chunk: unknown): Uint8Array {
  if (chunk instanceof Uint8Array) return chunk;
  if (chunk instanceof ArrayBuffer) return new Uint8Array(chunk);
  if (ArrayBuffer.isView(chunk)) return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  throw new TypeError('Поток изображения должен отдавать байты (Uint8Array), а не текст');
}

/**
 * В Base64 не бывает ни точки, ни обратной косой черты, поэтому строка с точкой после `/`, с `\` или
 * с расширением файла — это путь, переданный вместо содержимого.
 */
const PATH_LIKE = /\.(png|jpe?g|gif|webp|bmp|tiff?|heic|pdf)$|\/.*\.|\\/i;

function checkBase64String(input: string): string {
  if (input.startsWith('data:')) return input;
  if (/^https?:\/\//i.test(input)) {
    throw new TypeError('API не принимает ссылку на изображение: скачайте его и передайте байты');
  }
  if (input.length <= 4096 && !input.includes('\n') && PATH_LIKE.test(input.trim())) {
    throw new TypeError(
      `Строка похожа на путь к файлу, а ожидается Base64: ${input}. Файл с диска читайте через fileFromPath из 'atlorium/node'`,
    );
  }
  return input;
}

/** Превращает изображение из любого поддерживаемого вида в строку Base64. */
export async function encodeFile(input: FileInput): Promise<string> {
  if (typeof input === 'string') return checkBase64String(input);
  if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) return toBase64(asBytes(input));
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return toBase64(new Uint8Array(await input.arrayBuffer()));
  }
  const chunks: Uint8Array[] = [];
  if (isReadableStream(input)) {
    const reader = input.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(asBytes(value));
      }
    } finally {
      reader.releaseLock();
    }
    return toBase64(concat(chunks));
  }
  if (isAsyncIterable(input)) {
    for await (const chunk of input) chunks.push(asBytes(chunk));
    return toBase64(concat(chunks));
  }
  throw new TypeError('Неподдерживаемый тип изображения: ожидаются байты, Blob, поток или строка Base64');
}
