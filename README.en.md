# atlorium — official TypeScript & JavaScript SDK

[![npm](https://img.shields.io/npm/v/atlorium.svg)](https://www.npmjs.com/package/atlorium)
[![CI](https://github.com/atlorium-api/atlorium-node/actions/workflows/ci.yml/badge.svg)](https://github.com/atlorium-api/atlorium-node/actions/workflows/ci.yml)

Russian company registry (EGRUL) checks, bank BIK and SWIFT lookup, FIAS/GAR addresses, geocoding, OCR, DNS,
SSL, weather, AI chat and a dozen more B2B APIs for the Russian market — **all 23 [Atlorium](https://atlorium.com)
services in one package**.

- **All 59 API methods**, fully typed from the OpenAPI specs.
- **Zero dependencies**: built-in `fetch`. Node.js 20+, Bun, Deno, edge runtimes; ESM and CommonJS.
- **Works instantly, no sign-up** — on a public sandbox key.
- Retries on 429/503 honouring `Retry-After`, cancellation via `AbortSignal`, clear error classes
  (messages are in Russian).

Russian documentation (primary): [README.md](https://github.com/atlorium-api/atlorium-node/blob/main/README.md)

## Install

```bash
npm i atlorium
```

## Quick start

```ts
import { Atlorium } from 'atlorium';

const client = new Atlorium(); // no key — sandbox mode

const card = await client.egrul.get('7707083893'); // company by INN / OGRN
console.log(card.shortName, card.status);

const bank = await client.cbr.get('044525225'); // bank by BIK
console.log(bank.name, bank.corrAccount);
```

CommonJS: `const { Atlorium } = require('atlorium');`

Without a key the client uses the **public sandbox key** `ak_sandbox_demo_mockdata_v1`. The API returns
realistic but generated data (mocks), so you can build and test an integration before paying. Responses are
**deterministic** — the same request always gives the same result, which makes stable tests easy. Timestamp
fields are the only exception.

Sandbox rate limits equal those of a registered user: the sandbox key is meant for development and tests,
not for load.

If no key is given either as an argument or via `ATLORIUM_API_KEY`, the SDK prints a warning with `console.warn`
(once per process), so a key forgotten in production never turns into silent mocks. To choose sandbox mode
explicitly and without the warning, pass the sandbox key: `new Atlorium({ apiKey: SANDBOX_API_KEY })`.

## Live key

Get a key at [atlorium.com](https://atlorium.com) and pass it in one of two ways:

```ts
const client = new Atlorium({ apiKey: 'ak_...' }); // explicitly
// or the ATLORIUM_API_KEY environment variable — no code changes
```

`client.isSandbox` tells which mode is active. The key lives in a private field: it never shows up in
`console.log`, `JSON.stringify` or errors.

> Never ship a live key to the frontend — every visitor would see it. In the browser, call the API through
> your own backend.

## Services

| Service | Resource | Methods | Examples in 6 languages |
|---|---|---|---|
| Russian company registry (EGRUL/EGRIP) | `client.egrul` | `get`, `search`, `getExcerpt` | [egrul-api-client](https://github.com/atlorium-api/egrul-api-client) |
| Bank BIK directory (Bank of Russia) | `client.cbr` | `get`, `search`, `getStats` | [cbr-bik-api-client](https://github.com/atlorium-api/cbr-bik-api-client) |
| SWIFT/BIC | `client.swift` | `get`, `search`, `validate`, `getStats` | [swift-bic-api-client](https://github.com/atlorium-api/swift-bic-api-client) |
| Card BIN lookup | `client.bin` | `lookup`, `validate` | [bin-lookup-api-client](https://github.com/atlorium-api/bin-lookup-api-client) |
| Crypto wallet AML screening | `client.aml` | `screen`, `validate` | [aml-crypto-screening-api-client](https://github.com/atlorium-api/aml-crypto-screening-api-client) |
| IP profile | `client.ipinfo` | `lookup` | [ip-geolocation-api-client](https://github.com/atlorium-api/ip-geolocation-api-client) |
| FIAS/GAR addresses | `client.gar` | `search`, `suggest`, `getObject`, `getObjectById`, `getChildren`, `getHierarchy`, `getStats`, `listRegions`, `getRegionStats` | [gar-fias-address-api-client](https://github.com/atlorium-api/gar-fias-address-api-client) |
| Address standardization | `client.addressstd` | `standardize` | [address-standardization-api-client](https://github.com/atlorium-api/address-standardization-api-client) |
| Phone validation | `client.phone` | `validate` | [phone-validation-api-client](https://github.com/atlorium-api/phone-validation-api-client) |
| E-mail verification | `client.email` | `validate` | [email-verification-api-client](https://github.com/atlorium-api/email-verification-api-client) |
| Text recognition (OCR) | `client.ocr` | `recognize` | [image-ocr-api-client](https://github.com/atlorium-api/image-ocr-api-client) |
| DNS | `client.dns` | `lookup`, `checkPropagation` | [dns-lookup-api-client](https://github.com/atlorium-api/dns-lookup-api-client) |
| CIDR calculator | `client.cidr` | `calculate`, `split`, `check`, `supernet` | [cidr-subnet-calculator-api-client](https://github.com/atlorium-api/cidr-subnet-calculator-api-client) |
| Cron expressions | `client.cron` | `evaluate`, `build` | [cron-expression-parser-api-client](https://github.com/atlorium-api/cron-expression-parser-api-client) |
| SSL certificate | `client.certificate` | `check`, `checkUrl`, `checkBatch` | [ssl-certificate-check-api-client](https://github.com/atlorium-api/ssl-certificate-check-api-client) |
| Weather | `client.weather` | `get` | [weather-api-client](https://github.com/atlorium-api/weather-api-client) |
| AI chat | `client.aichat` | `send`, `getSession`, `deleteSession`, `listModels` | [ai-chat-api-client](https://github.com/atlorium-api/ai-chat-api-client) |
| Forward geocoding | `client.geocodeforward` | `search`, `searchStructured`, `searchBatch`, `getPlace`, `searchPostcode` | [geocoding-api-client](https://github.com/atlorium-api/geocoding-api-client) |
| Reverse geocoding | `client.geocodereverse` | `lookup`, `nearby` | [reverse-geocoding-api-client](https://github.com/atlorium-api/reverse-geocoding-api-client) |
| Russian test data generator | `client.testdata` | `generate`, `generateWithBody`, `listFields` | [test-data-generator-api-client](https://github.com/atlorium-api/test-data-generator-api-client) |
| URL reputation | `client.urlcheck` | `check`, `checkBatch` | [url-reputation-api-client](https://github.com/atlorium-api/url-reputation-api-client) |
| Site audit (Core Web Vitals) | `client.pagespeed` | `audit`, `auditBatch` | [core-web-vitals-api-client](https://github.com/atlorium-api/core-web-vitals-api-client) |
| Image moderation | `client.imagecheck` | `analyze` | [image-moderation-api-client](https://github.com/atlorium-api/image-moderation-api-client) |

Required arguments are positional; optional parameters go into the last object. Every method and parameter
has a description your IDE shows while typing (JSDoc is in Russian).

## Examples

```ts
import { Atlorium, CronTemplateType, DayOfWeek } from 'atlorium';
import { fileFromPath } from 'atlorium/node';

const client = new Atlorium();

// Companies and banks
await client.egrul.search('Сбербанк', { limit: 5 });
const pdf = await client.egrul.getExcerpt('7707083893'); // Uint8Array — the official registry excerpt
await client.cbr.search('Тинькофф');
await client.swift.validate('SABRRUMMXXX');
await client.bin.lookup('424242');
await client.aml.screen('TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', 'TRX');

// Addresses and maps
await client.gar.suggest('Москва Тверская');
await client.addressstd.standardize('мск тверская 1', { geocode: true });
await client.geocodeforward.search('Казань, Баумана 1', { size: 1 });
await client.geocodereverse.lookup(55.7558, 37.6173, { includeAdmin: true });
await client.weather.get(55.7558, 37.6173);

// Contacts
await client.phone.validate('+79161234567');
await client.email.validate('info@example.com');
await client.ipinfo.lookup('8.8.8.8');

// Images: bytes, Blob, stream or ready-made Base64 — the SDK encodes them itself
await client.ocr.recognize(await fileFromPath('scan.png'));
const photo: Blob = await (await fetch('https://example.com/photo.jpg')).blob(); // the API takes no URLs — download first
await client.imagecheck.analyze(photo, { includeWebSearch: true });

// Sites and infrastructure
await client.dns.lookup('atlorium.com');
await client.dns.checkPropagation('atlorium.com', { resolvers: ['1.1.1.1', '8.8.8.8'] });
await client.certificate.check('atlorium.com');
await client.urlcheck.checkBatch(['https://example.com', 'https://example.org']);
await client.pagespeed.audit('https://atlorium.com', { strategy: 'mobile' });
await client.cidr.calculate('192.168.1.10', 24);
await client.cron.evaluate('*/15 * * * *', { timeZoneId: 'Europe/Moscow', take: 3 });
await client.cron.build({ template: CronTemplateType.Weekly, timeOfDay: '09:30:00', weekDays: [DayOfWeek.Monday] });

// AI chat and test data
const reply = await client.aichat.send('Draft a reconciliation letter to a counterparty');
await client.aichat.send('Shorter', { sessionId: reply.sessionId });
await client.testdata.generate({ count: 10, fields: ['fullName', 'innPerson', 'snils'], seed: 42 });
const csv: string = await client.testdata.generate({ count: 10, format: 'csv' });
```

`fileFromPath` lives in the separate `atlorium/node` entry point, so the main package does not depend on Node.js.

## Errors

All errors extend `AtloriumError`:

| HTTP | Class | When |
|---|---|---|
| 400 | `ValidationError` | invalid input |
| 401 | `AuthenticationError` | the key is missing, expired or invalid |
| 402 | `InsufficientCreditsError` | not enough credits (`error.balance` — current balance) |
| 403 | `PermissionDeniedError` | the service is not included in your account terms — to enable it, write to support@atlorium.com |
| 404 | `NotFoundError` | object not found |
| 429 | `RateLimitError` | rate limit exceeded |
| 503 | `ServiceUnavailableError` | the service is temporarily unavailable: an upstream data source failure or scheduled maintenance (codes `service_disabled`, `maintenance`; status — https://atlorium.com/status). **You are not charged for such a response** |
| 5xx | `ServerError` | server-side error; parent of `ServiceUnavailableError`, so `instanceof ServerError` catches any 5xx |
| — | `APIConnectionError`, `APITimeoutError` | network, timeout |

Every error has `status`, `errorCode`, `requestId` and `retryAfter` — how many **seconds** the server asks you to
wait before retrying (the `Retry-After` header), or `null`. It usually comes with 429 and 503.

```ts
import { AtloriumError, NotFoundError, RateLimitError, ServiceUnavailableError } from 'atlorium';

try {
  const card = await client.egrul.get('7707083893');
} catch (error) {
  if (error instanceof NotFoundError) {
    // not in the registry
  } else if (error instanceof RateLimitError || error instanceof ServiceUnavailableError) {
    console.log('Retry in', error.retryAfter, 's'); // null — the server named no delay
  } else if (error instanceof AtloriumError) {
    console.log(error.status, error.errorCode, error.message);
  } else {
    throw error;
  }
}
```

`error.errorCode` is a stable machine-readable code (`not_found`, `insufficient_credits`, `rate_limited_client`,
`service_not_in_account_terms` …) — branch on it.

## Retries, timeouts, cancellation

- Requests are retried automatically on **429, 503 and network errors** — up to `maxRetries` times (default 2)
  with exponential backoff. `Retry-After` is honoured; if the server asks to wait longer than two minutes,
  the SDK does not hang but immediately throws the error for the status: `RateLimitError` for 429,
  `ServiceUnavailableError` for 503 (with `error.retryAfter`).
- A 503 with code `service_disabled` or `maintenance` means scheduled maintenance: it is not retried, the error
  is thrown right away.
- **POST requests** (AI chat, OCR, AML screening, batch checks) are retried after a network error only when the
  connection was never established and the request surely did not leave. After a timeout or a dropped
  connection they are not: the operation may have run on the server, and a retry would charge you twice.
- 400, 401, 402, 403 and 404 are never retried.
- A request cancelled via `signal` is not retried; cancelling also cuts short the wait before a retry.
- Timeouts are in **milliseconds**, default 30 000. Heavy operations have their own minimum: `ocr.recognize` and
  `pagespeed.audit` — 120 s, `pagespeed.auditBatch` — 600 s, `imagecheck.analyze` — 60 s, `aichat.send` — 660 s
  (11 minutes: a detailed model answer may take several minutes). An explicit per-call `timeout` wins.

```ts
const client = new Atlorium({ timeout: 60_000, maxRetries: 5 });
await client.pagespeed.audit('https://atlorium.com', { timeout: 300_000 }); // for one call
const fast = client.withOptions({ maxRetries: 0 }); // a copy with other settings

const controller = new AbortController();
setTimeout(() => controller.abort(), 1000);
await client.egrul.search('Ромашка', { signal: controller.signal }); // a cancelled request is not retried
```

## Response metadata

A regular call returns the data. Need the status and headers — call the same method via `withRawResponse`:

```ts
const raw = await client.testdata.withRawResponse.generate({ count: 5 });
console.log(raw.status, raw.isSandbox, raw.headers.get('X-Atlorium-Seed'));
const data = raw.data;
```

`raw.isSandbox` relies on the `X-Atlorium-Sandbox` header. Fully local services (such as the test data generator)
return real results even on the sandbox key, and the header may be absent.

## Types

Each service's types are grouped in a namespace: `Egrul`, `Cbr`, `Gar`, `GeocodeForward` and so on.

```ts
import type { Egrul } from 'atlorium';

function innOf(card: Egrul.CompanyLookupResult): string | null {
  return card.inn;
}
```

## Custom fetch

Any `fetch`-compatible function works: a proxy, logging, test doubles. For example, `fetch` from the `undici`
package with a proxy:

```ts
import { Atlorium } from 'atlorium';
import { fetch as undiciFetch, ProxyAgent } from 'undici';

const dispatcher = new ProxyAgent('http://proxy.local:3128');
const client = new Atlorium({ fetch: (url, init) => undiciFetch(url, { ...init, dispatcher }) });
```

## Development

```bash
npm ci
npm run typecheck && npm test
npm run build && npm run check:exports
npm run fetch-specs   # refresh the OpenAPI specs
npm run generate      # regenerate types and resources
npm run smoke         # manual check against the live API on the sandbox key (after build)
npm version patch     # new version: package.json and src/version.ts change together
```

Changelog — [CHANGELOG.md](https://github.com/atlorium-api/atlorium-node/blob/main/CHANGELOG.md).

## License

[MIT](https://github.com/atlorium-api/atlorium-node/blob/main/LICENSE)
