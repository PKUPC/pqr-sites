import { useRef, useState, type RefObject } from 'react';
import { Dialog } from '../../../components/Dialog';

export function Completion({ complete, title, edition, backgroundRef, returnFocus }: {
  complete: boolean; title: string; edition: number;
  backgroundRef: RefObject<HTMLDivElement | null>; returnFocus: RefObject<HTMLInputElement | null>;
}) {
  const continueButton = useRef<HTMLButtonElement>(null);
  const [dismissed, setDismissed] = useState(false);
  return <Dialog open={complete && !dismissed} onDismiss={() => setDismissed(true)}
    initialFocus={() => continueButton.current}
    returnFocus={() => returnFocus.current ?? backgroundRef.current?.querySelector<HTMLInputElement>('.card:not([hidden]) input') ?? null}
    className="completion-card" backdropClassName="completion-backdrop" viewportClassName="completion-viewport">
    <Dialog.Close className="completion-dismiss" aria-label="关闭">×</Dialog.Close>
    <p className="completion-kicker">P&amp;KU 群聊集萃 · 第 {edition} 期</p>
    <Dialog.Title render={<h2 />}>恭喜完成！</Dialog.Title>
    <Dialog.Description>你已经解出《{title}》的全部题目。</Dialog.Description>
    <Dialog.Close ref={continueButton} className="completion-close">继续浏览</Dialog.Close>
  </Dialog>;
}
