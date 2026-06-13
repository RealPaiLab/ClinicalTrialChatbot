import { useId } from 'react';
import { cn } from '@/lib/utils';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import type { TrialStatus } from '@/types/trial';

interface HospitalPinProps {
  status: TrialStatus;
  selected?: boolean;
}

const PIN_PATH =
  'M16 3C10.477 3 6 7.477 6 13c0 7.25 10 18 10 18s10-10.75 10-18c0-5.523-4.477-10-10-10z';

function HospitalPin({ status, selected }: HospitalPinProps) {
  const config = TRIAL_STATUS[status];
  const shadeId = useId();

  return (
    <div
      className={cn(
        'relative grid place-items-center transition-transform duration-200 ease-out',
        selected ? 'z-10 scale-125' : 'hover:scale-110'
      )}
    >
      {config.pulse && (
        <span
          aria-hidden
          className={cn(
            'absolute top-0.5 left-1/2 size-6 -translate-x-1/2 animate-ping rounded-full opacity-40',
            config.badgeClass
          )}
        />
      )}

      <svg
        aria-hidden
        viewBox="0 0 32 34"
        className={cn(
          'animate-in fade-in zoom-in-75 relative size-9 duration-300',
          config.colorClass,
          selected ? 'drop-shadow-lg' : 'drop-shadow-md'
        )}
      >
        <defs>
          <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.22" />
            <stop offset="42%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <path d={PIN_PATH} className="fill-current" />
        <path d={PIN_PATH} fill={`url(#${shadeId})`} />

        <circle cx="16" cy="13" r="6.2" className="fill-white" />
        <g className="fill-current">
          <rect x="14.9" y="8.6" width="2.2" height="8.8" rx="0.7" />
          <rect x="11.6" y="11.9" width="8.8" height="2.2" rx="0.7" />
        </g>
      </svg>

      <span
        aria-hidden
        className={cn(
          'absolute -bottom-0.5 left-1/2 h-[5px] -translate-x-1/2 rounded-[50%] bg-black/25 blur-[2px] transition-all duration-200',
          selected ? 'w-4 opacity-70' : 'w-3 opacity-50'
        )}
      />
    </div>
  );
}

export default HospitalPin;
