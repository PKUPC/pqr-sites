import { useRef } from 'react';
import { Dialog } from '../Dialog';

export { useCompletion } from './useCompletion';

export function Completion({
  open,
  onDismiss,
  title,
  edition,
  returnFocus,
}: {
  open: boolean;
  onDismiss: () => void;
  title: string;
  edition: number;
  returnFocus: () => HTMLElement | null;
}) {
  const continueButton = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      open={open}
      onDismiss={onDismiss}
      initialFocus={() => continueButton.current}
      returnFocus={returnFocus}
      className="completion-card"
      backdropClassName="completion-backdrop"
      viewportClassName="completion-viewport"
    >
      <Dialog.Close className="completion-dismiss" aria-label="关闭">
        ×
      </Dialog.Close>
      <p className="completion-kicker">P&amp;KU 群聊集萃 · 第 {edition} 期</p>
      <Dialog.Title render={<h2 />}>恭喜完成！</Dialog.Title>
      <Dialog.Description>你已经解出《{title}》的全部题目。</Dialog.Description>
      <Dialog.Close ref={continueButton} className="completion-close">
        继续浏览
      </Dialog.Close>
    </Dialog>
  );
}
