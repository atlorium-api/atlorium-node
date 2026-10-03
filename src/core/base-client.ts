/**
 * Транспортное ядро: ключ, заголовки, сериализация параметров, таймауты, ретраи и разбор ответов.
 *
 * Ядро не использует API Node.js и работает везде, где есть глобальный `fetch`.
 */

import { APIConnectionError, APITimeoutError, AtloriumError, makeStatusError, NON_RETRYABLE_503_CODES } from '../errors';
import { VERSION } from '../version';
import { makeApiResponse, parseRetryAfter, requestIdFrom, retryAfterFromBody, type ApiResponse } from './response';
import { getEnv, sleep, userAgent } from './runtime';

/** Публичный демо-ключ. С ним API отвечает детерминированными моками, а не реальными данными. */
export const SANDBOX_API_KEY = 'ak_sandbox_demo_mockdata_v1';
export const DEFAULT_BASE_URL = 'https://atlorium.com';
/** Таймаут запроса по умолчанию, миллисекунд. */
export const DEFAULT_TIMEOUT = 30_000;
export const DEFAULT_MAX_RETRIES = 2;
/**
 * Потолок ожидания перед повтором, **секунд**. Если сервер просит подождать дольше (исчерпан лимит
 * за длинный период, заглушка на время работ), ждать внутри вызова нельзя: такой ответ сразу
 * превращается в ошибку по статусу (`RateLimitError` для 429, `ServiceUnavailableError` для 503)
 * с `retryAfter`.
 */
export const MAX_RETRY_DELAY_SECONDS = 120;
const INITIAL_RETRY_DELAY = 500;
const MAX_BACKOFF_DELAY = 8_000;

/**
 * Что SDK передаёт в `fetch`. Описано структурно, чтобы подошли и глобальный `fetch`, и
 * `fetch` из пакета `undici` (у него свои классы `Request`/`Response`), и любые обёртки.
 */
export interface FetchInit {
  method: string;
  headers: Record<string, string>;
  /** Тело запроса — JSON-строка; у запросов без тела отсутствует. */
  body?: string;
  signal: AbortSignal;
}

/** Ответ `fetch` — ровно то, что читает SDK. Глобальный `Response` подходит. */
export interface FetchResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly headers: Headers;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/** Реализация `fetch` для `ClientOptions.fetch`: глобальный `fetch`, `undici.fetch` или своя обёртка. */
export type Fetch = (input: string, init: FetchInit) => Promise<FetchResponse>;

export interface ClientOptions {
  /**
   * API-ключ. Если не задан — переменная окружения `ATLORIUM_API_KEY`, а если нет и её — публичный
   * демо-ключ `ak_sandbox_demo_mockdata_v1` (ответы-моки; см. `isSandbox`).
   *
   * Не встраивайте боевой ключ во фронтенд: вызывайте API со своего сервера.
   */
  apiKey?: string | null;
  /** Адрес API, по умолчанию `https://atlorium.com` или `ATLORIUM_BASE_URL`. */
  baseUrl?: string | null;
  /**
   * Таймаут одного HTTP-запроса, **миллисекунд**. По умолчанию 30 000. Для тяжёлых операций действует
   * свой минимум (OCR и аудит сайта — 120 с, ИИ-чат — 660 с). Любой метод принимает свой `timeout`.
   */
  timeout?: number;
  /**
   * Сколько раз повторять запрос на 429, 503 и сетевых ошибках. По умолчанию 2. 503 с кодом
   * `service_disabled` или `maintenance` (плановые работы) не повторяется.
   */
  maxRetries?: number;
  /** Своя реализация `fetch` (прокси, тесты, старые среды). По умолчанию — глобальный `fetch`. */
  fetch?: Fetch;
  /** Дополнительные заголовки для каждого запроса. */
  defaultHeaders?: Record<string, string>;
}

/** Настройки одного вызова. Передаются в том же объекте, что и необязательные параметры метода. */
export interface RequestOptions {
  /** Таймаут этого вызова, миллисекунд. Перекрывает настройки клиента и минимум операции. */
  timeout?: number;
  /** Отмена запроса. Отменённый запрос не повторяется. */
  signal?: AbortSignal;
  /** Число повторов для этого вызова. */
  maxRetries?: number;
  /** Дополнительные заголовки для этого вызова. */
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ResponseType = 'json' | 'bytes' | 'text' | 'auto';
export type QueryValue = string | number | boolean | Date | readonly (string | number)[] | null | undefined;

/** @internal Полное описание вызова — то, что ресурс передаёт транспорту. */
export interface FinalRequestOptions extends RequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  hasBody?: boolean;
  /** Минимальный таймаут операции по умолчанию, миллисекунд. */
  defaultTimeout?: number;
  responseType?: ResponseType;
}

const INSPECT: unique symbol = Symbol.for('nodejs.util.inspect.custom');

/** Приводит значение параметра строки запроса к виду, который понимает сервер. */
export function serializeQueryValue(value: Exclude<QueryValue, null | undefined>): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => String(item)).join(',');
  return String(value);
}

function backoffDelay(attempt: number): number {
  const base = Math.min(INITIAL_RETRY_DELAY * 2 ** attempt, MAX_BACKOFF_DELAY);
  return base * (0.75 + Math.random() * 0.5);
}

const decoder = new TextDecoder();

function isJsonContentType(value: string | null): boolean {
  const type = (value ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
  return type === 'application/json' || type === 'text/json' || type.endsWith('+json');
}

function parseBody(response: FetchResponse, bytes: Uint8Array, responseType: ResponseType): unknown {
  if (responseType === 'bytes') return bytes;
  const text = decoder.decode(bytes);
  if (responseType === 'text') return text;
  if (bytes.length === 0) return null;
  // Сервер вернул не JSON (например, CSV или простой текст) — отдаём строкой.
  if (responseType === 'auto' && !isJsonContentType(response.headers.get('content-type'))) return text;
  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new AtloriumError(`HTTP ${response.status}: сервер вернул некорректный JSON`, {
      status: response.status,
      body: text,
      headers: response.headers,
      cause,
    });
  }
}

/** Машинный код причины (`error`) из тела ошибки, если он там есть. */
function errorCodeOf(body: unknown): string | undefined {
  const value = typeof body === 'object' && body !== null ? (body as { error?: unknown }).error : undefined;
  return typeof value === 'string' ? value : undefined;
}

function parseErrorBody(bytes: Uint8Array): unknown {
  const text = decoder.decode(bytes);
  try {
    return text ? (JSON.parse(text) as unknown) : text;
  } catch {
    return text;
  }
}

function errorCode(error: unknown): string | undefined {
  const cause = (error as { cause?: { code?: unknown; errors?: { code?: unknown }[] } } | null)?.cause;
  const code = cause?.code ?? cause?.errors?.[0]?.code;
  return typeof code === 'string' ? code : undefined;
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const code = errorCode(error);
  return code ? `${error.name} (${code})` : error.name;
}

/**
 * Коды ошибок, при которых соединение не установилось и запрос точно не дошёл до сервера.
 * Только их безопасно повторять для POST: POST-операции платные и неидемпотентные, и повтор после
 * таймаута или обрыва мог бы выполнить операцию (и списать деньги) второй раз.
 */
const NOT_SENT_CODES = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'UND_ERR_CONNECT_TIMEOUT',
]);

/** Ошибки соединения, после которых запрос заведомо не ушёл на сервер. */
const notSentErrors = new WeakSet<APIConnectionError>();

let sandboxWarned = false;

/** Предупреждает (один раз за процесс), что ключ не задан и ответы API будут моками. */
function warnImplicitSandbox(): void {
  if (sandboxWarned) return;
  sandboxWarned = true;
  globalThis.console?.warn?.(
    '[atlorium] API-ключ не задан (ни options.apiKey, ни ATLORIUM_API_KEY) — клиент работает на публичном ' +
      'демо-ключе, ответы API — моки, а не реальные данные. Чтобы явно выбрать демо-режим без ' +
      'предупреждения, передайте apiKey: SANDBOX_API_KEY.',
  );
}

/** Общая часть клиента: всё, кроме ресурсов. */
export class BaseClient {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly #apiKey: string;
  readonly #fetch: Fetch;
  readonly #defaultHeaders: Record<string, string>;
  /** @internal Пауза между попытками; подменяется в тестах. */
  _sleep: (ms: number, signal?: AbortSignal) => Promise<void> = sleep;

  constructor(options: ClientOptions = {}) {
    // Ключ — в приватном поле: он не виден ни в console.log, ни в JSON.stringify, ни в ошибках.
    const apiKey = options.apiKey?.trim() || getEnv('ATLORIUM_API_KEY');
    // Молча перейти на моки в проде опасно: проверки контрагентов вернут выдуманные данные.
    if (!apiKey) warnImplicitSandbox();
    this.#apiKey = apiKey || SANDBOX_API_KEY;
    this.baseUrl = (options.baseUrl?.trim() || getEnv('ATLORIUM_BASE_URL') || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    if (!(this.timeout > 0)) throw new RangeError('timeout должен быть положительным числом миллисекунд');
    if (!Number.isInteger(this.maxRetries) || this.maxRetries < 0) {
      throw new RangeError('maxRetries должен быть целым неотрицательным числом');
    }
    if (!options.fetch && typeof globalThis.fetch !== 'function') {
      throw new AtloriumError('Глобальный fetch недоступен: нужен Node.js 20+ или передайте options.fetch');
    }
    this.#fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
    this.#defaultHeaders = { ...options.defaultHeaders };
  }

  /** `true`, если клиент работает на публичном демо-ключе (ответы — моки). */
  get isSandbox(): boolean {
    return this.#apiKey === SANDBOX_API_KEY;
  }

  /** @internal Настройки для копии клиента (`withOptions`). */
  protected _clientOptions(): ClientOptions {
    return {
      apiKey: this.#apiKey,
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      fetch: this.#fetch,
      defaultHeaders: { ...this.#defaultHeaders },
    };
  }

  toJSON(): { baseUrl: string; isSandbox: boolean } {
    return { baseUrl: this.baseUrl, isSandbox: this.isSandbox };
  }

  [INSPECT](): string {
    return `${this.constructor.name} { baseUrl: '${this.baseUrl}', isSandbox: ${this.isSandbox} }`;
  }

  /**
   * Низкоуровневый вызов: возвращает разобранное тело. Обычно не нужен — используйте ресурсы
   * (`client.egrul.get(...)`).
   */
  async request<T>(options: FinalRequestOptions | Promise<FinalRequestOptions>): Promise<T> {
    const { data } = await this.#execute(await options);
    return data as T;
  }

  /** Как {@link request}, но возвращает данные вместе с метаданными ответа. */
  async requestRaw<T>(options: FinalRequestOptions | Promise<FinalRequestOptions>): Promise<ApiResponse<T>> {
    const { data, response } = await this.#execute(await options);
    return makeApiResponse(data as T, response);
  }

  protected buildUrl(path: string, query?: Record<string, QueryValue>): string {
    const url = new URL(this.baseUrl + path);
    for (const [key, value] of Object.entries(query ?? {})) {
      // Непереданный параметр не отправляется — тогда действует серверный дефолт.
      if (value === undefined || value === null) continue;
      url.searchParams.append(key, serializeQueryValue(value));
    }
    return url.toString();
  }

  protected buildHeaders(options: FinalRequestOptions): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json', ...this.#defaultHeaders };
    const agent = userAgent(VERSION);
    if (agent) headers['User-Agent'] = agent;
    if (options.hasBody) headers['Content-Type'] = 'application/json';
    Object.assign(headers, options.headers);
    headers.Authorization = `Bearer ${this.#apiKey}`;
    return headers;
  }

  #effectiveTimeout(options: FinalRequestOptions): number {
    if (options.timeout !== undefined) return options.timeout;
    if (options.defaultTimeout !== undefined) return Math.max(this.timeout, options.defaultTimeout);
    return this.timeout;
  }

  async #execute(options: FinalRequestOptions): Promise<{ data: unknown; response: FetchResponse }> {
    const maxRetries = options.maxRetries ?? this.maxRetries;
    const url = this.buildUrl(options.path, options.query);
    const init: Omit<FetchInit, 'signal'> = { method: options.method, headers: this.buildHeaders(options) };
    if (options.hasBody) init.body = JSON.stringify(options.body ?? null);
    const timeout = this.#effectiveTimeout(options);

    for (let attempt = 0; ; attempt += 1) {
      let result: { response: FetchResponse; bytes: Uint8Array };
      try {
        result = await this.#attempt(url, init, timeout, options.signal);
      } catch (error) {
        // GET и DELETE повторяются при любой сетевой ошибке, POST — только если запрос не ушёл.
        const retryable =
          error instanceof APIConnectionError && (options.method !== 'POST' || notSentErrors.has(error));
        if (retryable && attempt < maxRetries) {
          await this.#pause(backoffDelay(attempt), options.signal);
          continue;
        }
        throw error;
      }

      const { response, bytes } = result;
      if (response.ok) return { data: parseBody(response, bytes, options.responseType ?? 'json'), response };

      const body = parseErrorBody(bytes);
      const retryAfter = parseRetryAfter(response.headers) ?? retryAfterFromBody(body);
      // 503 с кодом service_disabled/maintenance — плановые работы: повтор через секунду бесполезен.
      const retryable =
        response.status === 429 || (response.status === 503 && !NON_RETRYABLE_503_CODES.has(errorCodeOf(body) ?? ''));
      // Сервер просит ждать дольше разумного — не вешаем вызов, отдаём ошибку по статусу сразу.
      if (retryable && attempt < maxRetries && (retryAfter === null || retryAfter <= MAX_RETRY_DELAY_SECONDS)) {
        await this.#pause(retryAfter !== null ? retryAfter * 1000 : backoffDelay(attempt), options.signal);
        continue;
      }
      throw makeStatusError(response.status, {
        body,
        headers: response.headers,
        requestId: requestIdFrom(response.headers),
        retryAfter,
      });
    }
  }

  /** Пауза перед повтором, которую прерывает `signal`: отменённый вызов не ждёт до конца паузы. */
  async #pause(ms: number, signal: AbortSignal | undefined): Promise<void> {
    if (!signal) return this._sleep(ms);
    if (signal.aborted) throw signal.reason;
    let onAbort: (() => void) | undefined;
    const aborted = new Promise<never>((_, reject) => {
      onAbort = () => reject(signal.reason);
      signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
      await Promise.race([this._sleep(ms, signal), aborted]);
    } finally {
      if (onAbort) signal.removeEventListener('abort', onAbort);
    }
  }

  /** Одна попытка: запрос и чтение тела целиком под одним таймаутом. */
  async #attempt(
    url: string,
    init: Omit<FetchInit, 'signal'>,
    timeout: number,
    signal: AbortSignal | undefined,
  ): Promise<{ response: FetchResponse; bytes: Uint8Array }> {
    if (signal?.aborted) throw signal.reason;
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);
    const onAbort = (): void => controller.abort(signal?.reason);
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await this.#fetch(url, { ...init, signal: controller.signal });
      const bytes = new Uint8Array(await response.arrayBuffer());
      return { response, bytes };
    } catch (error) {
      if (signal?.aborted) throw signal.reason ?? error;
      if (timedOut) throw new APITimeoutError(undefined, { cause: error });
      const connectionError = new APIConnectionError(`Не удалось подключиться к API Atlorium: ${describeError(error)}`, {
        cause: error,
      });
      const code = errorCode(error);
      if (code !== undefined && NOT_SENT_CODES.has(code)) notSentErrors.add(connectionError);
      throw connectionError;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}

/** Базовый класс ресурса (одного сервиса Atlorium). */
export abstract class APIResource {
  protected readonly _client: BaseClient;

  constructor(client: BaseClient) {
    this._client = client;
  }
}

/** @internal Экранирует значение для подстановки в путь (`/`, пробелы, кириллица). */
export function encodePath(value: string | number): string {
  return encodeURIComponent(String(value));
}

/** @internal Убирает из тела непереданные поля — тогда действует серверный дефолт. */
export function stripNullish(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null));
}

/** @internal Строка или массив строк → массив (строка не разбивается на символы). */
export function toList(value: string | readonly string[]): string[] {
  return typeof value === 'string' ? [value] : [...value];
}
