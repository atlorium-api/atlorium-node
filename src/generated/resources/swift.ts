/**
 * Ресурс «API справочника SWIFT/BIC»: `client.swift`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/swift';

function getRequest(bic: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/swift/${encodePath(bic)}`,
  };
}

function searchRequest(query: string, params: T.SearchParams & RequestOptions): FinalRequestOptions {
  const { limit, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/swift/search',
    query: { query, limit },
  };
}

function validateRequest(bic: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/swift/validate/${encodePath(bic)}`,
  };
}

function getStatsRequest(options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/swift/stats',
  };
}

/** Методы {@link SwiftResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class SwiftResourceWithRawResponse extends APIResource {
  /**
   * Возвращает карточку организации по точному SWIFT/BIC (8 или 11 символов).
   *
   * Пример запроса:
   * GET /api/swift/DEUTDEFF
   *
   * @param bic SWIFT/BIC-код. 8-значный (головной офис) дополняется до 11 ("XXX"). Пример: DEUTDEFF.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(bic: string, options: RequestOptions = {}): Promise<ApiResponse<T.SwiftBankInfo>> {
    return this._client.requestRaw<T.SwiftBankInfo>(getRequest(bic, options));
  }

  /**
   * Ищет организации по наименованию (полнотекстовый поиск).
   *
   * Примеры запросов:
   * GET /api/swift/search?query=Sberbank
   * GET /api/swift/search?query=Deutsche%20Bank&limit=50
   *
   * @param query Строка поиска — часть наименования организации. Пример: Sberbank.
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<ApiResponse<T.SwiftSearchResponse>> {
    return this._client.requestRaw<T.SwiftSearchResponse>(searchRequest(query, params));
  }

  /**
   * Проверяет формат SWIFT/BIC по стандарту ISO-9362 и разбирает его на части, мгновенно.
   * Проверяет только формат, а не существование такого кода.
   *
   * Пример запроса:
   * GET /api/swift/validate/DEUTDEFFXXX
   *
   * @param bic Проверяемый BIC (8 или 11 символов).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(bic: string, options: RequestOptions = {}): Promise<ApiResponse<T.SwiftBicValidationResult>> {
    return this._client.requestRaw<T.SwiftBicValidationResult>(validateRequest(bic, options));
  }

  /**
   * Возвращает служебную информацию сервиса: готовность отвечать на запросы.
   *
   * Пример запроса:
   * GET /api/swift/stats
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getStats(options: RequestOptions = {}): Promise<ApiResponse<T.SwiftStatsResponse>> {
    return this._client.requestRaw<T.SwiftStatsResponse>(getStatsRequest(options));
  }
}

/**
 * API справочника SWIFT/BIC.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/swift-bic-api-client
 */
export class SwiftResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: SwiftResourceWithRawResponse = new SwiftResourceWithRawResponse(this._client);

  /**
   * Возвращает карточку организации по точному SWIFT/BIC (8 или 11 символов).
   *
   * Пример запроса:
   * GET /api/swift/DEUTDEFF
   *
   * @param bic SWIFT/BIC-код. 8-значный (головной офис) дополняется до 11 ("XXX"). Пример: DEUTDEFF.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(bic: string, options: RequestOptions = {}): Promise<T.SwiftBankInfo> {
    return this._client.request<T.SwiftBankInfo>(getRequest(bic, options));
  }

  /**
   * Ищет организации по наименованию (полнотекстовый поиск).
   *
   * Примеры запросов:
   * GET /api/swift/search?query=Sberbank
   * GET /api/swift/search?query=Deutsche%20Bank&limit=50
   *
   * @param query Строка поиска — часть наименования организации. Пример: Sberbank.
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<T.SwiftSearchResponse> {
    return this._client.request<T.SwiftSearchResponse>(searchRequest(query, params));
  }

  /**
   * Проверяет формат SWIFT/BIC по стандарту ISO-9362 и разбирает его на части, мгновенно.
   * Проверяет только формат, а не существование такого кода.
   *
   * Пример запроса:
   * GET /api/swift/validate/DEUTDEFFXXX
   *
   * @param bic Проверяемый BIC (8 или 11 символов).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(bic: string, options: RequestOptions = {}): Promise<T.SwiftBicValidationResult> {
    return this._client.request<T.SwiftBicValidationResult>(validateRequest(bic, options));
  }

  /**
   * Возвращает служебную информацию сервиса: готовность отвечать на запросы.
   *
   * Пример запроса:
   * GET /api/swift/stats
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getStats(options: RequestOptions = {}): Promise<T.SwiftStatsResponse> {
    return this._client.request<T.SwiftStatsResponse>(getStatsRequest(options));
  }
}
