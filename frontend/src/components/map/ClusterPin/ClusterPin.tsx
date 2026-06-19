import PinShape from '@/components/map/PinShape/PinShape';
import type { TrialStatus } from '@/types/trial';

interface ClusterPinProps {
  count: number;
  status: TrialStatus;
  selected?: boolean;
}

function ClusterPin({ count, status, selected }: ClusterPinProps) {
  return (
    <PinShape status={status} selected={selected}>
      <text
        x="16"
        y="13"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-current text-[9px] font-semibold"
      >
        {count}
      </text>
    </PinShape>
  );
}

export default ClusterPin;
