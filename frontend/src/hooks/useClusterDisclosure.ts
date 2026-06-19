import { useState } from 'react';
import type { PinUnit } from '@/types/map';

export function useClusterDisclosure(units: PinUnit[], selectedNctNumber?: string | null) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [autoOpenedFor, setAutoOpenedFor] = useState<string | null | undefined>(selectedNctNumber);

  if (selectedNctNumber !== autoOpenedFor) {
    setAutoOpenedFor(selectedNctNumber);
    const unit = units.find((item) =>
      item.items.some((marker) => marker.trial.nctNumber === selectedNctNumber)
    );
    setOpenKey(unit && unit.items.length > 1 ? unit.key : null);
  }

  const toggle = (key: string) => setOpenKey((prev) => (prev === key ? null : key));
  const close = () => setOpenKey(null);

  return { openKey, toggle, close };
}
