import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { driver, type Driver } from 'driver.js';
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

export function useOnboardingTour() {
  const queryClient = useQueryClient();

  const startTour = useCallback(
    (options?: StartTourOptions) => {
      const store = useAppStore.getState();

      const snapshot = {
        trials: store.trials,
        selectedTrialRef: store.selectedTrialRef,
        selectedSiteKey: store.selectedSiteKey,
        contextTrialRefs: store.contextTrialRefs,
        tourMessages: store.tourMessages,
      };
      const isDark = store.theme === 'dark';

      DEMO_TRIALS.forEach((trial) => {
        if (trial.trialRef) queryClient.setQueryData(['trial', trial.trialRef], trial);
      });
      store.setTourMessages(DEMO_MESSAGES);

      const restore = () => {
        teardownAskAi();
        const current = useAppStore.getState();
        current.setTourMessages(snapshot.tourMessages);
        current.setTrials(snapshot.trials);
        current.selectTrial(snapshot.selectedTrialRef, snapshot.selectedSiteKey);
        current.clearContext();
        snapshot.contextTrialRefs.forEach((nct) => current.addToContext(nct));
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
        overlayColor: isDark ? '#000518' : '#ffffff',
        overlayOpacity: 0,
        stagePadding: 6,
        stageRadius: 10,
        disableActiveInteraction: true,
        nextBtnText: i18n.t('tour.next'),
        prevBtnText: i18n.t('tour.back'),
        doneBtnText: i18n.t('tour.done'),
        steps: buildTourSteps(() => tour),
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
    [queryClient]
  );

  return { startTour };
}
