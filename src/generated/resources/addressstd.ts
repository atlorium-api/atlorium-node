/**
 * Ресурс «API стандартизации адреса»: `client.addressstd`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/addressstd';

function standardizeRequest(address: string, params: T.StandardizeParams & RequestOptions): FinalRequestOptions {
  const { region, bind, geocode, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/addressstd',
    query: { address, region, bind, geocode },
  };
}

/** Методы {@link AddressStdResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class AddressStdResourceWithRawResponse extends APIResource {
  /**
   * Разбирает адресную строку в структуру: адресные уровни (регион/город/улица/дом/квартира),
   * нормализованное однострочное представление и коэффициент качества.
   *
   * Примеры запросов:
   * GET /api/addressstd?address=г Москва, ул. 16-я Парковая д.2 к1 кв.3
   * GET /api/addressstd?address=ленинский проспект 4&region=77
   *
   * @param address Адресная строка. Примеры: «мск ленинскй проспект д4 кв5», «г Москва, ул. 16-я Парковая д.2 к1 кв.3». Допускаются опечатки, сокращения, нижний регистр и переставленные части.
   * @param params Необязательные параметры (`StandardizeParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  standardize(address: string, params: T.StandardizeParams & RequestOptions = {}): Promise<ApiResponse<T.StandardizedAddress>> {
    return this._client.requestRaw<T.StandardizedAddress>(standardizeRequest(address, params));
  }
}

/**
 * API стандартизации адреса.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/address-standardization-api-client
 */
export class AddressStdResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: AddressStdResourceWithRawResponse = new AddressStdResourceWithRawResponse(this._client);

  /**
   * Разбирает адресную строку в структуру: адресные уровни (регион/город/улица/дом/квартира),
   * нормализованное однострочное представление и коэффициент качества.
   *
   * Примеры запросов:
   * GET /api/addressstd?address=г Москва, ул. 16-я Парковая д.2 к1 кв.3
   * GET /api/addressstd?address=ленинский проспект 4&region=77
   *
   * @param address Адресная строка. Примеры: «мск ленинскй проспект д4 кв5», «г Москва, ул. 16-я Парковая д.2 к1 кв.3». Допускаются опечатки, сокращения, нижний регистр и переставленные части.
   * @param params Необязательные параметры (`StandardizeParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  standardize(address: string, params: T.StandardizeParams & RequestOptions = {}): Promise<T.StandardizedAddress> {
    return this._client.request<T.StandardizedAddress>(standardizeRequest(address, params));
  }
}
