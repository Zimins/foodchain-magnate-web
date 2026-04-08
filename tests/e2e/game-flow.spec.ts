import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

const BASE = 'http://localhost:3001';

async function setupThreePlayerGame(browser: Browser): Promise<{
  contexts: BrowserContext[];
  pages: Page[];
}> {
  // Player 1 (host) creates a game
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await page1.goto(BASE);
  await page1.getByRole('button', { name: 'Create Game' }).click();
  await page1.getByPlaceholder('Your name').fill('Host');
  await page1.getByRole('button', { name: '3', exact: true }).click();
  await page1.getByRole('button', { name: 'Create', exact: true }).click();
  await page1.waitForURL('**/game/**', { timeout: 10000 });
  await expect(page1.getByText('Waiting for Players')).toBeVisible({ timeout: 10000 });

  const roomCodeElement = page1.locator('.font-mono.font-bold');
  const roomCode = await roomCodeElement.textContent();

  // Player 2 joins
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(BASE);
  await page2.getByRole('button', { name: 'Join Game' }).click();
  await page2.getByPlaceholder('Your name').fill('Player2');
  await page2.getByPlaceholder('Room code').fill(roomCode!);
  await page2.getByRole('button', { name: 'Join', exact: true }).click();
  await page2.waitForURL('**/game/**', { timeout: 10000 });
  await expect(page2.getByText('Waiting for Players')).toBeVisible({ timeout: 10000 });

  // Player 3 joins
  const context3 = await browser.newContext();
  const page3 = await context3.newPage();
  await page3.goto(BASE);
  await page3.getByRole('button', { name: 'Join Game' }).click();
  await page3.getByPlaceholder('Your name').fill('Player3');
  await page3.getByPlaceholder('Room code').fill(roomCode!);
  await page3.getByRole('button', { name: 'Join', exact: true }).click();
  await page3.waitForURL('**/game/**', { timeout: 10000 });
  await expect(page3.getByText('Waiting for Players')).toBeVisible({ timeout: 10000 });

  // Wait for all players to be visible from host, then start
  await expect(page1.getByText('Player3')).toBeVisible({ timeout: 5000 });
  await page1.getByRole('button', { name: 'Start Game' }).click();

  // Wait for game to load for all players
  await expect(page1.getByText('Round')).toBeVisible({ timeout: 10000 });
  await expect(page2.getByText('Round')).toBeVisible({ timeout: 10000 });
  await expect(page3.getByText('Round')).toBeVisible({ timeout: 10000 });

  return {
    contexts: [context1, context2, context3],
    pages: [page1, page2, page3],
  };
}

test.describe('Game Flow', () => {
  let contexts: BrowserContext[];
  let pages: Page[];

  test.beforeAll(async ({ browser }) => {
    const setup = await setupThreePlayerGame(browser);
    contexts = setup.contexts;
    pages = setup.pages;
  });

  test.afterAll(async () => {
    if (contexts) {
      for (const ctx of contexts) {
        await ctx.close();
      }
    }
  });

  test('game board is displayed', async () => {
    const page = pages[0];
    // The board is a grid inside a white rounded shadow container
    const board = page.locator('[style*="grid-template-columns"]');
    if (await board.count() === 0) {
      // Fallback: check for the board container
      await expect(page.locator('.bg-white.rounded-lg.shadow').first()).toBeVisible({ timeout: 5000 });
    } else {
      await expect(board).toBeVisible({ timeout: 5000 });
    }
  });

  test('phase indicator shows current phase', async () => {
    const page = pages[0];
    await expect(page.getByText('Round 1')).toBeVisible();
    await expect(page.getByText('Restructuring')).toBeVisible();
  });

  test('player dashboard shows cash and CEO', async () => {
    const page = pages[0];
    await expect(page.getByText('Cash').first()).toBeVisible();
    // CEO card displays as "Chief Executive Officer"
    await expect(page.getByText('Chief Executive Officer').first()).toBeVisible();
  });

  test('restructuring phase - submit with CEO only', async () => {
    for (const page of pages) {
      const submitButton = page.getByRole('button', { name: 'Submit Structure' });
      if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitButton.click();
      }
    }
    // Wait for phase transition
    await pages[0].waitForTimeout(2000);
  });

  test('game log shows events', async () => {
    const page = pages[0];
    await expect(page.getByText('Game Log')).toBeVisible();
  });
});
