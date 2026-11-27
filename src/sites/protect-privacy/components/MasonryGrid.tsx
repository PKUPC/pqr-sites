import { useLayoutEffect, useRef, type ComponentPropsWithoutRef } from 'react';

export function MasonryGrid({
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<'div'>, 'className'>) {
  const container = useRef<HTMLDivElement>(null);
  const placement = useRef({ key: '', columns: [] as number[] });

  useLayoutEffect(() => {
    const grid = container.current!;
    const cards = Array.from(grid.children) as HTMLElement[];
    let frame = 0;
    let lastWidth = 0;

    function layout() {
      frame = 0;
      const width = grid.getBoundingClientRect().width;
      if (!width) return;
      lastWidth = width;
      const style = getComputedStyle(grid);
      const columns = Number(style.getPropertyValue('--masonry-columns'));
      const gap = parseFloat(style.getPropertyValue('--card-gap'));
      const cardWidth = (width - gap * (columns - 1)) / columns;
      const visible = cards.filter((card) => !card.hidden);
      const key = `${columns}:${visible.map((card) => card.dataset.puzzleId).join(',')}`;
      const assignColumns = placement.current.key !== key;
      if (assignColumns) placement.current = { key, columns: [] };

      for (const card of visible) card.style.width = `${cardWidth}px`;
      const heights = Array<number>(columns).fill(0);
      for (const [index, card] of visible.entries()) {
        if (assignColumns) {
          placement.current.columns[index] = heights.indexOf(Math.min(...heights));
        }
        // Keep each card in its column while its explanation animates.
        const column = placement.current.columns[index];
        card.style.transform = `translate(${column * (cardWidth + gap)}px, ${heights[column]}px)`;
        heights[column] += card.getBoundingClientRect().height + gap;
      }
      grid.style.height = `${Math.max(0, ...heights.map((height) => height - gap))}px`;
    }

    const observer = new ResizeObserver((entries) => {
      if (entries.some((entry) => entry.target !== grid || entry.contentRect.width !== lastWidth)) {
        if (!frame) frame = requestAnimationFrame(layout);
      }
    });
    layout();
    observer.observe(grid);
    cards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [children]);

  return (
    <div {...props} className="grid" ref={container}>
      {children}
    </div>
  );
}
