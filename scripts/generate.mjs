/**
 * Генератор типов и ресурсов SDK из OpenAPI-спек `spec/<id>_ru.json`.
 *
 * Что создаётся (всё перезаписывается при каждом запуске, руками не редактировать):
 *
 * - `src/generated/types/<id>.ts` — интерфейсы схем, параметры методов (`<Метод>Params`);
 * - `src/generated/resources/<id>.ts` — класс ресурса и его вариант `withRawResponse`;
 * - `src/generated/client.ts` — класс `Atlorium` со свойствами `client.<id>`;
 * - `index.ts` в обеих папках.
 *
 * Таблица `OPERATIONS` — единая для всех SDK Atlorium (в других языках те же методы в их стиле
 * именования): имена методов, обязательные параметры (в спеках query-параметры не помечены
 * обязательными) и особые случаи. Скрипт падает, если в спеке есть операция без записи в таблице
 * или в таблице есть операция, которой нет в спеке.
 *
 * Запуск: `npm run generate` (после `npm run fetch-specs`, если спеки обновились).
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_DIR = join(ROOT, 'spec');
const OUT_DIR = join(ROOT, 'src', 'generated');
const NOTE = 'СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.';

const SERVICES = [
  ['egrul', 'Egrul', 'egrul-api-client'],
  ['cbr', 'Cbr', 'cbr-bik-api-client'],
  ['swift', 'Swift', 'swift-bic-api-client'],
  ['bin', 'Bin', 'bin-lookup-api-client'],
  ['aml', 'Aml', 'aml-crypto-screening-api-client'],
  ['ipinfo', 'IpInfo', 'ip-geolocation-api-client'],
  ['gar', 'Gar', 'gar-fias-address-api-client'],
  ['addressstd', 'AddressStd', 'address-standardization-api-client'],
  ['phone', 'Phone', 'phone-validation-api-client'],
  ['email', 'Email', 'email-verification-api-client'],
  ['ocr', 'Ocr', 'image-ocr-api-client'],
  ['dns', 'Dns', 'dns-lookup-api-client'],
  ['cidr', 'Cidr', 'cidr-subnet-calculator-api-client'],
  ['cron', 'Cron', 'cron-expression-parser-api-client'],
  ['certificate', 'Certificate', 'ssl-certificate-check-api-client'],
  ['weather', 'Weather', 'weather-api-client'],
  ['aichat', 'AiChat', 'ai-chat-api-client'],
  ['geocodeforward', 'GeocodeForward', 'geocoding-api-client'],
  ['geocodereverse', 'GeocodeReverse', 'reverse-geocoding-api-client'],
  ['testdata', 'TestData', 'test-data-generator-api-client'],
  ['urlcheck', 'UrlCheck', 'url-reputation-api-client'],
  ['pagespeed', 'PageSpeed', 'core-web-vitals-api-client'],
  ['imagecheck', 'ImageCheck', 'image-moderation-api-client'],
].map(([id, prefix, repo]) => ({ id, prefix, repo }));

const op = (service, http, path, name, extra = {}) => ({
  service,
  http,
  path,
  name,
  required: [],
  listParams: [],
  imageParams: [],
  bodyName: null,
  defaultTimeout: null,
  csvOverload: false,
  skipDescription: false,
  ...extra,
});

// Таймауты операций — миллисекунды; значения общие для всех SDK Atlorium.
const OPERATIONS = [
  op('egrul', 'GET', '/api/Egrul/{query}', 'get'),
  op('egrul', 'GET', '/api/Egrul/search', 'search', { required: ['query'] }),
  op('egrul', 'GET', '/api/Egrul/{query}/excerpt', 'getExcerpt'),
  op('cbr', 'GET', '/api/Cbr/{bik}', 'get'),
  op('cbr', 'GET', '/api/Cbr/search', 'search', { required: ['query'] }),
  op('cbr', 'GET', '/api/Cbr/stats', 'getStats'),
  op('swift', 'GET', '/api/Swift/{bic}', 'get'),
  op('swift', 'GET', '/api/Swift/search', 'search', { required: ['query'] }),
  op('swift', 'GET', '/api/Swift/validate/{bic}', 'validate'),
  op('swift', 'GET', '/api/Swift/stats', 'getStats'),
  op('bin', 'GET', '/api/Bin/{bin}', 'lookup'),
  op('bin', 'GET', '/api/Bin/validate/{bin}', 'validate'),
  op('aml', 'POST', '/api/Aml/screen', 'screen', { required: ['walletAddress', 'blockchain'] }),
  op('aml', 'GET', '/api/Aml/validate', 'validate', { required: ['walletAddress', 'blockchain'] }),
  op('ipinfo', 'GET', '/api/IpInfo/{ip}', 'lookup'),
  op('gar', 'GET', '/api/Gar/search', 'search', { required: ['query'] }),
  op('gar', 'GET', '/api/Gar/suggest', 'suggest', { required: ['query'] }),
  op('gar', 'GET', '/api/Gar/object/{guid}', 'getObject'),
  op('gar', 'GET', '/api/Gar/object/id/{objectId}', 'getObjectById'),
  op('gar', 'GET', '/api/Gar/children/{parentObjectId}', 'getChildren'),
  op('gar', 'GET', '/api/Gar/hierarchy/{objectId}', 'getHierarchy'),
  op('gar', 'GET', '/api/Gar/stats', 'getStats'),
  op('gar', 'GET', '/api/Gar/regions', 'listRegions'),
  op('gar', 'GET', '/api/Gar/region/{regionCode}/stats', 'getRegionStats'),
  op('addressstd', 'GET', '/api/AddressStd', 'standardize', { required: ['address'] }),
  op('phone', 'GET', '/api/Phone/{number}', 'validate'),
  op('email', 'GET', '/api/EmailValidation', 'validate', { required: ['email'] }),
  op('ocr', 'POST', '/api/Ocr/image-to-text', 'recognize', {
    required: ['image'],
    imageParams: ['image'],
    defaultTimeout: 120_000,
  }),
  op('dns', 'GET', '/api/Dns/lookup', 'lookup', { required: ['domain'] }),
  op('dns', 'GET', '/api/Dns/propagation', 'checkPropagation', { required: ['domain'], listParams: ['resolvers'] }),
  op('cidr', 'GET', '/api/Cidr/calculate', 'calculate', { required: ['ip', 'mask'] }),
  op('cidr', 'GET', '/api/Cidr/subnets', 'split', { required: ['cidr', 'newMask'] }),
  op('cidr', 'GET', '/api/Cidr/check', 'check', { required: ['cidr', 'ip'] }),
  op('cidr', 'POST', '/api/Cidr/supernet', 'supernet', { required: ['inputs'] }),
  op('cron', 'POST', '/api/Cron/evaluate', 'evaluate', { required: ['expression'] }),
  op('cron', 'POST', '/api/Cron/build', 'build', { skipDescription: true }),
  op('certificate', 'GET', '/api/Certificate', 'check', { required: ['host'] }),
  op('certificate', 'GET', '/api/Certificate/url', 'checkUrl', { required: ['url'] }),
  op('certificate', 'GET', '/api/Certificate/batch', 'checkBatch', { required: ['hosts'], listParams: ['hosts'] }),
  op('weather', 'GET', '/api/Weather', 'get', { required: ['latitude', 'longitude'] }),
  // Ответ модели на сервере ограничен 10 минутами; 11 минут — с запасом на сеть.
  op('aichat', 'POST', '/api/AiChat/send', 'send', { required: ['message'], defaultTimeout: 660_000 }),
  op('aichat', 'GET', '/api/AiChat/session/{sessionId}', 'getSession'),
  op('aichat', 'DELETE', '/api/AiChat/session/{sessionId}', 'deleteSession'),
  op('aichat', 'GET', '/api/AiChat/models', 'listModels'),
  op('geocodeforward', 'GET', '/api/geocodeforward', 'search', { required: ['text'] }),
  op('geocodeforward', 'GET', '/api/geocodeforward/structured', 'searchStructured'),
  op('geocodeforward', 'POST', '/api/geocodeforward/batch', 'searchBatch', { required: ['queries'] }),
  op('geocodeforward', 'GET', '/api/geocodeforward/place', 'getPlace', { required: ['placeId'] }),
  op('geocodeforward', 'GET', '/api/geocodeforward/postcode', 'searchPostcode', { required: ['code'] }),
  op('geocodereverse', 'GET', '/api/geocodereverse', 'lookup', { required: ['lat', 'lon'] }),
  op('geocodereverse', 'GET', '/api/geocodereverse/nearby', 'nearby', { required: ['lat', 'lon'] }),
  op('testdata', 'GET', '/api/TestData', 'generate', { listParams: ['fields'], csvOverload: true }),
  op('testdata', 'POST', '/api/TestData', 'generateWithBody', { csvOverload: true }),
  op('testdata', 'GET', '/api/TestData/fields', 'listFields'),
  op('urlcheck', 'GET', '/api/urlcheck', 'check', { required: ['url'] }),
  op('urlcheck', 'POST', '/api/urlcheck/batch', 'checkBatch', { required: ['urls'], bodyName: 'urls' }),
  op('pagespeed', 'GET', '/api/pagespeed', 'audit', { required: ['url'], defaultTimeout: 120_000 }),
  op('pagespeed', 'POST', '/api/pagespeed/batch', 'auditBatch', {
    required: ['urls'],
    bodyName: 'urls',
    defaultTimeout: 600_000,
  }),
  op('imagecheck', 'POST', '/api/imagecheck', 'analyze', {
    required: ['image'],
    imageParams: ['image'],
    defaultTimeout: 60_000,
  }),
];

// Поля-объекты, которые спека описывает ненулевыми, а сервер отдаёт null.
const NULLABLE_OVERRIDES = {
  swift: ['headquarters'],
  ipinfo: ['asn', 'company', 'flags', 'carrier', 'privacy', 'abuse', 'hostedDomains', 'abuseReports'],
  addressstd: ['gar', 'geo'],
  weather: ['rain', 'snow'],
  pagespeed: ['fieldData'],
  imagecheck: ['webSearch'],
};

// В спеке это голый integer без enum; значения — по коду сервера.
const INT_ENUMS = {
  CronTemplateType: [
    ['EveryMinute', 0, 'Каждую минуту.'],
    ['EveryNMinutes', 1, 'Каждые N минут (шаг — `interval`).'],
    ['Hourly', 2, 'Раз в час, в начале часа.'],
    ['EveryNHours', 3, 'Каждые N часов (шаг — `interval`).'],
    ['Daily', 4, 'Раз в сутки, в `timeOfDay`.'],
    ['Weekly', 5, 'В выбранные дни недели (`weekDays`), в `timeOfDay`.'],
    ['Monthly', 6, 'Раз в месяц: число `dayOfMonth`, время `timeOfDay`.'],
  ],
  DayOfWeek: [
    ['Sunday', 0, 'Воскресенье.'],
    ['Monday', 1, 'Понедельник.'],
    ['Tuesday', 2, 'Вторник.'],
    ['Wednesday', 3, 'Среда.'],
    ['Thursday', 4, 'Четверг.'],
    ['Friday', 5, 'Пятница.'],
    ['Saturday', 6, 'Суббота.'],
  ],
};

const RESERVED_TYPE_NAMES = new Set(['RequestOptions', 'FileInput', 'ApiResponse']);

// ── Утилиты ──────────────────────────────────────────────────────────────────────

function fail(message) {
  console.error(message);
  process.exit(1);
}

const pascal = (name) => name[0].toUpperCase() + name.slice(1);
const refName = (ref) => ref.slice(ref.lastIndexOf('/') + 1);
const isIdentifier = (key) => /^[A-Za-z_$][\w$]*$/.test(key);
const quote = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const propKey = (key) => (isIdentifier(key) ? key : quote(key));

function jsdoc(text, indent = '') {
  const clean = String(text ?? '')
    .trim()
    .replace(/\*\//g, '*\\/');
  if (!clean) return '';
  const lines = clean.split(/\r?\n/).map((line) => line.trimEnd());
  if (lines.length === 1) return `${indent}/** ${lines[0]} */\n`;
  return `${indent}/**\n${lines.map((line) => (line ? `${indent} * ${line}` : `${indent} *`)).join('\n')}\n${indent} */\n`;
}

function loadSpec(id) {
  return JSON.parse(readFileSync(join(SPEC_DIR, `${id}_ru.json`), 'utf8'));
}

function arrayOf(expr) {
  return /[\s|&]/.test(expr) ? `Array<${expr}>` : `${expr}[]`;
}

function withNull(expr, nullable) {
  return nullable && expr !== 'unknown' ? `${expr} | null` : expr;
}

/** JSON-схема → { expr, nullable }. `prefix` — `''` внутри модуля типов, `'T.'` в ресурсе. */
function render(schema, prefix) {
  if (typeof schema.$ref === 'string') return { expr: prefix + refName(schema.$ref), nullable: false };
  if (Array.isArray(schema.allOf) && schema.allOf.length === 1) return render(schema.allOf[0], prefix);
  for (const key of ['oneOf', 'anyOf']) {
    if (Array.isArray(schema[key])) {
      let nullable = false;
      const parts = [];
      for (const variant of schema[key]) {
        if (variant.type === 'null') {
          nullable = true;
          continue;
        }
        const rendered = render(variant, prefix);
        nullable ||= rendered.nullable;
        if (!parts.includes(rendered.expr)) parts.push(rendered.expr);
      }
      return { expr: parts.join(' | ') || 'unknown', nullable };
    }
  }
  if (Array.isArray(schema.enum)) {
    return { expr: schema.enum.map((value) => (typeof value === 'string' ? quote(value) : String(value))).join(' | '), nullable: false };
  }
  const rawTypes = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  const nullable = rawTypes.includes('null');
  let types = rawTypes.filter((type) => type !== 'null');
  if (types.length === 0 && (schema.properties || schema.additionalProperties)) types = ['object'];
  if (types.length === 0) return { expr: 'unknown', nullable };
  // ["integer","string"] — артефакт AllowReadingFromString в .NET: сервер пишет числа.
  if (types.includes('integer') || types.includes('number')) return { expr: 'number', nullable };
  if (types.length === 1 && types[0] === 'string') return { expr: 'string', nullable };
  if (types.length === 1 && types[0] === 'boolean') return { expr: 'boolean', nullable };
  if (types.length === 1 && types[0] === 'array') {
    const item = render(schema.items ?? {}, prefix);
    return { expr: arrayOf(withNull(item.expr, item.nullable)), nullable };
  }
  if (types.length === 1 && types[0] === 'object') {
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      const value = render(schema.additionalProperties, prefix);
      return { expr: `Record<string, ${withNull(value.expr, value.nullable)}>`, nullable };
    }
    return { expr: 'Record<string, unknown>', nullable };
  }
  return { expr: 'unknown', nullable };
}

// ── Параметры операций ───────────────────────────────────────────────────────────

function paramType(operation, name, schema, location, prefix) {
  if (operation.imageParams.includes(name)) return { ts: 'FileInput', kind: 'image' };
  if (operation.listParams.includes(name)) return { ts: 'string | readonly string[]', kind: 'plain' };
  if (operation.csvOverload && name === 'format') return { ts: "'json' | 'csv'", kind: 'plain' };
  if (schema.format === 'date-time') return { ts: 'Date | string', kind: 'plain' };
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  if (types.includes('array')) {
    const item = render(schema.items ?? {}, prefix).expr;
    if (item === 'string') return { ts: 'string | readonly string[]', kind: 'bodyList' };
    return { ts: `readonly ${/\s/.test(item) ? `(${item})` : item}[]`, kind: 'plain' };
  }
  if (location === 'path' && types.includes('integer')) return { ts: 'number | string', kind: 'plain' };
  return { ts: render(schema, prefix).expr, kind: 'plain' };
}

function collectParams(operation, specOp, schemas) {
  const params = [];
  const add = (api, location, required, schema, description) =>
    params.push({
      api,
      location,
      required,
      schema,
      type: paramType(operation, api, schema, location, 'T.'),
      localType: paramType(operation, api, schema, location, ''),
      description: String(description ?? '').trim(),
    });

  for (const raw of specOp.parameters ?? []) {
    if (raw.in !== 'path' && raw.in !== 'query') fail(`${operation.service}.${operation.name}: параметр в ${raw.in}`);
    add(raw.name, raw.in, raw.in === 'path' || operation.required.includes(raw.name), raw.schema ?? {}, raw.description);
  }

  const body = specOp.requestBody?.content?.['application/json']?.schema;
  if (body) {
    if (body.$ref) {
      const bodySchema = schemas[refName(body.$ref)];
      for (const [name, prop] of Object.entries(bodySchema.properties ?? {})) {
        add(name, 'body', operation.required.includes(name), prop, prop.description);
      }
    } else if (body.type === 'array') {
      if (!operation.bodyName) fail(`${operation.service}.${operation.name}: тело-массив без bodyName`);
      add(operation.bodyName, 'bodyArray', true, body, specOp.requestBody.description ?? 'Список значений.');
    } else {
      fail(`${operation.service}.${operation.name}: неизвестная форма тела ${JSON.stringify(body)}`);
    }
  }

  const known = new Set(params.map((param) => param.api));
  const missing = operation.required.filter((name) => !known.has(name));
  if (missing.length) fail(`${operation.service}.${operation.name}: обязательные параметры не найдены в спеке: ${missing}`);
  const clash = params.filter((param) => ['timeout', 'signal', 'maxRetries', 'headers', 'options', 'params'].includes(param.api));
  if (clash.length || known.size !== params.length) fail(`${operation.service}.${operation.name}: конфликт имён параметров`);
  return params;
}

function valueExpr(param) {
  if (param.type.kind === 'image') return `await encodeFile(${param.api})`;
  if (param.type.kind === 'bodyList') {
    return param.required ? `toList(${param.api})` : `${param.api} === undefined ? undefined : toList(${param.api})`;
  }
  return param.api;
}

function objectLiteral(params) {
  return `{ ${params.map((param) => (valueExpr(param) === param.api ? param.api : `${param.api}: ${valueExpr(param)}`)).join(', ')} }`;
}

function responseInfo(operation, specOp) {
  const content = specOp.responses?.['200']?.content ?? {};
  if (content['application/pdf']) return { ts: 'Uint8Array', responseType: 'bytes' };
  const schema = content['application/json']?.schema;
  if (!schema) return { ts: 'null', responseType: 'json' };
  // ASP.NET отдаёт строку JSON-строкой или простым текстом — в зависимости от Accept.
  if (schema.type === 'string') return { ts: 'string', responseType: 'auto' };
  return { ts: render(schema, 'T.').expr, responseType: operation.csvOverload ? 'auto' : 'json' };
}

function renderPath(operation) {
  let hasParams = false;
  const literal = operation.path
    .split(/(\{[^}]+\})/)
    .map((part) => {
      if (part.startsWith('{')) {
        hasParams = true;
        return `\${encodePath(${part.slice(1, -1)})}`;
      }
      return part.toLowerCase();
    })
    .join('');
  return hasParams ? `\`${literal}\`` : quote(literal);
}

// ── Модуль типов ─────────────────────────────────────────────────────────────────

function generateTypes(service, spec, operationParams) {
  const schemas = spec.components?.schemas ?? {};
  const overrides = new Set(NULLABLE_OVERRIDES[service.id] ?? []);
  const title = spec.info?.title ?? service.id;
  let out = `/**\n * Типы запросов и ответов сервиса «${title}».\n *\n * ${NOTE} Источник: spec/${service.id}_ru.json.\n */\n`;
  let needsFileInput = false;

  for (const [name, schema] of Object.entries(schemas)) {
    if (RESERVED_TYPE_NAMES.has(name)) fail(`${service.id}: имя схемы ${name} конфликтует с типами SDK`);
    out += '\n';
    if (INT_ENUMS[name]) {
      out += jsdoc(schema.description ?? name);
      out += `export const ${name} = {\n`;
      for (const [member, value, comment] of INT_ENUMS[name]) out += `${jsdoc(comment, '  ')}  ${member}: ${value},\n`;
      out += `} as const;\n${jsdoc(schema.description ?? name)}export type ${name} = (typeof ${name})[keyof typeof ${name}];\n`;
      continue;
    }
    if (!schema.properties) {
      out += `${jsdoc(schema.description)}export type ${name} = ${render(schema, '').expr};\n`;
      continue;
    }
    out += `${jsdoc(schema.description)}export interface ${name} {\n`;
    for (const [key, prop] of Object.entries(schema.properties)) {
      const rendered = render(prop, '');
      out += `${jsdoc(prop.description, '  ')}  ${propKey(key)}: ${withNull(rendered.expr, rendered.nullable || overrides.has(key))};\n`;
    }
    out += '}\n';
  }

  for (const { operation, params } of operationParams) {
    const optional = params.filter((param) => !param.required);
    if (!optional.length) continue;
    const typeName = `${pascal(operation.name)}Params`;
    if (schemas[typeName]) fail(`${service.id}: ${typeName} совпадает с именем схемы`);
    out += `\n/** Необязательные параметры метода \`${operation.name}\`. */\nexport interface ${typeName} {\n`;
    for (const param of optional) {
      if (param.localType.ts === 'FileInput') needsFileInput = true;
      out += `${jsdoc(param.description, '  ')}  ${param.api}?: ${param.localType.ts};\n`;
    }
    out += '}\n';
  }

  if (needsFileInput) out = out.replace(/\*\/\n/, "*/\n\nimport type { FileInput } from '../../core/files';\n");
  return out;
}

// ── Модуль ресурса ───────────────────────────────────────────────────────────────

function methodDoc(operation, specOp, positional, optionalCount, returns) {
  const summary = String(specOp.summary ?? '').trim();
  const description = operation.skipDescription ? '' : String(specOp.description ?? '').trim();
  const lines = [summary || operation.name];
  if (description && description !== summary) lines.push('', description);
  lines.push('');
  for (const param of positional) lines.push(`@param ${param.api} ${param.description.replace(/\s*\n\s*/g, ' ') || '—'}`);
  const optionsName = optionalCount ? 'params' : 'options';
  lines.push(
    `@param ${optionsName} ${optionalCount ? `Необязательные параметры (\`${pascal(operation.name)}Params\`) и настройки запроса` : 'Настройки запроса'}: \`timeout\` (мс), \`signal\`, \`maxRetries\`, \`headers\`.`,
  );
  if (returns === 'Uint8Array') lines.push('@returns Содержимое файла.');
  if (operation.csvOverload) lines.push("@returns При `format: 'csv'` — строка CSV, иначе разобранный JSON.");
  return lines.join('\n');
}

function generateResource(service, spec) {
  const schemas = spec.components?.schemas ?? {};
  const operations = OPERATIONS.filter((operation) => operation.service === service.id);
  const specOps = new Map();
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, body] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) specOps.set(`${method.toUpperCase()} ${path}`, body);
    }
  }
  const tableKeys = new Set(operations.map((operation) => `${operation.http} ${operation.path}`));
  const missingInTable = [...specOps.keys()].filter((key) => !tableKeys.has(key));
  const missingInSpec = [...tableKeys].filter((key) => !specOps.has(key));
  if (missingInTable.length || missingInSpec.length) {
    fail(`${service.id}: таблица не совпадает со спекой.\n  нет в таблице: ${missingInTable}\n  нет в спеке: ${missingInSpec}`);
  }

  const title = spec.info?.title ?? service.id;
  const className = `${service.prefix}Resource`;
  const rawClassName = `${className}WithRawResponse`;
  const builders = [];
  const methods = [];
  const rawMethods = [];
  const operationParams = [];

  for (const operation of operations) {
    const specOp = specOps.get(`${operation.http} ${operation.path}`);
    const params = collectParams(operation, specOp, schemas);
    operationParams.push({ operation, params });
    const requiredOrder = (param) => operation.required.indexOf(param.api);
    const positional = [
      ...params.filter((param) => param.location === 'path'),
      ...params.filter((param) => param.location !== 'path' && param.required).sort((a, b) => requiredOrder(a) - requiredOrder(b)),
    ];
    const optional = params.filter((param) => !param.required);
    const { ts: returns, responseType } = responseInfo(operation, specOp);
    const isAsync = params.some((param) => param.type.kind === 'image');
    const optionsName = optional.length ? 'params' : 'options';
    const optionsType = optional.length ? `T.${pascal(operation.name)}Params & RequestOptions` : 'RequestOptions';
    const builderName = `${operation.name}Request`;
    const positionalSignature = positional.map((param) => `${param.api}: ${param.type.ts}`);

    const query = params.filter((param) => param.location === 'query');
    const bodyFields = params.filter((param) => param.location === 'body');
    const bodyArray = params.find((param) => param.location === 'bodyArray');
    const fields = [`method: '${operation.http}'`, `path: ${renderPath(operation)}`];
    if (query.length) fields.push(`query: ${objectLiteral(query)}`);
    if (bodyFields.length) fields.push(`body: stripNullish(${objectLiteral(bodyFields)})`, 'hasBody: true');
    else if (bodyArray) fields.push(`body: ${valueExpr(bodyArray)}`, 'hasBody: true');
    else if (operation.http === 'POST') fields.push('hasBody: true');
    if (operation.defaultTimeout !== null) fields.push(`defaultTimeout: ${operation.defaultTimeout}`);
    if (responseType !== 'json') fields.push(`responseType: '${responseType}'`);

    let builder = `${isAsync ? 'async ' : ''}function ${builderName}(${[...positionalSignature, `${optionsName}: ${optionsType}`].join(', ')}): ${isAsync ? 'Promise<FinalRequestOptions>' : 'FinalRequestOptions'} {\n`;
    if (optional.length) builder += `  const { ${optional.map((param) => param.api).join(', ')}, ...options } = params;\n`;
    builder += `  return {\n    ...options,\n${fields.map((field) => `    ${field},\n`).join('')}  };\n}\n`;
    builders.push(builder);

    const callArgs = [...positional.map((param) => param.api), optionsName].join(', ');
    const doc = jsdoc(methodDoc(operation, specOp, positional, optional.length, returns), '  ');
    const signatureArgs = [...positionalSignature, `${optionsName}: ${optionsType} = {}`].join(', ');
    const fullReturns = operation.csvOverload ? `${returns} | string` : returns;

    let method = doc;
    if (operation.csvOverload) {
      const paramsType = `T.${pascal(operation.name)}Params`;
      method += `  ${operation.name}(params: ${paramsType} & { format: 'csv' } & RequestOptions): Promise<string>;\n`;
      method += `  ${operation.name}(params?: ${paramsType} & { format?: 'json' } & RequestOptions): Promise<${returns}>;\n`;
    }
    method += `  ${operation.name}(${signatureArgs}): Promise<${fullReturns}> {\n`;
    method += `    return this._client.request<${fullReturns}>(${builderName}(${callArgs}));\n  }\n`;
    methods.push(method);

    rawMethods.push(
      `${doc}  ${operation.name}(${signatureArgs}): Promise<ApiResponse<${fullReturns}>> {\n` +
        `    return this._client.requestRaw<${fullReturns}>(${builderName}(${callArgs}));\n  }\n`,
    );
  }

  const body = [...builders, '', ''].join('\n');
  const coreImports = ['APIResource', 'type FinalRequestOptions', 'type RequestOptions'];
  if (body.includes('encodePath(')) coreImports.push('encodePath');
  if (body.includes('stripNullish(')) coreImports.push('stripNullish');
  if (body.includes('toList(')) coreImports.push('toList');
  const sortKey = (name) => name.replace(/^type /, '');
  coreImports.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  let out = `/**\n * Ресурс «${title}»: \`client.${service.id}\`.\n *\n * ${NOTE}\n */\n\n`;
  out += `import { ${coreImports.join(', ')} } from '../../core/base-client';\n`;
  if (body.includes('encodeFile(')) out += "import { encodeFile, type FileInput } from '../../core/files';\n";
  out += "import type { ApiResponse } from '../../core/response';\n";
  out += `import type * as T from '../types/${service.id}';\n\n`;
  out += builders.join('\n');
  out += `\n/** Методы {@link ${className}}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */\n`;
  out += `export class ${rawClassName} extends APIResource {\n${rawMethods.join('\n')}}\n`;
  out += `\n${jsdoc(`${title}.\n\nПримеры на шести языках: https://github.com/atlorium-api/${service.repo}`)}`;
  out += `export class ${className} extends APIResource {\n`;
  out += '  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */\n';
  out += `  readonly withRawResponse: ${rawClassName} = new ${rawClassName}(this._client);\n\n`;
  out += `${methods.join('\n')}}\n`;

  return { resource: out, types: generateTypes(service, spec, operationParams), count: operations.length };
}

// ── Клиент и индексы ─────────────────────────────────────────────────────────────

function generateClient(titles) {
  let out = `/**\n * Клиент API Atlorium со всеми сервисами.\n *\n * ${NOTE}\n */\n\n`;
  out += "import { BaseClient, type ClientOptions } from '../core/base-client';\n";
  for (const service of SERVICES) out += `import { ${service.prefix}Resource } from './resources/${service.id}';\n`;
  out += `
/**
 * Клиент API Atlorium.
 *
 * \`\`\`ts
 * const client = new Atlorium(); // без ключа — публичный демо-ключ, ответы-моки
 * const card = await client.egrul.get('7707083893');
 * \`\`\`
 */
export class Atlorium extends BaseClient {
`;
  for (const service of SERVICES) out += `${jsdoc(titles[service.id], '  ')}  readonly ${service.id}: ${service.prefix}Resource;\n`;
  out += '\n  constructor(options: ClientOptions = {}) {\n    super(options);\n';
  for (const service of SERVICES) out += `    this.${service.id} = new ${service.prefix}Resource(this);\n`;
  out += `  }

  /** Копия клиента с другими настройками. Ключ, адрес и \`fetch\` — те же. */
  withOptions(options: Pick<ClientOptions, 'timeout' | 'maxRetries' | 'defaultHeaders'>): Atlorium {
    const copy = new Atlorium({ ...this._clientOptions(), ...options });
    copy._sleep = this._sleep;
    return copy;
  }
}
`;
  return out;
}

function generateIndexes() {
  let types = `/**\n * Типы по сервисам: \`Egrul.CompanyLookupResult\`, \`Cbr.CbrBankInfo\` и т.д.\n *\n * ${NOTE}\n */\n\n`;
  for (const service of SERVICES) types += `export * as ${service.prefix} from './${service.id}';\n`;
  types += "export { CronTemplateType, DayOfWeek } from './cron';\n";
  let resources = `/**\n * Классы ресурсов (обычно напрямую не нужны — используйте \`client.<сервис>\`).\n *\n * ${NOTE}\n */\n\n`;
  for (const service of SERVICES) {
    resources += `export { ${service.prefix}Resource, ${service.prefix}ResourceWithRawResponse } from './${service.id}';\n`;
  }
  return { types, resources };
}

function main() {
  const tableServices = new Set(OPERATIONS.map((operation) => operation.service));
  const unknown = SERVICES.filter((service) => !tableServices.has(service.id));
  if (unknown.length || tableServices.size !== SERVICES.length) fail('Сервисы таблицы и списка расходятся');

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(join(OUT_DIR, 'types'), { recursive: true });
  mkdirSync(join(OUT_DIR, 'resources'), { recursive: true });

  const titles = {};
  let total = 0;
  for (const service of SERVICES) {
    const spec = loadSpec(service.id);
    titles[service.id] = spec.info?.title ?? service.id;
    const { resource, types, count } = generateResource(service, spec);
    writeFileSync(join(OUT_DIR, 'types', `${service.id}.ts`), types);
    writeFileSync(join(OUT_DIR, 'resources', `${service.id}.ts`), resource);
    total += count;
  }
  const indexes = generateIndexes();
  writeFileSync(join(OUT_DIR, 'types', 'index.ts'), indexes.types);
  writeFileSync(join(OUT_DIR, 'resources', 'index.ts'), indexes.resources);
  writeFileSync(join(OUT_DIR, 'client.ts'), generateClient(titles));
  console.log(`Сгенерировано: ${SERVICES.length} сервисов, ${total} операций.`);
}

main();
