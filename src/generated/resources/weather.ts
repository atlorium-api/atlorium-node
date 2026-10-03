/**
 * Ресурс «API погодных данных»: `client.weather`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/weather';

function getRequest(latitude: number, longitude: number, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/weather',
    query: { latitude, longitude },
  };
}

/** Методы {@link WeatherResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class WeatherResourceWithRawResponse extends APIResource {
  /**
   * Получает текущие погодные данные для указанных географических координат.
   *
   * Пример запроса для Москвы:
   * GET /api/weather?latitude=55.7558&longitude=37.6173
   *
   * Пример запроса для Санкт-Петербурга:
   * GET /api/weather?latitude=59.9343&longitude=30.3351
   *
   * Ограничения:
   * - При превышении лимита запросов возвращается код 429
   * - Координаты должны быть в допустимых диапазонах
   *
   * @param latitude Географическая широта в градусах (десятичный формат). Допустимые значения: от -90.0 до +90.0 - Положительные значения: Северное полушарие (например, 55.7558 — Москва) - Отрицательные значения: Южное полушарие (например, -33.8688 — Сидней) - 0: Экватор Примеры: 55.7558 (Москва), 51.5074 (Лондон), 40.7128 (Нью-Йорк)
   * @param longitude Географическая долгота в градусах (десятичный формат). Допустимые значения: от -180.0 до +180.0 - Положительные значения: Восточное полушарие (например, 37.6173 — Москва) - Отрицательные значения: Западное полушарие (например, -74.0060 — Нью-Йорк) - 0: Нулевой меридиан (Гринвич) Примеры: 37.6173 (Москва), -0.1278 (Лондон), -74.0060 (Нью-Йорк)
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(latitude: number, longitude: number, options: RequestOptions = {}): Promise<ApiResponse<T.WeatherData>> {
    return this._client.requestRaw<T.WeatherData>(getRequest(latitude, longitude, options));
  }
}

/**
 * API погодных данных.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/weather-api-client
 */
export class WeatherResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: WeatherResourceWithRawResponse = new WeatherResourceWithRawResponse(this._client);

  /**
   * Получает текущие погодные данные для указанных географических координат.
   *
   * Пример запроса для Москвы:
   * GET /api/weather?latitude=55.7558&longitude=37.6173
   *
   * Пример запроса для Санкт-Петербурга:
   * GET /api/weather?latitude=59.9343&longitude=30.3351
   *
   * Ограничения:
   * - При превышении лимита запросов возвращается код 429
   * - Координаты должны быть в допустимых диапазонах
   *
   * @param latitude Географическая широта в градусах (десятичный формат). Допустимые значения: от -90.0 до +90.0 - Положительные значения: Северное полушарие (например, 55.7558 — Москва) - Отрицательные значения: Южное полушарие (например, -33.8688 — Сидней) - 0: Экватор Примеры: 55.7558 (Москва), 51.5074 (Лондон), 40.7128 (Нью-Йорк)
   * @param longitude Географическая долгота в градусах (десятичный формат). Допустимые значения: от -180.0 до +180.0 - Положительные значения: Восточное полушарие (например, 37.6173 — Москва) - Отрицательные значения: Западное полушарие (например, -74.0060 — Нью-Йорк) - 0: Нулевой меридиан (Гринвич) Примеры: 37.6173 (Москва), -0.1278 (Лондон), -74.0060 (Нью-Йорк)
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  get(latitude: number, longitude: number, options: RequestOptions = {}): Promise<T.WeatherData> {
    return this._client.request<T.WeatherData>(getRequest(latitude, longitude, options));
  }
}
