/**
 * Ресурс «API калькулятора подсетей»: `client.cidr`.
 *
 * СГЕНЕРИРОВАНО scripts/generate.mjs — не редактировать руками.
 */

import { APIResource, type FinalRequestOptions, type RequestOptions, stripNullish, toList } from '../../core/base-client';
import type { ApiResponse } from '../../core/response';
import type * as T from '../types/cidr';

function calculateRequest(ip: string, mask: number, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/cidr/calculate',
    query: { ip, mask },
  };
}

function splitRequest(cidr: string, newMask: number, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/cidr/subnets',
    query: { cidr, newMask },
  };
}

function checkRequest(cidr: string, ip: string, options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'GET',
    path: '/api/cidr/check',
    query: { cidr, ip },
  };
}

function supernetRequest(inputs: string | readonly string[], options: RequestOptions): FinalRequestOptions {
  return {
    ...options,
    method: 'POST',
    path: '/api/cidr/supernet',
    body: stripNullish({ inputs: toList(inputs) }),
    hasBody: true,
  };
}

/** Методы {@link CidrResource}, возвращающие {@link ApiResponse}: данные вместе со статусом и заголовками. */
export class CidrResourceWithRawResponse extends APIResource {
  /**
   * Вычисляет все параметры CIDR-блока.
   *
   * Пример запроса: GET /api/cidr/calculate?ip=192.168.1.0&mask=24
   *
   * Возвращает:
   * - Network Address (адрес сети)
   * - Broadcast Address (широковещательный адрес)
   * - Netmask (маска подсети)
   * - Wildcard Mask (wildcard-маска)
   * - First/Last Usable IP (первый/последний используемый IP)
   * - Total/Usable Hosts (общее/используемое количество хостов)
   * - Binary/Hex представления
   *
   * @param ip IP-адрес (IPv4 или IPv6), например: 192.168.1.0 или 2001:db8::1
   * @param mask Маска подсети в CIDR-нотации (0-32 для IPv4, 0-128 для IPv6)
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  calculate(ip: string, mask: number, options: RequestOptions = {}): Promise<ApiResponse<T.CidrCalculationResult>> {
    return this._client.requestRaw<T.CidrCalculationResult>(calculateRequest(ip, mask, options));
  }

  /**
   * Разбивает CIDR-блок на подсети с указанной новой маской.
   *
   * Пример запроса: GET /api/cidr/subnets?cidr=192.168.0.0/16&newMask=24
   *
   * Если количество подсетей превышает 128, возвращаются только первые 128.
   * Флаг IsTruncated указывает на усечение результата.
   *
   * @param cidr Исходный CIDR, например: 192.168.0.0/16
   * @param newMask Новая маска для подсетей (должна быть больше текущей)
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  split(cidr: string, newMask: number, options: RequestOptions = {}): Promise<ApiResponse<T.SubnetBreakdownResult>> {
    return this._client.requestRaw<T.SubnetBreakdownResult>(splitRequest(cidr, newMask, options));
  }

  /**
   * Проверяет, находится ли указанный IP-адрес в пределах CIDR-диапазона.
   *
   * Пример запроса: GET /api/cidr/check?cidr=10.0.0.0/8&ip=10.5.5.5
   *
   * @param cidr CIDR-диапазон для проверки, например: 10.0.0.0/8
   * @param ip IP-адрес для проверки, например: 10.5.5.5
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  check(cidr: string, ip: string, options: RequestOptions = {}): Promise<ApiResponse<T.IpRangeCheckResult>> {
    return this._client.requestRaw<T.IpRangeCheckResult>(checkRequest(cidr, ip, options));
  }

  /**
   * Вычисляет наименьший общий CIDR (Supernet), покрывающий все входные IP/CIDR.
   *
   * Пример запроса: POST /api/cidr/supernet
   * Body: { "inputs": ["192.168.1.0/24", "192.168.2.0/24", "192.168.3.0/24"] }
   *
   * Поддерживаемые форматы входных данных:
   * - CIDR: 192.168.0.0/24
   * - Одиночный IP: 192.168.1.1
   *
   * Смешивание IPv4 и IPv6 не поддерживается.
   *
   * @param inputs Список входных IP-адресов и/или CIDR для агрегации. Поддерживаемые разделители: новая строка, запятая, точка с запятой, пробел.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  supernet(inputs: string | readonly string[], options: RequestOptions = {}): Promise<ApiResponse<T.SupernetResult>> {
    return this._client.requestRaw<T.SupernetResult>(supernetRequest(inputs, options));
  }
}

/**
 * API калькулятора подсетей.
 *
 * Примеры на шести языках: https://github.com/atlorium-api/cidr-subnet-calculator-api-client
 */
export class CidrResource extends APIResource {
  /** Те же методы, но каждый возвращает {@link ApiResponse}: данные вместе со статусом и заголовками. */
  readonly withRawResponse: CidrResourceWithRawResponse = new CidrResourceWithRawResponse(this._client);

  /**
   * Вычисляет все параметры CIDR-блока.
   *
   * Пример запроса: GET /api/cidr/calculate?ip=192.168.1.0&mask=24
   *
   * Возвращает:
   * - Network Address (адрес сети)
   * - Broadcast Address (широковещательный адрес)
   * - Netmask (маска подсети)
   * - Wildcard Mask (wildcard-маска)
   * - First/Last Usable IP (первый/последний используемый IP)
   * - Total/Usable Hosts (общее/используемое количество хостов)
   * - Binary/Hex представления
   *
   * @param ip IP-адрес (IPv4 или IPv6), например: 192.168.1.0 или 2001:db8::1
   * @param mask Маска подсети в CIDR-нотации (0-32 для IPv4, 0-128 для IPv6)
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  calculate(ip: string, mask: number, options: RequestOptions = {}): Promise<T.CidrCalculationResult> {
    return this._client.request<T.CidrCalculationResult>(calculateRequest(ip, mask, options));
  }

  /**
   * Разбивает CIDR-блок на подсети с указанной новой маской.
   *
   * Пример запроса: GET /api/cidr/subnets?cidr=192.168.0.0/16&newMask=24
   *
   * Если количество подсетей превышает 128, возвращаются только первые 128.
   * Флаг IsTruncated указывает на усечение результата.
   *
   * @param cidr Исходный CIDR, например: 192.168.0.0/16
   * @param newMask Новая маска для подсетей (должна быть больше текущей)
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  split(cidr: string, newMask: number, options: RequestOptions = {}): Promise<T.SubnetBreakdownResult> {
    return this._client.request<T.SubnetBreakdownResult>(splitRequest(cidr, newMask, options));
  }

  /**
   * Проверяет, находится ли указанный IP-адрес в пределах CIDR-диапазона.
   *
   * Пример запроса: GET /api/cidr/check?cidr=10.0.0.0/8&ip=10.5.5.5
   *
   * @param cidr CIDR-диапазон для проверки, например: 10.0.0.0/8
   * @param ip IP-адрес для проверки, например: 10.5.5.5
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  check(cidr: string, ip: string, options: RequestOptions = {}): Promise<T.IpRangeCheckResult> {
    return this._client.request<T.IpRangeCheckResult>(checkRequest(cidr, ip, options));
  }

  /**
   * Вычисляет наименьший общий CIDR (Supernet), покрывающий все входные IP/CIDR.
   *
   * Пример запроса: POST /api/cidr/supernet
   * Body: { "inputs": ["192.168.1.0/24", "192.168.2.0/24", "192.168.3.0/24"] }
   *
   * Поддерживаемые форматы входных данных:
   * - CIDR: 192.168.0.0/24
   * - Одиночный IP: 192.168.1.1
   *
   * Смешивание IPv4 и IPv6 не поддерживается.
   *
   * @param inputs Список входных IP-адресов и/или CIDR для агрегации. Поддерживаемые разделители: новая строка, запятая, точка с запятой, пробел.
   * @param options Настройки запроса: `timeout` (мс), `signal`, `maxRetries`, `headers`.
   */
  supernet(inputs: string | readonly string[], options: RequestOptions = {}): Promise<T.SupernetResult> {
    return this._client.request<T.SupernetResult>(supernetRequest(inputs, options));
  }
}
