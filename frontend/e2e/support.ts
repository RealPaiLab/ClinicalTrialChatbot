import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { TERMS_VERSION } from '../src/lib/consent';

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8000';

/** A trial as the backend sends it: snake_case, straight into the canned stream. */
export interface WireTrial {
  trial_ref: string;
  nct_number: string | null;
  acronym_or_protocol_id: string | null;
  short_title_en: string | null;
  official_title_en: string | null;
  sites: { lat: number | null; lon: number | null; state: string | null }[];
}

/** Real recruiting trials with geocoded sites, so pins, summaries and contacts use live data. */
export async function realTrials(request: APIRequestContext, count: number): Promise<WireTrial[]> {
  const response = await request.get(`${API_URL}/debug/trials`, {
    params: { statuses: 'recruiting', limit: 25 },
  });
  expect(response.ok(), 'the backend must be running in a non-production environment').toBe(true);
  const trials = ((await response.json()) as WireTrial[]).filter(
    (trial) => trial.short_title_en && trial.sites.some((site) => site.lat !== null)
  );
  expect(trials.length).toBeGreaterThanOrEqual(count);
  return trials.slice(0, count);
}

export function shortTitle(trial: WireTrial): string {
  return trial.short_title_en as string;
}

interface CannedReply {
  message: string;
  trials: WireTrial[];
  followUps?: string[];
  title?: string;
}

/** Answers every chat turn with `reply` instead of calling the LLM; returns the messages sent. */
export async function stubChat(page: Page, reply: CannedReply): Promise<string[]> {
  const sent: string[] = [];
  await page.route('**/chat/stream', async (route) => {
    sent.push((route.request().postDataJSON() as { user_message: string }).user_message);
    const events = [
      {
        type: 'AgentResponse',
        data: { message: reply.message, used_trial_refs: [], follow_up_questions: [] },
      },
      {
        type: 'ChatResult',
        data: {
          message: reply.message,
          trials: reply.trials,
          follow_up_questions: reply.followUps ?? [],
          observation_id: 'e2e-observation',
          conversation_title: reply.title ?? null,
        },
      },
    ];
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''),
    });
  });
  return sent;
}

/** A visitor who already agreed, chose English and saw the tour; set once so reloads keep later changes. */
export async function seedReturningVisitor(page: Page): Promise<void> {
  await page.addInitScript((termsVersion) => {
    if (localStorage.getItem('ctc.termsConsent')) return;
    localStorage.setItem('ctc.termsConsent', termsVersion);
    localStorage.setItem(
      'ctc-app',
      JSON.stringify({
        state: {
          theme: 'light',
          language: 'en',
          hasChosenLanguage: true,
          hasSeenTour: true,
          bookmarkedTrialRefs: [],
        },
        version: 0,
      })
    );
  }, TERMS_VERSION);
}

export function citations(page: Page) {
  return page.getByRole('button', { name: /^Show .+ on the map$/ });
}

export function chatInput(page: Page) {
  return page.getByPlaceholder('Describe your situation or ask about a trial...');
}

export async function sendMessage(page: Page, text: string): Promise<void> {
  await chatInput(page).fill(text);
  await chatInput(page).press('Enter');
}

/** Clicks through every driver.js step until the tour closes. */
export async function finishTour(page: Page): Promise<number> {
  const popover = page.locator('.driver-popover');
  const next = popover.locator('.driver-popover-next-btn');
  const title = popover.locator('.driver-popover-title');
  const steps = { count: 0, done: false };
  // Steps that move the sheet or drawer advance on a timer, and the popover blinks out between steps.
  const reachedNextStep = async (before: string | null) => {
    const deadline = Date.now() + STEP_SETTLE_MS;
    while (Date.now() < deadline) {
      if ((await popover.isVisible()) && (await title.textContent()) !== before) return true;
      await page.waitForTimeout(100);
    }
    return false;
  };

  await expect(popover).toBeVisible();
  while (!steps.done) {
    const before = await title.textContent();
    await next.click();
    steps.count += 1;
    steps.done = !(await reachedNextStep(before));
    expect(steps.count).toBeLessThan(25);
  }
  await expect(popover).toHaveCount(0);
  return steps.count;
}

const STEP_SETTLE_MS = 3000;
