import { useTranslation } from 'react-i18next';
import { Marker } from 'react-map-gl/mapbox';
import { Button } from '@/components/ui/button';
import CountPin from '@/components/map/CountPin/CountPin';
import DualPin, { type StatusCount } from '@/components/map/DualPin/DualPin';
import type { ClusterItem } from '@/types/map';

interface TrialClusterProps {
  longitude: number;
  latitude: number;
  locationName: string;
  items: ClusterItem[];
  selectedTrialRef?: string | null;
  onToggle: () => void;
}
function TrialCluster({
  longitude,
  latitude,
  locationName,
  items,
  selectedTrialRef,
  onToggle,
}: TrialClusterProps) {
  const { t } = useTranslation();
  const selected = items.some((item) => item.trialRef === selectedTrialRef);
  const selectedStatus = items.find((item) => item.trialRef === selectedTrialRef)?.status ?? null;
  const groups = items.reduce<StatusCount[]>((acc, item) => {
    const group = acc.find((entry) => entry.status === item.status);
    return group
      ? acc.map((entry) => (entry === group ? { ...entry, count: entry.count + 1 } : entry))
      : [...acc, { status: item.status, count: 1 }];
  }, []);

  return (
    <Marker longitude={longitude} latitude={latitude} anchor="bottom">
      <Button
        type="button"
        variant="ghost"
        aria-label={`${t('map.trialCount', { count: items.length })} — ${locationName}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="h-auto bg-transparent p-0 hover:bg-transparent focus-visible:ring-0"
      >
        {groups.length > 1 ? (
          <DualPin groups={groups} selectedStatus={selectedStatus} />
        ) : (
          <CountPin count={items.length} status={groups[0].status} selected={selected} />
        )}
      </Button>
    </Marker>
  );
}

export default TrialCluster;
