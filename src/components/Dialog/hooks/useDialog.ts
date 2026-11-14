import { useCallback, useEffect, useRef } from 'react';
import type { DialogProps } from '../types';

export const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialog({ open, onDismiss, backgroundRef, initialFocus, returnFocus, openClassName, fallbackClassName }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fallbackBackground = useRef<{ element: HTMLElement; inert: boolean; ariaHidden: string | null } | null>(null);
  const releaseBackground = useCallback(() => {
    const previous = fallbackBackground.current;
    if (!previous) return;
    if (!previous.inert) previous.element.removeAttribute('inert');
    if (previous.ariaHidden === null) previous.element.removeAttribute('aria-hidden');
    else previous.element.setAttribute('aria-hidden', previous.ariaHidden);
    fallbackBackground.current = null;
  }, []);
  useEffect(() => () => releaseBackground(), [releaseBackground]);

  function dismissed() {
    releaseBackground();
    onDismiss();
    const target = returnFocus?.();
    if (target?.isConnected && !target.closest('[hidden]')) target.focus({ preventScroll: true });
  }
  function close() {
    const element = dialog.current;
    if (element?.open && typeof element.close === 'function') element.close();
    else {
      element?.removeAttribute('open');
      dismissed();
    }
  }

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) {
      if (element.open && typeof element.close === 'function') element.close();
      else element.removeAttribute('open');
      if (openClassName) element.classList.remove(openClassName);
      releaseBackground();
      return;
    }
    const native = typeof element.showModal === 'function';
    if (!element.open) {
      if (native) element.showModal();
      else element.setAttribute('open', '');
    }
    if (!native) {
      if (fallbackClassName) element.classList.add(fallbackClassName);
      const background = backgroundRef.current;
      if (background && !fallbackBackground.current) {
        fallbackBackground.current = { element: background, inert: background.hasAttribute('inert'), ariaHidden: background.getAttribute('aria-hidden') };
        background.setAttribute('inert', '');
        background.setAttribute('aria-hidden', 'true');
      }
    }
    if (openClassName) element.classList.add(openClassName);
    (initialFocus?.() ?? element.querySelector<HTMLElement>(focusableSelector))?.focus();
  }, [open, backgroundRef, initialFocus, openClassName, fallbackClassName, releaseBackground]);

  return { dialog, close, dismissed };
}
