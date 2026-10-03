/**
 * Ресурс «API проверки почты»: `client.email`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/email';

function validateRequest(email: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/emailvalidation',
    query: { email },
  };
}

/** Методы {@link EmailResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class EmailResourceWithRawResponse extends APIResource {
  /**
   * Проверяет почтовый адрес: существует ли ящик, принимает ли домен почту, не одноразовый
   * ли это ящик, не спам-ловушка и не ролевой ли адрес.
   *
   * Пример запроса:
   * GET /api/emailvalidation?email=user@example.com
   *
   * ТАРИФИКАЦИЯ. Запрос не тарифицируется, если адрес синтаксически некорректен (400) либо
   * если проверить адрес не удалось и вернулся статус unknown (почтовый сервер домена
   * применил greylisting, не ответил или заблокировал проверку). Платите только за
   * содержательный вердикт.
   *
   * @param email Почтовый адрес для проверки. Пример: user@example.com
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(email: string, options: RequestOptions = {}): Promise<ApiResponse<T.EmailValidationReport>> {
    return this._client.requestRaw<T.EmailValidationReport>(validateRequest(email, options));
  }
}

/**
 * API проверки почты.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/email-verification-api-client
 */
export class EmailResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: EmailResourceWithRawResponse = new EmailResourceWithRawResponse(this._client);

  /**
   * Проверяет почтовый адрес: существует ли ящик, принимает ли домен почту, не одноразовый
   * ли это ящик, не спам-ловушка и не ролевой ли адрес.
   *
   * Пример запроса:
   * GET /api/emailvalidation?email=user@example.com
   *
   * ТАРИФИКАЦИЯ. Запрос не тарифицируется, если адрес синтаксически некорректен (400) либо
   * если проверить адрес не удалось и вернулся статус unknown (почтовый сервер домена
   * применил greylisting, не ответил или заблокировал проверку). Платите только за
   * содержательный вердикт.
   *
   * @param email Почтовый адрес для проверки. Пример: user@example.com
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(email: string, options: RequestOptions = {}): Promise<T.EmailValidationReport> {
    return this._client.request<T.EmailValidationReport>(validateRequest(email, options));
  }
}
