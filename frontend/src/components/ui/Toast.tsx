import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'shadow-soft-lg',
        duration: 4000,
        style: {
          background: '#fff',
          color: '#18181b',
          border: '1px solid #e4e4e7',
          borderRadius: '12px',
          padding: '14px 16px',
        },
      }}
    />
  );
}
