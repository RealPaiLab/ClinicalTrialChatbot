import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useVerticalSwipe } from '@/hooks/useVerticalSwipe';
import { deriveTrialStatus, formatPhases, primarySite, publicTrialId } from '@/lib/trial';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { cn } from '@/lib/utils';
import type { Trial } from '@/types/trial';

interface TrialCarouselProps {
  trials: Trial[];
  selectedTrialRef: string | null;
  onSelect: (trialRef: string) => void;
  onOpen: () => void;
}

function TrialCarousel({ trials, selectedTrialRef, onSelect, onOpen }: TrialCarouselProps) {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const swipe = useVerticalSwipe({ onSwipeUp: onOpen });

  useEffect(() => {
    if (!api) return;
    // Our own scrollTo also fires `select`; re-selecting would drop the pin's site.
    const handleSelect = () => {
      const trialRef = trials[api.selectedScrollSnap()]?.trialRef;
      if (trialRef && trialRef !== selectedTrialRef) onSelect(trialRef);
    };
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api, trials, selectedTrialRef, onSelect]);

  // A pin tapped on the map brings its card into view.
  useEffect(() => {
    const index = trials.findIndex((trial) => trial.trialRef === selectedTrialRef);
    if (api && index >= 0 && index !== api.selectedScrollSnap()) api.scrollTo(index);
  }, [api, trials, selectedTrialRef]);

  if (trials.length === 0) return null;

  return (
    <Carousel setApi={setApi} opts={{ align: 'center' }} className="w-full">
      <CarouselContent className="-ml-2.5 px-4">
        {trials.map((trial) => {
          const status = deriveTrialStatus(trial);
          const site = primarySite(trial);
          const place = [site?.city, site?.province].filter(Boolean).join(', ');
          const selected = trial.trialRef === selectedTrialRef;
          return (
            <CarouselItem key={trial.trialRef} className="basis-[88%] pl-2.5">
              <button
                type="button"
                data-selected={selected}
                onClick={() => (selected ? onOpen() : onSelect(trial.trialRef))}
                {...swipe}
                className={cn(
                  'bg-card flex h-full w-full touch-none flex-col gap-2 rounded-xl border p-3.5 text-left shadow-lg transition-colors',
                  selected ? 'border-primary ring-primary/25 ring-2' : 'border-border'
                )}
              >
                <span className="text-muted-foreground flex items-center gap-2 text-[clamp(0.7rem,3vw,0.8rem)]">
                  {status && (
                    <span className={cn('size-2 rounded-full', TRIAL_STATUS[status].badgeClass)} />
                  )}
                  {status && t(TRIAL_STATUS[status].labelKey)}
                  <span className="ml-auto truncate font-mono">{publicTrialId(trial)}</span>
                </span>
                <span className="font-display line-clamp-2 min-h-[2lh] text-[clamp(0.9rem,4vw,1.1rem)] leading-snug font-semibold">
                  {trial.shortTitleEn ?? trial.officialTitleEn}
                </span>
                <span className="text-muted-foreground truncate text-[clamp(0.7rem,3vw,0.8rem)]">
                  {[formatPhases(trial.phases), place].filter(Boolean).join(', ')}
                </span>
              </button>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}

export default TrialCarousel;
