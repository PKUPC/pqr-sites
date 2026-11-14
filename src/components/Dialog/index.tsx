import { focusableSelector, useDialog } from './useDialog';
import type { DialogProps } from './types';

/** Accessible modal behavior; the caller supplies the content, styles and focus targets. */
export function Dialog(props: DialogProps) {
  const { className, labelledBy, describedBy, closeOnSurfaceClick = false, children } = props;
  const { dialog, close, dismissed } = useDialog(props);

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
