import { createContext, useContext } from 'react';

interface ActiveNote { id: string; pinned: boolean }
export const NoteContext = createContext<{
  active: ActiveNote | null;
  hover: (id: string) => void;
  leave: (id: string) => void;
  toggle: (id: string) => void;
  close: (id: string) => void;
} | null>(null);

export function useFloatingNotes() {
  return useContext(NoteContext)!;
}
