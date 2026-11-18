import { History, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ActionTooltip from '@/components/common/ActionTooltip/ActionTooltip';
import StatusDot from '@/components/trial/StatusDot/StatusDot';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { deriveTrialStatus } from '@/lib/trial';
import { useAppStore } from '@/store/appStore';

const EDGE_GAP_PX = 12;

/** Map control listing every answer that found trials, newest first; picking one puts its trials back. */
function ResultHistory() {
  const { t } = useTranslation();
  const turns = useAppStore((state) => state.resultTurns);
  const shownTurnId = useAppStore((state) => state.shownTurnId);
  const showTurn = useAppStore((state) => state.showTurn);
  const newestFirst = turns.map((turn, index) => ({ turn, number: index + 1 })).reverse();

  return (
    <Popover>
      <ActionTooltip label={t('map.history')}>
        <PopoverTrigger asChild>
          <Button
            variant="action"
            size="icon-sm"
            aria-label={t('map.history')}
            className="bg-canvas/90 text-muted-foreground border-border border shadow-sm backdrop-blur"
          >
            <History />
          </Button>
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        collisionPadding={EDGE_GAP_PX}
        className="bg-card max-h-[min(36rem,var(--radix-popover-content-available-height))] w-72 gap-0 overflow-hidden p-0"
      >
        <div className="border-border border-b px-3 py-2">
          <p className="text-eyebrow text-primary">{t('map.history')}</p>
        </div>
        {turns.length === 0 ? (
          <p className="text-muted-foreground px-3 py-3 text-sm">{t('map.historyEmpty')}</p>
        ) : (
          <Command className="min-h-0 flex-1 bg-transparent">
            <CommandList className="max-h-none">
              <CommandGroup className="p-0">
                {newestFirst.map(({ turn, number }) => (
                  <CommandItem
                    key={turn.id}
                    value={turn.id}
                    data-checked={turn.id === shownTurnId}
                    onSelect={() => showTurn(turn)}
                    className="border-border items-start rounded-none border-b px-3 py-2.5 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-caption text-muted-foreground">
                        {t('map.historyAnswer', { index: number })} ·{' '}
                        {t('map.trialCount', { count: turn.trials.length })}
                      </span>
                      <span className="line-clamp-2">{turn.question}</span>
                      <span className="flex flex-wrap gap-1">
                        {turn.trials.map((trial) => {
                          const status = deriveTrialStatus(trial);
                          return status ? <StatusDot key={trial.trialRef} status={status} /> : null;
                        })}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
        <p className="text-caption text-muted-foreground border-border flex items-start gap-1.5 border-t px-3 py-2">
          <Info className="mt-px size-3 shrink-0" />
          {t('map.coverageNotice')}
        </p>
      </PopoverContent>
    </Popover>
  );
}

export default ResultHistory;
