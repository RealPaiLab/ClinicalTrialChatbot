import type { DriveStep, Driver } from 'driver.js';
import { useAppStore } from '@/store/appStore';
import { DEMO_TRIALS } from './demoTrials';

const DEMO_NCT = DEMO_TRIALS[0].nctNumber as string;

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

export function buildTourSteps(getTour: () => Driver): DriveStep[] {
  return [
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
          'Answers cite real trials as pills like the one above: click one to focus it on the map, or hover to preview it. Underlined medical terms show a plain-language definition on hover.',
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
        title: 'Ask about anything',
        description:
          'Highlight any text in an answer and an Ask AI button appears, so you can ask the assistant to explain or expand on it in a follow-up.',
        side: 'right',
        align: 'center',
      },
      onDeselected: () => teardownAskAi(),
    },
    {
      element: '[data-tour="feedback"]',
      popover: {
        title: 'Tell us how it did',
        description:
          'Rate each answer with a thumbs up or down. You can add a comment or suggest trials the assistant missed, which helps us keep improving it.',
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
        window.setTimeout(() => getTour().refresh(), 60);
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
}
