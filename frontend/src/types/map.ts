import type { Trial, TrialSite, TrialStatus } from '@/types/trial';

export interface SiteMarker {
  trial: Trial;
  site: TrialSite;
  status: TrialStatus;
  longitude: number;
  latitude: number;
}

/** One trial row inside a pin's popover card. */
export interface ClusterItem {
  trialRef: string | null;
  title: string;
  status: TrialStatus;
}

export interface PinUnit {
  key: string;
  longitude: number;
  latitude: number;
  locationName: string;
  items: SiteMarker[];
}
