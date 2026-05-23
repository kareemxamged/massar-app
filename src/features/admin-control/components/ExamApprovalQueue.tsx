import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList, CheckCircle, XCircle, Clock, FileSearch,
  GraduationCap, BookOpen, ChevronDown, X, ShieldCheck, AlertTriangle, UserCheck, RotateCcw,
} from 'lucide-react';
import Portal from '../../../components/Portal';
import type { ExamForReview, CourseApprovalStatus } from '../types';

interface Props {
  exams: ExamForReview[];
  loading: boolean;
  filter: CourseApprovalStatus | undefined;
  onFilterChange: (f: CourseApprovalStatus | undefined) => void;
  onApprove: (id: number, notes?: string) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
  onResetToReview: (id: number) => Promise<void>;
}

interface ReviewPanelProps {
  exam: ExamForReview;
  onApprove: (id: number, notes?: string) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
  onResetToReview: (id: number) => Promise<void>;
  onClose: () => void;
}

function ExamReviewPanel({ exam, onApprove, onReject, onResetToReview, onClose }: ReviewPanelProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';
  const [notes, setNotes] = useState(exam.review_notes ?? '');
  const [notesError, setNotesError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isAlreadyDecided = exam.approval_status !== 'pending';

  const handleApprove = async () => {
    setSubmitting(true);
    try { await onApprove(exam.id, notes.trim() || undefined); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!notes.trim()) { setNotesError(isRtl ? 'سبب الرفض مطلوب' : 'Rejection reason is required'); return; }
    setNotesError('');
    setSubmitting(true);
    try { await onReject(exam.id, notes.trim()); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleResetToReview = async () => {
    setSubmitting(true);
    try { await onResetToReview(exam.id); onClose(); }
    finally { setSubmitting(false); }
  };

  const statusLabel = exam.approval_status === 'approved'
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
              <ClipboardList size={20} style={{ color: '#6366f1' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{exam.title}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{exam.subject}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: isRtl ? 'المعلم' : 'Teacher', value: exam.teacher?.full_name ?? '—', color: '#a78bfa', icon: <GraduationCap size={13} /> },
              { label: isRtl ? 'الدورة' : 'Course', value: exam.course?.title ?? (isRtl ? 'بدون دورة' : 'No Course'), color: '#38bdf8', icon: <BookOpen size={13} /> },
              { label: isRtl ? 'عدد الأسئلة' : 'Questions', value: String(exam.total_questions ?? 0), color: '#34d399', icon: <ClipboardList size={13} /> },
              { label: isRtl ? 'المدة' : 'Duration', value: `${exam.duration_minutes} ${isRtl ? 'دقيقة' : 'min'}`, color: '#f59e0b', icon: <Clock size={13} /> },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color: item.color }} className="shrink-0">{item.icon}</span>
                <div className="overflow-hidden">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-main)', maxWidth: 120 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

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
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: exam.approval_status === 'approved' ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)', border: `1px solid ${exam.approval_status === 'approved' ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}` }}>
              <UserCheck size={14} style={{ color: exam.approval_status === 'approved' ? '#34d399' : '#fb7185', flexShrink: 0 }} />
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: exam.approval_status === 'approved' ? '#34d399' : '#fb7185', fontWeight: 600 }} className="me-1">
                  {statusLabel}
                </span>
                {isRtl ? 'بواسطة' : 'by'}
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }} className="ms-1">
                  {exam.reviewer?.full_name ?? exam.reviewer?.email ?? 'Admin'}
                </span>
                {exam.reviewed_at && (
                  <span style={{ color: 'var(--text-muted)' }} className="whitespace-nowrap">
                    {' · '}{new Date(exam.reviewed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

export default function ExamApprovalQueue({ exams, loading, filter, onFilterChange, onApprove, onReject, onResetToReview }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';
  const [reviewExam, setReviewExam] = useState<ExamForReview | null>(null);

  const STATUS_BADGE: Record<CourseApprovalStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    pending: { label: isRtl ? 'بانتظار المراجعة' : 'Pending', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', icon: <Clock size={12} /> },
    approved: { label: isRtl ? 'مقبول' : 'Approved', bg: 'rgba(52,211,153,0.15)', color: '#34d399', icon: <CheckCircle size={12} /> },
    rejected: { label: isRtl ? 'مرفوض' : 'Rejected', bg: 'rgba(251,113,133,0.15)', color: '#fb7185', icon: <XCircle size={12} /> },
  };

  const pendingCount = exams.filter(e => e.approval_status === 'pending').length;
  const approvedCount = exams.filter(e => e.approval_status === 'approved').length;
  const rejectedCount = exams.filter(e => e.approval_status === 'rejected').length;

  const stats = [
    { label: isRtl ? 'بانتظار المراجعة' : 'Pending Review', value: pendingCount, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: <Clock size={16} /> },
    { label: isRtl ? 'موافقة' : 'Approved', value: approvedCount, color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: <CheckCircle size={16} /> },
    { label: isRtl ? 'مرفوض' : 'Rejected', value: rejectedCount, color: '#fb7185', bg: 'rgba(251,113,133,0.12)', icon: <XCircle size={16} /> },
  ];

  const headers = [
    isRtl ? 'الامتحان' : 'Exam',
    isRtl ? 'المعلم' : 'Teacher',
    isRtl ? 'الدورة' : 'Course',
    isRtl ? 'الأسئلة' : 'Questions',
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
            {isRtl ? `طلب المراجعة (${exams.length})` : `Exam Queue (${exams.length})`}
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
        ) : exams.length === 0 ? (
          <div className="py-14 text-center">
            <FileSearch size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لا توجد امتحانات لمراجعتها' : 'No exams to review'}</p>
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
                {exams.map((exam, idx) => {
                  const badge = STATUS_BADGE[exam.approval_status];
                  return (
                    <tr key={exam.id} style={{ borderBottom: idx < exams.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }} className="hover:bg-white/5">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                            <ClipboardList size={16} style={{ color: '#6366f1' }} />
                          </div>
                          <div>
                            <div className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{exam.title}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{exam.subject}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={13} style={{ color: '#a78bfa' }} className="shrink-0" />
                          <span className="text-sm" style={{ color: 'var(--text-main)' }}>{exam.teacher?.full_name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {exam.course ? (
                          <span className="flex items-center gap-1.5"><BookOpen size={12} className="shrink-0" />{exam.course.title}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {isRtl ? `${exam.total_questions ?? 0} سؤال • ${exam.duration_minutes} دقيقة` : `${exam.total_questions ?? 0} Qs • ${exam.duration_minutes} min`}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {exam.created_at ? new Date(exam.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: badge.bg, color: badge.color }}>
                          {badge.icon}{badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {exam.reviewer ? (
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={12} style={{ color: exam.approval_status === 'approved' ? '#34d399' : '#fb7185', flexShrink: 0 }} />
                            <div>
                              <div className="text-xs font-medium" style={{ color: 'var(--text-main)' }}>{exam.reviewer.full_name ?? exam.reviewer.email}</div>
                              {exam.reviewed_at && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(exam.reviewed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}</div>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-end whitespace-nowrap">
                        <button
                          onClick={() => setReviewExam(exam)}
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

      {reviewExam && (
        <ExamReviewPanel
          exam={reviewExam}
          onApprove={onApprove}
          onReject={onReject}
          onResetToReview={onResetToReview}
          onClose={() => setReviewExam(null)}
        />
      )}
    </div>
  );
}
