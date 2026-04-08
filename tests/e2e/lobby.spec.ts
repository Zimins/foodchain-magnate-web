import { test, expect } from '@playwright/test';

test.describe('Lobby', () => {
  test('home page loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Food Chain Magnate');
    await expect(page.locator('h1 + p')).toHaveText('Online');
  });

  test('create a game room and see room code', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Create Game' }).click();
    await page.getByPlaceholder('Your name').fill('Player1');
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Wait for navigation to game room
    await page.waitForURL('**/game/**', { timeout: 10000 });

    // Should show waiting room
    await expect(page.getByText('Waiting for Players')).toBeVisible({ timeout: 10000 });

    // Room code should be displayed
    await expect(page.getByText('Room Code')).toBeVisible();
    const roomCodeElement = page.locator('.font-mono.font-bold');
    await expect(roomCodeElement).toBeVisible();
  });

  test('3 players join and start game', async ({ browser }) => {
    // Player 1 (host) creates a game
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('http://localhost:3001');

    await page1.getByRole('button', { name: 'Create Game' }).click();
    await page1.getByPlaceholder('Your name').fill('Host');
    await page1.getByRole('button', { name: '3', exact: true }).click();
    await page1.getByRole('button', { name: 'Create', exact: true }).click();

    await page1.waitForURL('**/game/**', { timeout: 10000 });
    await expect(page1.getByText('Waiting for Players')).toBeVisible({ timeout: 10000 });

    // Extract room code
    const roomCodeElement = page1.locator('.font-mono.font-bold');
    await expect(roomCodeElement).toBeVisible();
    const roomCode = await roomCodeElement.textContent();
    expect(roomCode).toBeTruthy();

    // Player 2 joins
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('http://localhost:3001');
    await page2.getByRole('button', { name: 'Join Game' }).click();
    await page2.getByPlaceholder('Your name').fill('Player2');
    await page2.getByPlaceholder('Room code').fill(roomCode!);
    await page2.getByRole('button', { name: 'Join', exact: true }).click();
    await page2.waitForURL('**/game/**', { timeout: 10000 });
    await expect(page2.getByText('Waiting for Players')).toBeVisible({ timeout: 10000 });

    // Player 3 joins
    const context3 = await browser.newContext();
    const page3 = await context3.newPage();
    await page3.goto('http://localhost:3001');
    await page3.getByRole('button', { name: 'Join Game' }).click();
    await page3.getByPlaceholder('Your name').fill('Player3');
    await page3.getByPlaceholder('Room code').fill(roomCode!);
    await page3.getByRole('button', { name: 'Join', exact: true }).click();
    await page3.waitForURL('**/game/**', { timeout: 10000 });
    await expect(page3.getByText('Waiting for Players')).toBeVisible({ timeout: 10000 });

    // Verify all 3 players appear in the waiting room (check from host's perspective)
    await expect(page1.getByText('Host', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page1.getByText('Player2')).toBeVisible({ timeout: 5000 });
    await expect(page1.getByText('Player3')).toBeVisible({ timeout: 5000 });

    // Verify HOST badge
    await expect(page1.getByText('HOST', { exact: true })).toBeVisible();

    // Host clicks Start Game
    const startButton = page1.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeEnabled();
    await startButton.click();

    // Verify game starts - phase indicator should appear
    await expect(page1.getByText('Round')).toBeVisible({ timeout: 10000 });

    await context1.close();
    await context2.close();
    await context3.close();
  });
});
