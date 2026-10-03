/**
 * Ресурс «API генератора тестовых данных РФ»: `client.testdata`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, stripNullish, toList } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/testdata';

function generateRequest(params: T.GenerateParams & RequestOptions): FinalRequestOptions {
  const { count, fields, seed, gender, format, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/testdata',
    query: { count, fields, seed, gender, format },
    responseType: 'auto',
  };
}

function generateWithBodyRequest(params: T.GenerateWithBodyParams & RequestOptions): FinalRequestOptions {
  const { count, seed, fields, gender, format, ...options } = params;
  return {
    ...options,
    method: 'POST',
    path: '/api/testdata',
    body: stripNullish({ count, seed, fields: fields === undefined ? undefined : toList(fields), gender, format }),
    hasBody: true,
    responseType: 'auto',
  };
}

function listFieldsRequest(options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/testdata/fields',
  };
}

/** Методы {@link TestDataResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class TestDataResourceWithRawResponse extends APIResource {
  /**
   * Генерирует набор тестовых записей. Параметры передаются в строке запроса — самый
   * быстрый способ получить данные из curl, браузера или Swagger.
   *
   * Пример запроса:
   * GET /api/testdata?count=5&fields=fullName,innPerson,snils&seed=42
   *
   * ТАРИФИКАЦИЯ. Списывается по одной единице за каждую сгенерированную запись.
   * Отклонённый запрос (400) не тарифицируется: резерв снимается без списания.
   *
   * @param params Необязательные параметры (`GenerateParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   * @returns При `format: 'csv'` — строка CSV, иначе разобранный JSON.
   */
  generate(params: T.GenerateParams & RequestOptions = {}): Promise<ApiResponse<T.TestDataResponse | string>> {
    return this._client.requestRaw<T.TestDataResponse | string>(generateRequest(params));
  }

  /**
   * Генерирует набор тестовых записей по параметрам из тела запроса. Отличается от
   * GET-варианта только способом передачи параметров — контракт и цена те же.
   *
   * Пример запроса:
   * POST /api/testdata
   * {
   *   "count": 5,
   *   "seed": 42,
   *   "fields": ["fullName", "innPerson", "snils"],
   *   "gender": "female",
   *   "format": "json"
   * }
   *
   * Тело удобнее строки запроса, когда полей много: список приходит массивом, а не
   * строкой через запятую, и не упирается в предел длины URL.
   *
   * ТАРИФИКАЦИЯ. Списывается по одной единице за каждую сгенерированную запись.
   *
   * @param params Необязательные параметры (`GenerateWithBodyParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   * @returns При `format: 'csv'` — строка CSV, иначе разобранный JSON.
   */
  generateWithBody(params: T.GenerateWithBodyParams & RequestOptions = {}): Promise<ApiResponse<T.TestDataResponse | string>> {
    return this._client.requestRaw<T.TestDataResponse | string>(generateWithBodyRequest(params));
  }

  /**
   * Возвращает справочник всех типов данных, которые умеет генерировать сервис:
   * идентификатор поля, название, пояснение, смысловую группу, пример значения и признак
   * наличия контрольной суммы.
   *
   * Пример запроса:
   * GET /api/testdata/fields
   *
   * Идентификаторы из этого справочника передаются в параметре fields запроса
   * генерации. Справочник — часть контракта: если поле есть здесь, его можно запросить.
   *
   * ТАРИФИКАЦИЯ. Запрос БЕСПЛАТНЫЙ: справочник описывает контракт сервиса, а не является
   * результатом его работы. Ограничение частоты запросов на него действует общее.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  listFields(options: RequestOptions = {}): Promise<ApiResponse<T.TestDataFieldDescriptor[]>> {
    return this._client.requestRaw<T.TestDataFieldDescriptor[]>(listFieldsRequest(options));
  }
}

/**
 * API генератора тестовых данных РФ.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/test-data-generator-api-client
 */
export class TestDataResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: TestDataResourceWithRawResponse = new TestDataResourceWithRawResponse(this._client);

  /**
   * Генерирует набор тестовых записей. Параметры передаются в строке запроса — самый
   * быстрый способ получить данные из curl, браузера или Swagger.
   *
   * Пример запроса:
   * GET /api/testdata?count=5&fields=fullName,innPerson,snils&seed=42
   *
   * ТАРИФИКАЦИЯ. Списывается по одной единице за каждую сгенерированную запись.
   * Отклонённый запрос (400) не тарифицируется: резерв снимается без списания.
   *
   * @param params Необязательные параметры (`GenerateParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   * @returns При `format: 'csv'` — строка CSV, иначе разобранный JSON.
   */
  generate(params: T.GenerateParams & { format: 'csv' } & RequestOptions): Promise<string>;
  generate(params?: T.GenerateParams & { format?: 'json' } & RequestOptions): Promise<T.TestDataResponse>;
  generate(params: T.GenerateParams & RequestOptions = {}): Promise<T.TestDataResponse | string> {
    return this._client.request<T.TestDataResponse | string>(generateRequest(params));
  }

  /**
   * Генерирует набор тестовых записей по параметрам из тела запроса. Отличается от
   * GET-варианта только способом передачи параметров — контракт и цена те же.
   *
   * Пример запроса:
   * POST /api/testdata
   * {
   *   "count": 5,
   *   "seed": 42,
   *   "fields": ["fullName", "innPerson", "snils"],
   *   "gender": "female",
   *   "format": "json"
   * }
   *
   * Тело удобнее строки запроса, когда полей много: список приходит массивом, а не
   * строкой через запятую, и не упирается в предел длины URL.
   *
   * ТАРИФИКАЦИЯ. Списывается по одной единице за каждую сгенерированную запись.
   *
   * @param params Необязательные параметры (`GenerateWithBodyParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   * @returns При `format: 'csv'` — строка CSV, иначе разобранный JSON.
   */
  generateWithBody(params: T.GenerateWithBodyParams & { format: 'csv' } & RequestOptions): Promise<string>;
  generateWithBody(params?: T.GenerateWithBodyParams & { format?: 'json' } & RequestOptions): Promise<T.TestDataResponse>;
  generateWithBody(params: T.GenerateWithBodyParams & RequestOptions = {}): Promise<T.TestDataResponse | string> {
    return this._client.request<T.TestDataResponse | string>(generateWithBodyRequest(params));
  }

  /**
   * Возвращает справочник всех типов данных, которые умеет генерировать сервис:
   * идентификатор поля, название, пояснение, смысловую группу, пример значения и признак
   * наличия контрольной суммы.
   *
   * Пример запроса:
   * GET /api/testdata/fields
   *
   * Идентификаторы из этого справочника передаются в параметре fields запроса
   * генерации. Справочник — часть контракта: если поле есть здесь, его можно запросить.
   *
   * ТАРИФИКАЦИЯ. Запрос БЕСПЛАТНЫЙ: справочник описывает контракт сервиса, а не является
   * результатом его работы. Ограничение частоты запросов на него действует общее.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  listFields(options: RequestOptions = {}): Promise<T.TestDataFieldDescriptor[]> {
    return this._client.request<T.TestDataFieldDescriptor[]>(listFieldsRequest(options));
  }
}
