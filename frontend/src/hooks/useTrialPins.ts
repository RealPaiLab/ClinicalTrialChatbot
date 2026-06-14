import { useMemo } from 'react';
import { normalizeStatus } from '@/lib/trialStatus';
import type { Trial, TrialStatus } from '@/types/trial';
import type { PinUnit, SiteMarker } from '@/types/map';

const STATUS_ORDER: Record<TrialStatus, number> = { recruiting: 0, opening_soon: 1 };

export function useTrialPins(trials: Trial[]) {
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

  const units = useMemo<PinUnit[]>(() => {
    const byLocation = new Map<string, SiteMarker[]>();
    for (const marker of markers) {
      const key = `${marker.latitude.toFixed(5)},${marker.longitude.toFixed(5)}`;
      const bucket = byLocation.get(key);
      if (bucket) bucket.push(marker);
      else byLocation.set(key, [marker]);
    }
    return [...byLocation.entries()].map(([key, items]) => ({
      key,
      longitude: items[0].longitude,
      latitude: items[0].latitude,
      locationName: items[0].site.nameEn,
      items: [...items].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    }));
  }, [markers]);

  return { markers, units };
}
