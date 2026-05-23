import { Edit, Trash2, Copy, BarChart2, Eye, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isExamEditable } from '../utils';
import type { Exam } from '../../../services/examService';
import styles from './ExamActions.module.css';

interface ExamActionsProps {
  exam: Exam;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSubmissions: () => void;
  onQuickView: () => void;
}

export function ExamActions({
  exam,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
  onSubmissions,
  onQuickView,
}: ExamActionsProps) {
  const { t, i18n } = useTranslation('exams');
  const isRtl = i18n.language.startsWith('ar');

  const labels = {
    en: {
      editOnlyUpcoming: t('manageExams.editOnlyUpcoming'),
      actEdit: t('manageExams.actions.edit'),
      actSubmissions: t('manageExams.actions.submissions'),
      actQuickView: t('manageExams.actions.quickView'),
      actDuplicate: t('manageExams.actions.duplicate'),
      actDelete: t('manageExams.actions.delete'),
    },
    ar: {
      editOnlyUpcoming: 'يمكن التعديل على الامتحانات القادمة فقط',
      actEdit: 'تعديل',
      actSubmissions: 'النتائج',
      actQuickView: 'عرض سريع',
      actDuplicate: 'تكرار',
      actDelete: 'حذف',
    }
  };
  const txt = isRtl ? labels.ar : labels.en;

  const canEdit = isExamEditable(exam);

  return (
    <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
      <button className={styles.actionBtn} onClick={onToggle}>
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div
          className={`${styles.dropdownMenu} ${isRtl ? styles.dropdownMenuRtl : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.dropdownItem}
            disabled={!canEdit}
            title={!canEdit ? txt.editOnlyUpcoming : ''}
            style={{ opacity: !canEdit ? 0.5 : 1, cursor: !canEdit ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              if (canEdit) {
                onEdit();
              }
            }}
          >
            {isRtl ? (
              <>{txt.actEdit}<Edit size={14} /></>
            ) : (
              <><Edit size={14} />{txt.actEdit}</>
            )}
          </button>

          <button className={styles.dropdownItem} onClick={onSubmissions} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRtl ? (
              <>{txt.actSubmissions}<BarChart2 size={14} /></>
            ) : (
              <><BarChart2 size={14} />{txt.actSubmissions}</>
            )}
          </button>

          <button className={styles.dropdownItem} onClick={onQuickView} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRtl ? (
              <>{txt.actQuickView}<Eye size={14} /></>
            ) : (
              <><Eye size={14} />{txt.actQuickView}</>
            )}
          </button>

          <div className={styles.dropdownDivider} />

          <button className={styles.dropdownItem} onClick={onDuplicate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRtl ? (
              <>{txt.actDuplicate}<Copy size={14} /></>
            ) : (
              <><Copy size={14} />{txt.actDuplicate}</>
            )}
          </button>

          <button className={`${styles.dropdownItem} ${styles.dangerText}`} onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRtl ? (
              <>{txt.actDelete}<Trash2 size={14} /></>
            ) : (
              <><Trash2 size={14} />{txt.actDelete}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
