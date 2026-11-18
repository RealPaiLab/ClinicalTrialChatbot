import { useEffect, useRef, type ReactNode } from 'react';
import { usePanelRef } from 'react-resizable-panels';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatPanel from '@/components/chat/ChatPanel/ChatPanel';
import AppFooter from '@/components/layout/AppFooter/AppFooter';
import AppHeader from '@/components/layout/AppHeader/AppHeader';
import MapPanel from '@/components/map/MapPanel/MapPanel';
import TrialSummaryPanel from '@/components/summary/TrialSummaryPanel/TrialSummaryPanel';
import { animationsSettled } from '@/lib/motion';
import { useAppStore } from '@/store/appStore';

// The class turns on the split transition in index.css for this resize only, so dragging a handle stays instant.
const PANEL_SPLIT = {
  summaryIdle: '30%',
  summaryFocused: '70%',
  animatingClass: 'panel-split-animating',
} as const;

interface DesktopLayoutProps {
  onOpenBookmarks: () => void;
  onStartTour: () => void;
  children: ReactNode;
}

function DesktopLayout({ onOpenBookmarks, onStartTour, children }: DesktopLayoutProps) {
  const hasSelection = useAppStore((state) => state.selectedTrialRef !== null);
  const selectTrial = useAppStore((state) => state.selectTrial);
  const summaryPanelRef = usePanelRef();
  const splitGroupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const group = splitGroupRef.current;
    if (!group) return;
    const run = { current: true };
    group.classList.add(PANEL_SPLIT.animatingClass);
    summaryPanelRef.current?.resize(
      hasSelection ? PANEL_SPLIT.summaryFocused : PANEL_SPLIT.summaryIdle
    );

    void animationsSettled(group).then(() => {
      if (run.current) group.classList.remove(PANEL_SPLIT.animatingClass);
    });
    return () => {
      run.current = false;
    };
  }, [hasSelection, summaryPanelRef]);

  return (
    <div
      data-tour="app"
      className="text-foreground flex h-screen w-screen flex-col overflow-hidden"
    >
      <AppHeader onOpenBookmarks={onOpenBookmarks} onStartTour={onStartTour} />

      {children}

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="37%" minSize="22%" maxSize="50%">
          <ChatPanel onCitationClick={selectTrial} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="63%" className="bg-canvas">
          <ResizablePanelGroup orientation="vertical" elementRef={splitGroupRef}>
            <ResizablePanel minSize="20%">
              <div className="h-full p-2 pb-1">
                <div
                  data-tour="map"
                  className="border-border h-full overflow-hidden rounded-lg border shadow-sm"
                >
                  <MapPanel />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            <ResizablePanel
              panelRef={summaryPanelRef}
              defaultSize={hasSelection ? PANEL_SPLIT.summaryFocused : PANEL_SPLIT.summaryIdle}
              minSize="20%"
              maxSize="80%"
            >
              <div className="h-full p-2 pt-1">
                <div
                  data-tour="summary"
                  className="border-border h-full overflow-hidden rounded-lg border shadow-sm"
                >
                  <TrialSummaryPanel onClose={() => selectTrial(null)} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <AppFooter />
    </div>
  );
}

export default DesktopLayout;
