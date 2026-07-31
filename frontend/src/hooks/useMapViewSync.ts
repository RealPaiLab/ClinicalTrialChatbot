import { useEffect, useRef, type RefObject } from 'react';
import type { MapRef } from 'react-map-gl/mapbox';
import { findSelectedUnit } from '@/lib/mapSelection';
import type { PinUnit, SiteMarker } from '@/types/map';

const SELECTED_ZOOM = 11;
const SELECTED_FLY_MS = 1800;
const SELECTED_FLY_CURVE = 1.2;
const RESIZE_SETTLE_MS = 150;
const RECENTER_MS = 420;
const CENTER_EPSILON = 1e-4;
const ZOOM_EPSILON = 0.01;

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
  const emptyRef = useRef(markers.length === 0);
  const initialViewRef = useRef(initialView);

  useEffect(() => {
    emptyRef.current = markers.length === 0;
    initialViewRef.current = initialView;
  }, [markers, initialView]);

  useEffect(() => {
    if (!loaded) return;
    const container = containerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const state = { frame: 0, settleTimer: 0, waiting: false };
    const pump = () => {
      state.frame = window.requestAnimationFrame(pump);
      map.resize();
      map.triggerRepaint();
    };
    const align = () => {
      state.waiting = false;
      const center = selectedCenterRef.current;
      if (!center) return;
      const { lng, lat } = map.getCenter();
      const onTarget =
        Math.abs(lng - center[0]) < CENTER_EPSILON &&
        Math.abs(lat - center[1]) < CENTER_EPSILON &&
        Math.abs(map.getZoom() - SELECTED_ZOOM) < ZOOM_EPSILON;
      if (onTarget) return;
      map.easeTo({ center, zoom: SELECTED_ZOOM, duration: RECENTER_MS, essential: true });
    };

    const settle = () => {
      window.cancelAnimationFrame(state.frame);
      state.frame = 0;
      map.resize();
      map.triggerRepaint();
      if (!selectedCenterRef.current) {
        if (emptyRef.current) {
          const { longitude, latitude, zoom } = initialViewRef.current;
          map.easeTo({
            center: [longitude, latitude],
            zoom,
            duration: RECENTER_MS,
            essential: true,
          });
        }
        return;
      }
      if (!map.isMoving()) {
        align();
        return;
      }
      if (state.waiting) return;
      state.waiting = true;
      map.once('moveend', align);
    };

    const observer = new ResizeObserver(() => {
      if (!state.frame) state.frame = window.requestAnimationFrame(pump);
      window.clearTimeout(state.settleTimer);
      state.settleTimer = window.setTimeout(settle, RESIZE_SETTLE_MS);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      window.clearTimeout(state.settleTimer);
      window.cancelAnimationFrame(state.frame);
      map.off('moveend', align);
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
      duration: SELECTED_FLY_MS,
      curve: SELECTED_FLY_CURVE,
      essential: true,
    });
  }, [loaded, selectedNctNumber, selectedSiteKey, units, mapRef]);
}
