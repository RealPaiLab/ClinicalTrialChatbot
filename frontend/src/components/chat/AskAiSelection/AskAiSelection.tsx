import { useRef, type RefObject } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextSelection } from '@/hooks/useTextSelection';

interface AskAiSelectionProps {
  rootRef: RefObject<HTMLElement | null>;
  onAsk: (text: string) => void;
}

function AskAiSelection({ rootRef, onAsk }: AskAiSelectionProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { anchor, clear } = useTextSelection(rootRef, popoverRef);

  if (!anchor) return null;

  const handleAsk = () => {
    onAsk(anchor.text);
    clear();
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)]"
      style={{ left: anchor.x, top: anchor.y }}
    >
      <Button
        type="button"
        size="sm"
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleAsk}
        className="bg-secondary text-foreground hover:bg-secondary h-7 gap-1.5 rounded-full px-3 text-xs shadow-md transition-transform duration-150 ease-out hover:scale-110"
      >
        <Sparkles className="size-3.5" />
        Ask AI
      </Button>
    </div>
  );
}

export default AskAiSelection;
