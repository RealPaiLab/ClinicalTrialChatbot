import { Marker } from 'react-map-gl/mapbox';
import { Button } from '@/components/ui/button';
import HospitalPin from '@/components/map/HospitalPin/HospitalPin';
import type { TrialStatus } from '@/lib/trialStatus';

interface TrialMarkerProps {
  longitude: number;
  latitude: number;
  status: TrialStatus;
  selected: boolean;
  label: string;
  onSelect: () => void;
}

function TrialMarker({ longitude, latitude, status, selected, label, onSelect }: TrialMarkerProps) {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="bottom">
      <Button
        type="button"
        variant="ghost"
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        className="h-auto bg-transparent p-0 hover:bg-transparent focus-visible:ring-0"
      >
        <HospitalPin status={status} selected={selected} />
      </Button>
    </Marker>
  );
}

export default TrialMarker;
