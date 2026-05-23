import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, Video, Link as LinkIcon, CheckCircle, XCircle, Clock,
  FileSearch, ChevronDown, X, ShieldCheck, AlertTriangle, UserCheck,
  GraduationCap, BookOpen, RotateCcw,
} from 'lucide-react';
import Portal from '../../../components/Portal';
import type { MaterialForReview, CourseApprovalStatus } from '../types';

interface Props {
  materials: MaterialForReview[];
  loading: boolean;
  filter: CourseApprovalStatus | undefined;
  onFilterChange: (f: CourseApprovalStatus | undefined) => void;
  onApprove: (id: number, notes?: string) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
  onResetToReview: (id: number) => Promise<void>;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={15} style={{ color: '#fb923c' }} />,
  video: <Video size={15} style={{ color: '#a78bfa' }} />,
  link: <LinkIcon size={15} style={{ color: '#38bdf8' }} />,
};

interface ReviewPanelProps {
  material: MaterialForReview;
  onApprove: (id: number, notes?: string) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
  onResetToReview: (id: number) => Promise<void>;
  onClose: () => void;
}

function MaterialReviewPanel({ material, onApprove, onReject, onResetToReview, onClose }: ReviewPanelProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';
  const [notes, setNotes] = useState(material.review_notes ?? '');
  const [notesError, setNotesError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isAlreadyDecided = material.approval_status !== 'pending';

  const handleApprove = async () => {
    setSubmitting(true);
    try { await onApprove(material.id, notes.trim() || undefined); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!notes.trim()) { setNotesError(isRtl ? 'سبب الرفض مطلوب' : 'Rejection reason is required'); return; }
    setNotesError('');
    setSubmitting(true);
    try { await onReject(material.id, notes.trim()); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleResetToReview = async () => {
    setSubmitting(true);
    try { await onResetToReview(material.id); onClose(); }
    finally { setSubmitting(false); }
  };

  const statusLabel = material.approval_status === 'approved'
    ? (isRtl ? 'مقبول' : 'Approved')
    : (isRtl ? 'مرفوض' : 'Rejected');

  return (
    <Portal><div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 400 }}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
              {TYPE_ICON[material.type] ?? <FileText size={20} style={{ color: '#6366f1' }} />}
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{material.title}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{material.type.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: isRtl ? 'المعلم' : 'Teacher', value: material.teacher?.full_name ?? '—', color: '#a78bfa', icon: <GraduationCap size={13} /> },
              { label: isRtl ? 'الدورة' : 'Course', value: material.course?.title ?? (isRtl ? 'بدون دورة' : 'No Course'), color: '#38bdf8', icon: <BookOpen size={13} /> },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color: item.color }} className="shrink-0">{item.icon}</span>
                <div className="overflow-hidden">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-main)', maxWidth: 140 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Link preview */}
          {material.url && (
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#6366f1' }}
            >
              <LinkIcon size={13} />
              <span className="truncate">{material.url}</span>
            </a>
          )}

          {/* Already decided banner */}
          {isAlreadyDecided && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <AlertTriangle size={15} style={{ color: '#fbbf24' }} className="shrink-0" />
              <span className="text-sm" style={{ color: '#fbbf24' }}>
                {isRtl ? `تم اتخاذ القرار بالفعل: ${statusLabel}` : `Already decided: ${statusLabel}`}
              </span>
            </div>
          )}

          {/* Reviewer info */}
          {isAlreadyDecided && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: material.approval_status === 'approved' ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)', border: `1px solid ${material.approval_status === 'approved' ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}` }}>
              <UserCheck size={14} style={{ color: material.approval_status === 'approved' ? '#34d399' : '#fb7185', flexShrink: 0 }} />
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: material.approval_status === 'approved' ? '#34d399' : '#fb7185', fontWeight: 600 }} className="me-1">
                  {statusLabel}
                </span>
                {isRtl ? 'بواسطة' : 'by'}
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }} className="ms-1">
                  {material.reviewer?.full_name ?? material.reviewer?.email ?? 'Admin'}
                </span>
                {material.reviewed_at && (
                  <span style={{ color: 'var(--text-muted)' }} className="whitespace-nowrap">
                    {' · '}{new Date(material.reviewed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              {isRtl ? 'ملاحظات' : 'Notes'} {isAlreadyDecided ? '' : (isRtl ? '(مطلوبة للرفض)' : '(Required for rejection)')}
            </label>
            <textarea
              dir="auto"
              value={notes}
              onChange={e => { setNotes(e.target.value); if (notesError) setNotesError(''); }}
              rows={3}
              placeholder={isRtl ? 'اكتب سبب الرفض أو ملاحظات عامة...' : 'Write rejection reason or general notes...'}
              className="text-start w-full transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: notesError ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: 'var(--text-main)',
                padding: '10px 14px',
                fontSize: 14,
                resize: 'vertical',
                outline: 'none',
              }}
            />
            {notesError && <p className="mt-1 text-xs" style={{ color: '#fb7185' }}>{notesError}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors order-first sm:order-none" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            {isAlreadyDecided ? (
              <button onClick={handleResetToReview} disabled={submitting} className="inline-flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                <RotateCcw size={14} />{submitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'إعادة للمراجعة' : 'Return to Review')}
              </button>
            ) : (
              <>
                <button onClick={handleReject} disabled={submitting} className="inline-flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}>
                  <XCircle size={14} />{submitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'رفض مع ملاحظات' : 'Reject with Feedback')}
                </button>
                <button onClick={handleApprove} disabled={submitting} className="inline-flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <ShieldCheck size={14} />{submitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'موافقة' : 'Approve')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div></Portal>
  );
}

export default function MaterialApprovalQueue({ materials, loading, filter, onFilterChange, onApprove, onReject, onResetToReview }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';
  const [reviewMaterial, setReviewMaterial] = useState<MaterialForReview | null>(null);

  const STATUS_BADGE: Record<CourseApprovalStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    pending: { label: isRtl ? 'بانتظار المراجعة' : 'Pending', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', icon: <Clock size={12} /> },
    approved: { label: isRtl ? 'مقبول' : 'Approved', bg: 'rgba(52,211,153,0.15)', color: '#34d399', icon: <CheckCircle size={12} /> },
    rejected: { label: isRtl ? 'مرفوض' : 'Rejected', bg: 'rgba(251,113,133,0.15)', color: '#fb7185', icon: <XCircle size={12} /> },
  };

  const pendingCount = materials.filter(m => m.approval_status === 'pending').length;
  const approvedCount = materials.filter(m => m.approval_status === 'approved').length;
  const rejectedCount = materials.filter(m => m.approval_status === 'rejected').length;

  const stats = [
    { label: isRtl ? 'بانتظار المراجعة' : 'Pending Review', value: pendingCount, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: <Clock size={16} /> },
    { label: isRtl ? 'موافقة' : 'Approved', value: approvedCount, color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: <CheckCircle size={16} /> },
    { label: isRtl ? 'مرفوض' : 'Rejected', value: rejectedCount, color: '#fb7185', bg: 'rgba(251,113,133,0.12)', icon: <XCircle size={16} /> },
  ];

  const headers = [
    isRtl ? 'المادة' : 'Material',
    isRtl ? 'الدورة' : 'Course',
    isRtl ? 'المعلم' : 'Teacher',
    isRtl ? 'النوع' : 'Type',
    isRtl ? 'تاريخ التقديم' : 'Submitted',
    isRtl ? 'الحالة' : 'Status',
    isRtl ? 'تمت المراجعة من' : 'Reviewed By',
    '',
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
            {isRtl ? `طلب المراجعة (${materials.length})` : `Material Queue (${materials.length})`}
          </h3>
          <div className="relative">
            <select
              value={filter ?? ''}
              onChange={e => onFilterChange((e.target.value as CourseApprovalStatus) || undefined)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-main)', padding: '6px 32px 6px 12px', fontSize: 13, appearance: 'none', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#1e293b' }}>{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="pending" style={{ background: '#1e293b' }}>{isRtl ? 'بانتظار المراجعة' : 'Pending'}</option>
              <option value="approved" style={{ background: '#1e293b' }}>{isRtl ? 'موافقة' : 'Approved'}</option>
              <option value="rejected" style={{ background: '#1e293b' }}>{isRtl ? 'مرفوض' : 'Rejected'}</option>
            </select>
            <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2"><div className="h-4 bg-white/10 rounded w-1/3" /><div className="h-3 bg-white/10 rounded w-1/4" /></div>
                <div className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="py-14 text-center">
            <FileSearch size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لا توجد مواد لمراجعتها' : 'No materials to review'}</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto border border-white/10 rounded-lg m-4 w-[calc(100%-2rem)]">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {headers.map((h, i) => (
                    <th key={i} className={`px-5 py-3 ${i === headers.length - 1 ? 'text-end' : 'text-start'} whitespace-nowrap text-xs font-semibold uppercase tracking-wider`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map((m, idx) => {
                  const badge = STATUS_BADGE[m.approval_status];
                  return (
                    <tr key={m.id} style={{ borderBottom: idx < materials.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }} className="hover:bg-white/5">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                            {TYPE_ICON[m.type] ?? <FileText size={16} style={{ color: '#6366f1' }} />}
                          </div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{m.title}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {m.course ? <span className="flex items-center gap-1.5"><BookOpen size={12} className="shrink-0" />{m.course.title}</span> : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                        <span className="flex items-center gap-1.5"><GraduationCap size={12} style={{ color: '#a78bfa' }} className="shrink-0" />{m.teacher?.full_name ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{isRtl && m.type === 'video' ? 'فيديو' : isRtl && m.type === 'link' ? 'رابط' : isRtl && m.type === 'pdf' ? 'ملف' : m.type}</span>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {m.created_at ? new Date(m.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: badge.bg, color: badge.color }}>
                          {badge.icon}{badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {m.reviewer ? (
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={12} style={{ color: m.approval_status === 'approved' ? '#34d399' : '#fb7185', flexShrink: 0 }} />
                            <div>
                              <div className="text-xs font-medium" style={{ color: 'var(--text-main)' }}>{m.reviewer.full_name ?? m.reviewer.email}</div>
                              {m.reviewed_at && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(m.reviewed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}</div>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-end whitespace-nowrap">
                        <button
                          onClick={() => setReviewMaterial(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
                        >
                          <FileSearch size={13} />{isRtl ? 'مراجعة' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewMaterial && (
        <MaterialReviewPanel
          material={reviewMaterial}
          onApprove={onApprove}
          onReject={onReject}
          onResetToReview={onResetToReview}
          onClose={() => setReviewMaterial(null)}
        />
      )}
    </div>
  );
}
