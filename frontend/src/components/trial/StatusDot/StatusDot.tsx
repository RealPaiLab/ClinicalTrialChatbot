import { TRIAL_STATUS, type TrialStatus } from '@/constants/trialStatus';
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: TrialStatus;
  className?: string;
}

function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 rounded-full', TRIAL_STATUS[status].badgeClass, className)}
    />
  );
}

export default StatusDot;
