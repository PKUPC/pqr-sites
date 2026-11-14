import { createContext, useContext } from 'react';

export const NoteContext = createContext<{
  active: string | null;
  setOpen: (id: string, open: boolean) => void;
} | null>(null);

export function useFloatingNotes() {
  return useContext(NoteContext)!;
}
