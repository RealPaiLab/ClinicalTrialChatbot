import { expect, test } from '@playwright/test';
import { citations, seedReturningVisitor, sendMessage } from './support';

// Calls the real agent (paid LLM tokens, slow, nondeterministic): run with E2E_LIVE=1.
test.skip(!process.env.E2E_LIVE, 'set E2E_LIVE=1 to exercise the real agent');

test('the real agent answers a search with cited trials', async ({ page }) => {
  test.setTimeout(180_000);
  await seedReturningVisitor(page);
  await page.goto('/');
  if ((page.viewportSize()?.width ?? 0) < 768)
    await page.locator('[data-tour="mobile-search"]').click();

  await sendMessage(
    page,
    'I am 54 with stage 3 breast cancer in Toronto. Are there recruiting trials for me?'
  );

  await expect(citations(page).first()).toBeVisible({ timeout: 150_000 });
});
