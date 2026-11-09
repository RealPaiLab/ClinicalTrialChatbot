import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import StatusLabel from '@/components/trial/StatusLabel/StatusLabel';
import { useVerticalSwipe } from '@/hooks/useVerticalSwipe';
import { useMapTrials } from '@/hooks/useWorkspace';
import {
  deriveTrialStatus,
  formatPhases,
  primarySite,
  publicTrialId,
  sitePlace,
  trialTitle,
} from '@/lib/trial';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

interface TrialCarouselProps {
  onOpen: () => void;
}

function TrialCarousel({ onOpen }: TrialCarouselProps) {
  const trials = useMapTrials();
  const selectedTrialRef = useAppStore((state) => state.selectedTrialRef);
  const onSelect = useAppStore((state) => state.selectTrial);
  const [api, setApi] = useState<CarouselApi>();
  const swipe = useVerticalSwipe({ onSwipeUp: onOpen });

  useEffect(() => {
    if (!api) return;
    // Our own scrollTo also fires `select`; re-selecting would drop the pin's site.
    const handleSelect = () => {
      const trialRef = trials[api.selectedScrollSnap()]?.trialRef;
      if (trialRef !== undefined && trialRef !== selectedTrialRef) onSelect(trialRef);
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
          const place = sitePlace(primarySite(trial));
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
                  {status && <StatusLabel status={status} className="gap-2" />}
                  <span className="ml-auto truncate font-mono">{publicTrialId(trial)}</span>
                </span>
                <span className="font-display line-clamp-2 min-h-[2lh] text-[clamp(0.9rem,4vw,1.1rem)] leading-snug font-semibold">
                  {trialTitle(trial)}
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
