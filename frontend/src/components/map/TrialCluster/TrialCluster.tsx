import { Marker, Popup } from 'react-map-gl/mapbox';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import CountPin from '@/components/map/CountPin/CountPin';
import DualPin, { type StatusCount } from '@/components/map/DualPin/DualPin';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { cn } from '@/lib/utils';
import type { TrialStatus } from '@/types/trial';

export interface ClusterItem {
  trialRef: string | null;
  title: string;
  status: TrialStatus;
}

interface TrialClusterProps {
  longitude: number;
  latitude: number;
  locationName: string;
  items: ClusterItem[];
  selectedTrialRef?: string | null;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectTrial: (trialRef: string) => void;
}

function TrialCluster({
  longitude,
  latitude,
  locationName,
  items,
  selectedTrialRef,
  open,
  onToggle,
  onClose,
  onSelectTrial,
}: TrialClusterProps) {
  const selected = items.some((item) => item.trialRef === selectedTrialRef);
  const selectedStatus = items.find((item) => item.trialRef === selectedTrialRef)?.status ?? null;
  const groups = items.reduce<StatusCount[]>((acc, item) => {
    const group = acc.find((entry) => entry.status === item.status);
    return group
      ? acc.map((entry) => (entry === group ? { ...entry, count: entry.count + 1 } : entry))
      : [...acc, { status: item.status, count: 1 }];
  }, []);

  return (
    <>
      <Marker longitude={longitude} latitude={latitude} anchor="bottom">
        <Button
          type="button"
          variant="ghost"
          aria-label={`${items.length} trials at ${locationName}`}
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

      {open && (
        <Popup
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
          offset={40}
          closeButton={false}
          closeOnClick
          onClose={onClose}
          className="trial-cluster-popup"
          maxWidth="280px"
        >
          <div className="bg-card text-foreground w-64 overflow-hidden rounded-lg border shadow-lg">
            <div className="border-border border-b px-3 py-2">
              <p className="text-eyebrow text-primary">{items.length} trials</p>
              <p className="text-foreground truncate text-sm font-medium">{locationName}</p>
            </div>
            <Command className="bg-transparent">
              <CommandList className="max-h-56">
                <CommandGroup>
                  {items.map((item, index) => (
                    <CommandItem
                      key={item.trialRef ?? `no-ref-${index}`}
                      value={item.trialRef ?? `no-ref-${index}`}
                      disabled={!item.trialRef}
                      data-checked={item.trialRef === selectedTrialRef}
                      onSelect={() => {
                        if (item.trialRef) {
                          onSelectTrial(item.trialRef);
                          onClose();
                        }
                      }}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'size-2 shrink-0 rounded-full',
                          TRIAL_STATUS[item.status].badgeClass
                        )}
                      />
                      <span className="line-clamp-2">{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </Popup>
      )}
    </>
  );
}

export default TrialCluster;
