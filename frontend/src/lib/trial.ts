import { normalizeStatus } from '@/lib/trialStatus';
import type { Trial, TrialSite, TrialStatus } from '@/types/trial';

const STATUS_PRIORITY: TrialStatus[] = ['recruiting', 'opening_soon'];

export function deriveTrialStatus(trial: Trial): TrialStatus | null {
  return trialStatuses(trial)[0] ?? null;
}

/** Every distinct site status, in priority order: sites can disagree. */
export function trialStatuses(trial: Trial): TrialStatus[] {
  const statuses = trial.sites
    .map((site) => normalizeStatus(site.state))
    .filter((status): status is TrialStatus => status !== null);
  return STATUS_PRIORITY.filter((status) => statuses.includes(status));
}

export function primarySite(trial: Trial): TrialSite | null {
  return (
    trial.sites.find((site) => normalizeStatus(site.state) === 'recruiting') ??
    trial.sites[0] ??
    null
  );
}

export function uniqueCancerTypes(trial: Trial): string[] {
  return [...new Set(trial.sites.flatMap((site) => site.cancerTypeNames))];
}

export function formatPhases(phases: string[]): string {
  return phases.map((phase) => phase.replace(/phase\s*/i, 'Phase ')).join(' / ');
}
