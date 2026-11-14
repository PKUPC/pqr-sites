import { useEffect, useState } from 'react';
import type { ContextType } from 'react';
import { NoteContext } from './useFloatingNotes';

export function useFloatingNoteController(): NonNullable<ContextType<typeof NoteContext>> {
  const [active, setActive] = useState<NonNullable<ContextType<typeof NoteContext>>['active']>(null);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, []);
  return { active,
    hover: id => setActive(note => note?.id === id ? note : { id, pinned: false }),
    leave: id => setActive(note => note?.id === id && !note.pinned ? null : note),
    toggle: id => setActive(note => note?.id === id ? null : { id, pinned: true }),
    close: id => setActive(note => note?.id === id ? null : note),
  };
}
