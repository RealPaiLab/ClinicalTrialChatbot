import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour.css';
import { useAppStore } from '@/store/appStore';
import { createTourBlur } from './tourBlur';
import { DEMO_MESSAGES, DEMO_TRIALS } from './demoTrials';

const DEMO_NCT = DEMO_TRIALS[0].nctNumber as string;

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

    const steps: DriveStep[] = [
      {
        popover: {
          title: 'Welcome to Trial Navigator',
          description:
            'This quick tour shows you how to find clinical trials by chatting, exploring the map, and asking about the ones that interest you. It only takes a moment.',
        },
      },
      {
        element: '[data-tour="app"]',
        popover: {
          title: 'Your workspace',
          description:
            'Three panels work together: the chat on the left, the map top-right, and trial details bottom-right. As you chat, the map and details stay in sync. Let us walk through each.',
        },
      },
      {
        element: '[data-tour="chat-input"]',
        popover: {
          title: 'Start with a message',
          description:
            'Describe your situation in plain language, for example your cancer type, stage, and city. The assistant asks follow-up questions and finds matching trials.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="chat-messages"]',
        popover: {
          title: 'Reading the answer',
          description:
            'Answers cite real trials as pills like the one above: click one to focus it on the map, or hover to preview it. Underlined medical terms show a plain-language definition on hover, and you can highlight any text to ask the assistant about it.',
          side: 'right',
          align: 'center',
        },
      },
      {
        element: '[data-tour="feedback"]',
        popover: {
          title: 'Tell us how it did',
          description:
            'Rate each answer with a thumbs up or down. You can add a comment or suggest trials the assistant missed, which helps us keep improving it.',
          side: 'right',
          align: 'center',
        },
      },
      {
        element: '[data-tour="map"]',
        popover: {
          title: 'See trials on the map',
          description:
            'Matching trial sites appear as pins as the conversation narrows things down. Coverage is currently limited to Ontario.',
          side: 'left',
          align: 'center',
        },
        onHighlightStarted: () => {
          // Reveal sample pins only once the tour reaches the map.
          useAppStore.getState().setTrials(DEMO_TRIALS);
        },
      },
      {
        element: '[data-tour="summary"]',
        popover: {
          title: 'Trial details',
          description:
            'Click any pin to see that trial here: its phase, eligibility, locations, and a link to the official page.',
          side: 'top',
          align: 'center',
        },
        onHighlightStarted: () => {
          // Populate the summary panel only when we point at it.
          useAppStore.getState().selectTrial(DEMO_NCT);
        },
      },
      {
        element: '[data-tour="add-context"]',
        popover: {
          title: 'Ask about a trial',
          description:
            'Curious about a specific trial? Add it to your chat with this button, then ask the assistant anything about it.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="trial-link"]',
        popover: {
          title: 'Open the official page',
          description:
            'This opens the trial on the Cancer Trials Canada website, where you can read the full listing and find out how to get in touch.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="chat-input"]',
        popover: {
          title: 'Your added trials',
          description:
            'Trials you add show up here as chips before you send a message. Remove any of them with the × when you no longer need it.',
          side: 'top',
          align: 'center',
        },
        onHighlightStarted: () => {
          useAppStore.getState().addToContext(DEMO_NCT);
          // The chip grows the input; recalc the highlight once React re-renders.
          window.setTimeout(() => tour.refresh(), 60);
        },
      },
      {
        popover: {
          title: "You're all set",
          description:
            'That is the whole tour. Start by describing your situation in the chat, and the map and trial details will follow along. You can reopen this tour anytime from the help button up top.',
        },
      },
    ];

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
      steps,
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
