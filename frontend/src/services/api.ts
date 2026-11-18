import camelcaseKeys from 'camelcase-keys';
import { config } from '@/config';

export class ApiError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor(path: string, status: number, retryAfter?: number) {
    super(`${path} failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

interface RequestOptions {
  signal?: AbortSignal;
  /** Snake_case paths whose nested keys are data, not field names, and must stay as sent. */
  stopPaths?: string[];
}

function parseRetryAfter(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

export function camelize<T>(data: unknown, stopPaths?: string[]): T {
  return camelcaseKeys(data as Record<string, unknown>, { deep: true, stopPaths }) as T;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, init);
  if (!response.ok) {
    throw new ApiError(path, response.status, parseRetryAfter(response.headers.get('Retry-After')));
  }
  return response;
}

export async function apiGet<T>(
  path: string,
  { signal, stopPaths }: RequestOptions = {}
): Promise<T> {
  const response = await apiFetch(path, { signal });
  return camelize<T>(await response.json(), stopPaths);
}

export async function apiPost(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<Response> {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}
