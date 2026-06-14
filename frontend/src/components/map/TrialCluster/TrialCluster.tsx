import { Marker, Popup } from 'react-map-gl/mapbox';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import ClusterPin from '@/components/map/ClusterPin/ClusterPin';
import DualPin from '@/components/map/DualPin/DualPin';
import { TRIAL_STATUS } from '@/lib/trialStatus';
import { cn } from '@/lib/utils';
import type { TrialStatus } from '@/types/trial';

export interface ClusterItem {
  nctNumber: string | null;
  title: string;
  status: TrialStatus;
}

interface TrialClusterProps {
  longitude: number;
  latitude: number;
  locationName: string;
  items: ClusterItem[];
  selectedNctNumber?: string | null;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectTrial: (nctNumber: string) => void;
}

function TrialCluster({
  longitude,
  latitude,
  locationName,
  items,
  selectedNctNumber,
  open,
  onToggle,
  onClose,
  onSelectTrial,
}: TrialClusterProps) {
  const selected = items.some((item) => item.nctNumber === selectedNctNumber);
  const selectedStatus = items.find((item) => item.nctNumber === selectedNctNumber)?.status ?? null;
  const statuses = [...new Set(items.map((item) => item.status))];

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
          {statuses.length > 1 ? (
            <DualPin statuses={statuses} selectedStatus={selectedStatus} />
          ) : (
            <ClusterPin count={items.length} status={statuses[0]} selected={selected} />
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
                      key={item.nctNumber ?? `no-nct-${index}`}
                      value={item.nctNumber ?? `no-nct-${index}`}
                      disabled={!item.nctNumber}
                      data-checked={item.nctNumber === selectedNctNumber}
                      onSelect={() => {
                        if (item.nctNumber) {
                          onSelectTrial(item.nctNumber);
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
