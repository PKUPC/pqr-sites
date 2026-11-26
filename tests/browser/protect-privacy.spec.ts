import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { site } from '../../src/sites/protect-privacy/site';
import puzzles from '../../src/sites/protect-privacy/puzzles.json' with { type: 'json' };
import { encodeProgress, progressKey } from '../../src/lib/progress';

test('fourth edition is linked from the archive home', async ({ page }, testInfo) => {
  await page.goto('/');
  const link = page.locator('a[href="/protect-privacy/"]');
  await expect(link).toContainText(`第 ${site.edition} 期`);
  await expect(link.locator('img')).toHaveJSProperty('naturalWidth', 1200);
  await link.click();
  await expect(page).toHaveTitle(/保护隐私/);
  await expect(page.locator('.cover-issue')).toContainText(`第 ${site.edition} 期`);
  await expect(page.locator('.card-number').first()).toHaveText(
    `PQR-${String(site.edition).padStart(2, '0')}-01`,
  );
  await expect(page.locator('#puzzles .card')).toHaveCount(19);
  await expect(page.locator('#dlc-puzzles .card')).toHaveCount(15);
  await expect(page.locator('.hint-toggle')).toHaveCount(0);
  await page.screenshot({
    path: `.agents/local/protect-privacy-${testInfo.project.name}-desktop.png`,
    animations: 'disabled',
  });
});

test('fixed difficulty, joint author filters, answers and progress work', async ({ page }) => {
  await page.goto('/protect-privacy/');
  const card = page.locator('[data-puzzle-id="1"]');
  await expect(card.getByRole('img', { name: '难度 1/5' })).toBeVisible();
  await expect(card.locator('.difficulty-segment')).toHaveCount(5);
  await card.locator('input').fill('错误答案');
  await card.locator('input').press('Enter');
  await expect(card.locator('.submit')).toHaveText('错误！');
  await card.locator('input').fill('宫崎骏');
  await card.locator('input').press('Enter');
  await expect(card.locator('input')).toHaveAttribute('readonly', '');
  await expect(card.locator('.submit')).toHaveText('已解');
  await page.reload();
  await expect(card).toHaveClass(/solved/);
  await expect(page.locator('progress')).toHaveJSProperty('value', 1);
  for (const author of ['proton', 'ClashのRPC']) {
    await page.locator('#author-filter').selectOption(author);
    await expect(page.locator('[data-puzzle-id="18"]')).toBeVisible();
    await expect(page.locator('.dlc-section')).toBeVisible();
    const dlcId = author === 'proton' ? 24 : 20;
    await expect(page.locator(`[data-puzzle-id="${dlcId}"]`)).toBeVisible();
    await expect(page.locator('[data-puzzle-id="21"]')).toBeHidden();
    await expect(page.locator('[data-puzzle-id="18"] .author-name')).toHaveText([
      'proton、',
      'ClashのRPC',
    ]);
  }
  await page.locator('#author-filter').selectOption('');
  await page.locator('#puzzle-sort').selectOption('hard');
  await expect(
    page.locator('#puzzles .card').first().getByRole('img', { name: '难度 5/5' }),
  ).toBeVisible();
  const dlc = page.locator('#answer-20');
  await dlc.fill('-1');
  await dlc.press('Enter');
  await expect(page.locator('progress')).toHaveJSProperty('value', 1);
  await dlc.fill('−1 少年派的奇幻漂流');
  await dlc.press('Enter');
  await expect(page.locator('progress')).toHaveJSProperty('value', 2);
});

test('whole questions preview on hover and clicks pin the original without reflow', async ({
  page,
}) => {
  await page.goto('/protect-privacy/?preview=completion');
  await page.getByRole('button', { name: '关闭文件' }).click();
  for (const id of [1, 14, 15, 34]) {
    const puzzle = puzzles.find((entry) => entry.id === id)!;
    const card = page.locator(`[data-puzzle-id="${id}"]`);
    await expect(card).toHaveClass(/solved/);
    const before = (await card.boundingBox())!;
    const toggle = card.locator('.question-toggle');
    await card.locator('.card-number').hover();
    await toggle.hover({ position: { x: 20, y: 20 } });
    await expect(toggle).toHaveClass(/show-original/);
    await expect(toggle).toHaveAttribute('aria-label', puzzle.original);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await card.locator('.card-number').hover();
    await expect(toggle).toHaveClass(/show-original/);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveClass(/show-original/);
    await card.locator('.card-number').hover();
    await expect(toggle).not.toHaveClass(/show-original/);
    await page.mouse.move(0, 0);
    await toggle.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveClass(/show-original/);
    const after = (await card.boundingBox())!;
    expect(after.height).toBeCloseTo(before.height, 1);
    expect(after.width).toBeCloseTo(before.width, 1);
    await toggle.press('Space');
    await expect(toggle).not.toHaveClass(/show-original/);
  }
});

test('correct answers show one updating toast and keep focus and persistent solved status', async ({
  page,
}) => {
  await page.goto('/protect-privacy/');
  const card = page.locator('[data-puzzle-id="1"]');
  await expect(card.locator('.card-status')).toContainText('未解');
  const before = (await card.boundingBox())!;
  const paper = await card.evaluate((element) => getComputedStyle(element).backgroundColor);
  await card.locator('input').fill('错误');
  await card.locator('input').press('Enter');
  await expect(page.locator('.solve-toast')).toHaveCount(0);
  await card.locator('input').fill('宫崎骏');
  await card.locator('.submit').click();
  await expect(card.locator('input')).toBeFocused();
  await expect(card.locator('.card-status')).toContainText('已解');
  await expect(card).not.toHaveCSS('background-color', paper);
  const after = (await card.boundingBox())!;
  expect(after.height).toBeCloseTo(before.height, 1);
  const toast = page.locator('.solve-toast');
  await expect(toast).toHaveCount(1);
  await expect(toast).toContainText('第 1 题答对了');
  await expect(toast).toContainText('已解 1/34');
  await page.locator('#answer-2').fill('玄武门之变');
  await page.locator('#answer-2').press('Enter');
  await expect(toast).toHaveCount(1);
  await expect(toast).toContainText('第 2 题答对了');
  await expect(toast).toContainText('已解 2/34');
  await expect(page.locator('#answer-2')).toBeFocused();
  await expect(toast).toHaveCount(0, { timeout: 5000 });
  await page.locator('#answer-2').press('Enter');
  await expect(toast).toHaveCount(0);
  await page.reload();
  await expect(card.locator('.card-status')).toContainText('已解');
  await expect(page.locator('progress')).toHaveJSProperty('value', 2);
  await expect(toast).toHaveCount(0);
  expect(
    await card.locator('.card-status').evaluate((element) => element.getAnimations().length),
  ).toBe(0);
  await page.locator('#answer-3').fill('王浩然');
  await page.locator('#answer-3').press('Enter');
  await expect(toast).toBeVisible();
  await page.getByRole('button', { name: '关闭答对提示' }).click();
  await expect(toast).toHaveCount(0);
});

for (const width of [1280, 390, 320]) {
  test(`solved and unsolved cards stay aligned at ${width}px with reduced motion`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/protect-privacy/');
    const card = page.locator('[data-puzzle-id="1"]');
    const before = (await card.boundingBox())!;
    await card.locator('input').fill('宫崎骏');
    await card.locator('input').press('Enter');
    await expect(card.locator('.card-status')).toContainText('已解');
    await expect(page.locator('[data-puzzle-id="2"] .card-status')).toContainText('未解');
    const after = (await card.boundingBox())!;
    expect(after.height).toBeCloseTo(before.height, 1);
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(
      await card.locator('.card-status').evaluate((element) => element.getAnimations().length),
    ).toBe(0);
    const toast = page.locator('.solve-toast');
    await expect(toast).toBeVisible();
    await toast.focus();
    const toastBounds = (await toast.boundingBox())!;
    expect(toastBounds.x).toBeGreaterThanOrEqual(0);
    expect(toastBounds.x + toastBounds.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await card.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -90));
    await page.screenshot({
      path: `.agents/local/protect-privacy-${testInfo.project.name}-feedback-${width}.png`,
    });
    if (width === 1280) {
      const accessibility = await new AxeBuilder({ page })
        .include('[data-puzzle-id="1"]')
        .include('.solve-feedback')
        .exclude('[data-base-ui-focus-guard]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(accessibility.violations).toEqual([]);
    }
  });
}

test('the final answer opens the achievement and dismisses ordinary success feedback', async ({
  page,
}) => {
  await page.goto('/protect-privacy/');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: progressKey(site.id),
    value: encodeProgress(
      new Set(puzzles.filter((puzzle) => puzzle.id <= 32).map((puzzle) => puzzle.id)),
    ),
  });
  await page.reload();
  await page.locator('#answer-33').fill('葛宇路');
  await page.locator('#answer-33').press('Enter');
  await expect(page.locator('.solve-toast')).toContainText('已解 33/34');
  await page.locator('#answer-34').fill('V字仇杀队');
  await page.locator('#answer-34').press('Enter');
  await expect(page.locator('.completion-card')).toBeVisible();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('.solve-toast')).toHaveCount(0);
  await page.getByRole('button', { name: '关闭文件' }).click();
  await expect(page.locator('#answer-34')).toBeFocused();
  await page.reload();
  await expect(page.locator('progress')).toHaveJSProperty('value', 34);
  await expect(page.locator('.solve-toast')).toHaveCount(0);
  await page.getByRole('button', { name: '查看文件' }).click();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'true');
  await page.locator('.completion-reveal').click();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'false');
});

test('file stays covered before completion and closes back to its trigger', async ({ page }) => {
  await page.goto('/protect-privacy/');
  await page.getByRole('button', { name: '查看文件' }).click();
  await expect(page.getByRole('dialog', { name: '文件', exact: true })).toBeVisible();
  await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.completion-filehead')).toHaveText(
    `P&KU 群聊集萃 · 第 ${site.edition} 期`,
  );
  await expect(page.locator('.completion-reveal')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '查看文件' })).toBeFocused();
});

test('completion file is interactive and preview does not write progress', async ({
  page,
}, testInfo) => {
  await page.goto('/protect-privacy/?preview=completion');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('.completion-reveal').click();
  await expect(dialog.locator('.completion-content')).toHaveAttribute('aria-hidden', 'true');
  await dialog.locator('.completion-reveal').click();
  await expect(dialog.locator('.completion-content')).toHaveAttribute('aria-hidden', 'false');
  await expect(dialog.locator('.completion-dismiss')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  const accessibility = await new AxeBuilder({ page })
    .exclude('[data-base-ui-focus-guard]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({
    path: `.agents/local/protect-privacy-${testInfo.project.name}-completion.png`,
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(page.locator('#answer-1')).toBeFocused();
  await page.goto('/protect-privacy/');
  await expect(page.locator('progress')).toHaveJSProperty('value', 0);
});

test('narrow and short layouts keep the file close control usable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 680 });
  await page.goto('/protect-privacy/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-puzzle-id="1"]').scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `.agents/local/protect-privacy-${testInfo.project.name}-narrow.png`,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 320, height: 240 });
  await page.goto('/protect-privacy/?preview=completion');
  await page.getByRole('button', { name: '关闭文件' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('touch toggles question layers and the completion file', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/protect-privacy/');
    await page.locator('#answer-1').fill('宫崎骏');
    await page.locator('#answer-1').press('Enter');
    const question = page.locator('#question-1 .question-toggle');
    await question.tap();
    await expect(question).toHaveClass(/show-original/);
    await question.tap();
    await expect(question).not.toHaveClass(/show-original/);
    await page.goto('/protect-privacy/?preview=completion');
    const reveal = page.locator('.completion-reveal');
    await reveal.tap();
    await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'true');
    await reveal.tap();
    await expect(page.locator('.completion-content')).toHaveAttribute('aria-hidden', 'false');
    await page.getByRole('button', { name: '关闭文件' }).tap();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  } finally {
    await context.close();
  }
});

test('new DLC authors and Latin question layers keep their layout and progress', async ({
  page,
}) => {
  await page.goto('/protect-privacy/');
  await page.locator('#author-filter').selectOption('Николай,III');
  await expect(page.locator('#puzzles .card:visible')).toHaveCount(0);
  await expect(page.locator('#dlc-puzzles .card:visible')).toHaveCount(1);
  const card = page.locator('[data-puzzle-id="34"]');
  await card.locator('input').fill('V字仇杀队');
  await card.locator('input').press('Enter');
  await expect(card).toHaveClass(/solved/);
  const before = (await card.boundingBox())!;
  const toggle = card.locator('.question-toggle');
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute(
    'aria-label',
    /Voila! In view, a humble vaudevillian veteran/,
  );
  const after = (await card.boundingBox())!;
  expect(after.height).toBeCloseTo(before.height, 1);
  expect(after.width).toBeCloseTo(before.width, 1);
  await page.reload();
  await expect(card).toHaveClass(/solved/);
  await expect(page.locator('progress')).toHaveJSProperty('value', 1);
});
