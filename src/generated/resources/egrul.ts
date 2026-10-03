/**
 * Ресурс «API ЕГРЮЛ/ЕГРИП»: `client.egrul`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/egrul';

function getRequest(query: string, params: T.GetParams & RequestOptions): FinalRequestOptions {
  const { extended, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: `/api/egrul/${encodePath(query)}`,
    query: { extended },
  };
}

function searchRequest(query: string, params: T.SearchParams & RequestOptions): FinalRequestOptions {
  const { limit, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/egrul/search',
    query: { query, limit },
  };
}

function getExcerptRequest(query: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/egrul/${encodePath(query)}/excerpt`,
    responseType: 'bytes',
  };
}

/** Методы {@link EgrulResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class EgrulResourceWithRawResponse extends APIResource {
  /**
   * Возвращает карточку организации по ИНН, ОГРН или ОГРНИП.
   *
   * Примеры запросов:
   * GET /api/egrul/7707083893
   * GET /api/egrul/304500116000157?extended=true
   *
   * @param query Идентификатор: ИНН (10 цифр у ЮЛ, 12 у ИП), ОГРН (13 цифр) или ОГРНИП (15 цифр). Пример: 7707083893.
   * @param params Необязательные параметры (`GetParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(query: string, params: T.GetParams & RequestOptions = {}): Promise<ApiResponse<T.CompanyLookupResult>> {
    return this._client.requestRaw<T.CompanyLookupResult>(getRequest(query, params));
  }

  /**
   * Ищет субъекты (ЮЛ и ИП) по наименованию или ФИО.
   *
   * Примеры запросов:
   * GET /api/egrul/search?query=Сбербанк
   * GET /api/egrul/search?query=Иванов%20Иван%20Иванович&limit=20
   *
   * @param query Строка поиска: часть наименования организации или ФИО ИП. Пример: Сбербанк.
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<ApiResponse<T.CompanySearchResponse>> {
    return this._client.requestRaw<T.CompanySearchResponse>(searchRequest(query, params));
  }

  /**
   * Возвращает официальную выписку из ЕГРЮЛ/ЕГРИП по идентификатору субъекта в виде PDF-файла.
   *
   * Пример запроса:
   * GET /api/egrul/7707083893/excerpt
   *
   * @param query ИНН, ОГРН или ОГРНИП субъекта. Пример: 7707083893.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   * @returns Содержимое файла.
   */
  getExcerpt(query: string, options: RequestOptions = {}): Promise<ApiResponse<Uint8Array>> {
    return this._client.requestRaw<Uint8Array>(getExcerptRequest(query, options));
  }
}

/**
 * API ЕГРЮЛ/ЕГРИП.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/egrul-api-client
 */
export class EgrulResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: EgrulResourceWithRawResponse = new EgrulResourceWithRawResponse(this._client);

  /**
   * Возвращает карточку организации по ИНН, ОГРН или ОГРНИП.
   *
   * Примеры запросов:
   * GET /api/egrul/7707083893
   * GET /api/egrul/304500116000157?extended=true
   *
   * @param query Идентификатор: ИНН (10 цифр у ЮЛ, 12 у ИП), ОГРН (13 цифр) или ОГРНИП (15 цифр). Пример: 7707083893.
   * @param params Необязательные параметры (`GetParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(query: string, params: T.GetParams & RequestOptions = {}): Promise<T.CompanyLookupResult> {
    return this._client.request<T.CompanyLookupResult>(getRequest(query, params));
  }

  /**
   * Ищет субъекты (ЮЛ и ИП) по наименованию или ФИО.
   *
   * Примеры запросов:
   * GET /api/egrul/search?query=Сбербанк
   * GET /api/egrul/search?query=Иванов%20Иван%20Иванович&limit=20
   *
   * @param query Строка поиска: часть наименования организации или ФИО ИП. Пример: Сбербанк.
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<T.CompanySearchResponse> {
    return this._client.request<T.CompanySearchResponse>(searchRequest(query, params));
  }

  /**
   * Возвращает официальную выписку из ЕГРЮЛ/ЕГРИП по идентификатору субъекта в виде PDF-файла.
   *
   * Пример запроса:
   * GET /api/egrul/7707083893/excerpt
   *
   * @param query ИНН, ОГРН или ОГРНИП субъекта. Пример: 7707083893.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   * @returns Содержимое файла.
   */
  getExcerpt(query: string, options: RequestOptions = {}): Promise<Uint8Array> {
    return this._client.request<Uint8Array>(getExcerptRequest(query, options));
  }
}
