import type { ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  onDismiss: () => void;
  initialFocus?: () => HTMLElement | null;
  returnFocus?: () => HTMLElement | null;
  className?: string;
  backdropClassName?: string;
  viewportClassName?: string;
  children: ReactNode;
}
