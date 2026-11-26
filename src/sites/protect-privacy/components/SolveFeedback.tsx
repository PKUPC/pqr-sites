import { Toast } from '@base-ui/react/toast';

export function SolveFeedback() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="solve-feedback" aria-label="答题反馈">
        {toasts.map((toast) => (
          <Toast.Root key={toast.id} toast={toast} className="solve-toast" swipeDirection="up">
            <span className="solve-toast-check" aria-hidden="true">
              ✓
            </span>
            <Toast.Content className="solve-toast-content">
              <Toast.Title className="solve-toast-title">{toast.title}</Toast.Title>
              <Toast.Description className="solve-toast-description">
                {toast.description}
              </Toast.Description>
            </Toast.Content>
            <Toast.Close
              className="solve-toast-close"
              aria-label="关闭答对提示"
              aria-hidden={false}
            >
              <span aria-hidden="true">×</span>
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
