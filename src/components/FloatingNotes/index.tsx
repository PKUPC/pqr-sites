import type { ReactNode } from 'react';
import { NoteContext } from './useFloatingNotes';
import { useFloatingNoteController } from './useFloatingNoteController';

export { useFloatingNotes } from './useFloatingNotes';

export function FloatingNotes({ children }: { children: ReactNode }) {
  const controller = useFloatingNoteController();
  return <NoteContext value={controller}>{children}</NoteContext>;
}
