/**
 * Ресурс «API распознавания текста с изображения»: `client.ocr`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, stripNullish } from '../../core/base-client';
import { encodeFile, type FileInput } from '../../core/files';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/ocr';

async function recognizeRequest(image: FileInput, params: T.RecognizeParams & RequestOptions): Promise<FinalRequestOptions> {
  const { mode, ...options } = params;
  return {
    ...options,
    method: 'POST',
    path: '/api/ocr/image-to-text',
    body: stripNullish({ image: await encodeFile(image), mode }),
    hasBody: true,
    defaultTimeout: 120000,
  };
}

/** Методы {@link OcrResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class OcrResourceWithRawResponse extends APIResource {
  /**
   * Распознаёт содержимое страницы на изображении. Изображение передаётся в Base64
   * (можно как data-URL), предел — 10 МБ в декодированном виде.
   *
   * Пример запроса:
   * POST /api/ocr/image-to-text
   * { "image": "iVBORw0KGgoAAAANSUhEUgAA..." }
   *
   * @param image Изображение в кодировке Base64 (можно как «голый» base64, так и data-URL вида "data:image/png;base64,...."). Обязательное поле. Предел — 10 МБ в декодированном виде: скан листа A4 в 300 dpi укладывается с запасом. PDF на вход не принимается — многостраничный файл нужно отрендерить в изображения и отправлять постранично.
   * @param params Необязательные параметры (`RecognizeParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  recognize(image: FileInput, params: T.RecognizeParams & RequestOptions = {}): Promise<ApiResponse<T.ImageOcrResponse>> {
    return this._client.requestRaw<T.ImageOcrResponse>(recognizeRequest(image, params));
  }
}

/**
 * API распознавания текста с изображения.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/image-ocr-api-client
 */
export class OcrResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: OcrResourceWithRawResponse = new OcrResourceWithRawResponse(this._client);

  /**
   * Распознаёт содержимое страницы на изображении. Изображение передаётся в Base64
   * (можно как data-URL), предел — 10 МБ в декодированном виде.
   *
   * Пример запроса:
   * POST /api/ocr/image-to-text
   * { "image": "iVBORw0KGgoAAAANSUhEUgAA..." }
   *
   * @param image Изображение в кодировке Base64 (можно как «голый» base64, так и data-URL вида "data:image/png;base64,...."). Обязательное поле. Предел — 10 МБ в декодированном виде: скан листа A4 в 300 dpi укладывается с запасом. PDF на вход не принимается — многостраничный файл нужно отрендерить в изображения и отправлять постранично.
   * @param params Необязательные параметры (`RecognizeParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  recognize(image: FileInput, params: T.RecognizeParams & RequestOptions = {}): Promise<T.ImageOcrResponse> {
    return this._client.request<T.ImageOcrResponse>(recognizeRequest(image, params));
  }
}
