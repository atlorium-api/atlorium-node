/**
 * Ресурс «API профиля IP»: `client.ipinfo`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/ipinfo';

function lookupRequest(ip: string, params: T.LookupParams & RequestOptions): FinalRequestOptions {
  const { extended, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: `/api/ipinfo/${encodePath(ip)}`,
    query: { extended },
  };
}

/** Методы {@link IpInfoResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class IpInfoResourceWithRawResponse extends APIResource {
  /**
   * Возвращает профиль IP-адреса: геолокацию, а при extended=true — ещё и сведения о владельце
   * и репутации адреса.
   *
   * Примеры запросов:
   * GET /api/ipinfo/8.8.8.8
   * GET /api/ipinfo/206.189.233.36?extended=true
   *
   * @param ip IP-адрес (IPv4 или IPv6). Примеры: 8.8.8.8, 2606:4700:4700::1111. Приватные и зарезервированные адреса публичного профиля не имеют.
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(ip: string, params: T.LookupParams & RequestOptions = {}): Promise<ApiResponse<T.IpReport>> {
    return this._client.requestRaw<T.IpReport>(lookupRequest(ip, params));
  }
}

/**
 * API профиля IP.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/ip-geolocation-api-client
 */
export class IpInfoResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: IpInfoResourceWithRawResponse = new IpInfoResourceWithRawResponse(this._client);

  /**
   * Возвращает профиль IP-адреса: геолокацию, а при extended=true — ещё и сведения о владельце
   * и репутации адреса.
   *
   * Примеры запросов:
   * GET /api/ipinfo/8.8.8.8
   * GET /api/ipinfo/206.189.233.36?extended=true
   *
   * @param ip IP-адрес (IPv4 или IPv6). Примеры: 8.8.8.8, 2606:4700:4700::1111. Приватные и зарезервированные адреса публичного профиля не имеют.
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(ip: string, params: T.LookupParams & RequestOptions = {}): Promise<T.IpReport> {
    return this._client.request<T.IpReport>(lookupRequest(ip, params));
  }
}
