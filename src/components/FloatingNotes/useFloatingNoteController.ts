import { useState } from 'react';

/** Only coordinate which note is active; Base UI owns its interaction lifecycle. */
export function useFloatingNoteController() {
  const [active, setActive] = useState<string | null>(null);
  return {
    active,
    setOpen: (id: string, open: boolean) => setActive(current => open ? id : current === id ? null : current),
  };
}
