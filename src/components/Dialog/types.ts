import type { ReactNode, RefObject } from 'react';

export interface DialogProps {
  open: boolean;
  onDismiss: () => void;
  backgroundRef: RefObject<HTMLElement | null>;
  initialFocus?: () => HTMLElement | null;
  returnFocus?: () => HTMLElement | null;
  className?: string;
  openClassName?: string;
  fallbackClassName?: string;
  closeOnSurfaceClick?: boolean;
  labelledBy: string;
  describedBy?: string;
  children: (controls: { close: () => void }) => ReactNode;
}
