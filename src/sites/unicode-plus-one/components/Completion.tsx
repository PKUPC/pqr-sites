import { useRef, useState, type RefObject } from 'react';
import { Dialog } from '../../../components/Dialog';

export function Completion({ complete, title, edition, backgroundRef, returnFocus }: {
  complete: boolean; title: string; edition: number;
  backgroundRef: RefObject<HTMLDivElement | null>; returnFocus: RefObject<HTMLInputElement | null>;
}) {
  const continueButton = useRef<HTMLButtonElement>(null);
  const [dismissed, setDismissed] = useState(false);
  return <Dialog open={complete && !dismissed} onDismiss={() => setDismissed(true)}
    backgroundRef={backgroundRef} initialFocus={() => continueButton.current}
    returnFocus={() => returnFocus.current ?? backgroundRef.current?.querySelector<HTMLInputElement>('.card:not([hidden]) input') ?? null}
    className="completion-card" openClassName="is-visible" fallbackClassName="completion-fallback"
    labelledBy="completion-title" describedBy="completion-message">
    {({ close }) => <>
      <button className="completion-dismiss" type="button" aria-label="关闭" onClick={close}>×</button>
      <p className="completion-kicker">P&amp;KU 群聊集萃 · 第 {edition} 期</p>
      <h2 id="completion-title">恭喜完成！</h2>
      <p id="completion-message">你已经解出《{title}》的全部题目。</p>
      <button ref={continueButton} className="submit completion-close" type="button" onClick={close}>继续浏览</button>
    </>}
  </Dialog>;
}
