/**
 * Ресурс «API разбора Cron-выражений»: `client.cron`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, stripNullish } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/cron';

function evaluateRequest(expression: string, params: T.EvaluateParams & RequestOptions): FinalRequestOptions {
  const { timeZoneId, fromUtc, take, ...options } = params;
  return {
    ...options,
    method: 'POST',
    path: '/api/cron/evaluate',
    body: stripNullish({ expression, timeZoneId, fromUtc, take }),
    hasBody: true,
  };
}

function buildRequest(params: T.BuildParams & RequestOptions): FinalRequestOptions {
  const { template, interval, timeOfDay, dayOfMonth, weekDays, includeSeconds, ...options } = params;
  return {
    ...options,
    method: 'POST',
    path: '/api/cron/build',
    body: stripNullish({ template, interval, timeOfDay, dayOfMonth, weekDays, includeSeconds }),
    hasBody: true,
  };
}

/** Методы {@link CronResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class CronResourceWithRawResponse extends APIResource {
  /**
   * Парсит и валидирует cron-выражение, возвращает ближайшие даты запуска.
   * Позволяет проверить корректность выражения и увидеть, когда оно сработает.
   *
   * Пример запроса:
   * POST /api/cron/evaluate
   * Body: {
   *   "expression": "0 9 * * 1-5",
   *   "timeZoneId": "Europe/Moscow",
   *   "take": 5
   * }
   *
   * Пример ответа:
   * {
   *   "isValid": true,
   *   "description": "В 09:00, по будням с понедельника по пятницу",
   *   "nextOccurrences": ["2024-01-15T09:00:00+03:00", ...]
   * }
   *
   * @param expression Cron-выражение (5 или 6 полей, допускается ? из Quartz).
   * @param params Необязательные параметры (`EvaluateParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  evaluate(expression: string, params: T.EvaluateParams & RequestOptions = {}): Promise<ApiResponse<T.CronEvaluationResult>> {
    return this._client.requestRaw<T.CronEvaluationResult>(evaluateRequest(expression, params));
  }

  /**
   * Генерирует cron-строку по заданному шаблону и параметрам.
   * Упрощает создание cron-выражений для типовых сценариев.
   *
   * @param params Необязательные параметры (`BuildParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  build(params: T.BuildParams & RequestOptions = {}): Promise<ApiResponse<T.CronBuildResult>> {
    return this._client.requestRaw<T.CronBuildResult>(buildRequest(params));
  }
}

/**
 * API разбора Cron-выражений.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/cron-expression-parser-api-client
 */
export class CronResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: CronResourceWithRawResponse = new CronResourceWithRawResponse(this._client);

  /**
   * Парсит и валидирует cron-выражение, возвращает ближайшие даты запуска.
   * Позволяет проверить корректность выражения и увидеть, когда оно сработает.
   *
   * Пример запроса:
   * POST /api/cron/evaluate
   * Body: {
   *   "expression": "0 9 * * 1-5",
   *   "timeZoneId": "Europe/Moscow",
   *   "take": 5
   * }
   *
   * Пример ответа:
   * {
   *   "isValid": true,
   *   "description": "В 09:00, по будням с понедельника по пятницу",
   *   "nextOccurrences": ["2024-01-15T09:00:00+03:00", ...]
   * }
   *
   * @param expression Cron-выражение (5 или 6 полей, допускается ? из Quartz).
   * @param params Необязательные параметры (`EvaluateParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  evaluate(expression: string, params: T.EvaluateParams & RequestOptions = {}): Promise<T.CronEvaluationResult> {
    return this._client.request<T.CronEvaluationResult>(evaluateRequest(expression, params));
  }

  /**
   * Генерирует cron-строку по заданному шаблону и параметрам.
   * Упрощает создание cron-выражений для типовых сценариев.
   *
   * @param params Необязательные параметры (`BuildParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  build(params: T.BuildParams & RequestOptions = {}): Promise<T.CronBuildResult> {
    return this._client.request<T.CronBuildResult>(buildRequest(params));
  }
}
