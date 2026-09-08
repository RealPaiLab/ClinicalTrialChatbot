import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataFreshnessQuery } from './dataFreshness';

function run() {
  const { queryFn } = dataFreshnessQuery();
  return (queryFn as (context: { signal?: AbortSignal }) => Promise<unknown>)({});
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('dataFreshnessQuery', () => {
  it('maps the snake_case wire fields into camelCase', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ published_at: '2026-09-02T13:04:22Z' }))
    );

    await expect(run()).resolves.toEqual({ publishedAt: '2026-09-02T13:04:22Z' });
  });

  it('passes a corpus that was never ingested through as nulls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ published_at: null }))
    );

    await expect(run()).resolves.toEqual({ publishedAt: null });
  });

  it('throws on a failed response so the caller hides the date', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 }))
    );

    await expect(run()).rejects.toThrow('503');
  });
});
