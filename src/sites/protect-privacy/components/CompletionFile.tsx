import { useRef } from 'react';
import { Dialog } from '../../../components/Dialog';
import { site } from '../site';

export function CompletionFile({
  open,
  covered,
  complete,
  total,
  dlcTotal,
  onCoverChange,
  onDismiss,
  returnFocus,
}: {
  open: boolean;
  covered: boolean;
  complete: boolean;
  total: number;
  dlcTotal: number;
  onCoverChange: (covered: boolean) => void;
  onDismiss: () => void;
  returnFocus: () => HTMLElement | null;
}) {
  const close = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      open={open}
      onDismiss={onDismiss}
      initialFocus={() => close.current}
      returnFocus={returnFocus}
      className={`completion-card${complete ? ' is-unlocked' : ''}${covered ? ' is-covered' : ' play-reveal'}`}
      backdropClassName="completion-backdrop"
      viewportClassName="completion-viewport"
    >
      <Dialog.Title render={<span className="sr-only" />}>
        {covered ? '文件' : '恭喜通关！'}
      </Dialog.Title>
      <Dialog.Description render={<span className="sr-only" />}>
        {complete ? '点按文件切换黑条遮盖。' : `完成全部 ${total} 道题后可揭开文件。`}
      </Dialog.Description>
      <div className="completion-file">
        <div className="completion-paper file-sheet">
          <div className="completion-content" aria-hidden={covered}>
            <header className="completion-filehead">
              <p className="completion-mask">
                <span>P&amp;KU 群聊集萃 · 第 {site.edition} 期</span>
              </p>
            </header>
            <div className="completion-sheet">
              <p className="completion-topic completion-mask">
                <span>《{site.title}》</span>
              </p>
              <h2 className="completion-mask" id="completion-title">
                <span>恭喜通关！</span>
              </h2>
              <p className="completion-result" id="completion-message">
                <span className="completion-mask">
                  <span>
                    已解出 <strong>{total}</strong> 道题
                  </span>
                </span>
                {dlcTotal > 0 && (
                  <span className="completion-breakdown completion-mask">
                    <span>
                      其中有 {total - dlcTotal} 道正题和 {dlcTotal} 道 DLC 题目。
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
          {complete && (
            <button
              className="completion-reveal"
              type="button"
              aria-label={covered ? '揭开文件' : '遮盖文件'}
              aria-pressed={covered}
              title={covered ? '点击揭开文件' : '点击盖回黑条'}
              onClick={() => onCoverChange(!covered)}
            />
          )}
        </div>
        <Dialog.Close
          ref={close}
          className="completion-dismiss"
          type="button"
          aria-label="关闭文件"
        />
      </div>
    </Dialog>
  );
}
