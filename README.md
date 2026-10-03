# atlorium — официальный SDK для TypeScript и JavaScript

[![npm](https://img.shields.io/npm/v/atlorium.svg)](https://www.npmjs.com/package/atlorium)
[![CI](https://github.com/atlorium-api/atlorium-node/actions/workflows/ci.yml/badge.svg)](https://github.com/atlorium-api/atlorium-node/actions/workflows/ci.yml)

Проверка контрагентов по ЕГРЮЛ, БИК и SWIFT, адреса ГАР/ФИАС, геокодинг, OCR, DNS, SSL,
погода, ИИ-чат и ещё десяток B2B API для российского рынка — **23 сервиса [Atlorium](https://atlorium.com)
в одном пакете**.

- **Все 59 методов API** с полной типизацией по OpenAPI-спекам.
- **Без зависимостей**: встроенный `fetch`. Node.js 20+, Bun, Deno, edge-среды; ESM и CommonJS.
- **Работает сразу, без регистрации** — на публичном демо-ключе.
- Ретраи на 429/503 с учётом `Retry-After`, отмена через `AbortSignal`, понятные ошибки на русском.

English: [README.en.md](https://github.com/atlorium-api/atlorium-node/blob/main/README.en.md)

## Установка

```bash
npm i atlorium
```

## Быстрый старт

```ts
import { Atlorium } from 'atlorium';

const client = new Atlorium(); // без ключа — демо-режим

const card = await client.egrul.get('7707083893');
console.log(card.shortName, card.status);

const bank = await client.cbr.get('044525225');
console.log(bank.name, bank.corrAccount);
```

CommonJS: `const { Atlorium } = require('atlorium');`

Без ключа клиент работает на **публичном демо-ключе** `ak_sandbox_demo_mockdata_v1`. API отвечает
правдоподобными, но сгенерированными данными (моками): можно встроить и проверить интеграцию до
оплаты. Ответы **детерминированы** — один и тот же запрос всегда даёт один и тот же результат,
поэтому на них удобно писать стабильные тесты. Исключение — поля-отметки времени.

Лимиты демо-режима такие же, как у зарегистрированного пользователя: демо-ключ подходит для
разработки и тестов, но не для нагрузки.

Если ключ не задан ни аргументом, ни переменной `ATLORIUM_API_KEY`, SDK выдаёт предупреждение в `console.warn` (один раз за процесс):
так забытый в проде ключ не превратится в тихую работу на моках. Чтобы выбрать демо-режим явно и без
предупреждения, передайте демо-ключ: `new Atlorium({ apiKey: SANDBOX_API_KEY })`.

## Боевой ключ

Получите ключ на [atlorium.com](https://atlorium.com) и передайте его одним из способов:

```ts
const client = new Atlorium({ apiKey: 'ak_...' }); // явно
// или переменная окружения ATLORIUM_API_KEY — код не меняется
```

`client.isSandbox` показывает режим. Ключ хранится в приватном поле: его не видно ни в `console.log`,
ни в `JSON.stringify`, ни в ошибках.

> Боевой ключ не должен попадать во фронтенд — его увидит любой посетитель. В браузере вызывайте API
> через свой сервер.

## Сервисы

| Сервис | Ресурс | Методы | Примеры на 6 языках |
|---|---|---|---|
| ЕГРЮЛ/ЕГРИП | `client.egrul` | `get`, `search`, `getExcerpt` | [egrul-api-client](https://github.com/atlorium-api/egrul-api-client) |
| Справочник БИК ЦБ РФ | `client.cbr` | `get`, `search`, `getStats` | [cbr-bik-api-client](https://github.com/atlorium-api/cbr-bik-api-client) |
| SWIFT/BIC | `client.swift` | `get`, `search`, `validate`, `getStats` | [swift-bic-api-client](https://github.com/atlorium-api/swift-bic-api-client) |
| BIN банковской карты | `client.bin` | `lookup`, `validate` | [bin-lookup-api-client](https://github.com/atlorium-api/bin-lookup-api-client) |
| AML-скоринг криптокошелька | `client.aml` | `screen`, `validate` | [aml-crypto-screening-api-client](https://github.com/atlorium-api/aml-crypto-screening-api-client) |
| Профиль IP | `client.ipinfo` | `lookup` | [ip-geolocation-api-client](https://github.com/atlorium-api/ip-geolocation-api-client) |
| Адреса ГАР/ФИАС | `client.gar` | `search`, `suggest`, `getObject`, `getObjectById`, `getChildren`, `getHierarchy`, `getStats`, `listRegions`, `getRegionStats` | [gar-fias-address-api-client](https://github.com/atlorium-api/gar-fias-address-api-client) |
| Стандартизация адреса | `client.addressstd` | `standardize` | [address-standardization-api-client](https://github.com/atlorium-api/address-standardization-api-client) |
| Валидация телефона | `client.phone` | `validate` | [phone-validation-api-client](https://github.com/atlorium-api/phone-validation-api-client) |
| Проверка e-mail | `client.email` | `validate` | [email-verification-api-client](https://github.com/atlorium-api/email-verification-api-client) |
| Распознавание текста (OCR) | `client.ocr` | `recognize` | [image-ocr-api-client](https://github.com/atlorium-api/image-ocr-api-client) |
| DNS | `client.dns` | `lookup`, `checkPropagation` | [dns-lookup-api-client](https://github.com/atlorium-api/dns-lookup-api-client) |
| CIDR-калькулятор | `client.cidr` | `calculate`, `split`, `check`, `supernet` | [cidr-subnet-calculator-api-client](https://github.com/atlorium-api/cidr-subnet-calculator-api-client) |
| Cron-выражения | `client.cron` | `evaluate`, `build` | [cron-expression-parser-api-client](https://github.com/atlorium-api/cron-expression-parser-api-client) |
| SSL-сертификат | `client.certificate` | `check`, `checkUrl`, `checkBatch` | [ssl-certificate-check-api-client](https://github.com/atlorium-api/ssl-certificate-check-api-client) |
| Погода | `client.weather` | `get` | [weather-api-client](https://github.com/atlorium-api/weather-api-client) |
| ИИ-чат | `client.aichat` | `send`, `getSession`, `deleteSession`, `listModels` | [ai-chat-api-client](https://github.com/atlorium-api/ai-chat-api-client) |
| Прямой геокодинг | `client.geocodeforward` | `search`, `searchStructured`, `searchBatch`, `getPlace`, `searchPostcode` | [geocoding-api-client](https://github.com/atlorium-api/geocoding-api-client) |
| Обратный геокодинг | `client.geocodereverse` | `lookup`, `nearby` | [reverse-geocoding-api-client](https://github.com/atlorium-api/reverse-geocoding-api-client) |
| Генератор тестовых данных РФ | `client.testdata` | `generate`, `generateWithBody`, `listFields` | [test-data-generator-api-client](https://github.com/atlorium-api/test-data-generator-api-client) |
| Проверка ссылки | `client.urlcheck` | `check`, `checkBatch` | [url-reputation-api-client](https://github.com/atlorium-api/url-reputation-api-client) |
| Аудит сайта (Core Web Vitals) | `client.pagespeed` | `audit`, `auditBatch` | [core-web-vitals-api-client](https://github.com/atlorium-api/core-web-vitals-api-client) |
| Модерация изображений | `client.imagecheck` | `analyze` | [image-moderation-api-client](https://github.com/atlorium-api/image-moderation-api-client) |

Обязательные параметры передаются по порядку, необязательные — последним объектом. У каждого метода
и параметра есть описание — IDE покажет его при наборе.

## Примеры

```ts
import { Atlorium, CronTemplateType, DayOfWeek } from 'atlorium';
import { fileFromPath } from 'atlorium/node';

const client = new Atlorium();

// Контрагенты и банки
await client.egrul.search('Сбербанк', { limit: 5 });
const pdf = await client.egrul.getExcerpt('7707083893'); // Uint8Array — официальная выписка
await client.cbr.search('Тинькофф');
await client.swift.validate('SABRRUMMXXX');
await client.bin.lookup('424242');
await client.aml.screen('TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', 'TRX');

// Адреса и карты
await client.gar.suggest('Москва Тверская');
await client.addressstd.standardize('мск тверская 1', { geocode: true });
await client.geocodeforward.search('Казань, Баумана 1', { size: 1 });
await client.geocodereverse.lookup(55.7558, 37.6173, { includeAdmin: true });
await client.weather.get(55.7558, 37.6173);

// Контакты
await client.phone.validate('+79161234567');
await client.email.validate('info@example.com');
await client.ipinfo.lookup('8.8.8.8');

// Изображения: байты, Blob, поток или готовый Base64 — SDK сам кодирует
await client.ocr.recognize(await fileFromPath('scan.png'));
const photo: Blob = await (await fetch('https://example.com/photo.jpg')).blob(); // ссылку API не принимает — сначала скачать
await client.imagecheck.analyze(photo, { includeWebSearch: true });

// Сайты и инфраструктура
await client.dns.lookup('atlorium.com');
await client.dns.checkPropagation('atlorium.com', { resolvers: ['1.1.1.1', '8.8.8.8'] });
await client.certificate.check('atlorium.com');
await client.urlcheck.checkBatch(['https://example.com', 'https://example.org']);
await client.pagespeed.audit('https://atlorium.com', { strategy: 'mobile' });
await client.cidr.calculate('192.168.1.10', 24);
await client.cron.evaluate('*/15 * * * *', { timeZoneId: 'Europe/Moscow', take: 3 });
await client.cron.build({ template: CronTemplateType.Weekly, timeOfDay: '09:30:00', weekDays: [DayOfWeek.Monday] });

// ИИ-чат и тестовые данные
const reply = await client.aichat.send('Составь письмо контрагенту о сверке');
await client.aichat.send('Короче', { sessionId: reply.sessionId });
await client.testdata.generate({ count: 10, fields: ['fullName', 'innPerson', 'snils'], seed: 42 });
const csv: string = await client.testdata.generate({ count: 10, format: 'csv' });
```

`fileFromPath` лежит в отдельной точке входа `atlorium/node`, чтобы основной пакет не зависел от Node.js.

## Ошибки

Все ошибки наследуются от `AtloriumError`:

| HTTP | Класс | Когда |
|---|---|---|
| 400 | `ValidationError` | неверный формат входных данных |
| 401 | `AuthenticationError` | ключ отсутствует, просрочен или недействителен |
| 402 | `InsufficientCreditsError` | недостаточно кредитов (`error.balance` — текущий баланс) |
| 403 | `PermissionDeniedError` | сервис не входит в условия вашей учётной записи — чтобы подключить его, напишите на support@atlorium.com |
| 404 | `NotFoundError` | объект не найден |
| 429 | `RateLimitError` | превышен лимит запросов |
| 503 | `ServiceUnavailableError` | сервис временно недоступен: сбой внешнего источника данных или плановые работы (коды `service_disabled`, `maintenance`; состояние — https://atlorium.com/status). **Деньги за такой ответ не списываются** |
| 5xx | `ServerError` | ошибка на стороне сервера; родитель `ServiceUnavailableError`, так что `instanceof ServerError` ловит любой 5xx |
| — | `APIConnectionError`, `APITimeoutError` | сеть, таймаут |

У каждой ошибки есть `status`, `errorCode`, `requestId` и `retryAfter` — через сколько **секунд** сервер
разрешает повторить запрос (заголовок `Retry-After`), либо `null`. Обычно он приходит с 429 и 503.

```ts
import { AtloriumError, NotFoundError, RateLimitError, ServiceUnavailableError } from 'atlorium';

try {
  const card = await client.egrul.get('7707083893');
} catch (error) {
  if (error instanceof NotFoundError) {
    // нет в реестре
  } else if (error instanceof RateLimitError || error instanceof ServiceUnavailableError) {
    console.log('Повторить через', error.retryAfter, 'с'); // null — сервер не назвал срок
  } else if (error instanceof AtloriumError) {
    console.log(error.status, error.errorCode, error.message);
  } else {
    throw error;
  }
}
```

`error.errorCode` — стабильный машинный код (`not_found`, `insufficient_credits`, `rate_limited_client`,
`service_not_in_account_terms` …), по нему и стоит ветвиться.

## Ретраи, таймауты, отмена

- Запрос автоматически повторяется на **429, 503 и сетевых ошибках** — до `maxRetries` раз (по умолчанию 2)
  с экспоненциальной задержкой. `Retry-After` учитывается; если сервер просит ждать дольше двух минут,
  SDK не висит, а сразу бросает ошибку по статусу: `RateLimitError` для 429, `ServiceUnavailableError` для 503
  (с `error.retryAfter`).
- 503 с кодом `service_disabled` или `maintenance` — плановые работы: такой ответ не повторяется, ошибка
  приходит сразу.
- **POST-запросы** (ИИ-чат, OCR, AML-скрининг, пакетные проверки) после сетевой ошибки повторяются, только
  если соединение не установилось и запрос точно не ушёл. После таймаута или обрыва соединения — нет:
  операция могла выполниться на сервере, и повтор списал бы деньги второй раз.
- 400, 401, 402, 403 и 404 не повторяются никогда.
- Отменённый через `signal` запрос не повторяется; отмена прерывает и ожидание перед повтором.
- Таймаут — в **миллисекундах**, по умолчанию 30 000. Для тяжёлых операций свой минимум: `ocr.recognize` и
  `pagespeed.audit` — 120 с, `pagespeed.auditBatch` — 600 с, `imagecheck.analyze` — 60 с, `aichat.send` — 660 с
  (11 минут: развёрнутый ответ модели может готовиться несколько минут). Явный `timeout` вызова важнее.

```ts
const client = new Atlorium({ timeout: 60_000, maxRetries: 5 });
await client.pagespeed.audit('https://atlorium.com', { timeout: 300_000 }); // на один вызов
const fast = client.withOptions({ maxRetries: 0 }); // копия с другими настройками

const controller = new AbortController();
setTimeout(() => controller.abort(), 1000);
await client.egrul.search('Ромашка', { signal: controller.signal }); // отменённый запрос не повторяется
```

## Метаданные ответа

Обычный вызов возвращает данные. Нужны статус и заголовки — вызовите тот же метод через `withRawResponse`:

```ts
const raw = await client.testdata.withRawResponse.generate({ count: 5 });
console.log(raw.status, raw.isSandbox, raw.headers.get('X-Atlorium-Seed'));
const data = raw.data;
```

`raw.isSandbox` опирается на заголовок `X-Atlorium-Sandbox`. У полностью локальных сервисов (например,
генератора тестовых данных) демо-ключ возвращает настоящий результат, и заголовка может не быть.

## Типы

Типы каждого сервиса собраны в пространство имён: `Egrul`, `Cbr`, `Gar`, `GeocodeForward` и т.д.

```ts
import type { Egrul } from 'atlorium';

function innOf(card: Egrul.CompanyLookupResult): string | null {
  return card.inn;
}
```

## Свой fetch

Подойдёт любая функция, совместимая с `fetch`: прокси, логирование, тестовые подмены. Например, `fetch` из
пакета `undici` с прокси:

```ts
import { Atlorium } from 'atlorium';
import { fetch as undiciFetch, ProxyAgent } from 'undici';

const dispatcher = new ProxyAgent('http://proxy.local:3128');
const client = new Atlorium({ fetch: (url, init) => undiciFetch(url, { ...init, dispatcher }) });
```

## Разработка

```bash
npm ci
npm run typecheck && npm test
npm run build && npm run check:exports
npm run fetch-specs   # обновить OpenAPI-спеки
npm run generate      # перегенерировать типы и ресурсы
npm run smoke         # ручная проверка против живого API на демо-ключе (после build)
npm version patch     # новая версия: package.json и src/version.ts меняются вместе
```

История изменений — [CHANGELOG.md](https://github.com/atlorium-api/atlorium-node/blob/main/CHANGELOG.md).

## Лицензия

[MIT](https://github.com/atlorium-api/atlorium-node/blob/main/LICENSE)
