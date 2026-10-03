/**
 * Ресурс «API BIN Lookup»: `client.bin`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/bin';

function lookupRequest(bin: string, params: T.LookupParams & RequestOptions): FinalRequestOptions {
  const { customerIp, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: `/api/bin/${encodePath(bin)}`,
    query: { customerIp },
  };
}

function validateRequest(bin: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/bin/validate/${encodePath(bin)}`,
  };
}

/** Методы {@link BinResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class BinResourceWithRawResponse extends APIResource {
  /**
   * Возвращает карточку по BIN/IIN (6, 8 или 10 цифр). Для максимальной точности
   * рекомендуется передавать 8 и более цифр.
   *
   * Примеры запросов:
   * GET /api/bin/48334884
   * GET /api/bin/48334884?customerIp=8.8.8.8
   *
   * @param bin BIN/IIN — первые 6, 8 или 10 цифр номера карты. Пример: 48334884.
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(bin: string, params: T.LookupParams & RequestOptions = {}): Promise<ApiResponse<T.BinLookupResult>> {
    return this._client.requestRaw<T.BinLookupResult>(lookupRequest(bin, params));
  }

  /**
   * Мгновенно проверяет формат BIN/IIN (только цифры, длина 6, 8 или 10).
   * Проверяет формат, а не существование такого BIN.
   *
   * Пример запроса:
   * GET /api/bin/validate/48334884
   *
   * @param bin Проверяемый BIN (6, 8 или 10 цифр; пробелы/разделители игнорируются).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(bin: string, options: RequestOptions = {}): Promise<ApiResponse<T.BinFormatValidationResult>> {
    return this._client.requestRaw<T.BinFormatValidationResult>(validateRequest(bin, options));
  }
}

/**
 * API BIN Lookup.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/bin-lookup-api-client
 */
export class BinResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: BinResourceWithRawResponse = new BinResourceWithRawResponse(this._client);

  /**
   * Возвращает карточку по BIN/IIN (6, 8 или 10 цифр). Для максимальной точности
   * рекомендуется передавать 8 и более цифр.
   *
   * Примеры запросов:
   * GET /api/bin/48334884
   * GET /api/bin/48334884?customerIp=8.8.8.8
   *
   * @param bin BIN/IIN — первые 6, 8 или 10 цифр номера карты. Пример: 48334884.
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(bin: string, params: T.LookupParams & RequestOptions = {}): Promise<T.BinLookupResult> {
    return this._client.request<T.BinLookupResult>(lookupRequest(bin, params));
  }

  /**
   * Мгновенно проверяет формат BIN/IIN (только цифры, длина 6, 8 или 10).
   * Проверяет формат, а не существование такого BIN.
   *
   * Пример запроса:
   * GET /api/bin/validate/48334884
   *
   * @param bin Проверяемый BIN (6, 8 или 10 цифр; пробелы/разделители игнорируются).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(bin: string, options: RequestOptions = {}): Promise<T.BinFormatValidationResult> {
    return this._client.request<T.BinFormatValidationResult>(validateRequest(bin, options));
  }
}
