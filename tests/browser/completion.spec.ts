import { expect, test } from '@playwright/test';
import { completionSeenKey, encodeProgress, progressKey } from '../../src/lib/progress';
import abbreviations from '../../src/sites/missing-abbreviations/puzzles.json' with { type: 'json' };
import unicode from '../../src/sites/unicode-plus-one/puzzles.json' with { type: 'json' };
import privacy from '../../src/sites/protect-privacy/puzzles.json' with { type: 'json' };

for (const [slug, puzzles] of [
  ['missing-abbreviations', abbreviations],
  ['unicode-plus-one', unicode],
] as const) {
  const key = progressKey(slug);
  const seenKey = completionSeenKey(slug);
  const solved = encodeProgress(new Set(puzzles.map((puzzle) => puzzle.id)));

  test(`${slug}: completion displays once and full progress reopens it`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ key, progress }) => localStorage.setItem(key, progress), {
      key,
      progress: encodeProgress(new Set(puzzles.slice(0, -1).map((puzzle) => puzzle.id))),
    });
    await page.goto(`/${slug}/`);
    const replay = page.getByRole('button', { name: '查看通关界面' });
    const dialog = page.getByRole('dialog');
    await expect(page.getByRole('progressbar')).toHaveJSProperty('value', puzzles.length - 1);
    await expect(replay).toHaveCount(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBeNull();

    const last = puzzles[puzzles.length - 1];
    const input = page.locator(`#answer-${last.id}`);
    await input.fill([last.answers].flat()[0]);
    await input.press('Enter');
    await expect(dialog).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBe('1');
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        completionSeenKey(
          slug === 'missing-abbreviations' ? 'unicode-plus-one' : 'missing-abbreviations',
        ),
      ),
    ).toBeNull();

    // A display counts even if the page reloads before the player dismisses it.
    await page.reload();
    await expect(page.getByRole('progressbar')).toHaveJSProperty('value', puzzles.length);
    await expect(dialog).not.toBeVisible();
    await expect(replay).toBeVisible();
    await expect(page.locator('.progress')).toContainText('查看通关界面');
    await replay.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(replay).toBeFocused();
    await replay.press('Space');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: '继续浏览' }).click();
    await expect(replay).toBeFocused();
    await replay.press('Enter');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await expect(replay).toBeFocused();
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(solved);
  });

  test(`${slug}: completed progress supports touch and preview preserves saved state`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    try {
      await page.goto('/');
      await page.evaluate(
        ({ key, solved, seenKey }) => {
          localStorage.setItem(key, solved);
          localStorage.setItem(seenKey, '1');
        },
        { key, solved, seenKey },
      );
      await page.goto(`/${slug}/`);
      const replay = page.getByRole('button', { name: '查看通关界面' });
      const dialog = page.getByRole('dialog');
      await expect(replay).toBeVisible();
      await expect(dialog).not.toBeVisible();
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        const box = await replay.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        await replay.tap();
        await expect(dialog).toBeVisible();
        await page.getByRole('button', { name: '继续浏览' }).tap();
        await expect(dialog).not.toBeVisible();
      }
      // Preview always opens, even after the real completion has already been seen.
      await page.goto(`/${slug}/?preview=completion`);
      await expect(dialog).toBeVisible();
      expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(solved);
      expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBe('1');
      await page.evaluate((key) => localStorage.removeItem(key), seenKey);
      await page.reload();
      await expect(dialog).toBeVisible();
      expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBeNull();
    } finally {
      await context.close();
    }
  });
}

test('fourth edition uses shared once-only completion without consuming it in the covered preview', async ({
  page,
}) => {
  const key = progressKey('protect-privacy');
  const seenKey = completionSeenKey('protect-privacy');
  await page.goto('/protect-privacy/');
  const file = page.locator('.completion-card');
  const openFile = page.getByRole('button', { name: '查看文件', exact: true });
  await openFile.click();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'true');
  await page.getByRole('button', { name: '关闭文件' }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBeNull();
  await page.evaluate(({ key, progress }) => localStorage.setItem(key, progress), {
    key,
    progress: encodeProgress(new Set(privacy.slice(0, -1).map((puzzle) => puzzle.id))),
  });
  await page.reload();
  await expect(file).not.toBeVisible();
  const last = privacy[privacy.length - 1];
  await page.locator(`#answer-${last.id}`).fill([last.answers].flat()[0]);
  await page.locator(`#answer-${last.id}`).press('Enter');
  await expect(file).toBeVisible();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'false');
  expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBe('1');
  await page.reload();
  await expect(page.getByRole('progressbar')).toHaveJSProperty('value', privacy.length);
  await expect(file).not.toBeVisible();
  await openFile.click();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'true');
  await page.locator('.completion-reveal').click();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('Escape');
  await expect(openFile).toBeFocused();

  // Existing completed progress gets its first display record when revisited.
  await page.evaluate((key) => localStorage.removeItem(key), seenKey);
  await page.reload();
  await expect(file).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBe('1');
  await page.reload();
  await expect(file).not.toBeVisible();
  await page.goto('/protect-privacy/?preview=completion');
  await expect(file).toBeVisible();
  await page.evaluate((key) => localStorage.removeItem(key), seenKey);
  await page.reload();
  await expect(file).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), seenKey)).toBeNull();
});
