import { ListPlus, MapPinned } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MessageActions } from '@/components/ai-elements/message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import type { ResultTurn } from '@/types/trial';

interface MessageTrialActionsProps {
  turn: ResultTurn;
  busy: boolean;
  onShown?: () => void;
  onFindMore: (trialRefs: string[]) => void;
}

/** Under an answer that found trials: put them back on the map, or ask for more like them. */
function MessageTrialActions({ turn, busy, onShown, onFindMore }: MessageTrialActionsProps) {
  const { t } = useTranslation();
  const shown = useAppStore((state) => state.shownTurnId === turn.id);
  const showTurn = useAppStore((state) => state.showTurn);
  const count = turn.trials.length;

  return (
    <MessageActions className="text-muted-foreground w-fit">
      <Button
        variant="action"
        size="xs"
        aria-pressed={shown}
        disabled={shown}
        onClick={() => {
          showTurn(turn);
          onShown?.();
        }}
        className={cn(shown && 'text-foreground [&_svg]:text-highlight disabled:opacity-100')}
      >
        <MapPinned />
        {shown ? t('chat.trialsOnMap') : t('chat.showTrialsOnMap', { count })}
      </Button>
      <Button
        variant="action"
        size="xs"
        disabled={busy}
        onClick={() => onFindMore(turn.trials.map((trial) => trial.trialRef))}
      >
        <ListPlus />
        {t('chat.findMore')}
      </Button>
    </MessageActions>
  );
}

export default MessageTrialActions;
