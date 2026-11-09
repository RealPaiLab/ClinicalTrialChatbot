import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour.css';
import i18n from '@/i18n';
import { animationsSettled } from '@/lib/motion';
import { trialQuery } from '@/services/trials';
import { useAppStore } from '@/store/appStore';
import { DEMO_MESSAGES, DEMO_TRIALS } from '../demoTrials';
import { teardownAskAi } from '../tourSteps';
import { createTourBlur } from './tourBlur';

type BuildSteps = (getTour: () => Driver) => DriveStep[];

export function useOnboardingTour(buildSteps: BuildSteps) {
  const queryClient = useQueryClient();

  const startTour = useCallback(() => {
    const isDark = useAppStore.getState().theme === 'dark';

    // Demo citations resolve from the cache: their refs do not exist on the server.
    DEMO_TRIALS.forEach((trial) => {
      queryClient.setQueryData(trialQuery(trial.trialRef).queryKey, trial);
    });
    useAppStore.getState().startTour(DEMO_MESSAGES);

    const blur = createTourBlur();

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
      onHighlighted: (element) => blur.update(element?.getBoundingClientRect() ?? null),
      onDestroyed: () => {
        blur.destroy();
        window.removeEventListener('resize', onResize);
        teardownAskAi();
        useAppStore.getState().endTour();
        DEMO_TRIALS.forEach((trial) => {
          queryClient.removeQueries({ queryKey: trialQuery(trial.trialRef).queryKey });
        });
      },
    });

    const onResize = () => tour.refresh();
    window.addEventListener('resize', onResize);

    // Starts once the page is still, e.g. after the language gate has animated away.
    void animationsSettled().then(() => tour.drive());
  }, [queryClient, buildSteps]);

  return { startTour };
}
