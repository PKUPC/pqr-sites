import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';

const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Accessible modal behavior; the caller supplies the content, styles and focus targets. */
export function Dialog({ open, onDismiss, backgroundRef, initialFocus, returnFocus, className,
  openClassName, fallbackClassName, closeOnSurfaceClick = false, labelledBy, describedBy, children }: {
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
}) {
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

  return <dialog ref={dialog} className={className} aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy}
    onCancel={event => { event.preventDefault(); close(); }} onClose={dismissed}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const elements = [...event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector)].filter(element => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (closeOnSurfaceClick || event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
    }}>{children({ close })}</dialog>;
}
