import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { cn } from '@/lib/utils';
import type { ClusterItem } from '@/types/map';

interface SiteTrialsCardProps {
  locationName: string;
  items: ClusterItem[];
  selectedTrialRef?: string | null;
  onSelectTrial: (trialRef: string) => void;
  onClose: () => void;
}

function SiteTrialsCard({
  locationName,
  items,
  selectedTrialRef,
  onSelectTrial,
  onClose,
}: SiteTrialsCardProps) {
  const { t } = useTranslation();

  return (
    // Centred so it clears the info button, the zoom control and the legend.
    <div className="absolute top-3 left-1/2 z-20 w-64 max-w-[calc(100%-6rem)] -translate-x-1/2">
      <div className="bg-card/95 text-foreground overflow-hidden rounded-lg border shadow-lg backdrop-blur">
        <div className="border-border flex items-start gap-2 border-b px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-eyebrow text-primary">
              {t('map.trialCount', { count: items.length })}
            </p>
            <p className="text-foreground truncate text-sm font-medium">{locationName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t('map.closeSite')}
            onClick={onClose}
            className="-mr-1 shrink-0"
          >
            <X />
          </Button>
        </div>
        <Command className="bg-transparent">
          <CommandList className="max-h-56">
            <CommandGroup>
              {items.map((item, index) => (
                <CommandItem
                  key={item.trialRef ?? `no-ref-${index}`}
                  value={item.trialRef ?? `no-ref-${index}`}
                  disabled={!item.trialRef}
                  data-checked={item.trialRef === selectedTrialRef}
                  onSelect={() => {
                    if (item.trialRef) {
                      onSelectTrial(item.trialRef);
                      onClose();
                    }
                  }}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      TRIAL_STATUS[item.status].badgeClass
                    )}
                  />
                  <span className="line-clamp-2">{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
}

export default SiteTrialsCard;
