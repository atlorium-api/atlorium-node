/**
 * Ресурс «API аудита сайта»: `client.pagespeed`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, toList } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/pagespeed';

function auditRequest(url: string, params: T.AuditParams & RequestOptions): FinalRequestOptions {
  const { strategy, forceRefresh, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/pagespeed',
    query: { url, strategy, forceRefresh },
    defaultTimeout: 120000,
  };
}

function auditBatchRequest(urls: string | readonly string[], params: T.AuditBatchParams & RequestOptions): FinalRequestOptions {
  const { strategy, ...options } = params;
  return {
    ...options,
    method: 'POST',
    path: '/api/pagespeed/batch',
    query: { strategy },
    body: toList(urls),
    hasBody: true,
    defaultTimeout: 600000,
  };
}

/** Методы {@link PageSpeedResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class PageSpeedResourceWithRawResponse extends APIResource {
  /**
   * Выполняет аудит одной страницы и возвращает полный отчёт.
   *
   * Примеры запросов:
   * GET /api/pagespeed?url=https://example.com
   * GET /api/pagespeed?url=https://example.com&strategy=desktop
   * GET /api/pagespeed?url=https://example.com&forceRefresh=true
   *
   * ⚠ Ответ занимает 10–30 секунд: страница действительно загружается в браузере.
   *
   * КАК ЧИТАТЬ ОТЧЁТ. Начните с поля message — это одна фраза с выводом. Затем сверьте
   * finalUrl с запрошенным адресом: если они различаются, вас увела переадресация и
   * измерялась другая страница (частый случай — редирект на страницу согласия с cookie).
   * Дальше — performanceScore как быстрый ориентир и opportunities сверху вниз: первые
   * два-три пункта и есть то, чем стоит заняться.
   *
   * ЧТО ЗНАЧИТ «ЭКОНОМИЯ» В РЕКОМЕНДАЦИЯХ. Это оценка, а не обещание: столько
   * миллисекунд отыграется, если пункт выполнить полностью. Пункты пересекаются между
   * собой, поэтому складывать экономию по всему списку и ждать такой суммы не следует.
   *
   * @param url Адрес страницы. Схему можно опустить: «example.com» будет приведено к «https://example.com/». Принимаются только адреса со схемой http или https. Страница должна открываться публично — без авторизации и без блокировки автоматических обращений.
   * @param params Необязательные параметры (`AuditParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  audit(url: string, params: T.AuditParams & RequestOptions = {}): Promise<ApiResponse<T.SitePerformanceReport>> {
    return this._client.requestRaw<T.SitePerformanceReport>(auditRequest(url, params));
  }

  /**
   * Выполняет аудит пакета адресов за один вызов (до 20 адресов).
   *
   * Порядок результатов совпадает с порядком присланных адресов — сопоставляйте по индексу.
   *
   * ⚠ ПАКЕТ ИДЁТ МИНУТАМИ. Двадцать адресов — примерно две минуты: адреса обрабатываются
   * по четыре одновременно, каждый прогон 10–30 секунд. Поставьте таймаут своего клиента
   * с запасом или разбейте работу на пакеты поменьше — в деньгах вы ничего не потеряете,
   * единица стоит столько же.
   *
   * Пример запроса:
   * POST /api/pagespeed/batch?strategy=mobile
   * [ "https://example.com", "https://example.com/catalog" ]
   *
   * ТАРИФИКАЦИЯ ПАКЕТА. Списывается по числу адресов, по которым аудит РЕАЛЬНО состоялся.
   * Если из двадцати страниц три не открылись, спишется семнадцать единиц, а не двадцать.
   * Принудительного обновления в обход сохранённых отчётов у пакетного режима нет: пакет —
   * это регулярный обход списка страниц, и в нём ценно как раз то, что уже посчитанное
   * берётся готовым.
   *
   * @param urls Список адресов страниц. Пустые строки и повторы отбрасываются до аудита: повтор не добавляет работы и оплачиваться не должен. Максимум — 20 адресов.
   * @param params Необязательные параметры (`AuditBatchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  auditBatch(urls: string | readonly string[], params: T.AuditBatchParams & RequestOptions = {}): Promise<ApiResponse<T.SitePerformanceBatchResponse>> {
    return this._client.requestRaw<T.SitePerformanceBatchResponse>(auditBatchRequest(urls, params));
  }
}

/**
 * API аудита сайта.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/core-web-vitals-api-client
 */
export class PageSpeedResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: PageSpeedResourceWithRawResponse = new PageSpeedResourceWithRawResponse(this._client);

  /**
   * Выполняет аудит одной страницы и возвращает полный отчёт.
   *
   * Примеры запросов:
   * GET /api/pagespeed?url=https://example.com
   * GET /api/pagespeed?url=https://example.com&strategy=desktop
   * GET /api/pagespeed?url=https://example.com&forceRefresh=true
   *
   * ⚠ Ответ занимает 10–30 секунд: страница действительно загружается в браузере.
   *
   * КАК ЧИТАТЬ ОТЧЁТ. Начните с поля message — это одна фраза с выводом. Затем сверьте
   * finalUrl с запрошенным адресом: если они различаются, вас увела переадресация и
   * измерялась другая страница (частый случай — редирект на страницу согласия с cookie).
   * Дальше — performanceScore как быстрый ориентир и opportunities сверху вниз: первые
   * два-три пункта и есть то, чем стоит заняться.
   *
   * ЧТО ЗНАЧИТ «ЭКОНОМИЯ» В РЕКОМЕНДАЦИЯХ. Это оценка, а не обещание: столько
   * миллисекунд отыграется, если пункт выполнить полностью. Пункты пересекаются между
   * собой, поэтому складывать экономию по всему списку и ждать такой суммы не следует.
   *
   * @param url Адрес страницы. Схему можно опустить: «example.com» будет приведено к «https://example.com/». Принимаются только адреса со схемой http или https. Страница должна открываться публично — без авторизации и без блокировки автоматических обращений.
   * @param params Необязательные параметры (`AuditParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  audit(url: string, params: T.AuditParams & RequestOptions = {}): Promise<T.SitePerformanceReport> {
    return this._client.request<T.SitePerformanceReport>(auditRequest(url, params));
  }

  /**
   * Выполняет аудит пакета адресов за один вызов (до 20 адресов).
   *
   * Порядок результатов совпадает с порядком присланных адресов — сопоставляйте по индексу.
   *
   * ⚠ ПАКЕТ ИДЁТ МИНУТАМИ. Двадцать адресов — примерно две минуты: адреса обрабатываются
   * по четыре одновременно, каждый прогон 10–30 секунд. Поставьте таймаут своего клиента
   * с запасом или разбейте работу на пакеты поменьше — в деньгах вы ничего не потеряете,
   * единица стоит столько же.
   *
   * Пример запроса:
   * POST /api/pagespeed/batch?strategy=mobile
   * [ "https://example.com", "https://example.com/catalog" ]
   *
   * ТАРИФИКАЦИЯ ПАКЕТА. Списывается по числу адресов, по которым аудит РЕАЛЬНО состоялся.
   * Если из двадцати страниц три не открылись, спишется семнадцать единиц, а не двадцать.
   * Принудительного обновления в обход сохранённых отчётов у пакетного режима нет: пакет —
   * это регулярный обход списка страниц, и в нём ценно как раз то, что уже посчитанное
   * берётся готовым.
   *
   * @param urls Список адресов страниц. Пустые строки и повторы отбрасываются до аудита: повтор не добавляет работы и оплачиваться не должен. Максимум — 20 адресов.
   * @param params Необязательные параметры (`AuditBatchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  auditBatch(urls: string | readonly string[], params: T.AuditBatchParams & RequestOptions = {}): Promise<T.SitePerformanceBatchResponse> {
    return this._client.request<T.SitePerformanceBatchResponse>(auditBatchRequest(urls, params));
  }
}
