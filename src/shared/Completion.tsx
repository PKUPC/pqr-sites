import { useEffect, useRef, useState } from 'react';
import type { QuizId } from './types';

export function Completion({ complete, id, title, edition, returnFocus }: {
  complete: boolean; id: QuizId; title: string; edition: number; returnFocus: React.RefObject<HTMLInputElement | null>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const unicode = id === 'unicode-plus-one';

  function restoreFocus() {
    document.querySelector('.shell')?.removeAttribute('inert');
    document.querySelector('.shell')?.removeAttribute('aria-hidden');
    const target = returnFocus.current ?? document.querySelector<HTMLInputElement>('.card:not([hidden]) input');
    if (target && !target.closest('[hidden]')) target.focus({ preventScroll: true });
  }
  function close() {
    const element = dialog.current;
    if (element?.open && typeof element.close === 'function') element.close();
    else {
      element?.removeAttribute('open');
      setDismissed(true);
      restoreFocus();
    }
  }

  useEffect(() => {
    const element = dialog.current;
    if (!element || !complete || dismissed) return;
    if (!element.open) {
      if (typeof element.showModal === 'function') element.showModal();
      else {
        // Older embedded browsers keep the same dialog and keyboard controls.
        element.setAttribute('open', '');
        element.classList.add('completion-fallback');
        document.querySelector('.shell')?.setAttribute('inert', '');
        document.querySelector('.shell')?.setAttribute('aria-hidden', 'true');
      }
    }
    element.classList.add('is-visible');
    continueButton.current?.focus();
  }, [complete, dismissed]);

  const content = <>
    <button className="completion-dismiss" type="button" aria-label="关闭" onClick={close}>×</button>
    <p className="completion-kicker">P&amp;KU 群聊集萃 · 第 {edition} 期</p>
    <h2 id="completion-title">恭喜完成！</h2>
    <p id="completion-message">你已经解出《{title}》的全部题目。</p>
    <button ref={continueButton} className={`${unicode ? 'submit ' : ''}completion-close`} type="button" onClick={close}>继续浏览</button>
  </>;
  return <dialog ref={dialog} className={unicode ? 'completion-card' : 'completion-backdrop'}
    aria-modal="true" aria-labelledby="completion-title" aria-describedby="completion-message"
    onCancel={event => { event.preventDefault(); close(); }}
    onClose={() => { setDismissed(true); restoreFocus(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (!unicode || event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
    }}>
    {unicode ? content : <div className="completion-card">{content}</div>}
  </dialog>;
}
