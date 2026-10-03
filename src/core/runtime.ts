/**
 * Всё, что зависит от среды выполнения, — без импорта API Node.js: ядро SDK работает в Node,
 * Bun, Deno, браузерах и edge-средах.
 */

interface ProcessLike {
  env?: Record<string, string | undefined>;
  versions?: { node?: string; bun?: string };
}

interface DenoLike {
  version?: { deno?: string };
}

function processLike(): ProcessLike | undefined {
  return (globalThis as { process?: ProcessLike }).process;
}

/** Значение переменной окружения или `undefined`, если окружения нет (браузер) или переменная пуста. */
export function getEnv(name: string): string | undefined {
  try {
    const value = processLike()?.env?.[name]?.trim();
    return value ? value : undefined;
  } catch {
    // Deno без --allow-env бросает исключение при чтении окружения.
    return undefined;
  }
}

/**
 * Заголовок User-Agent для серверных сред. В браузере не ставится: там его задаёт сам браузер и
 * заменить из скрипта нельзя.
 *
 * Deno проверяется первым: в Deno 2 тоже есть `process.versions.node` (слой совместимости с Node).
 */
export function userAgent(version: string): string | undefined {
  const deno = (globalThis as { Deno?: DenoLike }).Deno;
  if (deno?.version?.deno) return `atlorium-node/${version} (deno/${deno.version.deno})`;
  const versions = processLike()?.versions;
  if (versions?.bun) return `atlorium-node/${version} (bun/${versions.bun})`;
  if (versions?.node) return `atlorium-node/${version} (node/${versions.node})`;
  return undefined;
}

interface BufferLike {
  from(data: Uint8Array): { toString(encoding: 'base64'): string };
}

/** Байты → Base64. В Node использует Buffer (быстрее), в остальных средах — `btoa`. */
export function toBase64(bytes: Uint8Array): string {
  const buffer = (globalThis as { Buffer?: BufferLike }).Buffer;
  if (buffer) return buffer.from(bytes).toString('base64');
  let binary = '';
  const chunk = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunk));
  }
  return btoa(binary);
}

/** Пауза; при отмене через `signal` таймер снимается сразу, чтобы не держать процесс. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
