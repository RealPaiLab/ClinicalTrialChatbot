import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour.css';
import { useAppStore } from '@/store/appStore';
import { DEMO_MESSAGES, DEMO_TRIALS } from '../demoTrials';
import { buildTourSteps, teardownAskAi } from '../tourSteps';
import { createTourBlur } from './tourBlur';

export function useOnboardingTour() {
  const queryClient = useQueryClient();

  const startTour = useCallback(() => {
    const store = useAppStore.getState();

    const snapshot = {
      trials: store.trials,
      selectedNctNumber: store.selectedNctNumber,
      contextNctNumbers: store.contextNctNumbers,
      tourMessages: store.tourMessages,
    };
    const isDark = store.theme === 'dark';

    DEMO_TRIALS.forEach((trial) => {
      if (trial.nctNumber) queryClient.setQueryData(['trial', trial.nctNumber], trial);
    });
    store.setTourMessages(DEMO_MESSAGES);

    const restore = () => {
      teardownAskAi();
      const current = useAppStore.getState();
      current.setTourMessages(snapshot.tourMessages);
      current.setTrials(snapshot.trials);
      current.selectTrial(snapshot.selectedNctNumber);
      current.clearContext();
      snapshot.contextNctNumbers.forEach((nct) => current.addToContext(nct));
      DEMO_TRIALS.forEach((trial) => {
        if (trial.nctNumber) queryClient.removeQueries({ queryKey: ['trial', trial.nctNumber] });
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
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
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

    tour.drive();
  }, [queryClient]);

  return { startTour };
}
