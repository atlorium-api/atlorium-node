/**
 * Ресурс «API валидации телефона»: `client.phone`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/phone';

function validateRequest(number: string, params: T.ValidateParams & RequestOptions): FinalRequestOptions {
  const { countryCode, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: `/api/phone/${encodePath(number)}`,
    query: { countryCode },
  };
}

/** Методы {@link PhoneResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class PhoneResourceWithRawResponse extends APIResource {
  /**
   * Возвращает карточку телефонного номера: валидность, форматы записи, страну, тип номера,
   * оператора диапазона, регион и часовые пояса.
   *
   * Примеры запросов:
   * GET /api/phone/%2B79161234567
   * GET /api/phone/89161234567?countryCode=RU
   *
   * ЧТО ЗНАЧИТ isValid. Номер записан правильно и попадает в диапазон, реально выделенный
   * в его стране. Это НЕ означает, что номер кому-то принадлежит и что он доступен.
   *
   * ЧТО ЗНАЧИТ originalCarrier. Оператор, которому ВЫДЕЛЕН диапазон номера. Абонент вправе
   * перенести номер к другому оператору, сохранив его (MNP), и справочник нумерации об этом
   * не знает. Для произвольного номера это поле — обоснованная догадка, а не факт.
   *
   * @param number Номер телефона. Принимается в международном формате ("+79161234567") или в национальном ("8 916 123-45-67") — во втором случае обязательно укажите countryCode. Пробелы, скобки и дефисы допустимы. Знак «+» в URL кодируется как %2B.
   * @param params Необязательные параметры (`ValidateParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(number: string, params: T.ValidateParams & RequestOptions = {}): Promise<ApiResponse<T.PhoneReport>> {
    return this._client.requestRaw<T.PhoneReport>(validateRequest(number, params));
  }
}

/**
 * API валидации телефона.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/phone-validation-api-client
 */
export class PhoneResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: PhoneResourceWithRawResponse = new PhoneResourceWithRawResponse(this._client);

  /**
   * Возвращает карточку телефонного номера: валидность, форматы записи, страну, тип номера,
   * оператора диапазона, регион и часовые пояса.
   *
   * Примеры запросов:
   * GET /api/phone/%2B79161234567
   * GET /api/phone/89161234567?countryCode=RU
   *
   * ЧТО ЗНАЧИТ isValid. Номер записан правильно и попадает в диапазон, реально выделенный
   * в его стране. Это НЕ означает, что номер кому-то принадлежит и что он доступен.
   *
   * ЧТО ЗНАЧИТ originalCarrier. Оператор, которому ВЫДЕЛЕН диапазон номера. Абонент вправе
   * перенести номер к другому оператору, сохранив его (MNP), и справочник нумерации об этом
   * не знает. Для произвольного номера это поле — обоснованная догадка, а не факт.
   *
   * @param number Номер телефона. Принимается в международном формате ("+79161234567") или в национальном ("8 916 123-45-67") — во втором случае обязательно укажите countryCode. Пробелы, скобки и дефисы допустимы. Знак «+» в URL кодируется как %2B.
   * @param params Необязательные параметры (`ValidateParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(number: string, params: T.ValidateParams & RequestOptions = {}): Promise<T.PhoneReport> {
    return this._client.request<T.PhoneReport>(validateRequest(number, params));
  }
}
