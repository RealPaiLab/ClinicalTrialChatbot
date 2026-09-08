import CountPin from '@/components/map/CountPin/CountPin';
import type { TrialStatus } from '@/types/trial';

export interface StatusCount {
  status: TrialStatus;
  count: number;
}

interface DualPinProps {
  groups: StatusCount[];
  selectedStatus?: TrialStatus | null;
}

const SPLAY_DEG = 15;

function DualPin({ groups, selectedStatus }: DualPinProps) {
  const last = groups.length - 1;

  return (
    <div className="relative h-10 w-14">
      {groups.map((group, index) => {
        const deg = (index - last / 2) * (SPLAY_DEG * 2);
        return (
          <div key={group.status} className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <div style={{ transformOrigin: 'bottom center', transform: `rotate(${deg}deg)` }}>
              <CountPin
                count={group.count}
                status={group.status}
                selected={group.status === selectedStatus}
                tilt={deg}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DualPin;
