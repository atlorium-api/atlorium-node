import { Atlorium, type ClientOptions, type Fetch } from '../src/index';

export interface Recorded {
  url: URL;
  method: string;
  headers: Headers;
  body: string | undefined;
  signal: AbortSignal | undefined;
}

export type Respond = (request: Recorded) => Response | Promise<Response>;

export function json(body: unknown, init: ResponseInit & { headers?: Record<string, string> } = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...init.headers },
  });
}

/** Подменный сервер: запоминает запросы и отвечает заданной функцией. */
export function recorder(respond: Respond = () => json({ ok: true })): { calls: Recorded[]; fetch: Fetch } {
  const calls: Recorded[] = [];
  const fetch: Fetch = async (input, init) => {
    const request: Recorded = {
      url: new URL(input),
      method: init.method ?? 'GET',
      headers: new Headers(init.headers),
      body: typeof init.body === 'string' ? init.body : undefined,
      signal: init.signal ?? undefined,
    };
    calls.push(request);
    return respond(request);
  };
  return { calls, fetch };
}

export function makeClient(fetch: Fetch, options: ClientOptions = {}): { client: Atlorium; sleeps: number[] } {
  const client = new Atlorium({ apiKey: 'ak_test', fetch, maxRetries: 0, ...options });
  const sleeps: number[] = [];
  client._sleep = async (ms) => {
    sleeps.push(ms);
  };
  return { client, sleeps };
}
