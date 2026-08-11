import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadConfig(environment: string) {
  window._env_ = { ENVIRONMENT: environment };
  vi.resetModules();
  const { config } = await import('@/config');
  return config;
}

afterEach(() => {
  delete window._env_;
  vi.resetModules();
});

describe('environment gate', () => {
  it.each([
    ['development', false],
    ['staging', false],
    ['production', true],
  ])('%s', async (environment, isProduction) => {
    const config = await loadConfig(environment);

    expect(config.isProduction).toBe(isProduction);
  });

  it('treats an unknown environment as non-production', async () => {
    const config = await loadConfig('preview');

    expect(config.isProduction).toBe(false);
  });
});
