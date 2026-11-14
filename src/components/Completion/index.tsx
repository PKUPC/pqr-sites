import { useRef, useState } from 'react';
import { Dialog } from '../Dialog';

export function Completion({
  complete,
  title,
  edition,
  returnFocus,
}: {
  complete: boolean;
  title: string;
  edition: number;
  returnFocus: () => HTMLElement | null;
}) {
  const continueButton = useRef<HTMLButtonElement>(null);
  const [dismissed, setDismissed] = useState(false);
  return (
    <Dialog
      open={complete && !dismissed}
      onDismiss={() => setDismissed(true)}
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
