import { useEffect, useState } from 'react';
import { completionSeenKey } from '../../lib/progress';

export function useCompletion({
  storageId,
  complete,
  preview = false,
}: {
  storageId: string;
  complete: boolean;
  preview?: boolean;
}) {
  const [dismissed, setDismissed] = useState(() => {
    if (preview) return false;
    try {
      return localStorage.getItem(completionSeenKey(storageId)) === '1';
    } catch {
      return false;
    }
  });
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const open = complete && !dismissed;

  useEffect(() => {
    if (!open || preview) return;
    try {
      // Record display immediately, including when the page closes with the dialog open.
      localStorage.setItem(completionSeenKey(storageId), '1');
    } catch {
      // The in-memory state still handles dismissal for this visit.
    }
  }, [open, preview, storageId]);

  return {
    open,
    manuallyOpened,
    onDismiss: () => setDismissed(true),
    show: () => {
      if (!complete) return;
      setManuallyOpened(true);
      setDismissed(false);
    },
  };
}
