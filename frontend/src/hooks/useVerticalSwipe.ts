import type { PointerEvent as ReactPointerEvent } from 'react';
import { MOBILE_LAYOUT } from '@/constants/layout';

interface VerticalSwipeHandlers {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

/** Pointer handler that fires on a mostly vertical swipe past the threshold. */
export function useVerticalSwipe({ onSwipeUp, onSwipeDown }: VerticalSwipeHandlers) {
  // Window listeners catch the release wherever the finger ends; a cancelled gesture drops them.
  const onPointerDown = (start: ReactPointerEvent) => {
    const origin = { x: start.clientX, y: start.clientY };
    const gesture = new AbortController();
    const onPointerUp = (end: PointerEvent) => {
      gesture.abort();
      const dx = end.clientX - origin.x;
      const dy = end.clientY - origin.y;
      if (Math.abs(dy) < MOBILE_LAYOUT.swipeThresholdPx || Math.abs(dy) < Math.abs(dx)) return;
      if (dy < 0) onSwipeUp?.();
      else onSwipeDown?.();
    };
    window.addEventListener('pointerup', onPointerUp, { signal: gesture.signal });
    window.addEventListener('pointercancel', () => gesture.abort(), { signal: gesture.signal });
  };

  return { onPointerDown };
}
