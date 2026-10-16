import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour.css';
import i18n from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { DEMO_MESSAGES, DEMO_TRIALS } from '../demoTrials';
import { buildTourSteps, teardownAskAi } from '../tourSteps';
import { createTourBlur } from './tourBlur';

export interface StartTourOptions {
  driveDelayMs?: number;
}

type BuildSteps = (getTour: () => Driver) => DriveStep[];

export function useOnboardingTour(buildSteps: BuildSteps = buildTourSteps) {
  const queryClient = useQueryClient();

  const startTour = useCallback(
    (options?: StartTourOptions) => {
      const store = useAppStore.getState();

      const snapshot = {
        trials: store.trials,
        selectedTrialRef: store.selectedTrialRef,
        selectedSiteKey: store.selectedSiteKey,
        contextTrialRefs: store.contextTrialRefs,
        pinnedTrialRefs: store.pinnedTrialRefs,
        tourMessages: store.tourMessages,
        sheetSnap: store.sheetSnap,
      };
      const isDark = store.theme === 'dark';

      DEMO_TRIALS.forEach((trial) => {
        if (trial.trialRef) queryClient.setQueryData(['trial', trial.trialRef], trial);
      });
      store.setTourMessages(DEMO_MESSAGES);
      // Kept trials would otherwise ride along onto the demo map.
      store.clearContext();

      const restore = () => {
        teardownAskAi();
        const current = useAppStore.getState();
        current.setTourMessages(snapshot.tourMessages);
        // Written directly: setTrials would keep the demo's added trial on the user's map.
        useAppStore.setState({
          trials: snapshot.trials,
          pinnedTrialRefs: snapshot.pinnedTrialRefs,
          contextTrialRefs: snapshot.contextTrialRefs,
        });
        current.selectTrial(snapshot.selectedTrialRef, snapshot.selectedSiteKey);
        current.setSheetSnap(snapshot.sheetSnap);
        current.setTrialDrawerOpen(false);
        DEMO_TRIALS.forEach((trial) => {
          if (trial.trialRef) queryClient.removeQueries({ queryKey: ['trial', trial.trialRef] });
        });
      };

      const blur = createTourBlur();
      const syncBlur = (element: Element | undefined) => {
        blur.update(element?.getBoundingClientRect() ?? null);
      };

      const tour: Driver = driver({
        showProgress: true,
        popoverClass: 'ctc-tour',
        overlayColor: isDark ? '#0b0b0b' : '#ffffff',
        overlayOpacity: 0,
        stagePadding: 6,
        stageRadius: 10,
        disableActiveInteraction: true,
        nextBtnText: i18n.t('tour.next'),
        prevBtnText: i18n.t('tour.back'),
        doneBtnText: i18n.t('tour.done'),
        steps: buildSteps(() => tour),
        onHighlighted: (element) => syncBlur(element),
        onDestroyed: () => {
          blur.destroy();
          window.removeEventListener('resize', onResize);
          restore();
          useAppStore.getState().markTourSeen();
        },
      });

      const onResize = () => tour.refresh();
      window.addEventListener('resize', onResize);

      const driveDelay = options?.driveDelayMs ?? 0;
      if (driveDelay > 0) window.setTimeout(() => tour.drive(), driveDelay);
      else tour.drive();
    },
    [queryClient, buildSteps]
  );

  return { startTour };
}
