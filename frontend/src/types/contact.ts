import type { TrialSite } from '@/types/trial';

export interface SiteContact {
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  phoneExtension: string | null;
}

export interface SiteContacts {
  site: TrialSite;
  contacts: SiteContact[];
}

export interface TrialContacts {
  trialRef: string;
  sites: SiteContacts[];
}
