import { useEffect, type RefObject } from 'react';
import type { MapRef } from 'react-map-gl/mapbox';
import type { PinUnit, SiteMarker } from '@/types/map';

interface MapViewSyncOptions {
  mapRef: RefObject<MapRef | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  loaded: boolean;
  markers: SiteMarker[];
  units: PinUnit[];
  selectedNctNumber?: string | null;
}

export function useMapViewSync({
  mapRef,
  containerRef,
  loaded,
  markers,
  units,
  selectedNctNumber,
}: MapViewSyncOptions) {
  useEffect(() => {
    if (!loaded) return;
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loaded, mapRef, containerRef]);

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
  }, [loaded, markers, mapRef]);

  useEffect(() => {
    if (!loaded || !selectedNctNumber) return;
    const unit = units.find((item) =>
      item.items.some((marker) => marker.trial.nctNumber === selectedNctNumber)
    );
    if (unit) {
      mapRef.current?.flyTo({
        center: [unit.longitude, unit.latitude],
        zoom: 11,
        duration: 1200,
        essential: true,
      });
    }
  }, [loaded, selectedNctNumber, units, mapRef]);
}
