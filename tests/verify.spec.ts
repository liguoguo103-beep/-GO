
import { test, expect } from '@playwright/test';

test('verify UI', async ({ page }) => {
  await page.goto('http://localhost:3002');
  await expect(page.getByText('START GRILLING')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1500); // Wait for transition to complete
  await page.screenshot({ path: 'screenshot.png' });
});
