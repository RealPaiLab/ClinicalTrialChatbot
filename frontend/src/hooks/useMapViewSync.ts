import { useEffect, useRef, type RefObject } from 'react';
import type { MapRef } from 'react-map-gl/mapbox';
import { findSelectedUnit } from '@/lib/mapSelection';
import type { PinUnit, SiteMarker } from '@/types/map';

const SELECTED_ZOOM = 11;
const RESIZE_SETTLE_MS = 120;
const RECENTER_MS = 260;

interface MapView {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface MapViewSyncOptions {
  mapRef: RefObject<MapRef | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  loaded: boolean;
  markers: SiteMarker[];
  units: PinUnit[];
  selectedNctNumber?: string | null;
  selectedSiteKey?: string | null;
  initialView: MapView;
}

export function useMapViewSync({
  mapRef,
  containerRef,
  loaded,
  markers,
  units,
  selectedNctNumber,
  selectedSiteKey,
  initialView,
}: MapViewSyncOptions) {
  const selectedCenterRef = useRef<[number, number] | null>(null);
  const settleTimerRef = useRef(0);

  useEffect(() => {
    if (!loaded) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        const center = selectedCenterRef.current;
        if (!center) return;
        mapRef.current?.easeTo({
          center,
          zoom: SELECTED_ZOOM,
          duration: RECENTER_MS,
          essential: true,
        });
      }, RESIZE_SETTLE_MS);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      window.clearTimeout(settleTimerRef.current);
    };
  }, [loaded, mapRef, containerRef]);

  useEffect(() => {
    if (!loaded || markers.length > 0) return;
    mapRef.current?.flyTo({
      center: [initialView.longitude, initialView.latitude],
      zoom: initialView.zoom,
      duration: 900,
      essential: true,
    });
  }, [loaded, markers, initialView, mapRef]);

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
    if (!loaded) return;
    const unit = selectedNctNumber
      ? findSelectedUnit(units, selectedNctNumber, selectedSiteKey)
      : null;
    if (!unit) {
      selectedCenterRef.current = null;
      return;
    }

    selectedCenterRef.current = [unit.longitude, unit.latitude];
    mapRef.current?.flyTo({
      center: selectedCenterRef.current,
      zoom: SELECTED_ZOOM,
      duration: 1200,
      essential: true,
    });
  }, [loaded, selectedNctNumber, selectedSiteKey, units, mapRef]);
}
