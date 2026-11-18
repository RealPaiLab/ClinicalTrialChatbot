import { TRIAL_STATUSES, type TrialStatus } from '@/constants/trialStatus';
import type { Trial, TrialSite } from '@/types/trial';

const UNTITLED = 'Trial';

/** Maps a registry's free-text site state onto the statuses the app shows; null for any other. */
export function normalizeStatus(state: string | null | undefined): TrialStatus | null {
  if (!state) return null;
  const value = state.toLowerCase();
  if (value.includes('not yet') || value.includes('opening')) return 'opening_soon';
  if (value.includes('recruit')) return 'recruiting';
  return null;
}

export function deriveTrialStatus(trial: Trial): TrialStatus | null {
  return trialStatuses(trial)[0] ?? null;
}

/** Every distinct site status, in priority order: sites can disagree. */
export function trialStatuses(trial: Trial): TrialStatus[] {
  const statuses = new Set(trial.sites.map((site) => normalizeStatus(site.state)));
  return TRIAL_STATUSES.filter((status) => statuses.has(status));
}

/** Identifies a map pin location; null for a site that was never geocoded. */
export function siteKey(site: TrialSite): string | null {
  if (site.lat === null || site.lon === null) return null;
  return `${site.lat.toFixed(5)},${site.lon.toFixed(5)}`;
}

export function findSiteByKey(trial: Trial, key: string | null): TrialSite | null {
  if (!key) return null;
  return trial.sites.find((site) => siteKey(site) === key) ?? null;
}

export function primarySite(trial: Trial): TrialSite | null {
  return (
    trial.sites.find((site) => normalizeStatus(site.state) === TRIAL_STATUSES[0]) ??
    trial.sites[0] ??
    null
  );
}

export function sitePlace(site: TrialSite | null): string {
  return [site?.city, site?.province].filter(Boolean).join(', ');
}

export function uniqueCancerTypes(trial: Trial): string[] {
  return [...new Set(trial.sites.flatMap((site) => site.cancerTypeNames))];
}

export function publicTrialId(
  trial: Pick<Trial, 'nctNumber' | 'acronymOrProtocolId'> | null | undefined
): string | null {
  return trial?.nctNumber ?? trial?.acronymOrProtocolId ?? null;
}

/** The short label for lists, chips and pins. */
export function trialTitle(trial: Trial | null | undefined): string {
  return trial?.shortTitleEn ?? trial?.officialTitleEn ?? publicTrialId(trial) ?? UNTITLED;
}

/** The full title for detail views. */
export function trialFullTitle(trial: Trial): string {
  return trial.officialTitleEn ?? trial.shortTitleEn ?? publicTrialId(trial) ?? UNTITLED;
}

export function formatPhase(phase: string): string {
  return phase.replace(/phase\s*/i, 'Phase ');
}

export function formatPhases(phases: string[]): string {
  return phases.map(formatPhase).join(' / ');
}
