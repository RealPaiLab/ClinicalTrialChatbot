import { expect, test, type Page } from '@playwright/test';
import frCa from '../src/i18n/locales/fr-CA';
import { chatInput, finishTour, seedReturningVisitor } from './support';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

async function openMenu(page: Page) {
  await page.getByRole('button', { name: 'Menu' }).click();
}

test('a first visit goes through consent, language and the full tour, then never again', async ({
  page,
}) => {
  await page.goto('/');

  const agree = page.getByRole('button', { name: 'Continue' });
  await expect(agree).toBeDisabled();
  await page.getByRole('checkbox').click();
  await agree.click();

  await expect(page.getByRole('heading', { name: 'Choose your language' })).toBeVisible();
  await page.getByRole('button', { name: 'Use English' }).click();

  const steps = await finishTour(page);
  expect(steps).toBeGreaterThan(8);

  // The tour hands back the empty workspace it found.
  await expect(page.getByText('Trials will appear here as you chat.')).toBeVisible();
  await expect(page.getByText(/How can I help you today\?/)).toBeAttached();
  await expect(page.locator('.driver-popover')).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Choose your language' })).toHaveCount(0);
  await expect(page.locator('.driver-popover')).toHaveCount(0);
});

test.describe('returning visitor', () => {
  test.beforeEach(async ({ page }) => {
    await seedReturningVisitor(page);
    await page.goto('/');
  });

  test('the theme toggle switches to dark and survives a reload', async ({ page }) => {
    if (isMobile(page)) {
      await openMenu(page);
      await page.getByRole('button', { name: 'Switch to Dark theme' }).click();
      await page.keyboard.press('Escape');
    } else {
      await page.getByRole('button', { name: 'Switch to Dark theme' }).click();
    }
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('choosing a language translates the UI and English switches it back', async ({ page }) => {
    const openLanguages = async (label: string) => {
      if (isMobile(page)) {
        await openMenu(page);
        await page.getByRole('button', { name: new RegExp(`^${label}`) }).click();
      } else {
        await page.getByRole('button', { name: label, exact: true }).click();
      }
    };

    await openLanguages('Language');
    await page.getByRole('button', { name: /Français/ }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');
    await expect(chatInput(page)).toHaveCount(0);
    await expect(page.getByPlaceholder(frCa.chat.placeholder)).toBeAttached();

    await page.keyboard.press('Escape');
    await openLanguages(frCa.header.language);
    await page.getByRole('button', { name: frCa.header.useEnglish }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(chatInput(page)).toBeAttached();
  });

  test('the terms page and an unknown route render', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms of Use', exact: true })).toBeVisible();

    await page.goto('/no-such-page');
    await expect(page.getByText('404')).toBeVisible();
  });
});
