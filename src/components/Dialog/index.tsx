import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { DialogProps } from './types';

function DialogRoot({
  open,
  onDismiss,
  initialFocus,
  returnFocus,
  className,
  backdropClassName,
  viewportClassName,
  children,
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onDismiss();
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={backdropClassName} />
        <BaseDialog.Viewport className={viewportClassName}>
          <BaseDialog.Popup
            className={className}
            initialFocus={initialFocus}
            finalFocus={returnFocus}
          >
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** Behavior comes from Base UI; callers own content and styling. */
export const Dialog = Object.assign(DialogRoot, {
  Title: BaseDialog.Title,
  Description: BaseDialog.Description,
  Close: BaseDialog.Close,
});
