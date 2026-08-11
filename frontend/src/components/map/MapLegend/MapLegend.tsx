import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { TRIAL_STATUS } from '@/lib/trialStatus';

function MapLegend() {
  const { t } = useTranslation();

  return (
    <div className="bg-card/90 absolute bottom-4 left-4 z-10 rounded-lg border p-2.5 shadow-sm backdrop-blur">
      <ul className="flex flex-col gap-1.5">
        {Object.values(TRIAL_STATUS).map((status) => (
          <li key={status.labelKey} className="flex items-center gap-2">
            <span className={cn('size-2.5 rounded-full', status.badgeClass)} />
            <span className="text-muted-foreground text-xs">{t(status.labelKey)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MapLegend;
