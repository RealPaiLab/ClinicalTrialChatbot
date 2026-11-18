import { useTranslation } from 'react-i18next';
import StatusDot from '@/components/trial/StatusDot/StatusDot';
import { TRIAL_STATUS, type TrialStatus } from '@/constants/trialStatus';
import { cn } from '@/lib/utils';

interface StatusLabelProps {
  status: TrialStatus;
  className?: string;
  dotClassName?: string;
}

function StatusLabel({ status, className, dotClassName }: StatusLabelProps) {
  const { t } = useTranslation();

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <StatusDot status={status} className={dotClassName} />
      {t(TRIAL_STATUS[status].labelKey)}
    </span>
  );
}

export default StatusLabel;
