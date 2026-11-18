import type { CSSProperties } from 'react';
import StatusLabel from '@/components/trial/StatusLabel/StatusLabel';
import { TRIAL_STATUSES } from '@/constants/trialStatus';
import { cn } from '@/lib/utils';

interface MapLegendProps {
  className?: string;
  style?: CSSProperties;
}

function MapLegend({ className, style }: MapLegendProps) {
  return (
    <div
      style={style}
      className={cn(
        'bg-card/90 absolute z-10 rounded-lg border p-2.5 shadow-sm backdrop-blur',
        className
      )}
    >
      <ul className="flex flex-col gap-1.5">
        {TRIAL_STATUSES.map((status) => (
          <li key={status}>
            <StatusLabel
              status={status}
              className="text-muted-foreground gap-2 text-xs"
              dotClassName="size-2.5"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MapLegend;
