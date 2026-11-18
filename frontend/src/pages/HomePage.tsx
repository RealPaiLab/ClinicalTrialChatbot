import { useEffect, useState } from 'react';
import BookmarksSheet from '@/components/bookmarks/BookmarksSheet/BookmarksSheet';
import DesktopLayout from '@/components/layout/DesktopLayout/DesktopLayout';
import MobileLayout from '@/components/mobile/MobileLayout/MobileLayout';
import { useOnboardingTour } from '@/components/onboarding/tour/useOnboardingTour';
import { buildMobileTourSteps, buildTourSteps } from '@/components/onboarding/tourSteps';
import { useIsMobile } from '@/hooks/useIsMobile';
import { afterPaint } from '@/lib/motion';
import { useAppStore } from '@/store/appStore';

function HomePage() {
  const isMobile = useIsMobile();
  const hasChosenLanguage = useAppStore((state) => state.hasChosenLanguage);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const { startTour } = useOnboardingTour(isMobile ? buildMobileTourSteps : buildTourSteps);
  // First visit: the tour starts once a language is chosen; a cleanup before the next paint cancels it (StrictMode remounts).
  useEffect(() => {
    if (!hasChosenLanguage || useAppStore.getState().hasSeenTour) return;
    const run = { current: true };
    void afterPaint().then(() => {
      if (run.current) startTour();
    });
    return () => {
      run.current = false;
    };
  }, [hasChosenLanguage, startTour]);

  const Layout = isMobile ? MobileLayout : DesktopLayout;

  return (
    <Layout onOpenBookmarks={() => setBookmarksOpen(true)} onStartTour={() => startTour()}>
      <BookmarksSheet open={bookmarksOpen} onOpenChange={setBookmarksOpen} />
    </Layout>
  );
}

export default HomePage;
