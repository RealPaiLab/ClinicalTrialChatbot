import { expect, test, type Page } from '@playwright/test';
import {
  citations,
  realTrials,
  seedReturningVisitor,
  sendMessage,
  shortTitle,
  stubChat,
  type WireTrial,
} from './support';

const summary = (page: Page) => page.locator('[data-tour="summary"]');
const mapPins = (page: Page) => page.getByRole('button', { name: /^\d+ trials? — / });
const contextChip = (page: Page) => page.getByRole('button', { name: /^Remove .+ from context$/ });

async function chatTurn(page: Page, trials: WireTrial[]) {
  const sent = await stubChat(page, {
    message: `Two trials may fit: [${trials[0].trial_ref}] and [${trials[1].trial_ref}].`,
    trials,
    followUps: ['What are the eligibility requirements?'],
  });
  await sendMessage(page, 'breast cancer trials in Toronto');
  await expect(citations(page).first()).toBeVisible();
  return sent;
}

test.beforeEach(async ({ page }) => {
  await seedReturningVisitor(page);
  await page.goto('/');
});

test('a chat turn cites trials, pins them on the map and opens one in the summary', async ({
  page,
  request,
}) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);

  await expect(citations(page)).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Contact research team' }).first()).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'What are the eligibility requirements?' })
  ).toBeVisible();
  await expect(mapPins(page).first()).toBeVisible();
  await expect(page.getByText('Trials will appear here as you chat.')).toHaveCount(0);

  await citations(page).first().click();
  await expect(summary(page).getByRole('heading', { level: 2 })).toBeVisible();
  await expect(summary(page).getByText('Status')).toBeVisible();
  await expect(summary(page).getByText('No trial selected')).toHaveCount(0);

  await summary(page).getByRole('button', { name: 'Close' }).click();
  await expect(summary(page).getByText('No trial selected')).toBeVisible();
});

test('a map pin lists its trials and opens the chosen one', async ({ page, request }) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);

  await mapPins(page).first().click();
  const popup = page.locator('.trial-cluster-popup');
  await expect(popup).toBeVisible();
  await popup.getByRole('option').first().click();

  await expect(summary(page).getByText('No trial selected')).toHaveCount(0);
  await expect(summary(page).getByRole('heading', { level: 2 })).toBeVisible();
});

test('a trial added to the chat rides along with every message until removed', async ({
  page,
  request,
}) => {
  const trials = await realTrials(request, 2);
  const sent = await chatTurn(page, trials);

  await citations(page).first().click();
  await summary(page)
    .getByRole('button', { name: /^Ask .+ about this trial$/ })
    .click();
  await expect(summary(page).getByRole('button', { name: 'Added to your chat' })).toBeDisabled();
  await expect(contextChip(page)).toHaveCount(1);

  await sendMessage(page, 'what are the side effects?');
  await expect.poll(() => sent.length).toBe(2);
  expect(sent[1]).toContain(trials[0].trial_ref);

  const userMessage = page.locator('.is-user').filter({ hasText: 'what are the side effects?' });
  await expect(userMessage.getByRole('button', { name: /^Show .+ on the map$/ })).toBeVisible();

  await contextChip(page).click();
  await expect(contextChip(page)).toHaveCount(0);
  await sendMessage(page, 'anything else?');
  await expect.poll(() => sent.length).toBe(3);
  expect(sent[2]).not.toContain(trials[0].trial_ref);
});

test('a saved trial survives a new conversation and reopens onto the map and chat', async ({
  page,
  request,
}) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);

  await citations(page).first().click();
  await summary(page).getByRole('button', { name: 'Save this trial' }).click();
  await expect(
    summary(page).getByRole('button', { name: 'Remove from saved trials' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'New conversation' }).click();
  await expect(page.getByText('Trials will appear here as you chat.')).toBeVisible();
  await expect(summary(page).getByText('No trial selected')).toBeVisible();

  await page.getByRole('button', { name: 'Saved trials (1)' }).click();
  const sheet = page.getByRole('dialog', { name: /Saved trials/ });
  await sheet.getByText(shortTitle(trials[0])).click();

  await expect(sheet).toBeHidden();
  await expect(summary(page).getByText('No trial selected')).toHaveCount(0);
  await expect(mapPins(page).first()).toBeVisible();
  await expect(contextChip(page)).toHaveCount(1);
});

test('a saved trial exports as a PDF', async ({ page, request }) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);
  await citations(page).first().click();
  await summary(page).getByRole('button', { name: 'Save this trial' }).click();

  await page.getByRole('button', { name: 'Saved trials (1)' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export all as PDF' }).click();

  expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
});

test('the contact dialog opens from the summary with live site data', async ({ page, request }) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);
  await citations(page).first().click();

  await summary(page).getByRole('button', { name: 'Contact research team' }).click();
  const dialog = page.getByRole('dialog', { name: 'Contact the research team' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Talk to your own care team first')).toBeVisible();
  await expect(
    dialog.getByText('Contact details could not be loaded. Please try again.')
  ).toHaveCount(0);
});
