/**
 * Клиент API Atlorium со всеми сервисами.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { BaseClient, type ClientOptions } from '../core/base-client';
import { EgrulResource } from './resources/egrul';
import { CbrResource } from './resources/cbr';
import { SwiftResource } from './resources/swift';
import { BinResource } from './resources/bin';
import { AmlResource } from './resources/aml';
import { IpInfoResource } from './resources/ipinfo';
import { GarResource } from './resources/gar';
import { AddressStdResource } from './resources/addressstd';
import { PhoneResource } from './resources/phone';
import { EmailResource } from './resources/email';
import { OcrResource } from './resources/ocr';
import { DnsResource } from './resources/dns';
import { CidrResource } from './resources/cidr';
import { CronResource } from './resources/cron';
import { CertificateResource } from './resources/certificate';
import { WeatherResource } from './resources/weather';
import { AiChatResource } from './resources/aichat';
import { GeocodeForwardResource } from './resources/geocodeforward';
import { GeocodeReverseResource } from './resources/geocodereverse';
import { TestDataResource } from './resources/testdata';
import { UrlCheckResource } from './resources/urlcheck';
import { PageSpeedResource } from './resources/pagespeed';
import { ImageCheckResource } from './resources/imagecheck';

/**
 * Клиент API Atlorium.
 *
 * ```ts
 * const client = new Atlorium(); // без ключа — публичный демо-ключ, ответы-моки
 * const card = await client.egrul.get('7707083893');
 * ```
 */
export class Atlorium extends BaseClient {
  /** API ЕГРЮЛ/ЕГРИП */
  readonly egrul: EgrulResource;
  /** API справочника БИК */
  readonly cbr: CbrResource;
  /** API справочника SWIFT/BIC */
  readonly swift: SwiftResource;
  /** API BIN Lookup */
  readonly bin: BinResource;
  /** API AML-скоринга */
  readonly aml: AmlResource;
  /** API профиля IP */
  readonly ipinfo: IpInfoResource;
  /** ГАР/ФИАС API */
  readonly gar: GarResource;
  /** API стандартизации адреса */
  readonly addressstd: AddressStdResource;
  /** API валидации телефона */
  readonly phone: PhoneResource;
  /** API проверки почты */
  readonly email: EmailResource;
  /** API распознавания текста с изображения */
  readonly ocr: OcrResource;
  /** API проверки DNS */
  readonly dns: DnsResource;
  /** API калькулятора подсетей */
  readonly cidr: CidrResource;
  /** API разбора Cron-выражений */
  readonly cron: CronResource;
  /** API проверки SSL-сертификата */
  readonly certificate: CertificateResource;
  /** API погодных данных */
  readonly weather: WeatherResource;
  /** API ИИ-чата */
  readonly aichat: AiChatResource;
  /** API прямого геокодинга */
  readonly geocodeforward: GeocodeForwardResource;
  /** API обратного геокодинга */
  readonly geocodereverse: GeocodeReverseResource;
  /** API генератора тестовых данных РФ */
  readonly testdata: TestDataResource;
  /** API проверки ссылки */
  readonly urlcheck: UrlCheckResource;
  /** API аудита сайта */
  readonly pagespeed: PageSpeedResource;
  /** API анализа изображения */
  readonly imagecheck: ImageCheckResource;

  constructor(options: ClientOptions = {}) {
    super(options);
    this.egrul = new EgrulResource(this);
    this.cbr = new CbrResource(this);
    this.swift = new SwiftResource(this);
    this.bin = new BinResource(this);
    this.aml = new AmlResource(this);
    this.ipinfo = new IpInfoResource(this);
    this.gar = new GarResource(this);
    this.addressstd = new AddressStdResource(this);
    this.phone = new PhoneResource(this);
    this.email = new EmailResource(this);
    this.ocr = new OcrResource(this);
    this.dns = new DnsResource(this);
    this.cidr = new CidrResource(this);
    this.cron = new CronResource(this);
    this.certificate = new CertificateResource(this);
    this.weather = new WeatherResource(this);
    this.aichat = new AiChatResource(this);
    this.geocodeforward = new GeocodeForwardResource(this);
    this.geocodereverse = new GeocodeReverseResource(this);
    this.testdata = new TestDataResource(this);
    this.urlcheck = new UrlCheckResource(this);
    this.pagespeed = new PageSpeedResource(this);
    this.imagecheck = new ImageCheckResource(this);
  }

  /** Копия клиента с другими настройками. Ключ, адрес и `fetch` — те же. */
  withOptions(options: Pick<ClientOptions, 'timeout' | 'maxRetries' | 'defaultHeaders'>): Atlorium {
    const copy = new Atlorium({ ...this._clientOptions(), ...options });
    copy._sleep = this._sleep;
    return copy;
  }
}
