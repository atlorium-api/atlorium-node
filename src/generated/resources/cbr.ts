/**
 * Ресурс «API справочника БИК»: `client.cbr`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/cbr';

function getRequest(bik: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/cbr/${encodePath(bik)}`,
  };
}

function searchRequest(query: string, params: T.SearchParams & RequestOptions): FinalRequestOptions {
  const { limit, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/cbr/search',
    query: { query, limit },
  };
}

function getStatsRequest(options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/cbr/stats',
  };
}

/** Методы {@link CbrResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class CbrResourceWithRawResponse extends APIResource {
  /**
   * Возвращает реквизиты участника справочника по точному БИК (9 цифр).
   *
   * Пример запроса:
   * GET /api/cbr/044525225
   *
   * @param bik БИК — банковский идентификационный код (ровно 9 цифр). Пример: 044525225 (ПАО Сбербанк).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(bik: string, options: RequestOptions = {}): Promise<ApiResponse<T.CbrBankInfo>> {
    return this._client.requestRaw<T.CbrBankInfo>(getRequest(bik, options));
  }

  /**
   * Ищет участников по наименованию, городу, SWIFT или началу БИК.
   *
   * Примеры запросов:
   * GET /api/cbr/search?query=Сбербанк
   * GET /api/cbr/search?query=0445&limit=50
   *
   * @param query Строка поиска. Если состоит только из цифр — трактуется как БИК (поиск по началу кода), иначе ищется как подстрока в наименовании, населённом пункте и SWIFT.
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<ApiResponse<T.CbrSearchResponse>> {
    return this._client.requestRaw<T.CbrSearchResponse>(searchRequest(query, params));
  }

  /**
   * Возвращает статистику загруженного справочника: размер, дата актуальности, готовность.
   *
   * Пример запроса:
   * GET /api/cbr/stats
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getStats(options: RequestOptions = {}): Promise<ApiResponse<T.CbrStatsResponse>> {
    return this._client.requestRaw<T.CbrStatsResponse>(getStatsRequest(options));
  }
}

/**
 * API справочника БИК.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/cbr-bik-api-client
 */
export class CbrResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: CbrResourceWithRawResponse = new CbrResourceWithRawResponse(this._client);

  /**
   * Возвращает реквизиты участника справочника по точному БИК (9 цифр).
   *
   * Пример запроса:
   * GET /api/cbr/044525225
   *
   * @param bik БИК — банковский идентификационный код (ровно 9 цифр). Пример: 044525225 (ПАО Сбербанк).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(bik: string, options: RequestOptions = {}): Promise<T.CbrBankInfo> {
    return this._client.request<T.CbrBankInfo>(getRequest(bik, options));
  }

  /**
   * Ищет участников по наименованию, городу, SWIFT или началу БИК.
   *
   * Примеры запросов:
   * GET /api/cbr/search?query=Сбербанк
   * GET /api/cbr/search?query=0445&limit=50
   *
   * @param query Строка поиска. Если состоит только из цифр — трактуется как БИК (поиск по началу кода), иначе ищется как подстрока в наименовании, населённом пункте и SWIFT.
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<T.CbrSearchResponse> {
    return this._client.request<T.CbrSearchResponse>(searchRequest(query, params));
  }

  /**
   * Возвращает статистику загруженного справочника: размер, дата актуальности, готовность.
   *
   * Пример запроса:
   * GET /api/cbr/stats
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getStats(options: RequestOptions = {}): Promise<T.CbrStatsResponse> {
    return this._client.request<T.CbrStatsResponse>(getStatsRequest(options));
  }
}
