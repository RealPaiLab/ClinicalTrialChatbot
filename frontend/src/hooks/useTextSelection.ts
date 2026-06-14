import { useEffect, useState, type RefObject } from 'react';

export interface SelectionAnchor {
  x: number;
  y: number;
  text: string;
}

const MAX_SELECTION_LENGTH = 200;

function readSelectionWithin(root: HTMLElement | null): SelectionAnchor | null {
  if (!root) return null;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const text = selection.toString().trim();
  if (!text || text.length > MAX_SELECTION_LENGTH) return null;

  const { anchorNode, focusNode } = selection;
  if (!anchorNode || !focusNode) return null;
  if (!root.contains(anchorNode) || !root.contains(focusNode)) return null;

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top, text };
}

export function useTextSelection(
  rootRef: RefObject<HTMLElement | null>,
  ignoreRef: RefObject<HTMLElement | null>
) {
  const [anchor, setAnchor] = useState<SelectionAnchor | null>(null);

  useEffect(() => {
    const handlePointerUp = (event: MouseEvent | TouchEvent) => {
      if (ignoreRef.current?.contains(event.target as Node)) return;
      setAnchor(readSelectionWithin(rootRef.current));
    };
    const dismiss = () => setAnchor(null);

    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchend', handlePointerUp);
    document.addEventListener('scroll', dismiss, true);
    return () => {
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchend', handlePointerUp);
      document.removeEventListener('scroll', dismiss, true);
    };
  }, [rootRef, ignoreRef]);

  const clear = () => {
    window.getSelection()?.removeAllRanges();
    setAnchor(null);
  };

  return { anchor, clear };
}
