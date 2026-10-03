/**
 * Иерархия ошибок SDK.
 *
 * Все ошибки наследуются от {@link AtloriumError}, поэтому достаточно одной проверки:
 *
 * ```ts
 * try {
 *   const card = await client.egrul.get('7707083893');
 * } catch (error) {
 *   if (error instanceof NotFoundError) { ... }        // организации нет в реестре
 *   else if (error instanceof AtloriumError) console.log(error.status, error.errorCode);
 * }
 * ```
 */

// Человекочитаемые причины по коду HTTP — те же формулировки, что в SDK Atlorium для других языков.
const REASONS: Readonly<Record<number, string>> = {
  400: 'Неверный формат входных данных',
  401: 'API-ключ отсутствует, просрочен или недействителен',
  402: 'Недостаточно кредитов на балансе — пополните на https://atlorium.com',
  403: 'Сервис не входит в условия вашей учётной записи. Чтобы подключить его, напишите на support@atlorium.com',
  404: 'Объект не найден либо маршрут не существует',
  429: 'Превышен лимит запросов — повторите позже',
  503:
    'Сервис временно недоступен: сбой внешнего источника данных или плановые работы (коды service_disabled, ' +
    'maintenance; состояние — https://atlorium.com/status). Деньги за такой ответ не списываются',
};

/**
 * @internal Коды ответа 503, при которых повтор бесполезен: плановые работы на сервисе.
 * Прочие 503 (внешний источник данных временно недоступен) повторяются.
 */
export const NON_RETRYABLE_503_CODES: ReadonlySet<string> = new Set(['service_disabled', 'maintenance']);

export interface AtloriumErrorInit {
  status?: number | null;
  body?: unknown;
  headers?: Headers | null;
  requestId?: string | null;
  /** Значение `Retry-After` в секундах (или `retryAfterSeconds` из тела). */
  retryAfter?: number | null;
  cause?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Базовая ошибка SDK. */
export class AtloriumError extends Error {
  override name = 'AtloriumError';
  /** HTTP-статус ответа; `null` для сетевых ошибок. */
  readonly status: number | null;
  /** Тело ответа: разобранный JSON (обычно объект `ApiError`) или текст. */
  readonly body: unknown;
  /** Заголовки ответа; `null` для сетевых ошибок. */
  readonly headers: Headers | null;
  /** Идентификатор запроса из `X-Request-Id`, если сервер его прислал. */
  readonly requestId: string | null;
  /**
   * Стабильный машинный код причины из тела ответа (`not_found`, `insufficient_credits`,
   * `rate_limited_client` …). Ветвиться в коде стоит по нему, а не по тексту сообщения.
   */
  readonly errorCode: string | null;
  /** Короткий заголовок для интерфейса из тела ответа, если есть. */
  readonly title: string | null;
  /**
   * Через сколько **секунд** сервер разрешает повторить запрос: заголовок `Retry-After` или поле
   * `retryAfterSeconds` тела, либо `null`. Бывает у 429 и 503.
   */
  readonly retryAfter: number | null;

  constructor(message: string, init: AtloriumErrorInit = {}) {
    super(message, init.cause === undefined ? undefined : { cause: init.cause });
    this.status = init.status ?? null;
    this.body = init.body;
    this.headers = init.headers ?? null;
    this.requestId = init.requestId ?? null;
    this.retryAfter = init.retryAfter ?? null;
    const body = init.body;
    this.errorCode = isRecord(body) && typeof body.error === 'string' ? body.error : null;
    this.title = isRecord(body) && typeof body.title === 'string' ? body.title : null;
  }
}

/** Не удалось связаться с сервером: DNS, обрыв соединения, TLS и т.п. */
export class APIConnectionError extends AtloriumError {
  override name = 'APIConnectionError';

  constructor(message = 'Не удалось подключиться к API Atlorium', init: AtloriumErrorInit = {}) {
    super(message, init);
  }
}

/** Сервер не ответил за отведённое время (настройка `timeout`). */
export class APITimeoutError extends APIConnectionError {
  override name = 'APITimeoutError';

  constructor(message = 'Истекло время ожидания ответа API Atlorium', init: AtloriumErrorInit = {}) {
    super(message, init);
  }
}

/** HTTP 400: неверный формат входных данных. Отклонённый запрос не тарифицируется. */
export class ValidationError extends AtloriumError {
  override name = 'ValidationError';
}

/** HTTP 401: API-ключ отсутствует, просрочен или недействителен. */
export class AuthenticationError extends AtloriumError {
  override name = 'AuthenticationError';
}

/** HTTP 402: недостаточно кредитов на балансе. */
export class InsufficientCreditsError extends AtloriumError {
  override name = 'InsufficientCreditsError';

  /** Текущий баланс в кредитах, если сервер его сообщил. */
  get balance(): number | null {
    const value = isRecord(this.body) ? this.body.balance : undefined;
    return typeof value === 'number' ? value : null;
  }
}

/**
 * HTTP 403: сервис не входит в условия вашей учётной записи (код `service_not_in_account_terms`).
 * Чтобы подключить его, напишите на support@atlorium.com. Не повторяется.
 */
export class PermissionDeniedError extends AtloriumError {
  override name = 'PermissionDeniedError';
}

/** HTTP 404: объект не найден либо маршрут не существует. */
export class NotFoundError extends AtloriumError {
  override name = 'NotFoundError';
}

/**
 * HTTP 429: превышен лимит запросов. `retryAfter` — через сколько **секунд** сервер разрешает
 * повторить запрос (заголовок `Retry-After` или поле `retryAfterSeconds` тела), либо `null`.
 */
export class RateLimitError extends AtloriumError {
  override name = 'RateLimitError';
}

/** Ответы 5xx: ошибка на стороне сервера. Ловит и {@link ServiceUnavailableError}. */
export class ServerError extends AtloriumError {
  override name = 'ServerError';
}

/**
 * HTTP 503: сервис временно недоступен — сбой внешнего источника данных или плановые работы
 * (коды `service_disabled`, `maintenance`; состояние — https://atlorium.com/status). Деньги за такой
 * ответ не списываются. Наследник {@link ServerError}: `instanceof ServerError` ловит любой 5xx.
 */
export class ServiceUnavailableError extends ServerError {
  override name = 'ServiceUnavailableError';
}

function reasonFor(status: number): string {
  return REASONS[status] ?? (status >= 500 ? 'Внутренняя ошибка сервера' : 'Неожиданный ответ сервера');
}

function extractServerMessage(body: unknown): string | null {
  if (isRecord(body)) {
    for (const key of ['message', 'detail', 'title']) {
      const value = body[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  }
  if (typeof body === 'string' && body.trim()) return body.trim().slice(0, 300);
  return null;
}

/** @internal Создаёт ошибку нужного класса по HTTP-статусу. */
export function makeStatusError(status: number, init: Omit<AtloriumErrorInit, 'status'>): AtloriumError {
  const serverMessage = extractServerMessage(init.body);
  let message = `HTTP ${status}: ${reasonFor(status)}`;
  if (serverMessage) message += `. Ответ сервера: ${serverMessage}`;
  const full = { ...init, status };
  switch (status) {
    case 400:
      return new ValidationError(message, full);
    case 401:
      return new AuthenticationError(message, full);
    case 402:
      return new InsufficientCreditsError(message, full);
    case 403:
      return new PermissionDeniedError(message, full);
    case 404:
      return new NotFoundError(message, full);
    case 429:
      return new RateLimitError(message, full);
    case 503:
      return new ServiceUnavailableError(message, full);
    default:
      return status >= 500 ? new ServerError(message, full) : new AtloriumError(message, full);
  }
}
