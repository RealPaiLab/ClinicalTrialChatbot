import { useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ChevronUp, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MOBILE_LAYOUT, SHEET_SNAPS, type SheetSnap } from '@/constants/layout';
import { cn } from '@/lib/utils';

interface ChatSheetProps {
  snap: SheetSnap;
  heights: Record<SheetSnap, number>;
  peekLabel: string;
  onSnapChange: (snap: SheetSnap) => void;
  children: ReactNode;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function ChatSheet({ snap, heights, peekLabel, onSnapChange, children }: ChatSheetProps) {
  const { t } = useTranslation();
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  // Drags follow the finger, then settle on the nearest stop; a flick always moves one stop.
  const startDrag = (start: ReactPointerEvent) => {
    const origin = start.clientY;
    const startHeight = heights[snap];
    const drag = { active: false };
    const gesture = new AbortController();
    const heightAt = (y: number) => clamp(startHeight + origin - y, heights.peek, heights.full);

    const onMove = (event: PointerEvent) => {
      if (!drag.active && Math.abs(origin - event.clientY) < MOBILE_LAYOUT.dragSlopPx) return;
      drag.active = true;
      setDragHeight(heightAt(event.clientY));
    };
    const onUp = (event: PointerEvent) => {
      gesture.abort();
      if (!drag.active) return;
      const height = heightAt(event.clientY);
      const nearest = SHEET_SNAPS.reduce((best, candidate) =>
        Math.abs(heights[candidate] - height) < Math.abs(heights[best] - height) ? candidate : best
      );
      const step = Math.sign(origin - event.clientY);
      const flicked =
        SHEET_SNAPS[clamp(SHEET_SNAPS.indexOf(snap) + step, 0, SHEET_SNAPS.length - 1)];
      const moved = Math.abs(origin - event.clientY) > MOBILE_LAYOUT.swipeThresholdPx;
      setDragHeight(null);
      onSnapChange(nearest === snap && moved ? flicked : nearest);
      // A drag that ends on the handle must not also count as a tap on it.
      const swallowClick = (click: MouseEvent) => click.stopPropagation();
      window.addEventListener('click', swallowClick, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', swallowClick, true));
    };
    // A cancelled gesture drops the listeners and settles back on the current stop.
    const onCancel = () => {
      gesture.abort();
      setDragHeight(null);
    };
    window.addEventListener('pointermove', onMove, { signal: gesture.signal });
    window.addEventListener('pointerup', onUp, { signal: gesture.signal });
    window.addEventListener('pointercancel', onCancel, { signal: gesture.signal });
  };

  const peeking = snap === 'peek' && dragHeight === null;

  return (
    <section
      aria-label={t('app.shortTitle')}
      style={{ height: dragHeight ?? heights[snap] }}
      className={cn(
        'bg-card border-border absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t shadow-2xl',
        dragHeight === null &&
          'transition-[height] duration-300 ease-out motion-reduce:transition-none'
      )}
    >
      <div
        data-tour="mobile-sheet-handle"
        onPointerDown={startDrag}
        className="flex shrink-0 touch-none flex-col items-center"
      >
        {peeking ? (
          <button
            type="button"
            onClick={() => onSnapChange('half')}
            className="flex h-16 w-full flex-col items-center justify-center gap-1.5 px-4"
          >
            <span aria-hidden className="bg-muted-foreground/30 h-1.5 w-10 rounded-full" />
            <span className="flex max-w-full items-center gap-2 text-[clamp(0.9rem,3.9vw,1.05rem)] font-medium">
              <MessageCircle className="text-primary size-5 shrink-0" />
              <span className="truncate">{peekLabel}</span>
              <ChevronUp className="text-muted-foreground size-5 shrink-0" />
            </span>
          </button>
        ) : (
          <button
            type="button"
            aria-label={t('mobile.backToMap')}
            title={t('mobile.resizeChat')}
            onClick={() => onSnapChange('peek')}
            className="flex h-6 w-full cursor-grab items-center justify-center"
          >
            <span aria-hidden className="bg-muted-foreground/30 h-1.5 w-10 rounded-full" />
          </button>
        )}
      </div>
      {/* The chat's own header doubles as a drag handle. */}
      <div
        inert={peeking}
        onPointerDown={(event) =>
          (event.target as HTMLElement).closest('header') && startDrag(event)
        }
        className="min-h-0 flex-1 [&_header]:touch-none [&_header]:select-none"
      >
        {children}
      </div>
    </section>
  );
}

export default ChatSheet;
