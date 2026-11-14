import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ActiveNote { id: string; pinned: boolean }
const NoteContext = createContext<{
  active: ActiveNote | null;
  hover: (id: string) => void;
  leave: (id: string) => void;
  toggle: (id: string) => void;
  close: (id: string) => void;
} | null>(null);

export function FloatingNotes({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveNote | null>(null);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, []);
  return <NoteContext value={{ active,
    hover: id => setActive(note => note?.id === id ? note : { id, pinned: false }),
    leave: id => setActive(note => note?.id === id && !note.pinned ? null : note),
    toggle: id => setActive(note => note?.id === id ? null : { id, pinned: true }),
    close: id => setActive(note => note?.id === id ? null : note),
  }}>{children}</NoteContext>;
}

export function Note({ id, label, text, children, className, tag }: {
  id: string; label: string; text: string; children: ReactNode; className: string; tag?: string;
}) {
  const context = useContext(NoteContext)!;
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
