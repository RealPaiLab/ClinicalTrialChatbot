'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ScrollReset() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const isHistoryNav = useRef(false);

  useEffect(() => {
    const markHistoryNav = () => {
      isHistoryNav.current = true;
    };

    window.addEventListener('popstate', markHistoryNav);
    return () => window.removeEventListener('popstate', markHistoryNav);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isHistoryNav.current) {
      isHistoryNav.current = false;
      return;
    }

    if (window.location.hash) return;

    window.scrollTo({ top: 0 });
  }, [pathname]);

  return null;
}
