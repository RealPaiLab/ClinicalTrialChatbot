import type { PinUnit } from '@/types/map';

export function findSelectedUnit(
  units: PinUnit[],
  selectedTrialRef?: string | null,
  selectedSiteKey?: string | null
): PinUnit | undefined {
  if (!selectedTrialRef) return undefined;
  const containsSelection = (unit: PinUnit) =>
    unit.items.some((marker) => marker.trial.trialRef === selectedTrialRef);
  const exact = selectedSiteKey
    ? units.find((unit) => unit.key === selectedSiteKey && containsSelection(unit))
    : undefined;
  return exact ?? units.find(containsSelection);
}
