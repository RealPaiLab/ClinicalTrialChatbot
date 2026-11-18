import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Node's own localStorage global (undefined without --localstorage-file) shadows jsdom's; the persisted store needs one before it loads.
vi.hoisted(() => {
  const items = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
});

import { cleanup } from '@testing-library/react';
import '@/i18n';
import { useAppStore } from '@/store/appStore';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Plain globals, not vi.stubGlobal, so a test's vi.unstubAllGlobals() for fetch leaves them in place.
globalThis.ResizeObserver = ResizeObserverMock;

// jsdom has no matchMedia; tests render the desktop layout.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }) as unknown as MediaQueryList;

// jsdom runs no animations.
Element.prototype.getAnimations = () => [];
Document.prototype.getAnimations = () => [];
Element.prototype.scrollTo = (() => {}) as Element['scrollTo'];
Element.prototype.scrollIntoView = (() => {}) as Element['scrollIntoView'];

afterEach(() => {
  cleanup();
  useAppStore.setState(useAppStore.getInitialState());
});
