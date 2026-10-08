import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ChatPanel from '@/components/chat/ChatPanel/ChatPanel';
import MapPanel from '@/components/map/MapPanel/MapPanel';
import ChatSheet from '@/components/mobile/ChatSheet/ChatSheet';
import SearchBar from '@/components/mobile/SearchBar/SearchBar';
import TrialCarousel from '@/components/mobile/TrialCarousel/TrialCarousel';
import TrialSummaryPanel from '@/components/summary/TrialSummaryPanel/TrialSummaryPanel';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { MOBILE_LAYOUT, sheetHeights } from '@/constants/layout';
import { useViewportHeight } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import type { Trial } from '@/types/trial';

const MAP_TUCK_PX = 16;
const CAROUSEL_GAP_PX = 12;
// No coverage note on mobile; the legend mirrors the zoom buttons (10px inset, 70px tall) on the left.
const MAP_OVERLAYS =
  '[&_[data-slot=map-info]]:hidden [&_[data-slot=map-legend]]:bottom-auto [&_[data-slot=map-legend]]:left-[10px] [&_[data-slot=map-legend]]:flex [&_[data-slot=map-legend]]:h-[70px] [&_[data-slot=map-legend]]:items-center [&_[data-slot=map-legend]]:py-0';
const MAP_OVERLAYS_BESIDE_SHEET = '[&_[data-slot=map-legend]]:top-[10px]';
// Behind the search bar both groups drop below it; `!` beats Mapbox's unlayered CSS.
const MAP_OVERLAYS_UNDER_SEARCH =
  '[&_.mapboxgl-ctrl-top-right]:top-19! [&_[data-slot=map-legend]]:top-[calc(var(--spacing)*19+10px)]';

interface MobileLayoutProps {
  dark: boolean;
  trials: Trial[];
  selectedTrial: Trial | null;
  selectedSiteKey: string | null;
  selectedSiteName: string | null;
  selectedInContext: boolean;
  selectedIsBookmarked: boolean;
  contextTrials: Trial[];
  bookmarkCount: number;
  onRemoveContext: (trialRef: string) => void;
  onOpenBookmarks: () => void;
  onStartTour: () => void;
  children: ReactNode;
}

function MobileLayout({
  dark,
  trials,
  selectedTrial,
  selectedSiteKey,
  selectedSiteName,
  selectedInContext,
  selectedIsBookmarked,
  contextTrials,
  bookmarkCount,
  onRemoveContext,
  onOpenBookmarks,
  onStartTour,
  children,
}: MobileLayoutProps) {
  const { t } = useTranslation();
  const conversationTitle = useAppStore((state) => state.conversationTitle);
  const { setTrials, selectTrial, reset, addToContext, clearContext, toggleBookmark, toggleTheme } =
    useAppStore.getState();

  const snap = useAppStore((state) => state.sheetSnap);
  const setSnap = useAppStore.getState().setSheetSnap;
  const detailOpen = useAppStore((state) => state.trialDrawerOpen);
  const setDetailOpen = useAppStore.getState().setTrialDrawerOpen;
  const heights = sheetHeights(useViewportHeight());
  const selectedTrialRef = selectedTrial?.trialRef ?? null;

  // A cited trial collapses the chat so its card is one tap from the details.
  const showTrial = (trialRef: string) => {
    selectTrial(trialRef);
    setSnap('peek');
  };

  const askAbout = (trialRef: string) => {
    addToContext(trialRef);
    setDetailOpen(false);
    setSnap('full');
  };

  return (
    <div className="bg-canvas text-foreground relative h-dvh w-screen overflow-hidden">
      {/* Beside a half sheet the map fits between the search bar and the sheet. */}
      <div
        className={cn(
          'absolute inset-x-0',
          MAP_OVERLAYS,
          snap === 'half' ? MAP_OVERLAYS_BESIDE_SHEET : MAP_OVERLAYS_UNDER_SEARCH
        )}
        style={
          snap === 'half'
            ? { top: MOBILE_LAYOUT.sheetTopGapPx, bottom: heights.half - MAP_TUCK_PX }
            : { top: 0, bottom: 0 }
        }
      >
        <MapPanel
          trials={trials}
          selectedTrialRef={selectedTrialRef}
          selectedSiteKey={selectedSiteKey}
          onSelectTrial={selectTrial}
          dark={dark}
          autoOpenClusters={false}
        />
      </div>

      <SearchBar
        title={conversationTitle}
        dark={dark}
        bookmarkCount={bookmarkCount}
        onOpenChat={() => setSnap('full')}
        onOpenBookmarks={onOpenBookmarks}
        onStartTour={onStartTour}
        onToggleTheme={toggleTheme}
      />

      <div
        data-tour="mobile-cards"
        inert={snap !== 'peek'}
        style={{ bottom: heights.peek + CAROUSEL_GAP_PX }}
        className={cn(
          'absolute inset-x-0 z-10 transition-opacity duration-200',
          snap !== 'peek' && 'opacity-0'
        )}
      >
        <TrialCarousel
          trials={trials}
          selectedTrialRef={selectedTrialRef}
          onSelect={selectTrial}
          onOpen={() => setDetailOpen(true)}
        />
      </div>

      <ChatSheet
        snap={snap}
        heights={heights}
        peekLabel={trials.length > 0 ? t('mobile.chatPeek') : t('mobile.searchPrompt')}
        onSnapChange={setSnap}
      >
        <ChatPanel
          onTrialsChange={setTrials}
          onCitationClick={showTrial}
          onReset={reset}
          contextTrials={contextTrials}
          onRemoveContext={onRemoveContext}
          onClearContext={clearContext}
        />
      </ChatSheet>

      <Drawer open={detailOpen && Boolean(selectedTrial)} onOpenChange={setDetailOpen}>
        <DrawerContent
          data-tour="mobile-trial"
          className="h-[88dvh] data-[vaul-drawer-direction=bottom]:max-h-[88dvh]"
        >
          <DrawerTitle className="sr-only">{t('summary.trialDetails')}</DrawerTitle>
          <div className="min-h-0 flex-1">
            <TrialSummaryPanel
              trial={selectedTrial}
              onClose={() => setDetailOpen(false)}
              onAddToContext={askAbout}
              isInContext={selectedInContext}
              onToggleBookmark={toggleBookmark}
              isBookmarked={selectedIsBookmarked}
              selectedSiteName={selectedSiteName}
              actionBar
            />
          </div>
        </DrawerContent>
      </Drawer>

      {children}
    </div>
  );
}

export default MobileLayout;
