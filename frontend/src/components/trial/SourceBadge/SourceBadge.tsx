import { Badge } from '@/components/ui/badge';
import { TRIAL_SOURCES } from '@/constants/trialSources';
import type { TrialSourceCode } from '@/constants/trialSources';
import { cn } from '@/lib/utils';

function SourceBadge({ source }: { source: TrialSourceCode }) {
  return (
    <Badge variant="outline" className={cn('font-normal', TRIAL_SOURCES[source].badgeClass)}>
      {TRIAL_SOURCES[source].label}
    </Badge>
  );
}

export default SourceBadge;
