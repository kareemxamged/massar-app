import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} style={{ color: '#34d399' }} />,
    error: <AlertCircle size={20} style={{ color: '#fb7185' }} />,
    info: <Info size={20} style={{ color: '#38bdf8' }} />,
  };

  const backgrounds = {
    success: 'rgba(52,211,153,0.1)',
    error: 'rgba(251,113,133,0.1)',
    info: 'rgba(56,189,248,0.1)',
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg glass-card"
      style={{ background: backgrounds[type], border: `1px solid ${backgrounds[type].replace('0.1', '0.3')}` }}
    >
      {icons[type]}
      <span style={{ color: 'var(--text-main)' }}>{message}</span>
      <button onClick={onClose} className="btn-icon" style={{ color: 'var(--text-muted)' }}>
        <X size={16} />
      </button>
    </div>
  );
}

// Hook for using toasts — co-located with Toast component intentionally
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastComponent };
}
