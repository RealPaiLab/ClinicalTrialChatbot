import type { DriveStep, Driver } from 'driver.js';
import i18n from '@/i18n';
import type en from '@/i18n/locales/en';
import { useAppStore } from '@/store/appStore';
import { DEMO_TRIALS } from './demoTrials';

const DEMO_NCT = DEMO_TRIALS[0].trialRef as string;

const ASK_AI_WORD = 'chemotherapy';

function findTextNode(root: Node, predicate: (node: Text) => boolean): Text | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const step = (): Text | null => {
    const node = walker.nextNode() as Text | null;
    if (!node) return null;
    return predicate(node) ? node : step();
  };
  return step();
}

function showAskAiSelection() {
  const root = document.querySelector('[data-tour="chat-messages"]');
  if (!root) return;
  const node = findTextNode(root, (text) => (text.textContent ?? '').includes(ASK_AI_WORD));
  const start = node?.textContent?.indexOf(ASK_AI_WORD) ?? -1;
  if (!node || start < 0) return;

  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, start + ASK_AI_WORD.length);

  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
}

const ASK_AI_PROXY_ID = 'tour-ask-ai-proxy';

function ensureAskAiProxy(): Element {
  const proxy =
    document.getElementById(ASK_AI_PROXY_ID) ??
    (() => {
      const el = document.createElement('div');
      el.id = ASK_AI_PROXY_ID;
      el.style.position = 'fixed';
      el.style.pointerEvents = 'none';
      el.style.opacity = '0';
      document.body.appendChild(el);
      return el;
    })();

  const button = document.querySelector('[data-tour="ask-ai"]')?.getBoundingClientRect();
  const selection = window.getSelection();
  const text =
    selection && selection.rangeCount > 0 && !selection.isCollapsed
      ? selection.getRangeAt(0).getBoundingClientRect()
      : undefined;
  const rects = [button, text].filter((rect): rect is DOMRect => Boolean(rect));

  if (rects.length > 0) {
    const left = Math.min(...rects.map((rect) => rect.left));
    const top = Math.min(...rects.map((rect) => rect.top));
    const right = Math.max(...rects.map((rect) => rect.right));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    proxy.style.left = `${left}px`;
    proxy.style.top = `${top}px`;
    proxy.style.width = `${right - left}px`;
    proxy.style.height = `${bottom - top}px`;
  }
  return proxy;
}

export function teardownAskAi() {
  window.getSelection()?.removeAllRanges();
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  document.getElementById(ASK_AI_PROXY_ID)?.remove();
}

type StepName = keyof typeof en.tour.steps;

// The tour is built when it starts, so it picks up whatever language is active then.
function step(name: StepName): { title: string; description: string } {
  return {
    title: i18n.t(`tour.steps.${name}.title`),
    description: i18n.t(`tour.steps.${name}.description`),
  };
}

export function buildTourSteps(getTour: () => Driver): DriveStep[] {
  return [
    {
      popover: step('welcome'),
    },
    {
      element: '[data-tour="app"]',
      popover: step('workspace'),
    },
    {
      element: '[data-tour="chat-input"]',
      popover: {
        ...step('message'),
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '[data-tour="chat-messages"]',
      popover: {
        ...step('answer'),
        side: 'right',
        align: 'center',
        onNextClick: () => {
          showAskAiSelection();
          window.setTimeout(() => getTour().moveNext(), 80);
        },
      },
    },
    {
      element: () => ensureAskAiProxy(),
      popover: {
        ...step('askAi'),
        side: 'right',
        align: 'center',
      },
      onDeselected: () => teardownAskAi(),
    },
    {
      element: '[data-tour="feedback"]',
      popover: {
        ...step('feedback'),
        side: 'right',
        align: 'center',
        onPrevClick: () => {
          showAskAiSelection();
          window.setTimeout(() => getTour().movePrevious(), 80);
        },
      },
    },
    {
      element: '[data-tour="map"]',
      popover: {
        ...step('map'),
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
        ...step('details'),
        side: 'top',
        align: 'center',
      },
      onHighlightStarted: () => {
        // Populate the summary panel only when we point at it.
        useAppStore.getState().selectTrial(DEMO_NCT);
      },
    },
    {
      element: '[data-tour="trial-link"]',
      popover: {
        ...step('officialPage'),
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="add-context"]',
      popover: {
        ...step('addToChat'),
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="chat-input"]',
      popover: {
        ...step('addedTrials'),
        side: 'top',
        align: 'center',
      },
      onHighlightStarted: () => {
        useAppStore.getState().addToContext(DEMO_NCT);
        // The chip grows the input; recalc the highlight once React re-renders.
        window.setTimeout(() => getTour().refresh(), 60);
      },
    },
    {
      popover: step('finish'),
    },
  ];
}
