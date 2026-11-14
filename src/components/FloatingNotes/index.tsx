import type { ReactNode } from 'react';
import { NoteContext } from './hooks/useFloatingNotes';
import { useFloatingNoteController } from './hooks/useFloatingNoteController';

export { useFloatingNotes } from './hooks/useFloatingNotes';

export function FloatingNotes({ children }: { children: ReactNode }) {
  const controller = useFloatingNoteController();
  return <NoteContext value={controller}>{children}</NoteContext>;
}
