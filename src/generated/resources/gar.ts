/**
 * Ресурс «ГАР/ФИАС API»: `client.gar`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, encodePath, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/gar';

function searchRequest(query: string, params: T.SearchParams & RequestOptions): FinalRequestOptions {
  const { limit, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/gar/search',
    query: { query, limit },
  };
}

function suggestRequest(query: string, params: T.SuggestParams & RequestOptions): FinalRequestOptions {
  const { limit, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/gar/suggest',
    query: { query, limit },
  };
}

function getObjectRequest(guid: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/gar/object/${encodePath(guid)}`,
  };
}

function getObjectByIdRequest(objectId: number | string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/gar/object/id/${encodePath(objectId)}`,
  };
}

function getChildrenRequest(parentObjectId: number | string, params: T.GetChildrenParams & RequestOptions): FinalRequestOptions {
  const { limit, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: `/api/gar/children/${encodePath(parentObjectId)}`,
    query: { limit },
  };
}

function getHierarchyRequest(objectId: number | string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/gar/hierarchy/${encodePath(objectId)}`,
  };
}

function getStatsRequest(options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/gar/stats',
  };
}

function listRegionsRequest(options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/gar/regions',
  };
}

function getRegionStatsRequest(regionCode: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: `/api/gar/region/${encodePath(regionCode)}/stats`,
  };
}

/** Методы {@link GarResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class GarResourceWithRawResponse extends APIResource {
  /**
   * Ищет адресные объекты по произвольной строке запроса: разбирает её на части и
   * находит регионы, населённые пункты, улицы, дома, квартиры и комнаты.
   *
   * Пример запроса:
   * GET /api/gar/search?query=Москва ул Ленина д 5
   * GET /api/gar/search?query=Самарская, Самара, Пушкина&limit=20
   *
   * @param query Строка поиска адреса. Формат: произвольный текст, элементы можно разделять запятыми. Примеры: - Москва ул Ленина д 5 - Самарская обл, Самара, Ленина, д 5 кв 18 - ул Пушкина
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<ApiResponse<T.GarSearchResponse>> {
    return this._client.requestRaw<T.GarSearchResponse>(searchRequest(query, params));
  }

  /**
   * Возвращает подсказки автодополнения для быстрого поиска адресных объектов.
   * Облегчённая версия search — возвращает только имена и идентификаторы.
   *
   * @param query Строка для автодополнения (минимум 2 символа).
   * @param params Необязательные параметры (`SuggestParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  suggest(query: string, params: T.SuggestParams & RequestOptions = {}): Promise<ApiResponse<T.GarSuggestResponse>> {
    return this._client.requestRaw<T.GarSuggestResponse>(suggestRequest(query, params));
  }

  /**
   * Получает детальную информацию об объекте ГАР по его UUID (GUID).
   * Включает иерархию, параметры (почтовый индекс, ОКТМО, ОКАТО, ИФНС, КЛАДР).
   *
   * @param guid UUID (GUID) объекта ГАР. Формат: стандартный GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getObject(guid: string, options: RequestOptions = {}): Promise<ApiResponse<T.GarObjectDetailsResponse>> {
    return this._client.requestRaw<T.GarObjectDetailsResponse>(getObjectRequest(guid, options));
  }

  /**
   * Получает детальную информацию об объекте по числовому идентификатору (object_id).
   *
   * @param objectId Числовой идентификатор объекта ГАР.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getObjectById(objectId: number | string, options: RequestOptions = {}): Promise<ApiResponse<T.GarObjectDetailsResponse>> {
    return this._client.requestRaw<T.GarObjectDetailsResponse>(getObjectByIdRequest(objectId, options));
  }

  /**
   * Получает список дочерних объектов для указанного родителя.
   * Например: дома на улице, квартиры в доме, комнаты в квартире.
   *
   * @param parentObjectId Идентификатор родительского объекта.
   * @param params Необязательные параметры (`GetChildrenParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getChildren(parentObjectId: number | string, params: T.GetChildrenParams & RequestOptions = {}): Promise<ApiResponse<T.GarChildrenResponse>> {
    return this._client.requestRaw<T.GarChildrenResponse>(getChildrenRequest(parentObjectId, params));
  }

  /**
   * Получает иерархию объекта — путь от корня (региона) до указанного объекта.
   *
   * @param objectId Идентификатор объекта.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getHierarchy(objectId: number | string, options: RequestOptions = {}): Promise<ApiResponse<T.GarHierarchyResponse>> {
    return this._client.requestRaw<T.GarHierarchyResponse>(getHierarchyRequest(objectId, options));
  }

  /**
   * Возвращает статистику загруженных данных ГАР:
   * количество объектов по типам, загруженные регионы и состояние готовности.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getStats(options: RequestOptions = {}): Promise<ApiResponse<T.GarStatsResponse>> {
    return this._client.requestRaw<T.GarStatsResponse>(getStatsRequest(options));
  }

  /**
   * Возвращает список доступных регионов (субъектов РФ) из загруженных данных ГАР.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  listRegions(options: RequestOptions = {}): Promise<ApiResponse<T.GarRegionInfo[]>> {
    return this._client.requestRaw<T.GarRegionInfo[]>(listRegionsRequest(options));
  }

  /**
   * Возвращает статистику по конкретному региону: количество объектов по типам.
   *
   * @param regionCode Код региона (2 цифры, например "77" = Москва).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getRegionStats(regionCode: string, options: RequestOptions = {}): Promise<ApiResponse<T.GarRegionStatsResponse>> {
    return this._client.requestRaw<T.GarRegionStatsResponse>(getRegionStatsRequest(regionCode, options));
  }
}

/**
 * ГАР/ФИАС API.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/gar-fias-address-api-client
 */
export class GarResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: GarResourceWithRawResponse = new GarResourceWithRawResponse(this._client);

  /**
   * Ищет адресные объекты по произвольной строке запроса: разбирает её на части и
   * находит регионы, населённые пункты, улицы, дома, квартиры и комнаты.
   *
   * Пример запроса:
   * GET /api/gar/search?query=Москва ул Ленина д 5
   * GET /api/gar/search?query=Самарская, Самара, Пушкина&limit=20
   *
   * @param query Строка поиска адреса. Формат: произвольный текст, элементы можно разделять запятыми. Примеры: - Москва ул Ленина д 5 - Самарская обл, Самара, Ленина, д 5 кв 18 - ул Пушкина
   * @param params Необязательные параметры (`SearchParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  search(query: string, params: T.SearchParams & RequestOptions = {}): Promise<T.GarSearchResponse> {
    return this._client.request<T.GarSearchResponse>(searchRequest(query, params));
  }

  /**
   * Возвращает подсказки автодополнения для быстрого поиска адресных объектов.
   * Облегчённая версия search — возвращает только имена и идентификаторы.
   *
   * @param query Строка для автодополнения (минимум 2 символа).
   * @param params Необязательные параметры (`SuggestParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  suggest(query: string, params: T.SuggestParams & RequestOptions = {}): Promise<T.GarSuggestResponse> {
    return this._client.request<T.GarSuggestResponse>(suggestRequest(query, params));
  }

  /**
   * Получает детальную информацию об объекте ГАР по его UUID (GUID).
   * Включает иерархию, параметры (почтовый индекс, ОКТМО, ОКАТО, ИФНС, КЛАДР).
   *
   * @param guid UUID (GUID) объекта ГАР. Формат: стандартный GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getObject(guid: string, options: RequestOptions = {}): Promise<T.GarObjectDetailsResponse> {
    return this._client.request<T.GarObjectDetailsResponse>(getObjectRequest(guid, options));
  }

  /**
   * Получает детальную информацию об объекте по числовому идентификатору (object_id).
   *
   * @param objectId Числовой идентификатор объекта ГАР.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getObjectById(objectId: number | string, options: RequestOptions = {}): Promise<T.GarObjectDetailsResponse> {
    return this._client.request<T.GarObjectDetailsResponse>(getObjectByIdRequest(objectId, options));
  }

  /**
   * Получает список дочерних объектов для указанного родителя.
   * Например: дома на улице, квартиры в доме, комнаты в квартире.
   *
   * @param parentObjectId Идентификатор родительского объекта.
   * @param params Необязательные параметры (`GetChildrenParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getChildren(parentObjectId: number | string, params: T.GetChildrenParams & RequestOptions = {}): Promise<T.GarChildrenResponse> {
    return this._client.request<T.GarChildrenResponse>(getChildrenRequest(parentObjectId, params));
  }

  /**
   * Получает иерархию объекта — путь от корня (региона) до указанного объекта.
   *
   * @param objectId Идентификатор объекта.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getHierarchy(objectId: number | string, options: RequestOptions = {}): Promise<T.GarHierarchyResponse> {
    return this._client.request<T.GarHierarchyResponse>(getHierarchyRequest(objectId, options));
  }

  /**
   * Возвращает статистику загруженных данных ГАР:
   * количество объектов по типам, загруженные регионы и состояние готовности.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getStats(options: RequestOptions = {}): Promise<T.GarStatsResponse> {
    return this._client.request<T.GarStatsResponse>(getStatsRequest(options));
  }

  /**
   * Возвращает список доступных регионов (субъектов РФ) из загруженных данных ГАР.
   *
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  listRegions(options: RequestOptions = {}): Promise<T.GarRegionInfo[]> {
    return this._client.request<T.GarRegionInfo[]>(listRegionsRequest(options));
  }

  /**
   * Возвращает статистику по конкретному региону: количество объектов по типам.
   *
   * @param regionCode Код региона (2 цифры, например "77" = Москва).
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  getRegionStats(regionCode: string, options: RequestOptions = {}): Promise<T.GarRegionStatsResponse> {
    return this._client.request<T.GarRegionStatsResponse>(getRegionStatsRequest(regionCode, options));
  }
}
