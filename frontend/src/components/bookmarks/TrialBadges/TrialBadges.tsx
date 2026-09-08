import { Badge } from '@/components/ui/badge';
import { deriveTrialStatus, formatPhases, primarySite, uniqueCancerTypes } from '@/lib/trial';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { cn } from '@/lib/utils';
import type { Trial } from '@/types/trial';

function TrialBadges({ trial }: { trial: Trial }) {
  const status = deriveTrialStatus(trial);
  const site = primarySite(trial);
  const place = [site?.city, site?.province].filter(Boolean).join(', ');
  const cancerType = uniqueCancerTypes(trial)[0];
  const phases = formatPhases(trial.phases);

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {status && (
        <Badge variant="secondary" className="gap-1.5 font-normal">
          <span className={cn('size-2 rounded-full', TRIAL_STATUS[status].badgeClass)} />
          {TRIAL_STATUS[status].label}
        </Badge>
      )}
      {cancerType && (
        <Badge variant="outline" className="font-normal capitalize">
          {cancerType}
        </Badge>
      )}
      {place && (
        <Badge variant="outline" className="font-normal">
          {place}
        </Badge>
      )}
      {phases && (
        <Badge variant="outline" className="font-normal">
          {phases}
        </Badge>
      )}
    </span>
  );
}

export default TrialBadges;
