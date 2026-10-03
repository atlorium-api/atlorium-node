/**
 * Типы запросов и ответов сервиса «API калькулятора подсетей».
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками. Источник: spec/cidr_ru.json.
 */

/** Единое тело ответа для любого отказа: и для ошибки валидации, и для отсутствующего ключа, и для исчерпанного лимита. Ветвиться в коде следует по полю `error` — это стабильный машинный код. Поля `title` и `message` предназначены человеку, их формулировки могут меняться. */
export interface ApiError {
  /**
   * Машинный код причины отказа. Возможные значения:
   *
   * * `server_error` (500) — Сервис временно недоступен
   * * `unauthorized` (401) — Требуется вход
   * * `api_key_required` (401) — Нужен API-ключ
   * * `account_not_activated` (402) — Аккаунт не активирован
   * * `rate_limited_client` (429) — Слишком много запросов
   * * `rate_limited_global` (429) — Высокая нагрузка на сервис
   * * `provider_keys_exhausted` (429) — Сервис временно недоступен
   * * `insufficient_credits` (402) — Недостаточно кредитов
   * * `guest_quota_exhausted` (402) — Бесплатный лимит на сегодня исчерпан
   * * `service_disabled` (503) — Проводятся плановые работы
   * * `maintenance` (503) — Проводятся плановые работы
   * * `guest_not_allowed` (402) — Нужна регистрация
   * * `service_not_in_account_terms` (403) — Сервис не подключён
   * * `bad_request` (400) — Некорректный запрос
   * * `forbidden` (403) — Доступ запрещён
   * * `not_found` (404) — Ничего не найдено
   * * `method_not_allowed` (405) — Метод HTTP не поддерживается
   * * `unsupported_media_type` (415) — Формат запроса не поддерживается
   * * `not_implemented` (501) — Режим пока не реализован
   */
  error: string;
  /** Короткий заголовок для интерфейса. */
  title: string;
  /** Подробное объяснение: что произошло и что с этим делать. Показывается пользователю целиком. */
  message: string;
  /** Текущий баланс в кредитах. Заполняется при 402, чтобы не делать отдельный запрос за балансом; в остальных случаях null. */
  balance: number | null;
  /** Через сколько секунд имеет смысл повторить запрос. Дублирует HTTP-заголовок Retry-After. null — если повтор не поможет (например, кончились кредиты). */
  retryAfterSeconds: number | null;
  /** Та же задержка готовой фразой — «через 2 мин 30 с». Чтобы клиентам не приходилось самим склонять минуты и секунды. */
  retryAfterText: string | null;
}

/** Результат расчёта CIDR — содержит все вычисленные параметры сети. */
export interface CidrCalculationResult {
  /** Исходный IP-адрес, введённый пользователем. */
  ipAddress: string;
  /** Маска подсети в CIDR-нотации (например, 24 для /24). */
  mask: number;
  /** Версия IP-протокола: 4 для IPv4, 6 для IPv6. */
  ipVersion: number;
  /** Адрес сети (Network Address) — первый адрес в диапазоне. */
  networkAddress: string;
  /**
   * Широковещательный адрес (Broadcast Address) — последний адрес в диапазоне.
   * Для IPv6 технически не существует, но возвращаем последний адрес диапазона.
   */
  broadcastAddress: string;
  /** Маска подсети в полном формате (например, 255.255.255.0). */
  netmask: string;
  /** Wildcard-маска — инверсия маски подсети (используется в ACL Cisco). */
  wildcardMask: string;
  /** Первый используемый IP-адрес (Network + 1 для IPv4). */
  firstUsableIp: string;
  /** Последний используемый IP-адрес (Broadcast - 1 для IPv4). */
  lastUsableIp: string;
  /**
   * Общее количество хостов в сети.
   * Для больших IPv6 сетей возвращается строка, так как BigInteger.
   */
  totalHosts: string;
  /** Количество используемых хостов (без Network и Broadcast для IPv4). */
  usableHosts: string;
  /** CIDR-нотация сети (например, 192.168.1.0/24). */
  cidrNotation: string;
  /** Двоичное представление IP-адреса. */
  binaryRepresentation: string;
  /** Шестнадцатеричное представление IP-адреса. */
  hexRepresentation: string;
  /** Двоичное представление маски подсети. */
  binaryMask: string;
  /** Флаг успешности расчёта. */
  success: boolean;
  /** Сообщение об ошибке, если расчёт не удался. */
  error: string | null;
}

/** Результат проверки принадлежности IP-адреса к CIDR-диапазону. */
export interface IpRangeCheckResult {
  /** Проверяемый CIDR-диапазон. */
  cidr: string;
  /** Проверяемый IP-адрес. */
  ipAddress: string;
  /** Результат проверки: true — IP находится в диапазоне. */
  isInRange: boolean;
  /** Детальное описание результата проверки. */
  details: string;
  /** Флаг успешности проверки (валидность входных данных). */
  success: boolean;
  /** Сообщение об ошибке, если проверка не удалась. */
  error: string | null;
}

/** Результат разбиения сети на подсети. */
export interface SubnetBreakdownResult {
  /** Исходный CIDR, который разбивается на подсети. */
  originalCidr: string;
  /** Новая маска для подсетей. */
  newMask: number;
  /** Общее количество возможных подсетей. */
  totalSubnets: string;
  /** Количество отображаемых подсетей (до 128). */
  displayedCount: number;
  /** Флаг, указывающий что результат был ограничен. */
  isTruncated: boolean;
  /** Список подсетей. */
  subnets: SubnetInfo[];
  /** Флаг успешности расчёта. */
  success: boolean;
  /** Сообщение об ошибке, если расчёт не удался. */
  error: string | null;
}

/** Информация об отдельной подсети. */
export interface SubnetInfo {
  /** Порядковый номер подсети (начиная с 1). */
  index: number;
  /** Адрес сети. */
  networkAddress: string;
  /** Широковещательный адрес. */
  broadcastAddress: string;
  /** Первый используемый IP-адрес. */
  firstUsableIp: string;
  /** Последний используемый IP-адрес. */
  lastUsableIp: string;
  /** Количество хостов в подсети. */
  hostCount: string;
  /** CIDR-нотация подсети. */
  cidrNotation: string;
}

/** Запрос на агрегацию CIDR/IP. */
export interface SupernetRequest {
  /**
   * Список входных IP-адресов и/или CIDR для агрегации.
   * Поддерживаемые разделители: новая строка, запятая, точка с запятой, пробел.
   */
  inputs: string[];
}

/** Результат агрегации (supernetting) — наименьший общий CIDR. */
export interface SupernetResult {
  /** Список входных IP-адресов и CIDR. */
  inputs: string[];
  /** Количество успешно разобранных входных значений. */
  parsedCount: number;
  /** Вычисленный агрегированный CIDR (Supernet). */
  supernetCidr: string;
  /** Адрес сети supernet. */
  networkAddress: string;
  /** Широковещательный адрес supernet. */
  broadcastAddress: string;
  /** Общее количество хостов в supernet. */
  totalHosts: string;
  /** Флаг успешности расчёта. */
  success: boolean;
  /** Сообщение об ошибке, если расчёт не удался. */
  error: string | null;
  /** Список предупреждений (например, если некоторые входные значения не распознаны). */
  warnings: string[];
}
