import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import unicode from '../../sites/unicode-plus-one/puzzles.json' with { type: 'json' };

test('home exposes both real document routes and metadata without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [slug, title] of [['', 'PQR'], ['missing-abbreviations/', '缩略'], ['unicode-plus-one/', 'unicode+1']]) {
    await page.goto('/' + slug);
    await expect(page).toHaveTitle(new RegExp(title.replace('+', '\\+')));
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://pqr.pkupuzzle.art/${slug}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /https:\/\/pqr.pkupuzzle.art\/.+og-image.png/);
    await expect(page.locator('noscript')).toBeVisible();
  }
  await context.close();
});

test('abbreviations: wrong answer, both alternatives, persistence, filter and sort', async ({ page }) => {
  await page.goto('/missing-abbreviations/');
  await expect(page.locator('.card')).toHaveCount(91);
  const card = page.locator('[data-puzzle-id="88"]');
  await card.locator('input').fill('错误答案');
  await card.locator('form').evaluate(form => (form as HTMLFormElement).requestSubmit());
  await expect(card.locator('.feedback')).toHaveText('答案不正确，请再试一次。');
  await expect(card.locator('input')).toHaveAttribute('aria-invalid', 'true');
  for (const answer of ['附中', '附小']) {
    await card.locator('input').fill(answer);
    await card.locator('input').press('Enter');
    await expect(card).toHaveClass(/solved/);
  }
  await page.reload();
  await expect(page.locator('[data-puzzle-id="88"]')).toHaveClass(/solved/);
  await expect(page.locator('progress')).toHaveJSProperty('value', 1);
  await page.locator('#author-filter').selectOption('小吉');
  await expect(page.locator('.card:visible')).toHaveCount(2);
  await page.locator('#puzzle-sort').selectOption('hard');
  await expect(page.locator('.card:visible').first()).toHaveAttribute('data-puzzle-id', '38');
});

test('unicode: new authors, difficulties, readonly canonical answer and persistent original toggle', async ({ page }) => {
  await page.goto('/unicode-plus-one/');
  await expect(page.locator('.card')).toHaveCount(20);
  await expect(page.locator('#author-filter option')).toHaveCount(4);
  const card = page.locator('[data-puzzle-id="1"]');
  await expect(card.getByRole('img', { name: '难度 2/5' })).toBeVisible();
  await card.locator('input').fill('数九歌');
  await card.locator('input').press('Enter');
  await expect(card.locator('input')).toHaveAttribute('readonly', '');
  await expect(card.locator('input')).toHaveAttribute('placeholder', '九九歌');
  await expect(card.locator('.submit')).toBeDisabled();
  const toggle = card.locator('.question-toggle');
  await toggle.focus();
  await toggle.press('Enter');
  await expect(toggle).toHaveClass(/show-original/);
  await toggle.press('Space');
  await expect(toggle).not.toHaveClass(/show-original/);
  await page.reload();
  await expect(card.locator('.submit')).toBeDisabled();
  await expect(page.locator('progress')).toHaveJSProperty('value', 1);
  await page.locator('#author-filter').selectOption('CALS');
  await expect(page.locator('.card:visible')).toHaveCount(2);
});

for (const slug of ['missing-abbreviations', 'unicode-plus-one']) {
  test(`${slug}: hints stay open under pointer, dismiss with global Escape and keyboard`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    const card = page.locator('.card').first();
    const button = card.locator('.hint-toggle').first();
    const note = card.locator('.float-note').last();
    await button.hover();
    await expect(note).toBeVisible();
    const buttonBox = (await button.boundingBox())!;
    const noteBox = (await note.boundingBox())!;
    await page.mouse.move(buttonBox.x + buttonBox.width / 2, noteBox.y + Math.min(noteBox.height / 2, 10), { steps: 6 });
    await expect(note).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(note).toBeHidden();
    await button.focus();
    await button.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await button.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test(`${slug}: completion preview traps focus, restores it and never saves synthetic progress`, async ({ page }) => {
    await page.goto(`/${slug}/?preview=completion`);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: '继续浏览' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: '关闭', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: '继续浏览' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('#answer-1')).toBeFocused();
    if (slug === 'missing-abbreviations') {
      await page.locator('#answer-1').fill('奥运会');
      await page.locator('#answer-1').press('Enter');
    }
    await page.goto(`/${slug}/`);
    await expect(page.locator('progress')).toHaveJSProperty('value', 0);
  });

  test(`${slug}: 320px narrow and short screens remain usable`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 680 });
    await page.goto(`/${slug}/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/${slug}-narrow.png`, fullPage: true });
    await page.setViewportSize({ width: 320, height: 240 });
    await page.goto(`/${slug}/?preview=completion`);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '继续浏览' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
}

test('complete all 20 unicode answers and restore final focus and progress', async ({ page }) => {
  await page.goto('/unicode-plus-one/');
  for (const puzzle of unicode) {
    const input = page.locator(`#answer-${puzzle.id}`);
    await input.fill([puzzle.answers].flat()[0]);
    await input.press('Enter');
  }
  await expect(page.locator('progress')).toHaveJSProperty('value', 20);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#answer-20')).toBeFocused();
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#answer-1')).toBeFocused();
});

test('storage failure and absent runtime Segmenter do not prevent play', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Intl, 'Segmenter', { value: undefined });
    Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
  });
  await page.goto('/unicode-plus-one/');
  await page.locator('#answer-1').fill('九九歌');
  await page.locator('#answer-1').press('Enter');
  await expect(page.locator('.storage-warning')).toContainText('无法保存进度');
  await expect(page.locator('progress')).toHaveJSProperty('value', 1);
});

for (const slug of ['', 'missing-abbreviations/', 'unicode-plus-one/']) {
  test(`${slug || 'home'}: automated WCAG A/AA checks`, async ({ page }) => {
    await page.goto('/' + slug);
    const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    if (slug) {
      const first = page.locator('.card').first();
      await first.locator('input').fill('错误答案');
      await first.locator('input').press('Enter');
      await expect(first.locator('.feedback')).toBeVisible();
      await expect(first.locator('.feedback')).toContainText('答案不正确');
      const errorResults = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
      expect(errorResults.violations).toEqual([]);
    }
  });
}

test('local static routes serve real assets and return 404 for missing files', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const slug of ['', 'missing-abbreviations/', 'unicode-plus-one/']) {
    await page.goto('/' + slug);
    if (slug) await expect(page.locator('.card').first()).toBeVisible();
    else await expect(page.getByRole('link', { name: /第 2 期/ })).toBeVisible();
  }
  expect(errors).toEqual([]);
  for (const path of ['/missing-abbreviations/missing.js', '/unicode-plus-one/missing.png', '/unknown-page/']) {
    expect((await request.get(path)).status()).toBe(404);
  }
});

test('dialog capability fallback remains keyboard operable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { value: undefined });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { value: undefined });
  });
  await page.goto('/unicode-plus-one/?preview=completion');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', {name:'继续浏览'}).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', {name:'关闭',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#answer-1')).toBeFocused();
});
