import PinShape from '@/components/map/PinShape/PinShape';
import type { TrialStatus } from '@/types/trial';

interface HospitalPinProps {
  status: TrialStatus;
  selected?: boolean;
}

function HospitalPin({ status, selected }: HospitalPinProps) {
  return (
    <PinShape status={status} selected={selected}>
      <g className="fill-current">
        <rect x="14.9" y="8.6" width="2.2" height="8.8" rx="0.7" />
        <rect x="11.6" y="11.9" width="8.8" height="2.2" rx="0.7" />
      </g>
    </PinShape>
  );
}

export default HospitalPin;
