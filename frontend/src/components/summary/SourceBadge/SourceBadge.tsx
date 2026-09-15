import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { TRIAL_SOURCES } from '@/constants/trialSources';
import type { TrialSourceCode } from '@/constants/trialSources';
import { cn } from '@/lib/utils';

function SourceBadge({ source }: { source: TrialSourceCode }) {
  const { t } = useTranslation();
  return (
    <Badge variant="outline" className={cn('font-normal', TRIAL_SOURCES[source].badgeClass)}>
      {t(TRIAL_SOURCES[source].labelKey)}
    </Badge>
  );
}

export default SourceBadge;
