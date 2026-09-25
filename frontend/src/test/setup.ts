import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@/i18n';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// jsdom has no matchMedia; tests render the desktop layout.
vi.stubGlobal(
  'matchMedia',
  (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList
);

Element.prototype.scrollTo = (() => {}) as Element['scrollTo'];
Element.prototype.scrollIntoView = (() => {}) as Element['scrollIntoView'];

afterEach(() => {
  cleanup();
});
