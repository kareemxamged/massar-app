import { Clock, Globe, Users, FileQuestion, Edit, BarChart2, Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExamStatusBadge } from './ExamStatusBadge';
import { isExamEditable, getExamDerivedStatus } from '../utils';
import type { ExamWithSubmissions } from '../types';
import styles from './ExamCard.module.css';

interface ExamCardProps {
  exam: ExamWithSubmissions;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSubmissions: () => void;
}

export function ExamCard({
  exam,
  onEdit,
  onDelete,
  onDuplicate,
  onSubmissions,
}: ExamCardProps) {
  const { t, i18n } = useTranslation('exams');
  const isRtl = i18n.language.startsWith('ar');

  const labels = {
    en: {
      mins: t('manageExams.table.mins'),
      evergreen: t('manageExams.evergreen'),
      questions: t('manageExams.table.questions'),
      submissions: t('manageExams.stats.submissions'),
      actSubmissions: t('manageExams.actions.submissions'),
      actEdit: t('manageExams.actions.edit'),
      actDuplicate: t('manageExams.actions.duplicate'),
      actDelete: t('manageExams.actions.delete'),
      editOnlyUpcoming: t('manageExams.editOnlyUpcoming'),
      awaitingApproval: t('manageExams.awaitingApproval'),
      published: t('manageExams.toggles.published'),
      shuffleQs: t('manageExams.toggles.shuffleQs'),
    },
    ar: {
      mins: 'دقيقة',
      evergreen: 'متاح دائماً',
      questions: 'أسئلة',
      submissions: 'إجابة',
      actSubmissions: 'النتائج',
      actEdit: 'تعديل',
      actDuplicate: 'تكرار',
      actDelete: 'حذف',
      editOnlyUpcoming: 'يمكن التعديل على الامتحانات القادمة فقط',
      awaitingApproval: 'بانتظار الموافقة',
      published: 'نشر',
      shuffleQs: 'أسئلة عشوائية',
    }
  };
  const txt = isRtl ? labels.ar : labels.en;

  const statusInfo = getExamDerivedStatus(exam);
  const isPub = exam.is_published ?? true;
  const isApproved = ((exam as any).approval_status ?? 'approved') === 'approved';
  const canEdit = isExamEditable(exam);

  return (
    <div className={`${styles.card} ${!isPub ? styles.disabledCard : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{exam.title}</h3>
          <p className={styles.course}>{exam.course_name || exam.subject}</p>
          <ExamStatusBadge exam={exam} />
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <Clock size={16} />
          <span>
            {exam.duration_minutes} {txt.mins}
          </span>
        </div>

        <div className={styles.detailItem}>
          <Globe size={16} />
          <span>
            {exam.start_time
              ? new Date(exam.start_time).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')
              : txt.evergreen}
          </span>
        </div>

        <div className={styles.detailItem}>
          <FileQuestion size={16} />
          <span>
            <strong>{exam.total_questions}</strong> {txt.questions}
          </span>
        </div>

        <div className={styles.detailItem}>
          <Users size={16} />
          <span>
            <strong>{exam.submissions_count}</strong> {txt.submissions}
          </span>
        </div>
      </div>

      {/* Inline Action Buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.primaryBtn}`}
          onClick={onSubmissions}
          title={txt.actSubmissions}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isRtl ? (
            <>{txt.actSubmissions} <BarChart2 size={14} /></>
          ) : (
            <><BarChart2 size={14} /> {txt.actSubmissions}</>
          )}
        </button>

        <button
          className={`${styles.actionBtn} ${!canEdit ? styles.disabledBtn : ''}`}
          onClick={onEdit}
          disabled={!canEdit}
          title={!canEdit ? txt.editOnlyUpcoming : txt.actEdit}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isRtl ? (
            <>{txt.actEdit} <Edit size={14} /></>
          ) : (
            <><Edit size={14} /> {txt.actEdit}</>
          )}
        </button>

        <button
          className={styles.actionBtn}
          onClick={onDuplicate}
          title={txt.actDuplicate}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isRtl ? (
            <>{txt.actDuplicate} <Copy size={14} /></>
          ) : (
            <><Copy size={14} /> {txt.actDuplicate}</>
          )}
        </button>

        <button
          className={`${styles.actionBtn} ${styles.dangerBtn}`}
          onClick={onDelete}
          title={txt.actDelete}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isRtl ? (
            <>{txt.actDelete} <Trash2 size={14} /></>
          ) : (
            <><Trash2 size={14} /> {txt.actDelete}</>
          )}
        </button>
      </div>

      <div className={styles.settings}>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel} title={!isApproved ? txt.awaitingApproval : undefined}>
            {txt.published}
          </span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isPub}
              disabled={statusInfo.label === 'Expired' || !isApproved}
              onChange={() => { }}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>{txt.shuffleQs}</span>
          <label className={styles.switch}>
            <input type="checkbox" checked={exam.is_randomized} disabled={statusInfo.label === 'Expired'} onChange={() => { }} />
            <span className={styles.slider} />
          </label>
        </div>
      </div>
    </div>
  );
}
