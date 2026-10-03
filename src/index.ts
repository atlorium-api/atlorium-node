/**
 * Официальный SDK Atlorium для TypeScript и JavaScript — 23 B2B API для российского рынка.
 *
 * ```ts
 * import { Atlorium } from 'atlorium';
 *
 * const client = new Atlorium(); // без ключа — демо-режим: ответы-моки
 * const card = await client.egrul.get('7707083893');
 * ```
 *
 * Документация: https://atlorium.com, исходники: https://github.com/atlorium-api/atlorium-node
 */

export { Atlorium } from './generated/client';
export {
  APIResource,
  BaseClient,
  DEFAULT_BASE_URL,
  DEFAULT_MAX_RETRIES,
  DEFAULT_TIMEOUT,
  MAX_RETRY_DELAY_SECONDS,
  SANDBOX_API_KEY,
} from './core/base-client';
export type { ClientOptions, Fetch, FetchInit, FetchResponse, RequestOptions } from './core/base-client';
export type { ApiResponse, RateLimitInfo } from './core/response';
export type { FileInput } from './core/files';
export {
  APIConnectionError,
  APITimeoutError,
  AtloriumError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  ServerError,
  ServiceUnavailableError,
  ValidationError,
} from './errors';
export { VERSION } from './version';
export * from './generated/types';
export * from './generated/resources';
