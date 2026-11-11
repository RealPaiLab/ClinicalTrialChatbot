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

const MAP_TUCK_PX = 16;
const CAROUSEL_GAP_PX = 12;
// The search bar's footprint at the top of a full-height map (its h-14 plus the 0.75rem inset and a gap).
const SEARCH_BAR_CLEARANCE_PX = 76;

interface MobileLayoutProps {
  onOpenBookmarks: () => void;
  onStartTour: () => void;
  children: ReactNode;
}

function MobileLayout({ onOpenBookmarks, onStartTour, children }: MobileLayoutProps) {
  const { t } = useTranslation();
  const hasTrials = useAppStore((state) => state.trials.length > 0);
  const hasSelection = useAppStore((state) => state.selectedTrialRef !== null);
  const selectTrial = useAppStore((state) => state.selectTrial);
  const snap = useAppStore((state) => state.sheetSnap);
  const setSnap = useAppStore((state) => state.setSheetSnap);
  const detailOpen = useAppStore((state) => state.trialDrawerOpen);
  const setDetailOpen = useAppStore((state) => state.setTrialDrawerOpen);
  const heights = sheetHeights(useViewportHeight());

  // A cited trial collapses the chat so its card is one tap from the details.
  const showTrial = (trialRef: string) => {
    selectTrial(trialRef);
    setSnap('peek');
  };

  const returnToChat = () => {
    setDetailOpen(false);
    setSnap('full');
  };

  return (
    <div className="bg-canvas text-foreground relative h-dvh w-screen overflow-hidden">
      {/* Beside a half sheet the map fits between the search bar and the sheet. */}
      <div
        className="absolute inset-x-0"
        style={
          snap === 'half'
            ? { top: MOBILE_LAYOUT.sheetTopGapPx, bottom: heights.half - MAP_TUCK_PX }
            : { top: 0, bottom: 0 }
        }
      >
        <MapPanel compact topInset={snap === 'half' ? 0 : SEARCH_BAR_CLEARANCE_PX} />
      </div>

      <SearchBar
        onOpenChat={() => setSnap('full')}
        onOpenBookmarks={onOpenBookmarks}
        onStartTour={onStartTour}
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
        <TrialCarousel onOpen={() => setDetailOpen(true)} />
      </div>

      <ChatSheet
        snap={snap}
        heights={heights}
        peekLabel={hasTrials ? t('mobile.chatPeek') : t('mobile.searchPrompt')}
        onSnapChange={setSnap}
      >
        <ChatPanel onCitationClick={showTrial} onShowTurn={() => setSnap('peek')} />
      </ChatSheet>

      <Drawer open={detailOpen && hasSelection} onOpenChange={setDetailOpen}>
        <DrawerContent
          data-tour="mobile-trial"
          className="h-[88dvh] data-[vaul-drawer-direction=bottom]:max-h-[88dvh]"
        >
          <DrawerTitle className="sr-only">{t('summary.trialDetails')}</DrawerTitle>
          <div className="min-h-0 flex-1">
            <TrialSummaryPanel
              onClose={() => setDetailOpen(false)}
              onAddedToContext={returnToChat}
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
