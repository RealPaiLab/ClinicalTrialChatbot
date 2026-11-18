import { Badge } from '@/components/ui/badge';
import SourceBadge from '@/components/trial/SourceBadge/SourceBadge';
import StatusLabel from '@/components/trial/StatusLabel/StatusLabel';
import {
  deriveTrialStatus,
  formatPhases,
  primarySite,
  sitePlace,
  uniqueCancerTypes,
} from '@/lib/trial';
import type { Trial } from '@/types/trial';

function TrialBadges({ trial }: { trial: Trial }) {
  const status = deriveTrialStatus(trial);
  const place = sitePlace(primarySite(trial));
  const cancerType = uniqueCancerTypes(trial)[0];
  const phases = formatPhases(trial.phases);

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {trial.dataSources.map((source) => (
        <SourceBadge key={source} source={source} />
      ))}
      {status && (
        <Badge variant="secondary" className="font-normal">
          <StatusLabel status={status} />
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
