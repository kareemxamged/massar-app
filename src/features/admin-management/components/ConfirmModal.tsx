import { X, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import Portal from '../../../components/Portal';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
  loading = false
}: Props) {
  if (!isOpen) return null;

  const colors = {
    danger: { icon: '#fb7185', bg: 'rgba(251,113,133,0.15)', button: '#fb7185' },
    warning: { icon: '#fb923c', bg: 'rgba(251,146,60,0.15)', button: '#fb923c' },
    info: { icon: '#38bdf8', bg: 'rgba(56,189,248,0.15)', button: '#38bdf8' },
  };

  const Icon = type === 'danger' ? AlertTriangle : type === 'warning' ? AlertCircle : CheckCircle;
  const theme = colors[type];

  return (
    <Portal>
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 400 }}>
      <div className="glass-card w-full max-w-md p-6 relative">
        <button onClick={onCancel} className="absolute top-4 right-4 btn-icon" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg flex-shrink-0" style={{ background: theme.bg }}>
            <Icon size={24} style={{ color: theme.icon }} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-main)' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm} 
            className="btn-primary"
            disabled={loading}
            style={{ 
              background: theme.button,
              borderColor: theme.button,
              color: '#000'
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
