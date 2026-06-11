import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

Element.prototype.scrollTo = (() => {}) as Element['scrollTo'];
Element.prototype.scrollIntoView = (() => {}) as Element['scrollIntoView'];

afterEach(() => {
  cleanup();
});
