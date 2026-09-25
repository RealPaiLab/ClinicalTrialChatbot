import { useSyncExternalStore } from 'react';
import { MOBILE_LAYOUT } from '@/constants/layout';

const subscribeMedia = (onChange: () => void) => {
  const media = window.matchMedia(MOBILE_LAYOUT.query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const subscribeResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeMedia, () => window.matchMedia(MOBILE_LAYOUT.query).matches);
}

export function useViewportHeight(): number {
  return useSyncExternalStore(subscribeResize, () => window.innerHeight);
}
