import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { site } from '../../src/sites/protect-privacy/site';

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

test('redacted words preview on hover and whole questions toggle without reflow', async ({
  page,
}) => {
  await page.goto('/protect-privacy/');
  await page.locator('#answer-1').fill('宫崎骏');
  await page.locator('#answer-1').press('Enter');
  const card = page.locator('[data-puzzle-id="1"]');
  const blank = card.locator('.question-blank').first();
  await blank.hover();
  await expect(blank).toHaveClass(/is-previewed/);
  await expect(blank.locator('.redaction-preview')).toHaveText('千');
  await card.locator('.card-number').hover();
  await expect(blank).not.toHaveClass(/is-previewed/);
  const before = (await card.boundingBox())!;
  const toggle = card.locator('.question-toggle');
  await toggle.focus();
  await toggle.press('Enter');
  await expect(toggle).toHaveClass(/show-original/);
  const after = (await card.boundingBox())!;
  expect(after.height).toBeCloseTo(before.height, 1);
  expect(after.width).toBeCloseTo(before.width, 1);
  await toggle.press('Space');
  await expect(toggle).not.toHaveClass(/show-original/);
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
