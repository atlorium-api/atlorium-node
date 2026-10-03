/**
 * Ресурс «API анализа изображения»: `client.imagecheck`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, stripNullish } from '../../core/base-client';
import { encodeFile, type FileInput } from '../../core/files';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/imagecheck';

async function analyzeRequest(image: FileInput, params: T.AnalyzeParams & RequestOptions): Promise<FinalRequestOptions> {
  const { includeText, includeWebSearch, ...options } = params;
  return {
    ...options,
    method: 'POST',
    path: '/api/imagecheck',
    body: stripNullish({ image: await encodeFile(image), includeText, includeWebSearch }),
    hasBody: true,
    defaultTimeout: 60000,
  };
}

/** Методы {@link ImageCheckResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class ImageCheckResourceWithRawResponse extends APIResource {
  /**
   * Анализирует изображение и возвращает решение модерации вместе с разбором содержимого.
   *
   * Пример запроса:
   *
   * POST /api/imagecheck
   * {
   *   "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
   *   "includeText": true,
   *   "includeWebSearch": false
   * }
   *
   * ФОРМАТ ИЗОБРАЖЕНИЯ. Base64 — «голым» или в виде data-URL. Предел 7 МБ в декодированном
   * виде. Принимаются JPEG, PNG, WEBP, BMP, GIF. PDF и видео на вход не подаются.
   *
   * КАК ЧИТАТЬ ОТВЕТ. Сначала decision — что делать. Затем flags — почему принято такое
   * решение: у каждого срабатывания есть категория, слой-источник и конкретное
   * доказательство (найденная метка, найденное в тексте выражение или категория
   * классификации с её степенью). И только потом сырые слои, если решение нужно
   * перепроверить или оспорить. Сырые слои отдаются намеренно: в модерации ошибка стоит
   * дорого в обе стороны, и решение, которое нельзя проверить, доверия не заслуживает.
   *
   * ПУСТОЙ text — НЕ ОШИБКА. Он означает либо что читаемого текста на картинке нет, либо
   * что слой не заказывался. Какой это случай, видно по billedUnits.
   *
   * ПАКЕТНОГО РЕЖИМА НЕТ намеренно: изображение — это мегабайты в теле запроса, и пакет
   * превратился бы в стомегабайтный POST с таймаутами на промежуточных узлах. Поток
   * модерируется параллельными одиночными запросами — они независимы, повторяются
   * поштучно и не теряют весь пакет из-за одной битой картинки.
   *
   * ТАРИФИКАЦИЯ. От одной до трёх единиц, см. описание контроллера. Анализ, который
   * не выполнен, не тарифицируется вовсе.
   *
   * @param image Изображение в кодировке Base64 — «голым» base64 или data-URL вида data:image/jpeg;base64,.... Обязательное поле. Предел — 7 МБ в декодированном виде; фотография с телефона укладывается с запасом. Число нецелое не случайно: картинка уезжает в base64 внутри JSON-запроса, у которого чужой потолок 10 МБ, а кодирование добавляет около 37 %. Принимаются растровые форматы (JPEG, PNG, WEBP, BMP, GIF); PDF и видео на вход не подаются.
   * @param params Необязательные параметры (`AnalyzeParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  analyze(image: FileInput, params: T.AnalyzeParams & RequestOptions = {}): Promise<ApiResponse<T.ImageModerationResult>> {
    return this._client.requestRaw<T.ImageModerationResult>(analyzeRequest(image, params));
  }
}

/**
 * API анализа изображения.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/image-moderation-api-client
 */
export class ImageCheckResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: ImageCheckResourceWithRawResponse = new ImageCheckResourceWithRawResponse(this._client);

  /**
   * Анализирует изображение и возвращает решение модерации вместе с разбором содержимого.
   *
   * Пример запроса:
   *
   * POST /api/imagecheck
   * {
   *   "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
   *   "includeText": true,
   *   "includeWebSearch": false
   * }
   *
   * ФОРМАТ ИЗОБРАЖЕНИЯ. Base64 — «голым» или в виде data-URL. Предел 7 МБ в декодированном
   * виде. Принимаются JPEG, PNG, WEBP, BMP, GIF. PDF и видео на вход не подаются.
   *
   * КАК ЧИТАТЬ ОТВЕТ. Сначала decision — что делать. Затем flags — почему принято такое
   * решение: у каждого срабатывания есть категория, слой-источник и конкретное
   * доказательство (найденная метка, найденное в тексте выражение или категория
   * классификации с её степенью). И только потом сырые слои, если решение нужно
   * перепроверить или оспорить. Сырые слои отдаются намеренно: в модерации ошибка стоит
   * дорого в обе стороны, и решение, которое нельзя проверить, доверия не заслуживает.
   *
   * ПУСТОЙ text — НЕ ОШИБКА. Он означает либо что читаемого текста на картинке нет, либо
   * что слой не заказывался. Какой это случай, видно по billedUnits.
   *
   * ПАКЕТНОГО РЕЖИМА НЕТ намеренно: изображение — это мегабайты в теле запроса, и пакет
   * превратился бы в стомегабайтный POST с таймаутами на промежуточных узлах. Поток
   * модерируется параллельными одиночными запросами — они независимы, повторяются
   * поштучно и не теряют весь пакет из-за одной битой картинки.
   *
   * ТАРИФИКАЦИЯ. От одной до трёх единиц, см. описание контроллера. Анализ, который
   * не выполнен, не тарифицируется вовсе.
   *
   * @param image Изображение в кодировке Base64 — «голым» base64 или data-URL вида data:image/jpeg;base64,.... Обязательное поле. Предел — 7 МБ в декодированном виде; фотография с телефона укладывается с запасом. Число нецелое не случайно: картинка уезжает в base64 внутри JSON-запроса, у которого чужой потолок 10 МБ, а кодирование добавляет около 37 %. Принимаются растровые форматы (JPEG, PNG, WEBP, BMP, GIF); PDF и видео на вход не подаются.
   * @param params Необязательные параметры (`AnalyzeParams`) и настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  analyze(image: FileInput, params: T.AnalyzeParams & RequestOptions = {}): Promise<T.ImageModerationResult> {
    return this._client.request<T.ImageModerationResult>(analyzeRequest(image, params));
  }
}
