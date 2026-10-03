/**
 * Ресурс «API AML-скоринга»: `client.aml`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, stripNullish } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/aml';

function screenRequest(walletAddress: string, blockchain: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'POST',
    path: '/api/aml/screen',
    body: stripNullish({ walletAddress, blockchain }),
    hasBody: true,
  };
}

function validateRequest(walletAddress: string, blockchain: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/aml/validate',
    query: { walletAddress, blockchain },
  };
}

/** Методы {@link AmlResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class AmlResourceWithRawResponse extends APIResource {
  /**
   * Выполняет AML-скрининг криптокошелька по адресу и сети.
   *
   * Пример запроса:
   * POST /api/aml/screen
   * { "walletAddress": "0x26a5919cd0392df875a53873b0323c42094bb216", "blockchain": "BNB" }
   *
   * Тарификация: списывается только успешный скрининг. Если сервис временно недоступен или
   * входные данные некорректны, списания не происходит.
   *
   * @param walletAddress Адрес криптокошелька для проверки (обязателен).
   * @param blockchain Сеть (блокчейн) адреса: "BTC", "ETH", "BNB", "TRX", "SOL" и т.д. (обязательно). Должна входить в список поддерживаемых сетей AmlBlockchains.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  screen(walletAddress: string, blockchain: string, options: RequestOptions = {}): Promise<ApiResponse<T.AmlScreeningResult>> {
    return this._client.requestRaw<T.AmlScreeningResult>(screenRequest(walletAddress, blockchain, options));
  }

  /**
   * Проверяет входные данные AML-скрининга: поддержку сети и формат адреса.
   * Проверяет формат, а не существование адреса в блокчейне.
   *
   * Пример запроса:
   * GET /api/aml/validate?walletAddress=0x26a5919cd0392df875a53873b0323c42094bb216&blockchain=BNB
   *
   * @param walletAddress Проверяемый адрес кошелька.
   * @param blockchain Код сети (например, "ETH", "BTC", "BNB").
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(walletAddress: string, blockchain: string, options: RequestOptions = {}): Promise<ApiResponse<T.AmlValidationResult>> {
    return this._client.requestRaw<T.AmlValidationResult>(validateRequest(walletAddress, blockchain, options));
  }
}

/**
 * API AML-скоринга.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/aml-crypto-screening-api-client
 */
export class AmlResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: AmlResourceWithRawResponse = new AmlResourceWithRawResponse(this._client);

  /**
   * Выполняет AML-скрининг криптокошелька по адресу и сети.
   *
   * Пример запроса:
   * POST /api/aml/screen
   * { "walletAddress": "0x26a5919cd0392df875a53873b0323c42094bb216", "blockchain": "BNB" }
   *
   * Тарификация: списывается только успешный скрининг. Если сервис временно недоступен или
   * входные данные некорректны, списания не происходит.
   *
   * @param walletAddress Адрес криптокошелька для проверки (обязателен).
   * @param blockchain Сеть (блокчейн) адреса: "BTC", "ETH", "BNB", "TRX", "SOL" и т.д. (обязательно). Должна входить в список поддерживаемых сетей AmlBlockchains.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  screen(walletAddress: string, blockchain: string, options: RequestOptions = {}): Promise<T.AmlScreeningResult> {
    return this._client.request<T.AmlScreeningResult>(screenRequest(walletAddress, blockchain, options));
  }

  /**
   * Проверяет входные данные AML-скрининга: поддержку сети и формат адреса.
   * Проверяет формат, а не существование адреса в блокчейне.
   *
   * Пример запроса:
   * GET /api/aml/validate?walletAddress=0x26a5919cd0392df875a53873b0323c42094bb216&blockchain=BNB
   *
   * @param walletAddress Проверяемый адрес кошелька.
   * @param blockchain Код сети (например, "ETH", "BTC", "BNB").
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  validate(walletAddress: string, blockchain: string, options: RequestOptions = {}): Promise<T.AmlValidationResult> {
    return this._client.request<T.AmlValidationResult>(validateRequest(walletAddress, blockchain, options));
  }
}
