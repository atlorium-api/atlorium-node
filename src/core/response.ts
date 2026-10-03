/**
 * Ответ с метаданными: статус, заголовки, признак песочницы, остатки лимита.
 *
 * Обычные методы возвращают сразу данные. Чтобы получить ещё и метаданные, вызовите тот же метод
 * через `withRawResponse`:
 *
 * ```ts
 * const raw = await client.testdata.withRawResponse.generate({ count: 5 });
 * console.log(raw.status, raw.isSandbox, raw.headers.get('X-Atlorium-Seed'));
 * ```
 */

import type { FetchResponse } from './base-client';

export const SANDBOX_HEADER = 'X-Atlorium-Sandbox';

/** Остатки лимита из заголовков `X-RateLimit-*` / `RateLimit-*`, если сервер их прислал. */
export interface RateLimitInfo {
  readonly limit: number | null;
  readonly remaining: number | null;
  readonly reset: number | null;
}

/** Данные ответа вместе с HTTP-метаданными. */
export interface ApiResponse<T> {
  /** Разобранное тело ответа — то же, что возвращает обычный вызов метода. */
  readonly data: T;
  /** HTTP-статус. */
  readonly status: number;
  /** Заголовки ответа. */
  readonly headers: Headers;
  /**
   * `true`, если сервер пометил ответ заголовком `X-Atlorium-Sandbox: true`. У полностью
   * локальных сервисов (например, генератора тестовых данных) заголовка нет даже на демо-ключе —
   * ответ там настоящий.
   */
  readonly isSandbox: boolean;
  /** Идентификатор запроса из `X-Request-Id`, если сервер его прислал. */
  readonly requestId: string | null;
  /** Значение `Retry-After` в секундах, если заголовок есть. */
  readonly retryAfter: number | null;
  /** Остатки лимита или `null`, если сервер не отдаёт соответствующие заголовки. */
  readonly rateLimit: RateLimitInfo | null;
  /**
   * Исходный ответ `fetch` (при своём `options.fetch` — объект, который он вернул). Тело уже прочитано SDK.
   */
  readonly response: Response;
}

function toNumber(value: string | null): number | null {
  if (value === null || !value.trim()) return null;
  const number = Number(value.trim());
  return Number.isFinite(number) ? number : null;
}

/** Разбирает `Retry-After`: число секунд или HTTP-дата (RFC 9110 §10.2.3). */
export function parseRetryAfter(headers: Headers): number | null {
  const raw = headers.get('retry-after')?.trim();
  if (!raw) return null;
  if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw);
  const moment = Date.parse(raw);
  return Number.isNaN(moment) ? null : Math.max(0, (moment - Date.now()) / 1000);
}

/** Разбирает заголовки остатков лимита (оба распространённых варианта именования). */
export function parseRateLimit(headers: Headers): RateLimitInfo | null {
  for (const prefix of ['x-ratelimit-', 'ratelimit-']) {
    const info = {
      limit: toNumber(headers.get(`${prefix}limit`)),
      remaining: toNumber(headers.get(`${prefix}remaining`)),
      reset: toNumber(headers.get(`${prefix}reset`)),
    };
    if (info.limit !== null || info.remaining !== null || info.reset !== null) return info;
  }
  return null;
}

export function requestIdFrom(headers: Headers): string | null {
  return headers.get('x-request-id') || headers.get('request-id') || null;
}

/** Задержка из тела `ApiError` (`retryAfterSeconds`), если заголовка нет. */
export function retryAfterFromBody(body: unknown): number | null {
  if (typeof body === 'object' && body !== null) {
    const value = (body as { retryAfterSeconds?: unknown }).retryAfterSeconds;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  }
  return null;
}

export function makeApiResponse<T>(data: T, response: FetchResponse): ApiResponse<T> {
  const headers = response.headers;
  return {
    data,
    status: response.status,
    headers,
    isSandbox: (headers.get(SANDBOX_HEADER) ?? '').trim().toLowerCase() === 'true',
    requestId: requestIdFrom(headers),
    retryAfter: parseRetryAfter(headers),
    rateLimit: parseRateLimit(headers),
    // Глобальный fetch возвращает настоящий Response; свой fetch обязан вернуть совместимый объект.
    response: response as Response,
  };
}
