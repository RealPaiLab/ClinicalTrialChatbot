import { useState } from 'react';
import { findSelectedUnit } from '@/lib/mapSelection';
import type { PinUnit } from '@/types/map';

export function useClusterDisclosure(
  units: PinUnit[],
  selectedNctNumber?: string | null,
  selectedSiteKey?: string | null
) {
  const selectionKey = `${selectedNctNumber ?? ''}@${selectedSiteKey ?? ''}`;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [autoOpenedFor, setAutoOpenedFor] = useState(selectionKey);

  if (selectionKey !== autoOpenedFor) {
    setAutoOpenedFor(selectionKey);
    const unit = findSelectedUnit(units, selectedNctNumber, selectedSiteKey);
    setOpenKey(unit && unit.items.length > 1 ? unit.key : null);
  }

  const toggle = (key: string) => setOpenKey((prev) => (prev === key ? null : key));
  const close = () => setOpenKey(null);

  return { openKey, toggle, close };
}
