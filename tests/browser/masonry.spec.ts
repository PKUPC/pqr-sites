import { expect, test } from '@playwright/test';

test('fourth edition masonry keeps equal gaps through reveal, filtering and resizing', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/protect-privacy/?preview=completion');
  await page.getByRole('button', { name: '关闭文件' }).click();

  const measure = () =>
    page.locator('.grid').evaluateAll((grids) =>
      grids
        .filter((grid) => grid.getBoundingClientRect().width > 0)
        .map((grid) => {
          const bounds = grid.getBoundingClientRect();
          const cards = Array.from(
            grid.querySelectorAll<HTMLElement>('.card:not([hidden])'),
            (card) => {
              const box = card.getBoundingClientRect();
              return {
                id: card.dataset.puzzleId,
                x: box.x - bounds.x,
                y: box.y - bounds.y,
                width: box.width,
                height: box.height,
              };
            },
          );
          const columns = [...new Set(cards.map((card) => card.x))].sort((a, b) => a - b);
          const gaps = columns.flatMap((x) => {
            const column = cards.filter((card) => card.x === x).sort((a, b) => a.y - b.y);
            return column
              .slice(1)
              .map((card, index) => card.y - column[index].y - column[index].height);
          });
          if (columns.length === 2) gaps.push(columns[1] - columns[0] - cards[0].width);
          const bottom = Math.max(0, ...cards.map((card) => card.y + card.height));
          return {
            cards,
            columns: columns.length,
            valid:
              gaps.every((gap) => Math.abs(gap - 18) < 0.6) &&
              Math.abs(bottom - bounds.height) < 0.6 &&
              cards.every((card) => card.x >= 0 && card.x + card.width <= bounds.width + 0.6),
          };
        }),
    );
  const checkLayout = async () => {
    await expect.poll(async () => (await measure()).every((grid) => grid.valid)).toBe(true);
  };

  await checkLayout();
  const before = (await measure()).flatMap((grid) => grid.cards.map(({ id, x }) => ({ id, x })));
  const card = page.locator('[data-puzzle-id="16"]');
  await card.locator('.card-number').click();
  await expect(card.locator('.answer-explanation')).not.toBeVisible();
  await checkLayout();
  expect((await measure()).flatMap((grid) => grid.cards.map(({ id, x }) => ({ id, x })))).toEqual(
    before,
  );
  await card.locator('.card-number').click();
  await expect(card.locator('.answer-explanation')).toHaveCSS('opacity', '1');
  await checkLayout();

  await page.locator('#author-filter').selectOption('ClashのRPC');
  await page.locator('#puzzle-sort').selectOption('hard');
  await checkLayout();
  await page.locator('#author-filter').selectOption('');
  await page.locator('#puzzle-sort').selectOption('original');

  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await checkLayout();
    expect((await measure()).map((grid) => grid.columns)).toEqual(width > 850 ? [2, 2] : [1, 1]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page
      .locator('[data-puzzle-id="1"]')
      .evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -16));
    await page.screenshot({ path: `.agents/local/privacy-masonry-${width}.png` });
  }
  expect(errors).toEqual([]);
});
