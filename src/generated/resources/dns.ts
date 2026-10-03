/**
 * Ресурс «API проверки DNS»: `client.dns`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/dns';

function lookupRequest(domain: string, params: T.LookupParams & RequestOptions): FinalRequestOptions {
  const { resolver, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/dns/lookup',
    query: { domain, resolver },
  };
}

function checkPropagationRequest(domain: string, params: T.CheckPropagationParams & RequestOptions): FinalRequestOptions {
  const { resolvers, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/dns/propagation',
    query: { domain, resolvers },
  };
}

/** Методы {@link DnsResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class DnsResourceWithRawResponse extends APIResource {
  /**
   * Выполняет DNS-запрос для основных типов записей (A, AAAA, MX, TXT, CNAME, NS).
   * Возвращает все найденные записи для указанного домена.
   *
   * Пример запроса:
   * GET /api/dns/lookup?domain=google.com
   * GET /api/dns/lookup?domain=microsoft.com&resolver=8.8.8.8
   *
   * Пример ответа:
   * {
   *   "domain": "google.com",
   *   "resolver": "1.1.1.1",
   *   "records": {
   *     "A": ["142.250.185.78"],
   *     "AAAA": ["2a00:1450:4010:c08::64"],
   *     "MX": ["smtp.google.com"],
   *     "NS": ["ns1.google.com", "ns2.google.com"]
   *   }
   * }
   *
   * @param domain Доменное имя для запроса. Формат: чистое доменное имя без протокола. Примеры: - example.com - sub.example.com - google.com Не допускаются: - URL с протоколом (https://example.com) - IP-адреса
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(domain: string, params: T.LookupParams & RequestOptions = {}): Promise<ApiResponse<T.DnsLookupResponse>> {
    return this._client.requestRaw<T.DnsLookupResponse>(lookupRequest(domain, params));
  }

  /**
   * Проверяет распространение DNS-записей (пропагацию) через несколько публичных резолверов.
   * Полезно для проверки того, обновились ли DNS-записи на всех серверах после изменения.
   *
   * Пример запроса:
   * GET /api/dns/propagation?domain=example.com
   * GET /api/dns/propagation?domain=new-site.com&resolvers=8.8.8.8,1.1.1.1
   *
   * Пример использования:
   * После изменения DNS-записей домена выполните этот запрос,
   * чтобы проверить, распространились ли изменения на все резолверы.
   * Полная пропагация может занять от нескольких минут до 48 часов.
   *
   * @param domain Доменное имя для проверки. Формат: чистое доменное имя без протокола. Примеры: - example.com - new-domain.com
   * @param params Необязательные параметры (`CheckPropagationParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkPropagation(domain: string, params: T.CheckPropagationParams & RequestOptions = {}): Promise<ApiResponse<T.DnsPropagationResponse>> {
    return this._client.requestRaw<T.DnsPropagationResponse>(checkPropagationRequest(domain, params));
  }
}

/**
 * API проверки DNS.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/dns-lookup-api-client
 */
export class DnsResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: DnsResourceWithRawResponse = new DnsResourceWithRawResponse(this._client);

  /**
   * Выполняет DNS-запрос для основных типов записей (A, AAAA, MX, TXT, CNAME, NS).
   * Возвращает все найденные записи для указанного домена.
   *
   * Пример запроса:
   * GET /api/dns/lookup?domain=google.com
   * GET /api/dns/lookup?domain=microsoft.com&resolver=8.8.8.8
   *
   * Пример ответа:
   * {
   *   "domain": "google.com",
   *   "resolver": "1.1.1.1",
   *   "records": {
   *     "A": ["142.250.185.78"],
   *     "AAAA": ["2a00:1450:4010:c08::64"],
   *     "MX": ["smtp.google.com"],
   *     "NS": ["ns1.google.com", "ns2.google.com"]
   *   }
   * }
   *
   * @param domain Доменное имя для запроса. Формат: чистое доменное имя без протокола. Примеры: - example.com - sub.example.com - google.com Не допускаются: - URL с протоколом (https://example.com) - IP-адреса
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(domain: string, params: T.LookupParams & RequestOptions = {}): Promise<T.DnsLookupResponse> {
    return this._client.request<T.DnsLookupResponse>(lookupRequest(domain, params));
  }

  /**
   * Проверяет распространение DNS-записей (пропагацию) через несколько публичных резолверов.
   * Полезно для проверки того, обновились ли DNS-записи на всех серверах после изменения.
   *
   * Пример запроса:
   * GET /api/dns/propagation?domain=example.com
   * GET /api/dns/propagation?domain=new-site.com&resolvers=8.8.8.8,1.1.1.1
   *
   * Пример использования:
   * После изменения DNS-записей домена выполните этот запрос,
   * чтобы проверить, распространились ли изменения на все резолверы.
   * Полная пропагация может занять от нескольких минут до 48 часов.
   *
   * @param domain Доменное имя для проверки. Формат: чистое доменное имя без протокола. Примеры: - example.com - new-domain.com
   * @param params Необязательные параметры (`CheckPropagationParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkPropagation(domain: string, params: T.CheckPropagationParams & RequestOptions = {}): Promise<T.DnsPropagationResponse> {
    return this._client.request<T.DnsPropagationResponse>(checkPropagationRequest(domain, params));
  }
}
