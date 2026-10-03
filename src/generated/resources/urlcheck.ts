/**
 * Ресурс «API проверки ссылки»: `client.urlcheck`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, toList } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/urlcheck';

function checkRequest(url: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/urlcheck',
    query: { url },
  };
}

function checkBatchRequest(urls: string | readonly string[], options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'POST',
    path: '/api/urlcheck/batch',
    body: toList(urls),
    hasBody: true,
  };
}

/** Методы {@link UrlCheckResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class UrlCheckResourceWithRawResponse extends APIResource {
  /**
   * Проверяет одну ссылку и возвращает вердикт репутационной проверки.
   *
   * Пример запроса:
   * GET /api/urlcheck?url=https://example.com/page
   *
   * Пример ответа «чисто»:
   * { "url": "https://example.com/page", "verdict": "clean", "threatTypes": [],
   *   "checkedAtUtc": "2026-09-01T10:15:00Z" }
   *
   * Пример ответа «угроза»:
   * { "url": "http://danger.example/login", "verdict": "threat",
   *   "threatTypes": ["social_engineering"], "checkedAtUtc": "2026-09-01T10:15:00Z" }
   *
   * В демо-режиме (публичный демо-ключ) ветку ответа задаёт домен: адрес на
   * malware.example.com вернёт вредонос, на phishing.example.com — фишинг, на
   * danger.example.com — сразу две категории, любой другой — «чисто».
   *
   * @param url Проверяемый адрес. Схему можно опустить: «example.com/page» будет приведено к «http://example.com/page». Принимаются только адреса со схемой http или https. В ответе адрес возвращается в приведённом виде — именно в нём он и проверялся.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  check(url: string, options: RequestOptions = {}): Promise<ApiResponse<T.UrlThreatResult>> {
    return this._client.requestRaw<T.UrlThreatResult>(checkRequest(url, options));
  }

  /**
   * Проверяет пакет ссылок за один вызов (до 100 адресов).
   *
   * Порядок результатов совпадает с порядком присланных ссылок — сопоставляйте по индексу.
   *
   * Пример запроса:
   * POST /api/urlcheck/batch
   * [ "https://example.com", "http://phishing.example.com/login" ]
   *
   * ТАРИФИКАЦИЯ ПАКЕТА. Списывается по числу ссылок с НАСТОЯЩИМ вердиктом. Если по трём
   * строкам из ста вердикт получить не удалось, спишется девяносто семь единиц, а не сто.
   *
   * @param urls Список проверяемых адресов. Пустые строки и повторы отбрасываются до проверки: повтор не добавляет работы и оплачиваться не должен. Максимум — 100 адресов.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkBatch(urls: string | readonly string[], options: RequestOptions = {}): Promise<ApiResponse<T.UrlThreatBatchResponse>> {
    return this._client.requestRaw<T.UrlThreatBatchResponse>(checkBatchRequest(urls, options));
  }
}

/**
 * API проверки ссылки.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/url-reputation-api-client
 */
export class UrlCheckResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: UrlCheckResourceWithRawResponse = new UrlCheckResourceWithRawResponse(this._client);

  /**
   * Проверяет одну ссылку и возвращает вердикт репутационной проверки.
   *
   * Пример запроса:
   * GET /api/urlcheck?url=https://example.com/page
   *
   * Пример ответа «чисто»:
   * { "url": "https://example.com/page", "verdict": "clean", "threatTypes": [],
   *   "checkedAtUtc": "2026-09-01T10:15:00Z" }
   *
   * Пример ответа «угроза»:
   * { "url": "http://danger.example/login", "verdict": "threat",
   *   "threatTypes": ["social_engineering"], "checkedAtUtc": "2026-09-01T10:15:00Z" }
   *
   * В демо-режиме (публичный демо-ключ) ветку ответа задаёт домен: адрес на
   * malware.example.com вернёт вредонос, на phishing.example.com — фишинг, на
   * danger.example.com — сразу две категории, любой другой — «чисто».
   *
   * @param url Проверяемый адрес. Схему можно опустить: «example.com/page» будет приведено к «http://example.com/page». Принимаются только адреса со схемой http или https. В ответе адрес возвращается в приведённом виде — именно в нём он и проверялся.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  check(url: string, options: RequestOptions = {}): Promise<T.UrlThreatResult> {
    return this._client.request<T.UrlThreatResult>(checkRequest(url, options));
  }

  /**
   * Проверяет пакет ссылок за один вызов (до 100 адресов).
   *
   * Порядок результатов совпадает с порядком присланных ссылок — сопоставляйте по индексу.
   *
   * Пример запроса:
   * POST /api/urlcheck/batch
   * [ "https://example.com", "http://phishing.example.com/login" ]
   *
   * ТАРИФИКАЦИЯ ПАКЕТА. Списывается по числу ссылок с НАСТОЯЩИМ вердиктом. Если по трём
   * строкам из ста вердикт получить не удалось, спишется девяносто семь единиц, а не сто.
   *
   * @param urls Список проверяемых адресов. Пустые строки и повторы отбрасываются до проверки: повтор не добавляет работы и оплачиваться не должен. Максимум — 100 адресов.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkBatch(urls: string | readonly string[], options: RequestOptions = {}): Promise<T.UrlThreatBatchResponse> {
    return this._client.request<T.UrlThreatBatchResponse>(checkBatchRequest(urls, options));
  }
}
