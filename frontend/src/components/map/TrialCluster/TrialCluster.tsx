import { useTranslation } from 'react-i18next';
import { Marker, Popup } from 'react-map-gl/mapbox';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import CountPin from '@/components/map/CountPin/CountPin';
import DualPin, { type StatusCount } from '@/components/map/DualPin/DualPin';
import StatusDot from '@/components/trial/StatusDot/StatusDot';
import { trialTitle } from '@/lib/trial';
import type { PinUnit } from '@/types/map';

interface TrialClusterProps {
  unit: PinUnit;
  selectedTrialRef: string | null;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectTrial: (trialRef: string) => void;
}

function TrialCluster({
  unit,
  selectedTrialRef,
  open,
  onToggle,
  onClose,
  onSelectTrial,
}: TrialClusterProps) {
  const { t } = useTranslation();
  const { longitude, latitude, locationName, items } = unit;
  const selectedStatus =
    items.find((item) => item.trial.trialRef === selectedTrialRef)?.status ?? null;
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
            <CountPin
              count={items.length}
              status={groups[0].status}
              selected={selectedStatus !== null}
            />
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
              <p className="text-eyebrow text-primary">
                {t('map.trialCount', { count: items.length })}
              </p>
              <p className="text-foreground truncate text-sm font-medium">{locationName}</p>
            </div>
            <Command className="bg-transparent">
              <CommandList className="max-h-56">
                <CommandGroup>
                  {items.map(({ trial, status }) => (
                    <CommandItem
                      key={trial.trialRef}
                      value={trial.trialRef}
                      data-checked={trial.trialRef === selectedTrialRef}
                      onSelect={() => {
                        onSelectTrial(trial.trialRef);
                        onClose();
                      }}
                    >
                      <StatusDot status={status} />
                      <span className="line-clamp-2">{trialTitle(trial)}</span>
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
