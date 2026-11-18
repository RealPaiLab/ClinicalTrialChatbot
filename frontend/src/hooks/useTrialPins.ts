import { useMemo } from 'react';
import { TRIAL_STATUSES } from '@/constants/trialStatus';
import { normalizeStatus, siteKey } from '@/lib/trial';
import type { Trial } from '@/types/trial';
import type { PinUnit, SiteMarker } from '@/types/map';

export function useTrialPins(trials: Trial[]) {
  const markers = useMemo<SiteMarker[]>(
    () =>
      trials.flatMap((trial) =>
        trial.sites.flatMap((site) => {
          const status = normalizeStatus(site.state);
          return status && site.lat !== null && site.lon !== null
            ? [{ trial, site, status, longitude: site.lon, latitude: site.lat }]
            : [];
        })
      ),
    [trials]
  );

  const units = useMemo<PinUnit[]>(() => {
    const byLocation = new Map<string, SiteMarker[]>();
    for (const marker of markers) {
      const key = siteKey(marker.site) as string;
      byLocation.set(key, [...(byLocation.get(key) ?? []), marker]);
    }
    return [...byLocation.entries()].map(([key, items]) => ({
      key,
      longitude: items[0].longitude,
      latitude: items[0].latitude,
      locationName: items[0].site.nameEn,
      items: items.toSorted(
        (a, b) => TRIAL_STATUSES.indexOf(a.status) - TRIAL_STATUSES.indexOf(b.status)
      ),
    }));
  }, [markers]);

  return { markers, units };
}
