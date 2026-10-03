/**
 * Ресурс «API ИИ-чата»: `client.aichat`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions, stripNullish } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/aichat';

function sendRequest(message: string, params: T.SendParams & RequestOptions): FinalRequestOptions {
  const { sessionId, model, ...options } = params;
  return {
    ...options,
    method: 'POST',
    path: '/api/aichat/send',
    body: stripNullish({ message, sessionId, model }),
    hasBody: true,
    defaultTimeout: 660000,
  };
}

function getSessionRequest(sessionId: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/aichat/session/${encodePath(sessionId)}`,
  };
}

function deleteSessionRequest(sessionId: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'DELETE',
    path: `/api/aichat/session/${encodePath(sessionId)}`,
    responseType: 'auto',
  };
}

function listModelsRequest(options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/aichat/models',
  };
}

/** Методы {@link AiChatResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class AiChatResourceWithRawResponse extends APIResource {
  /**
   * Отправляет сообщение ИИ и получает ответ.
   * Автоматически создаёт новую сессию или продолжает существующую.
   *
   * Пример запроса:
   * POST /api/aichat/send
   * Content-Type: application/json
   *
   * {
   *   "message": "Что такое DNS?",
   *   "sessionId": null
   * }
   *
   * Для продолжения диалога передайте sessionId из предыдущего ответа:
   * {
   *   "message": "А как работает DNSSEC?",
   *   "sessionId": "abc123def456"
   * }
   *
   * Ограничения:
   * - Длина сообщения ограничена в токенах и зависит от модели (см. maxInputTokens в GET /api/aichat/models)
   * - Максимум 50 сообщений пользователя в одной сессии
   * - Сессия удаляется через 1 час неактивности
   * - Поле model принимает только модели из GET /api/aichat/models; произвольное имя — 400
   *
   * ТАРИФИКАЦИЯ складывается из ДВУХ составляющих:
   * 1) плата за запрос — фиксированная, одинаковая для всех моделей;
   * 2) стоимость токенов выбранной модели — зависит от модели и от длины диалога.
   *    У бесплатных моделей она равна нулю, и тогда вы платите только за запрос.
   *    Цены токенов каждой модели — в GET /api/aichat/models (inputPricePer1kTokens,
   *    outputPricePer1kTokens) и на странице тарифов.
   *
   * В ответе возвращаются фактически израсходованные токены (promptTokens/completionTokens) —
   * именно по ним и считается вторая составляющая.
   *
   * ВАЖНО ПРО БАЛАНС: перед вызовом модели временно удерживается максимально возможная
   * стоимость запроса (весь ввод + самый длинный ответ), а списывается только фактически
   * израсходованное — остаток удержания сразу возвращается. Поэтому для запроса к дорогой
   * модели на балансе должен быть этот максимум, даже если по факту спишется меньше.
   * Если баланса не хватает на удержание — 402 Payment Required.
   *
   * ВРЕМЯ ОТВЕТА: ответ приходит целиком, а не частями, и перед ответом модель рассуждает.
   * Короткий ответ приходит за секунды, развёрнутый ответ флагманской модели — за несколько
   * минут. Ставьте таймаут HTTP-клиента не меньше 10 минут: если клиент оборвёт соединение
   * раньше, модель всё равно допишет ответ, и запрос будет оплачен как выполненный.
   * Не тарифицируются только сбои: модель не ответила за 10 минут или вернула ответ без
   * текста (израсходовала лимит ответа на рассуждения) — в обоих случаях код 500.
   *
   * @param message Текст сообщения пользователя (обязательное поле; длина ограничена в зависимости от выбранной модели).
   * @param params Необязательные параметры (`SendParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  send(message: string, params: T.SendParams & RequestOptions = {}): Promise<ApiResponse<T.AiChatResponse>> {
    return this._client.requestRaw<T.AiChatResponse>(sendRequest(message, params));
  }

  /**
   * Получает информацию о сессии чата по её идентификатору.
   * Возвращает количество сообщений, время создания и последней активности.
   *
   * Пример запроса:
   * GET /api/aichat/session/abc123def456789012345678abcdef00
   *
   * Сессии сохраняются и автоматически удаляются через 1 час неактивности.
   *
   * @param sessionId Уникальный идентификатор сессии чата. Формат: строка из 32 шестнадцатеричных символов (GUID без дефисов). Пример: abc123def456789012345678abcdef00 Идентификатор возвращается в ответе метода SendMessage при создании новой сессии.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getSession(sessionId: string, options: RequestOptions = {}): Promise<ApiResponse<T.AiChatSession>> {
    return this._client.requestRaw<T.AiChatSession>(getSessionRequest(sessionId, options));
  }

  /**
   * Удаляет сессию чата и всю историю сообщений.
   * После удаления сессию невозможно восстановить.
   *
   * Пример запроса:
   * DELETE /api/aichat/session/abc123def456789012345678abcdef00
   *
   * После удаления все сообщения сессии безвозвратно удаляются.
   * Повторная отправка сообщения с тем же sessionId создаст новую пустую сессию.
   *
   * @param sessionId Уникальный идентификатор сессии чата для удаления. Формат: строка из 32 шестнадцатеричных символов (GUID без дефисов). Пример: abc123def456789012345678abcdef00
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  deleteSession(sessionId: string, options: RequestOptions = {}): Promise<ApiResponse<string>> {
    return this._client.requestRaw<string>(deleteSessionRequest(sessionId, options));
  }

  /**
   * Возвращает список доступных ИИ моделей.
   * Каждая модель имеет уникальный идентификатор, название, описание и лимит токенов.
   *
   * Пример запроса:
   * GET /api/aichat/models
   *
   * Список моделей может меняться. Этот метод бесплатный и не тарифицируется —
   * тарифицируется только POST /api/aichat/send. Чтобы обратиться к конкретной модели,
   * передайте её id в поле model запроса на отправку сообщения.
   *
   * Стоимость запроса к /api/aichat/send складывается из двух частей: фиксированной платы
   * за запрос (одинаковой для всех моделей) и стоимости токенов выбранной модели —
   * она у моделей РАЗНАЯ (inputPricePer1kTokens/outputPricePer1kTokens ниже, для бесплатных
   * моделей — ноль). Подробности — в описании метода POST /api/aichat/send.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  listModels(options: RequestOptions = {}): Promise<ApiResponse<T.AiModelInfo[]>> {
    return this._client.requestRaw<T.AiModelInfo[]>(listModelsRequest(options));
  }
}

/**
 * API ИИ-чата.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/ai-chat-api-client
 */
export class AiChatResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: AiChatResourceWithRawResponse = new AiChatResourceWithRawResponse(this._client);

  /**
   * Отправляет сообщение ИИ и получает ответ.
   * Автоматически создаёт новую сессию или продолжает существующую.
   *
   * Пример запроса:
   * POST /api/aichat/send
   * Content-Type: application/json
   *
   * {
   *   "message": "Что такое DNS?",
   *   "sessionId": null
   * }
   *
   * Для продолжения диалога передайте sessionId из предыдущего ответа:
   * {
   *   "message": "А как работает DNSSEC?",
   *   "sessionId": "abc123def456"
   * }
   *
   * Ограничения:
   * - Длина сообщения ограничена в токенах и зависит от модели (см. maxInputTokens в GET /api/aichat/models)
   * - Максимум 50 сообщений пользователя в одной сессии
   * - Сессия удаляется через 1 час неактивности
   * - Поле model принимает только модели из GET /api/aichat/models; произвольное имя — 400
   *
   * ТАРИФИКАЦИЯ складывается из ДВУХ составляющих:
   * 1) плата за запрос — фиксированная, одинаковая для всех моделей;
   * 2) стоимость токенов выбранной модели — зависит от модели и от длины диалога.
   *    У бесплатных моделей она равна нулю, и тогда вы платите только за запрос.
   *    Цены токенов каждой модели — в GET /api/aichat/models (inputPricePer1kTokens,
   *    outputPricePer1kTokens) и на странице тарифов.
   *
   * В ответе возвращаются фактически израсходованные токены (promptTokens/completionTokens) —
   * именно по ним и считается вторая составляющая.
   *
   * ВАЖНО ПРО БАЛАНС: перед вызовом модели временно удерживается максимально возможная
   * стоимость запроса (весь ввод + самый длинный ответ), а списывается только фактически
   * израсходованное — остаток удержания сразу возвращается. Поэтому для запроса к дорогой
   * модели на балансе должен быть этот максимум, даже если по факту спишется меньше.
   * Если баланса не хватает на удержание — 402 Payment Required.
   *
   * ВРЕМЯ ОТВЕТА: ответ приходит целиком, а не частями, и перед ответом модель рассуждает.
   * Короткий ответ приходит за секунды, развёрнутый ответ флагманской модели — за несколько
   * минут. Ставьте таймаут HTTP-клиента не меньше 10 минут: если клиент оборвёт соединение
   * раньше, модель всё равно допишет ответ, и запрос будет оплачен как выполненный.
   * Не тарифицируются только сбои: модель не ответила за 10 минут или вернула ответ без
   * текста (израсходовала лимит ответа на рассуждения) — в обоих случаях код 500.
   *
   * @param message Текст сообщения пользователя (обязательное поле; длина ограничена в зависимости от выбранной модели).
   * @param params Необязательные параметры (`SendParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  send(message: string, params: T.SendParams & RequestOptions = {}): Promise<T.AiChatResponse> {
    return this._client.request<T.AiChatResponse>(sendRequest(message, params));
  }

  /**
   * Получает информацию о сессии чата по её идентификатору.
   * Возвращает количество сообщений, время создания и последней активности.
   *
   * Пример запроса:
   * GET /api/aichat/session/abc123def456789012345678abcdef00
   *
   * Сессии сохраняются и автоматически удаляются через 1 час неактивности.
   *
   * @param sessionId Уникальный идентификатор сессии чата. Формат: строка из 32 шестнадцатеричных символов (GUID без дефисов). Пример: abc123def456789012345678abcdef00 Идентификатор возвращается в ответе метода SendMessage при создании новой сессии.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getSession(sessionId: string, options: RequestOptions = {}): Promise<T.AiChatSession> {
    return this._client.request<T.AiChatSession>(getSessionRequest(sessionId, options));
  }

  /**
   * Удаляет сессию чата и всю историю сообщений.
   * После удаления сессию невозможно восстановить.
   *
   * Пример запроса:
   * DELETE /api/aichat/session/abc123def456789012345678abcdef00
   *
   * После удаления все сообщения сессии безвозвратно удаляются.
   * Повторная отправка сообщения с тем же sessionId создаст новую пустую сессию.
   *
   * @param sessionId Уникальный идентификатор сессии чата для удаления. Формат: строка из 32 шестнадцатеричных символов (GUID без дефисов). Пример: abc123def456789012345678abcdef00
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  deleteSession(sessionId: string, options: RequestOptions = {}): Promise<string> {
    return this._client.request<string>(deleteSessionRequest(sessionId, options));
  }

  /**
   * Возвращает список доступных ИИ моделей.
   * Каждая модель имеет уникальный идентификатор, название, описание и лимит токенов.
   *
   * Пример запроса:
   * GET /api/aichat/models
   *
   * Список моделей может меняться. Этот метод бесплатный и не тарифицируется —
   * тарифицируется только POST /api/aichat/send. Чтобы обратиться к конкретной модели,
   * передайте её id в поле model запроса на отправку сообщения.
   *
   * Стоимость запроса к /api/aichat/send складывается из двух частей: фиксированной платы
   * за запрос (одинаковой для всех моделей) и стоимости токенов выбранной модели —
   * она у моделей РАЗНАЯ (inputPricePer1kTokens/outputPricePer1kTokens ниже, для бесплатных
   * моделей — ноль). Подробности — в описании метода POST /api/aichat/send.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  listModels(options: RequestOptions = {}): Promise<T.AiModelInfo[]> {
    return this._client.request<T.AiModelInfo[]>(listModelsRequest(options));
  }
}
