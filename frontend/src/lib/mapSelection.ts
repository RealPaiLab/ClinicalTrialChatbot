import type { PinUnit } from '@/types/map';

export function findSelectedUnit(
  units: PinUnit[],
  selectedNctNumber?: string | null,
  selectedSiteKey?: string | null
): PinUnit | undefined {
  if (!selectedNctNumber) return undefined;
  const containsSelection = (unit: PinUnit) =>
    unit.items.some((marker) => marker.trial.nctNumber === selectedNctNumber);
  const exact = selectedSiteKey
    ? units.find((unit) => unit.key === selectedSiteKey && containsSelection(unit))
    : undefined;
  return exact ?? units.find(containsSelection);
}
