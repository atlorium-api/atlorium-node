/**
 * Ресурс «API обратного геокодинга»: `client.geocodereverse`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/geocodereverse';

function lookupRequest(lat: number, lon: number, params: T.LookupParams & RequestOptions): FinalRequestOptions {
  const { includeNeighbors, neighborsSize, includeAdmin, includeNearby, nearbyRadiusKm, nearbySize, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/geocodereverse',
    query: { lat, lon, includeNeighbors, neighborsSize, includeAdmin, includeNearby, nearbyRadiusKm, nearbySize },
  };
}

function nearbyRequest(lat: number, lon: number, params: T.NearbyParams & RequestOptions): FinalRequestOptions {
  const { radiusKm, size, ...options } = params;
  return {
    ...options,
    method: 'GET',
    path: '/api/geocodereverse/nearby',
    query: { lat, lon, radiusKm, size },
  };
}

/** Методы {@link GeocodeReverseResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class GeocodeReverseResourceWithRawResponse extends APIResource {
  /**
   * Находит ближайший адрес по координатам и добавляет запрошенные обогащения.
   *
   * Пример простого запроса (одна единица работы):
   * GET /api/geocodereverse?lat=55.788226&lon=49.121984
   *
   * Пример с обогащениями (до четырёх единиц работы):
   * GET /api/geocodereverse?lat=55.788226&lon=49.121984&includeNeighbors=true&includeAdmin=true&includeNearby=true
   *
   * ЗАЧЕМ СОСЕДНИЕ ДОМА. Ответом на вопрос «какой здесь адрес» является ОДИН объект —
   * ближайший. Но точка нередко стоит между двумя зданиями или у торца длинного дома, и
   * автоматический выбор в этом случае спорный. Соседи дают возможность разрешить сомнение
   * вручную, не делая второй запрос с другим радиусом.
   *
   * ЗАЧЕМ ПРИНАДЛЕЖНОСТЬ ПО ГРАНИЦАМ. Она считается попаданием точки в полигон, а не
   * выводится из найденного дома. Разница принципиальна: иначе точка в чистом поле
   * унаследовала бы район ближайшей деревни за двадцать километров.
   *
   * ЧТО ВЕРНЁТСЯ ПРИ ПУСТОМ ОБОГАЩЕНИИ. Поле просто не заполняется, а единица работы за него
   * не списывается: запрос остаётся успешным, потому что базовый ответ — адрес — получен.
   *
   * ТАРИФИКАЦИЯ. Смотрите поле billedUnits в ответе: в нём ровно то число, которое списано.
   *
   * @param lat Широта в градусах. Для России — примерно от 41 до 82.
   * @param lon Долгота в градусах.
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(lat: number, lon: number, params: T.LookupParams & RequestOptions = {}): Promise<ApiResponse<T.GeocodeReverseResponse>> {
    return this._client.requestRaw<T.GeocodeReverseResponse>(lookupRequest(lat, lon, params));
  }

  /**
   * Возвращает ориентиры вокруг точки: магазины, аптеки, остановки, заправки.
   *
   * Пример запроса:
   * GET /api/geocodereverse/nearby?lat=55.788226&lon=49.121984&radiusKm=1&size=10
   *
   * ЭТО НЕ ПЕРЕЧИСЛЕНИЕ СОСЕДНИХ ДОМОВ. Режим отвечает на вопрос «что здесь есть»:
   * организации и объекты городской среды. Соседние дома — это обогащение обратного
   * геокодинга (параметр includeNeighbors), и стоит оно по-другому.
   *
   * ⚠ ПОЛНОТА НЕ ГАРАНТИРУЕТСЯ, и это принципиально. Сведения об объектах наносят на карту
   * добровольцы: в крупных городах покрытие плотное, в малых населённых пунктах и вдоль
   * трасс — разреженное. Отсутствие объекта в ответе НЕ означает, что его нет в
   * действительности. Предупреждение об этом едет в каждом успешном ответе полем
   * completenessNotice — показывайте его пользователю, иначе он сделает неверный вывод.
   *
   * ПОЧЕМУ РАДИУС ОГРАНИЧЕН ДЕСЯТЬЮ КИЛОМЕТРАМИ. Граница смысловая, а не техническая: запрос
   * с радиусом в сотню километров — это уже не «что рядом», а постраничная выгрузка куска
   * карты.
   *
   * ТАРИФИКАЦИЯ. Одна единица работы за запрос. Пустой результат (404) не тарифицируется.
   *
   * @param lat Широта центра поиска в градусах.
   * @param lon Долгота центра поиска в градусах.
   * @param params Необязательные параметры (`NearbyParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  nearby(lat: number, lon: number, params: T.NearbyParams & RequestOptions = {}): Promise<ApiResponse<T.GeocodeNearbyResponse>> {
    return this._client.requestRaw<T.GeocodeNearbyResponse>(nearbyRequest(lat, lon, params));
  }
}

/**
 * API обратного геокодинга.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/reverse-geocoding-api-client
 */
export class GeocodeReverseResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: GeocodeReverseResourceWithRawResponse = new GeocodeReverseResourceWithRawResponse(this._client);

  /**
   * Находит ближайший адрес по координатам и добавляет запрошенные обогащения.
   *
   * Пример простого запроса (одна единица работы):
   * GET /api/geocodereverse?lat=55.788226&lon=49.121984
   *
   * Пример с обогащениями (до четырёх единиц работы):
   * GET /api/geocodereverse?lat=55.788226&lon=49.121984&includeNeighbors=true&includeAdmin=true&includeNearby=true
   *
   * ЗАЧЕМ СОСЕДНИЕ ДОМА. Ответом на вопрос «какой здесь адрес» является ОДИН объект —
   * ближайший. Но точка нередко стоит между двумя зданиями или у торца длинного дома, и
   * автоматический выбор в этом случае спорный. Соседи дают возможность разрешить сомнение
   * вручную, не делая второй запрос с другим радиусом.
   *
   * ЗАЧЕМ ПРИНАДЛЕЖНОСТЬ ПО ГРАНИЦАМ. Она считается попаданием точки в полигон, а не
   * выводится из найденного дома. Разница принципиальна: иначе точка в чистом поле
   * унаследовала бы район ближайшей деревни за двадцать километров.
   *
   * ЧТО ВЕРНЁТСЯ ПРИ ПУСТОМ ОБОГАЩЕНИИ. Поле просто не заполняется, а единица работы за него
   * не списывается: запрос остаётся успешным, потому что базовый ответ — адрес — получен.
   *
   * ТАРИФИКАЦИЯ. Смотрите поле billedUnits в ответе: в нём ровно то число, которое списано.
   *
   * @param lat Широта в градусах. Для России — примерно от 41 до 82.
   * @param lon Долгота в градусах.
   * @param params Необязательные параметры (`LookupParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  lookup(lat: number, lon: number, params: T.LookupParams & RequestOptions = {}): Promise<T.GeocodeReverseResponse> {
    return this._client.request<T.GeocodeReverseResponse>(lookupRequest(lat, lon, params));
  }

  /**
   * Возвращает ориентиры вокруг точки: магазины, аптеки, остановки, заправки.
   *
   * Пример запроса:
   * GET /api/geocodereverse/nearby?lat=55.788226&lon=49.121984&radiusKm=1&size=10
   *
   * ЭТО НЕ ПЕРЕЧИСЛЕНИЕ СОСЕДНИХ ДОМОВ. Режим отвечает на вопрос «что здесь есть»:
   * организации и объекты городской среды. Соседние дома — это обогащение обратного
   * геокодинга (параметр includeNeighbors), и стоит оно по-другому.
   *
   * ⚠ ПОЛНОТА НЕ ГАРАНТИРУЕТСЯ, и это принципиально. Сведения об объектах наносят на карту
   * добровольцы: в крупных городах покрытие плотное, в малых населённых пунктах и вдоль
   * трасс — разреженное. Отсутствие объекта в ответе НЕ означает, что его нет в
   * действительности. Предупреждение об этом едет в каждом успешном ответе полем
   * completenessNotice — показывайте его пользователю, иначе он сделает неверный вывод.
   *
   * ПОЧЕМУ РАДИУС ОГРАНИЧЕН ДЕСЯТЬЮ КИЛОМЕТРАМИ. Граница смысловая, а не техническая: запрос
   * с радиусом в сотню километров — это уже не «что рядом», а постраничная выгрузка куска
   * карты.
   *
   * ТАРИФИКАЦИЯ. Одна единица работы за запрос. Пустой результат (404) не тарифицируется.
   *
   * @param lat Широта центра поиска в градусах.
   * @param lon Долгота центра поиска в градусах.
   * @param params Необязательные параметры (`NearbyParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  nearby(lat: number, lon: number, params: T.NearbyParams & RequestOptions = {}): Promise<T.GeocodeNearbyResponse> {
    return this._client.request<T.GeocodeNearbyResponse>(nearbyRequest(lat, lon, params));
  }
}
