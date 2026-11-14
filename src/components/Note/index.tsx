import type { ReactNode } from 'react';
import { useFloatingNotes } from '../FloatingNotes';

export function Note({ id, label, text, children, className, tag }: {
  id: string; label: string; text: string; children: ReactNode; className: string; tag?: string;
}) {
  const context = useFloatingNotes();
  const open = context.active?.id === id;
  return <span className="float-wrap" onPointerEnter={event => {
    if (event.pointerType === 'mouse') context.hover(id);
  }} onPointerLeave={event => {
    if (event.pointerType === 'mouse') context.leave(id);
  }}>
    <button type="button" className={`${className} float-trigger`} data-tag={tag}
      aria-label={label} aria-controls={id} aria-expanded={open}
      onClick={() => context.toggle(id)} onBlur={() => context.close(id)}>{children}</button>
    <span id={id} className="float-note" hidden={!open}>{text}</span>
  </span>;
}
