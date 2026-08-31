import { useRef, useState } from 'react';
import MapGL, { Layer, NavigationControl, Source, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Info, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import MapLegend from '@/components/map/MapLegend/MapLegend';
import TrialCluster from '@/components/map/TrialCluster/TrialCluster';
import SiteTrialsCard from '@/components/map/SiteTrialsCard/SiteTrialsCard';
import { useClusterDisclosure } from '@/hooks/useClusterDisclosure';
import { useMapViewSync } from '@/hooks/useMapViewSync';
import { useTrialPins } from '@/hooks/useTrialPins';
import { CANADA_BOUNDARY, CANADA_CENTER } from '@/assets/canada.geojson';
import { publicTrialId } from '@/lib/trial';
import { config } from '@/config';
import type { Trial } from '@/types/trial';
import type { ClusterItem, PinUnit } from '@/types/map';

const MAPBOX_TOKEN = config.mapboxToken;
const LIGHT_STYLE = config.mapboxStyleLight;
const DARK_STYLE = config.mapboxStyleDark;
const INITIAL_VIEW = { longitude: CANADA_CENTER[0], latitude: CANADA_CENTER[1], zoom: 2.5 };
const MIN_ZOOM = 2;
const MAX_ZOOM = 16;

interface MapPanelProps {
  trials: Trial[];
  selectedTrialRef?: string | null;
  selectedSiteKey?: string | null;
  onSelectTrial?: (trialRef: string, siteKey?: string | null) => void;
  dark?: boolean;
}

function toClusterItems(unit: PinUnit): ClusterItem[] {
  return unit.items.map((item) => ({
    trialRef: item.trial.trialRef,
    title:
      item.trial.shortTitleEn ?? item.trial.officialTitleEn ?? publicTrialId(item.trial) ?? 'Trial',
    status: item.status,
  }));
}

function MapPanel({
  trials,
  selectedTrialRef,
  selectedSiteKey,
  onSelectTrial,
  dark,
}: MapPanelProps) {
  const { t } = useTranslation();
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const { markers, units } = useTrialPins(trials);
  const { openKey, toggle, close } = useClusterDisclosure(units, selectedTrialRef, selectedSiteKey);
  const openUnit = units.find((unit) => unit.key === openKey) ?? null;
  useMapViewSync({
    mapRef,
    containerRef,
    loaded,
    markers,
    units,
    selectedTrialRef,
    selectedSiteKey,
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
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        projection="mercator"
        reuseMaps
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setLoaded(true)}
        onClick={close}
      >
        <NavigationControl position="top-right" showCompass={false} />

        <Source id="canada" type="geojson" data={CANADA_BOUNDARY}>
          <Layer
            id="canada-fill"
            type="fill"
            paint={{
              'fill-color': dark ? '#7e9ce6' : '#2f3f7b',
              'fill-opacity': ['interpolate', ['linear'], ['zoom'], 4, dark ? 0.08 : 0.05, 6, 0],
            }}
          />
          <Layer
            id="canada-line"
            type="line"
            paint={{
              'line-color': dark ? '#7e9ce6' : '#2f3f7b',
              'line-width': 1.5,
              'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.6, 6, 0],
            }}
          />
        </Source>
        {units.map((unit) => (
          <TrialCluster
            key={unit.key}
            longitude={unit.longitude}
            latitude={unit.latitude}
            locationName={unit.locationName}
            selectedTrialRef={
              selectedSiteKey && selectedSiteKey !== unit.key ? null : selectedTrialRef
            }
            onToggle={() => toggle(unit.key)}
            items={toClusterItems(unit)}
          />
        ))}
      </MapGL>

      <div className="absolute top-3 left-3 z-10">
        <HoverCard openDelay={100} closeDelay={0}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              aria-label={t('map.coverageArea')}
              className="bg-canvas/90 text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-md border shadow-sm backdrop-blur transition-colors"
            >
              <Info className="size-3.5" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-64 text-sm leading-relaxed">
            {t('map.coverageNotice')}
          </HoverCardContent>
        </HoverCard>
      </div>

      {openUnit && (
        <SiteTrialsCard
          locationName={openUnit.locationName}
          items={toClusterItems(openUnit)}
          selectedTrialRef={
            selectedSiteKey && selectedSiteKey !== openUnit.key ? null : selectedTrialRef
          }
          onSelectTrial={(ref) => onSelectTrial?.(ref, openUnit.key)}
          onClose={close}
        />
      )}

      {markers.length > 0 ? (
        <MapLegend />
      ) : (
        <div className="text-muted-foreground pointer-events-none absolute inset-0 grid place-items-center">
          <p className="bg-card/80 rounded-lg border px-3 py-2 text-sm backdrop-blur">
            {t('map.emptyHint')}
          </p>
        </div>
      )}
    </div>
  );
}

export default MapPanel;
