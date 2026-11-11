import { useRef, useState } from 'react';
import MapGL, { Layer, NavigationControl, Source, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MapLegend from '@/components/map/MapLegend/MapLegend';
import ResultHistory from '@/components/map/ResultHistory/ResultHistory';
import TrialCluster from '@/components/map/TrialCluster/TrialCluster';
import { CANADA_BOUNDARY } from '@/assets/canada.geojson';
import { config } from '@/config';
import { useClusterDisclosure } from '@/hooks/useClusterDisclosure';
import { INITIAL_VIEW, useMapViewSync } from '@/hooks/useMapViewSync';
import { useTrialPins } from '@/hooks/useTrialPins';
import { useMapTrials } from '@/hooks/useWorkspace';
import { useAppStore } from '@/store/appStore';

const MIN_ZOOM = 2;
const MAX_ZOOM = 16;
// Mirrors the `--highlight` token (OICR logo green).
const CANADA_GREEN = '#64bc46';

// Mapbox's own margin around corner controls; the compact legend lines up with it.
const CONTROL_MARGIN_PX = 10;

interface MapPanelProps {
  /** Phone layout: no results history, shared sites open only on tap, and the legend sits beside the zoom buttons. */
  compact?: boolean;
  /** Pushes the top corner controls down, clear of anything layered over the map. */
  topInset?: number;
}

function MapPanel({ compact = false, topInset = 0 }: MapPanelProps) {
  const { t } = useTranslation();
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const trials = useMapTrials();
  const selectedTrialRef = useAppStore((state) => state.selectedTrialRef);
  const selectedSiteKey = useAppStore((state) => state.selectedSiteKey);
  const selectTrial = useAppStore((state) => state.selectTrial);
  const dark = useAppStore((state) => state.theme === 'dark');

  const { markers, units } = useTrialPins(trials);
  const { openKey, toggle, close } = useClusterDisclosure(
    units,
    selectedTrialRef,
    selectedSiteKey,
    !compact
  );
  const controlTop = topInset + CONTROL_MARGIN_PX;
  useMapViewSync({
    mapRef,
    containerRef,
    loaded,
    markers,
    units,
    selectedTrialRef,
    selectedSiteKey,
  });

  if (!config.mapboxToken) {
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
        mapboxAccessToken={config.mapboxToken}
        mapStyle={dark ? config.mapboxStyleDark : config.mapboxStyleLight}
        initialViewState={INITIAL_VIEW}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        projection="mercator"
        reuseMaps
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setLoaded(true)}
      >
        <NavigationControl
          position="top-right"
          showCompass={false}
          style={{ marginTop: controlTop }}
        />

        <Source id="canada" type="geojson" data={CANADA_BOUNDARY}>
          <Layer
            id="canada-fill"
            type="fill"
            paint={{
              'fill-color': CANADA_GREEN,
              'fill-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.12, 6, 0],
            }}
          />
          <Layer
            id="canada-line"
            type="line"
            paint={{
              'line-color': CANADA_GREEN,
              'line-width': 1.5,
              'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.6, 6, 0],
            }}
          />
        </Source>

        {/* Every pin opens the popup, single-trial sites too, so the site is named before a pick. */}
        {units.map((unit) => (
          <TrialCluster
            key={unit.key}
            unit={unit}
            selectedTrialRef={
              selectedSiteKey && selectedSiteKey !== unit.key ? null : selectedTrialRef
            }
            open={openKey === unit.key}
            onToggle={() => toggle(unit.key)}
            onClose={close}
            onSelectTrial={(trialRef) => selectTrial(trialRef, unit.key)}
          />
        ))}
      </MapGL>

      {!compact && (
        <div className="absolute top-3 left-3 z-10">
          <ResultHistory />
        </div>
      )}

      {markers.length > 0 ? (
        compact ? (
          // Mirrors the zoom buttons on the left: same inset, same 70px height.
          <MapLegend
            className="flex h-[70px] items-center py-0"
            style={{ top: controlTop, left: CONTROL_MARGIN_PX }}
          />
        ) : (
          <MapLegend className="bottom-4 left-4" />
        )
      ) : (
        <div className="text-muted-foreground pointer-events-none absolute inset-0 grid place-items-center p-6">
          <p className="bg-card/80 max-w-xs rounded-lg border px-3 py-2 text-center text-sm text-balance backdrop-blur">
            {t('map.emptyHint')}
          </p>
        </div>
      )}
    </div>
  );
}

export default MapPanel;
