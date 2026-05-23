import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, ShieldCheck, XCircle, BookOpen, FileText, ClipboardList,
  GraduationCap, Calendar, Layers, AlertTriangle, UserCheck, RotateCcw, Flag,
} from 'lucide-react';
import { adminControlApi } from '../api/adminControlApi';
import Portal from '../../../components/Portal';
import type { CourseForReview, CourseDetails } from '../types';

interface Props {
  course: CourseForReview;
  onClose: () => void;
  onApprove: (id: number, notes?: string) => Promise<void>;
  onReject: (id: number, notes: string) => Promise<void>;
  onResetToReview: (id: number) => Promise<void>;
  onReport: (id: number, reason: string) => Promise<void>;
}

export default function CourseReviewModal({ course, onClose, onApprove, onReject, onResetToReview, onReport }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dateLocale = isRtl ? 'ar-SA' : 'en-US';

  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [notes, setNotes] = useState(course.review_notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    setDetailsLoading(true);
    adminControlApi.getCourseDetails(course.id)
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setDetailsLoading(false));
  }, [course.id]);

  const handleApprove = async () => {
    setSubmitting(true);
    try { await onApprove(course.id, notes.trim() || undefined); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!notes.trim()) { setNotesError(isRtl ? 'سبب الرفض مطلوب' : 'Rejection reason is required'); return; }
    setNotesError('');
    setSubmitting(true);
    try { await onReject(course.id, notes.trim()); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleResetToReview = async () => {
    setSubmitting(true);
    try { await onResetToReview(course.id); onClose(); }
    finally { setSubmitting(false); }
  };

  const handleSubmitReport = async () => {
    if (reportReason.trim().length < 20) { setReportError(isRtl ? 'يجب أن يكون السبب على الأقل 20 حرفاً' : 'Report reason must be at least 20 characters'); return; }
    setReportSubmitting(true);
    setReportError('');
    try { await onReport(course.id, reportReason.trim()); setReportMode(false); setReportReason(''); }
    catch { setReportError(isRtl ? 'فشل الإبلاغ. حاول مرة أخرى' : 'Failed to submit report. Try again.'); }
    finally { setReportSubmitting(false); }
  };

  const isAlreadyDecided = course.approval_status !== 'pending';
  const statusLabel = course.approval_status === 'approved'
    ? (isRtl ? 'مقبول' : 'Approved')
    : (isRtl ? 'مرفوض' : 'Rejected');

  return (
    <Portal><div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 400 }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <BookOpen size={22} style={{ color: '#6366f1' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{course.title}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{course.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Course meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: <GraduationCap size={14} />, label: isRtl ? 'المعلم' : 'Teacher', value: course.teacher?.full_name ?? '—', color: '#a78bfa' },
              { icon: <Calendar size={14} />, label: isRtl ? 'تاريخ التقديم' : 'Submitted', value: new Date(course.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' }), color: '#38bdf8' },
              { icon: <Layers size={14} />, label: isRtl ? 'القسم' : 'Department', value: course.department ?? '—', color: '#fb923c' },
              { icon: <FileText size={14} />, label: isRtl ? 'الساعات' : 'Credits', value: course.credits != null ? String(course.credits) : '—', color: '#34d399' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color: item.color }} className="shrink-0">{item.icon}</span>
                <div className="overflow-hidden">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'الوصف' : 'Description'}</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>{course.description}</p>
            </div>
          )}

          {/* Materials */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <FileText size={13} className="shrink-0" /> {isRtl ? 'المواد' : 'Materials'} ({details?.materials.length ?? course.materials_count})
            </h4>
            {detailsLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />)}
              </div>
            ) : details?.materials.length ? (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {details.materials.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 px-4 py-2.5 text-sm"
                    style={{ borderBottom: idx < details.materials.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span style={{ color: 'var(--text-main)' }} className="truncate">{m.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs self-start sm:self-auto shrink-0" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>{isRtl && m.type === 'video' ? 'فيديو' : isRtl && m.type === 'link' ? 'رابط' : isRtl && m.type === 'pdf' ? 'ملف' : m.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لا توجد مواد' : 'No materials attached'}</p>
            )}
          </div>

          {/* Exams */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <ClipboardList size={13} className="shrink-0" /> {isRtl ? 'الامتحانات' : 'Exams'} ({details?.exams.length ?? course.exams_count})
            </h4>
            {detailsLoading ? (
              <div className="space-y-2">
                {[1].map(i => <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />)}
              </div>
            ) : details?.exams.length ? (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {details.exams.map((e, idx) => (
                  <div
                    key={e.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 px-4 py-2.5 text-sm"
                    style={{ borderBottom: idx < details.exams.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span style={{ color: 'var(--text-main)' }} className="truncate">{e.title}</span>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{isRtl ? `${e.total_questions} سؤال • ${e.duration_minutes} دقيقة` : `${e.total_questions} Qs • ${e.duration_minutes} min`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{isRtl ? 'لا توجد امتحانات' : 'No exams attached'}</p>
            )}
          </div>

          {/* Already decided banner */}
          {isAlreadyDecided && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <AlertTriangle size={16} style={{ color: '#fbbf24' }} className="shrink-0" />
              <span className="text-sm" style={{ color: '#fbbf24' }}>
                {isRtl ? `تم اتخاذ القرار بالفعل: ${statusLabel}` : `Already decided: ${statusLabel}`}
              </span>
            </div>
          )}

          {/* Reviewer info */}
          {isAlreadyDecided && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: course.approval_status === 'approved' ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)', border: `1px solid ${course.approval_status === 'approved' ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}` }}>
              <UserCheck size={15} style={{ color: course.approval_status === 'approved' ? '#34d399' : '#fb7185', flexShrink: 0 }} />
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: course.approval_status === 'approved' ? '#34d399' : '#fb7185', fontWeight: 600 }} className="me-1">
                  {statusLabel}
                </span>
                {isRtl ? 'بواسطة' : 'by'}
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }} className="ms-1">
                  {course.reviewer?.full_name ?? course.reviewer?.email ?? 'Admin'}
                </span>
                {course.reviewed_at && (
                  <span style={{ color: 'var(--text-muted)' }} className="whitespace-nowrap">
                    {' · '}{new Date(course.reviewed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              {isRtl ? 'ملاحظات' : 'Notes'} {isAlreadyDecided ? '' : (isRtl ? '(مطلوبة للرفض)' : '(Required for rejection)')}
            </label>
            <textarea
              dir="auto"
              value={notes}
              onChange={e => { setNotes(e.target.value); if (notesError) setNotesError(''); }}
              rows={3}
              placeholder={isRtl ? 'اكتب سبب الرفض أو ملاحظات عامة حول الدورة...' : 'Write rejection reason or general notes about the course...'}
              className="text-start transition-colors w-full"
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

        {/* File Report section */}
        {reportMode && (
          <div className="px-6 pb-4 space-y-2">
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.2)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#fb7185' }}>{isRtl ? 'إبلاغ عن محتوى الدورة' : 'Report Course Content'}</p>
              <textarea
                dir="auto"
                value={reportReason}
                onChange={e => { setReportReason(e.target.value); if (reportError) setReportError(''); }}
                rows={3}
                placeholder={isRtl ? 'وصف سبب الإبلاغ بالتفصيل...' : 'Describe why this course violates policies...'}
                className="w-full text-start transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: reportError ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-main)', padding: '8px 12px', fontSize: 13, resize: 'vertical', outline: 'none' }}
              />
              {reportError && <p className="text-xs" style={{ color: '#fb7185' }}>{reportError}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setReportMode(false); setReportReason(''); setReportError(''); }} className="px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSubmitReport} disabled={reportSubmitting || reportReason.trim().length < 20} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}>
                  <Flag size={11} />{reportSubmitting ? (isRtl ? 'جاري الإبلاغ...' : 'Filing...') : (isRtl ? 'تأكيد الإبلاغ' : 'File Report')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => { setReportMode(m => !m); setReportReason(''); setReportError(''); }}
            className="flex-shrink-0 inline-flex justify-center sm:justify-start items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-white/10 order-2 sm:order-1"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
            title={isRtl ? 'الإبلاغ كغير لائق' : 'Report as inappropriate'}
          >
            <Flag size={13} style={{ color: '#fb7185' }} /> {isRtl ? 'إبلاغ' : 'Report'}
          </button>

          <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 order-1 sm:order-2">
            <button onClick={onClose} disabled={submitting} className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10 order-last sm:order-first" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            {isAlreadyDecided ? (
              <button onClick={handleResetToReview} disabled={submitting} className="flex-shrink-0 inline-flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                <RotateCcw size={15} />{submitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'إعادة للمراجعة' : 'Return to Review')}
              </button>
            ) : (
              <>
                <button onClick={handleReject} disabled={submitting} className="flex-shrink-0 inline-flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}>
                  <XCircle size={15} />{submitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'رفض مع ملاحظات' : 'Reject with Feedback')}
                </button>
                <button onClick={handleApprove} disabled={submitting} className="flex-shrink-0 inline-flex justify-center sm:justify-start items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <ShieldCheck size={15} />{submitting ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'موافقة' : 'Approve')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div></Portal>
  );
}
