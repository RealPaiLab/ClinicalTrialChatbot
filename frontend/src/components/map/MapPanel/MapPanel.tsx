import { useRef, useState } from 'react';
import MapGL, { Layer, Source, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Info, MapPin } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import MapLegend from '@/components/map/MapLegend/MapLegend';
import TrialMarker from '@/components/map/TrialMarker/TrialMarker';
import TrialCluster from '@/components/map/TrialCluster/TrialCluster';
import { useClusterDisclosure } from '@/hooks/useClusterDisclosure';
import { useMapViewSync } from '@/hooks/useMapViewSync';
import { useTrialPins } from '@/hooks/useTrialPins';
import { ONTARIO_BOUNDARY, ONTARIO_CENTER } from '@/assets/ontario.geojson';
import { config } from '@/config';
import type { Trial } from '@/types/trial';

const MAPBOX_TOKEN = config.mapboxToken;
const LIGHT_STYLE = config.mapboxStyleLight;
const DARK_STYLE = config.mapboxStyleDark;
const INITIAL_VIEW = { longitude: ONTARIO_CENTER[0], latitude: ONTARIO_CENTER[1], zoom: 3.9 };
const EMPTY_HINT = 'Trials will appear here as you chat.';
const ONTARIO_ONLY_NOTICE = 'Coverage is currently limited to Ontario.';

interface MapPanelProps {
  trials: Trial[];
  selectedNctNumber?: string | null;
  onSelectTrial?: (nctNumber: string) => void;
  dark?: boolean;
}

function MapPanel({ trials, selectedNctNumber, onSelectTrial, dark }: MapPanelProps) {
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const { markers, units } = useTrialPins(trials);
  const { openKey, toggle, close } = useClusterDisclosure(units, selectedNctNumber);
  useMapViewSync({
    mapRef,
    containerRef,
    loaded,
    markers,
    units,
    selectedNctNumber,
    initialView: INITIAL_VIEW,
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-muted/40 text-muted-foreground flex h-full flex-col items-center justify-center gap-1.5 p-6 text-center">
        <MapPin className="size-6" />
        <p className="text-sm">Map needs a Mapbox token</p>
        <p className="text-xs">
          Set <span className="font-mono">VITE_MAPBOX_TOKEN</span> in your .env
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={dark ? DARK_STYLE : LIGHT_STYLE}
        initialViewState={INITIAL_VIEW}
        projection="mercator"
        reuseMaps
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setLoaded(true)}
      >
        <Source id="ontario" type="geojson" data={ONTARIO_BOUNDARY}>
          <Layer
            id="ontario-fill"
            type="fill"
            paint={{
              'fill-color': dark ? '#7e9ce6' : '#2f3f7b',
              'fill-opacity': dark ? 0.08 : 0.05,
            }}
          />
          <Layer
            id="ontario-line"
            type="line"
            paint={{
              'line-color': dark ? '#7e9ce6' : '#2f3f7b',
              'line-width': 1.5,
              'line-opacity': 0.6,
            }}
          />
        </Source>

        {units.map((unit) => {
          if (unit.items.length === 1) {
            const marker = unit.items[0];
            return (
              <TrialMarker
                key={unit.key}
                longitude={unit.longitude}
                latitude={unit.latitude}
                status={marker.status}
                selected={marker.trial.nctNumber === selectedNctNumber}
                label={`${marker.site.nameEn} — ${marker.trial.shortTitleEn ?? marker.trial.nctNumber ?? 'trial'}`}
                onSelect={() => {
                  if (marker.trial.nctNumber) onSelectTrial?.(marker.trial.nctNumber);
                }}
              />
            );
          }
          return (
            <TrialCluster
              key={unit.key}
              longitude={unit.longitude}
              latitude={unit.latitude}
              locationName={unit.locationName}
              selectedNctNumber={selectedNctNumber}
              open={openKey === unit.key}
              onToggle={() => toggle(unit.key)}
              onClose={close}
              onSelectTrial={(nct) => onSelectTrial?.(nct)}
              items={unit.items.map((item) => ({
                nctNumber: item.trial.nctNumber,
                title:
                  item.trial.shortTitleEn ??
                  item.trial.officialTitleEn ??
                  item.trial.nctNumber ??
                  'Trial',
                status: item.status,
              }))}
            />
          );
        })}
      </MapGL>

      <div className="absolute top-3 left-3 z-10">
        <HoverCard openDelay={100} closeDelay={0}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              aria-label="Coverage area"
              className="bg-canvas/90 text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-md border shadow-sm backdrop-blur transition-colors"
            >
              <Info className="size-3.5" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-64 text-sm leading-relaxed">
            {ONTARIO_ONLY_NOTICE}
          </HoverCardContent>
        </HoverCard>
      </div>

      {markers.length > 0 ? (
        <MapLegend />
      ) : (
        <div className="text-muted-foreground pointer-events-none absolute inset-0 grid place-items-center">
          <p className="bg-card/80 rounded-lg border px-3 py-2 text-sm backdrop-blur">
            {EMPTY_HINT}
          </p>
        </div>
      )}
    </div>
  );
}

export default MapPanel;
