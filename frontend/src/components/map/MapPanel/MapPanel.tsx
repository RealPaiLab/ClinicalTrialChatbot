import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import MapLegend from '@/components/map/MapLegend/MapLegend';
import TrialMarker from '@/components/map/TrialMarker/TrialMarker';
import { normalizeStatus } from '@/lib/trialStatus';
import type { Trial, TrialSite, TrialStatus } from '@/types/trial';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const LIGHT_STYLE = import.meta.env.VITE_MAPBOX_STYLE_LIGHT ?? 'mapbox://styles/mapbox/light-v11';
const DARK_STYLE = import.meta.env.VITE_MAPBOX_STYLE_DARK ?? 'mapbox://styles/mapbox/dark-v11';
const INITIAL_VIEW = { longitude: -96.5, latitude: 56, zoom: 3.4 };
const EMPTY_HINT = 'Trials will appear here as you chat.';

interface MapPanelProps {
  trials: Trial[];
  selectedNctNumber?: string | null;
  onSelectTrial?: (nctNumber: string) => void;
  dark?: boolean;
}

interface SiteMarker {
  trial: Trial;
  site: TrialSite;
  status: TrialStatus;
  longitude: number;
  latitude: number;
}

function MapPanel({ trials, selectedNctNumber, onSelectTrial, dark }: MapPanelProps) {
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const markers = useMemo<SiteMarker[]>(() => {
    const result: SiteMarker[] = [];
    for (const trial of trials) {
      for (const site of trial.sites) {
        const status = normalizeStatus(site.state);
        if (status && site.lat !== null && site.lon !== null) {
          result.push({ trial, site, status, longitude: site.lon, latitude: site.lat });
        }
      }
    }
    return result;
  }, [trials]);

  useEffect(() => {
    if (!loaded) return;
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loaded]);

  useEffect(() => {
    if (!loaded || markers.length === 0) return;
    const lons = markers.map((marker) => marker.longitude);
    const lats = markers.map((marker) => marker.latitude);
    mapRef.current?.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 72, duration: 900, maxZoom: 11 }
    );
  }, [loaded, markers]);

  useEffect(() => {
    if (!loaded || !selectedNctNumber) return;
    const marker = markers.find((item) => item.trial.nctNumber === selectedNctNumber);
    if (marker) {
      mapRef.current?.flyTo({
        center: [marker.longitude, marker.latitude],
        zoom: 11,
        duration: 1200,
        essential: true,
      });
    }
  }, [loaded, selectedNctNumber, markers]);

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
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={dark ? DARK_STYLE : LIGHT_STYLE}
        initialViewState={INITIAL_VIEW}
        projection="mercator"
        reuseMaps
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setLoaded(true)}
      >
        {markers.map((marker, index) => (
          <TrialMarker
            key={`${marker.trial.nctNumber ?? 'trial'}-${index}`}
            longitude={marker.longitude}
            latitude={marker.latitude}
            status={marker.status}
            selected={marker.trial.nctNumber === selectedNctNumber}
            label={`${marker.site.nameEn} — ${marker.trial.shortTitleEn ?? marker.trial.nctNumber ?? 'trial'}`}
            onSelect={() => {
              if (marker.trial.nctNumber) onSelectTrial?.(marker.trial.nctNumber);
            }}
          />
        ))}
      </Map>

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
