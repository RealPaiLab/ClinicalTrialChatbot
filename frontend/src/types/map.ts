import type { Trial, TrialSite, TrialStatus } from '@/types/trial';

export interface SiteMarker {
  trial: Trial;
  site: TrialSite;
  status: TrialStatus;
  longitude: number;
  latitude: number;
}

export interface PinUnit {
  key: string;
  longitude: number;
  latitude: number;
  locationName: string;
  items: SiteMarker[];
}
