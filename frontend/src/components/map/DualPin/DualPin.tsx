import PinShape from '@/components/map/PinShape/PinShape';
import type { TrialStatus } from '@/types/trial';

interface DualPinProps {
  statuses: TrialStatus[];
  selectedStatus?: TrialStatus | null;
}

const SPLAY_DEG = 15;

function CrossGlyph() {
  return (
    <g className="fill-current">
      <rect x="14.9" y="8.6" width="2.2" height="8.8" rx="0.7" />
      <rect x="11.6" y="11.9" width="8.8" height="2.2" rx="0.7" />
    </g>
  );
}

function DualPin({ statuses, selectedStatus }: DualPinProps) {
  const last = statuses.length - 1;

  return (
    <div className="relative h-10 w-14">
      {statuses.map((status, index) => {
        const deg = (index - last / 2) * (SPLAY_DEG * 2);
        return (
          <div key={status} className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <div style={{ transformOrigin: 'bottom center', transform: `rotate(${deg}deg)` }}>
              <PinShape status={status} selected={status === selectedStatus}>
                <CrossGlyph />
              </PinShape>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DualPin;
