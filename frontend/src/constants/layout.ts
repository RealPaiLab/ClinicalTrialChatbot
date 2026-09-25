export const PANEL_SPLIT = {
  summaryIdle: '30%',
  summaryFocused: '70%',
  animatingClass: 'panel-split-animating',
  animationMs: 520,
} as const;

export const MOBILE_LAYOUT = {
  // Short screens too, so a phone turned to landscape keeps the mobile layout.
  query: '(max-width: 767px), (max-height: 500px)',
  swipeThresholdPx: 48,
  dragSlopPx: 6,
  sheetPeekPx: 64,
  sheetHalfRatio: 0.55,
  // Room left above a full sheet so the search bar stays visible.
  sheetTopGapPx: 88,
} as const;

export const SHEET_SNAPS = ['peek', 'half', 'full'] as const;
export type SheetSnap = (typeof SHEET_SNAPS)[number];

export function sheetHeights(viewportHeight: number): Record<SheetSnap, number> {
  return {
    peek: MOBILE_LAYOUT.sheetPeekPx,
    half: Math.round(viewportHeight * MOBILE_LAYOUT.sheetHalfRatio),
    full: viewportHeight - MOBILE_LAYOUT.sheetTopGapPx,
  };
}
