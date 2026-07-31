import PinShape from '@/components/map/PinShape/PinShape';
import type { TrialStatus } from '@/types/trial';

interface CountPinProps {
  count: number;
  status: TrialStatus;
  selected?: boolean;
  tilt?: number;
}

function CountPin({ count, status, selected, tilt = 0 }: CountPinProps) {
  return (
    <PinShape status={status} selected={selected}>
      <text
        x="16"
        y="13"
        textAnchor="middle"
        dominantBaseline="central"
        transform={tilt ? `rotate(${-tilt} 16 13)` : undefined}
        className="fill-current text-[9px] font-semibold"
      >
        {count}
      </text>
    </PinShape>
  );
}

export default CountPin;
