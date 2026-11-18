import { expect, test, type Page } from '@playwright/test';
import {
  chatInput,
  citations,
  realTrials,
  seedReturningVisitor,
  sendMessage,
  shortTitle,
  stubChat,
  type WireTrial,
} from './support';

const cards = (page: Page) => page.locator('[data-tour="mobile-cards"]');
const drawer = (page: Page) => page.locator('[data-tour="mobile-trial"]');
const contextChip = (page: Page) => page.getByRole('button', { name: /^Remove .+ from context$/ });

async function chatTurn(page: Page, trials: WireTrial[]) {
  const sent = await stubChat(page, {
    message: `Two trials may fit: [${trials[0].trial_ref}] and [${trials[1].trial_ref}].`,
    trials,
    title: 'Breast cancer trials in Toronto',
  });
  await page.locator('[data-tour="mobile-search"]').click();
  await expect(chatInput(page)).toBeVisible();
  await sendMessage(page, 'breast cancer trials in Toronto');
  await expect(citations(page).first()).toBeVisible();
  return sent;
}

test.beforeEach(async ({ page }) => {
  await seedReturningVisitor(page);
  await page.goto('/');
});

test('the phone opens on the map, and the search bar opens the chat', async ({ page }) => {
  await expect(page.getByText('Trials will appear here as you chat.')).toBeVisible();
  await expect(page.locator('[data-tour="mobile-search"]')).toHaveText(
    'Tell me about your situation to find trials'
  );

  await page.locator('[data-tour="mobile-search"]').click();
  await expect(chatInput(page)).toBeVisible();
  await expect(page.getByText(/How can I help you today\?/)).toBeVisible();
});

test('a cited trial collapses the chat onto its card, which opens the details drawer', async ({
  page,
  request,
}) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);
  await expect(page.locator('[data-tour="mobile-search"]')).toHaveText(
    'Breast cancer trials in Toronto'
  );

  await citations(page).first().click();
  const selected = cards(page).locator('[data-selected="true"]');
  await expect(selected).toBeVisible();
  await expect(selected).toContainText(shortTitle(trials[0]));

  await selected.click();
  await expect(drawer(page)).toBeVisible();
  await expect(
    drawer(page).getByRole('heading', {
      name: trials[0].official_title_en ?? shortTitle(trials[0]),
    })
  ).toBeVisible();
  await expect(drawer(page).getByText('Status')).toBeVisible();
});

test('asking about a trial from the drawer returns to the chat with it attached', async ({
  page,
  request,
}) => {
  const trials = await realTrials(request, 2);
  const sent = await chatTurn(page, trials);

  await citations(page).first().click();
  await cards(page).locator('[data-selected="true"]').click();
  await drawer(page)
    .getByRole('button', { name: /^Ask .+ about this trial$/ })
    .click();

  await expect(drawer(page)).toBeHidden();
  await expect(contextChip(page)).toHaveCount(1);
  await expect(chatInput(page)).toBeVisible();

  await sendMessage(page, 'what are the side effects?');
  await expect.poll(() => sent.length).toBe(2);
  expect(sent[1]).toContain(trials[0].trial_ref);
});

test('a trial saved from the drawer shows up in the menu and the saved list', async ({
  page,
  request,
}) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);

  await citations(page).first().click();
  await cards(page).locator('[data-selected="true"]').click();
  await drawer(page).getByRole('button', { name: 'Save this trial' }).click();
  await expect(
    drawer(page).getByRole('button', { name: 'Remove from saved trials' })
  ).toBeVisible();
  await drawer(page).getByRole('button', { name: 'Close' }).click();
  await expect(drawer(page)).toBeHidden();

  await page.getByRole('button', { name: 'Menu' }).click();
  const savedRow = page.getByRole('button', { name: /^Saved trials/ });
  await expect(savedRow).toContainText('1');
  await savedRow.click();
  await expect(
    page.getByRole('dialog', { name: /Saved trials/ }).getByText(shortTitle(trials[0]))
  ).toBeVisible();
});

test('the map controls and legend sit level with each other, clear of the search bar', async ({
  page,
  request,
}) => {
  const trials = await realTrials(request, 2);
  await chatTurn(page, trials);
  await citations(page).first().click();

  const searchBar = await page.locator('[data-tour="mobile-search"]').boundingBox();
  const zoom = await page.locator('.mapboxgl-ctrl-group').boundingBox();
  const legend = await page.getByRole('list').filter({ hasText: 'Opening soon' }).boundingBox();
  expect(searchBar && zoom && legend).toBeTruthy();
  if (!searchBar || !zoom || !legend) return;

  expect(zoom.y).toBeGreaterThan(searchBar.y + searchBar.height);
  expect(Math.abs(legend.y + legend.height / 2 - (zoom.y + zoom.height / 2))).toBeLessThan(4);
  await expect(page.getByRole('button', { name: 'Results history' })).toHaveCount(0);
});
