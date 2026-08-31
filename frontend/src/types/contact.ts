import type { TrialSite } from '@/types/trial';

export interface SiteContact {
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  phoneExtension: string | null;
}

export interface SiteContacts {
  /** The same TrialSite shape the map and summary already render. */
  site: TrialSite;
  contacts: SiteContact[];
}

export interface TrialContacts {
  trialRef: string;
  sites: SiteContacts[];
}
