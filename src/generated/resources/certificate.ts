/**
 * Ресурс «API проверки SSL-сертификата»: `client.certificate`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/certificate';

function checkRequest(host: string, params: T.CheckParams & RequestOptions): FinalRequestOptions {
  const { port, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/certificate',
    query: { host, port },
  };
}

function checkUrlRequest(url: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/certificate/url',
    query: { url },
  };
}

function checkBatchRequest(hosts: string | readonly string[], params: T.CheckBatchParams & RequestOptions): FinalRequestOptions {
  const { port, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/certificate/batch',
    query: { hosts, port },
  };
}

/** Методы {@link CertificateResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class CertificateResourceWithRawResponse extends APIResource {
  /**
   * Проверяет SSL/TLS сертификат по доменному имени и порту.
   * Подключается к серверу, извлекает сертификат и возвращает подробную информацию о нём.
   *
   * Пример запроса:
   * GET /api/certificate?host=google.com
   * GET /api/certificate?host=mail.server.com&port=993
   *
   * Сервис устанавливает TLS-соединение с указанным хостом и портом,
   * извлекает представленный сервером сертификат и анализирует его содержимое.
   *
   * @param host Доменное имя сервера для проверки. Поддерживаемые форматы: - Чистое доменное имя: example.com - С поддоменом: www.example.com - IP-адрес: 192.168.1.1 Примеры: google.com, github.com, microsoft.com
   * @param params Необязательные параметры (`CheckParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  check(host: string, params: T.CheckParams & RequestOptions = {}): Promise<ApiResponse<T.CertificateData>> {
    return this._client.requestRaw<T.CertificateData>(checkRequest(host, params));
  }

  /**
   * Проверяет SSL/TLS сертификат по полному URL.
   * Автоматически извлекает хост и порт из URL и выполняет проверку сертификата.
   *
   * Пример запроса:
   * GET /api/certificate/url?url=https://google.com
   * GET /api/certificate/url?url=https://mail.server.com:993
   *
   * Этот метод удобен, когда вы хотите проверить сертификат по URL,
   * который пользователь скопировал из браузера — без необходимости
   * разбирать URL на хост и порт вручную.
   *
   * @param url Полный URL для проверки. Поддерживаемые форматы: - Полный URL с протоколом: https://example.com - URL с портом: https://example.com:8443 - URL с путём: https://example.com:8443/api/v1 Примеры: - https://google.com - https://secure.bank.com:8443 - https://api.github.com/users Если порт не указан, используется стандартный порт 443.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkUrl(url: string, options: RequestOptions = {}): Promise<ApiResponse<T.CertificateData>> {
    return this._client.requestRaw<T.CertificateData>(checkUrlRequest(url, options));
  }

  /**
   * Проверяет несколько SSL/TLS сертификатов одновременно (пакетная проверка).
   * Позволяет проверить до 10 хостов за один запрос параллельно.
   *
   * Пример запроса:
   * GET /api/certificate/batch?hosts=google.com,github.com,microsoft.com
   * GET /api/certificate/batch?hosts=mail1.com,mail2.com&port=993
   *
   * Все проверки выполняются параллельно для быстрого получения результатов.
   * Если один из сертификатов недоступен, вся операция может завершиться ошибкой.
   *
   * @param hosts Список доменных имён через запятую. Формат: host1,host2,host3 Ограничения: - Минимум 1 хост - Максимум 10 хостов за один запрос - Пробелы вокруг запятых игнорируются - Повторы одного и того же хоста схлопываются (за одну проверку платите один раз) ТАРИФИКАЦИЯ: похостная. Каждый хост — отдельная проверка сертификата, поэтому пакет из N хостов стоит столько же, сколько N одиночных проверок, и на столько же уменьшает дневной бесплатный лимит. Оплачиваются хосты, по которым получен вердикт (недоступный сервер — тоже вердикт); при сбое всего запроса не списывается ничего. Примеры: - google.com,github.com,microsoft.com - google.com, github.com, microsoft.com (с пробелами — допустимо)
   * @param params Необязательные параметры (`CheckBatchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkBatch(hosts: string | readonly string[], params: T.CheckBatchParams & RequestOptions = {}): Promise<ApiResponse<T.CertificateData[]>> {
    return this._client.requestRaw<T.CertificateData[]>(checkBatchRequest(hosts, params));
  }
}

/**
 * API проверки SSL-сертификата.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/ssl-certificate-check-api-client
 */
export class CertificateResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: CertificateResourceWithRawResponse = new CertificateResourceWithRawResponse(this._client);

  /**
   * Проверяет SSL/TLS сертификат по доменному имени и порту.
   * Подключается к серверу, извлекает сертификат и возвращает подробную информацию о нём.
   *
   * Пример запроса:
   * GET /api/certificate?host=google.com
   * GET /api/certificate?host=mail.server.com&port=993
   *
   * Сервис устанавливает TLS-соединение с указанным хостом и портом,
   * извлекает представленный сервером сертификат и анализирует его содержимое.
   *
   * @param host Доменное имя сервера для проверки. Поддерживаемые форматы: - Чистое доменное имя: example.com - С поддоменом: www.example.com - IP-адрес: 192.168.1.1 Примеры: google.com, github.com, microsoft.com
   * @param params Необязательные параметры (`CheckParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  check(host: string, params: T.CheckParams & RequestOptions = {}): Promise<T.CertificateData> {
    return this._client.request<T.CertificateData>(checkRequest(host, params));
  }

  /**
   * Проверяет SSL/TLS сертификат по полному URL.
   * Автоматически извлекает хост и порт из URL и выполняет проверку сертификата.
   *
   * Пример запроса:
   * GET /api/certificate/url?url=https://google.com
   * GET /api/certificate/url?url=https://mail.server.com:993
   *
   * Этот метод удобен, когда вы хотите проверить сертификат по URL,
   * который пользователь скопировал из браузера — без необходимости
   * разбирать URL на хост и порт вручную.
   *
   * @param url Полный URL для проверки. Поддерживаемые форматы: - Полный URL с протоколом: https://example.com - URL с портом: https://example.com:8443 - URL с путём: https://example.com:8443/api/v1 Примеры: - https://google.com - https://secure.bank.com:8443 - https://api.github.com/users Если порт не указан, используется стандартный порт 443.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkUrl(url: string, options: RequestOptions = {}): Promise<T.CertificateData> {
    return this._client.request<T.CertificateData>(checkUrlRequest(url, options));
  }

  /**
   * Проверяет несколько SSL/TLS сертификатов одновременно (пакетная проверка).
   * Позволяет проверить до 10 хостов за один запрос параллельно.
   *
   * Пример запроса:
   * GET /api/certificate/batch?hosts=google.com,github.com,microsoft.com
   * GET /api/certificate/batch?hosts=mail1.com,mail2.com&port=993
   *
   * Все проверки выполняются параллельно для быстрого получения результатов.
   * Если один из сертификатов недоступен, вся операция может завершиться ошибкой.
   *
   * @param hosts Список доменных имён через запятую. Формат: host1,host2,host3 Ограничения: - Минимум 1 хост - Максимум 10 хостов за один запрос - Пробелы вокруг запятых игнорируются - Повторы одного и того же хоста схлопываются (за одну проверку платите один раз) ТАРИФИКАЦИЯ: похостная. Каждый хост — отдельная проверка сертификата, поэтому пакет из N хостов стоит столько же, сколько N одиночных проверок, и на столько же уменьшает дневной бесплатный лимит. Оплачиваются хосты, по которым получен вердикт (недоступный сервер — тоже вердикт); при сбое всего запроса не списывается ничего. Примеры: - google.com,github.com,microsoft.com - google.com, github.com, microsoft.com (с пробелами — допустимо)
   * @param params Необязательные параметры (`CheckBatchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  checkBatch(hosts: string | readonly string[], params: T.CheckBatchParams & RequestOptions = {}): Promise<T.CertificateData[]> {
    return this._client.request<T.CertificateData[]>(checkBatchRequest(hosts, params));
  }
}
