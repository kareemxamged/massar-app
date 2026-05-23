import { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import Portal from '../../components/Portal';
import { submitCourseReport } from '../../services/reportService';

interface Props {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportCourseModal({ courseId, courseTitle, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (reason.trim().length < 20) {
      setError('Please provide at least 20 characters describing the issue.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitCourseReport(courseId, reason.trim());
      onSuccess();
      onClose();
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', zIndex: 400 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-md rounded-2xl flex flex-col"
          style={{ background: 'var(--bg-panel, #1e293b)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(251,113,133,0.15)' }}>
                <Flag size={18} style={{ color: '#fb7185' }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-main, #f1f5f9)' }}>Report Course</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted, #94a3b8)' }}>{courseTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted, #94a3b8)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <AlertTriangle size={14} style={{ color: '#fbbf24', marginTop: 2, flexShrink: 0 }} />
              <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
                Your report will be reviewed by an admin. Please describe the issue clearly and accurately.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                Reason for Report <span style={{ color: '#fb7185' }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => { setReason(e.target.value); if (error) setError(''); }}
                rows={4}
                placeholder="Describe the issue in detail (e.g. inappropriate content, misleading information, copyright violation...)..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: error ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: 'var(--text-main, #f1f5f9)',
                  padding: '10px 14px',
                  fontSize: 13,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              <div className="flex items-center justify-between mt-1">
                {error
                  ? <p className="text-xs" style={{ color: '#fb7185' }}>{error}</p>
                  : <span />
                }
                <span className="text-xs ml-auto" style={{ color: reason.length < 20 ? '#fb7185' : 'var(--text-muted, #94a3b8)' }}>
                  {reason.length} / 20 min
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: 'var(--text-muted, #94a3b8)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || reason.trim().length < 20}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}
            >
              <Flag size={14} />
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
