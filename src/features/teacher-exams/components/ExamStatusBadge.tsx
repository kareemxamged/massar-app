import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getExamDerivedStatus, getApprovalBadgeStyle, translateStatusLabel } from '../utils';
import type { Exam } from '../../../services/examService';
import styles from './ExamStatusBadge.module.css';

interface ExamStatusBadgeProps {
  exam: Exam;
  showApproval?: boolean;
}

export function ExamStatusBadge({ exam, showApproval = true }: ExamStatusBadgeProps) {
  const { t, i18n } = useTranslation('exams');
  const isRtl = i18n.language.startsWith('ar');

  const statusInfo = getExamDerivedStatus(exam);
  const approvalStatus = (exam as any).approval_status as string ?? 'approved';
  const tFn = (key: string, defaultValue?: string) => t(key, defaultValue ?? key);

  const approvalStyle = getApprovalBadgeStyle(approvalStatus);

  const translateStatusArabic = (label: string) => {
    switch (label) {
      case 'Always Available': return 'متاح دائماً';
      case 'Active': return 'نشط';
      case 'Upcoming': return 'قادم';
      case 'Disabled': return 'معطل';
      case 'Expired': return 'منتهي';
      case 'Draft': return 'مسودة';
      default: return translateStatusLabel(label, tFn);
    }
  };

  const labels = {
    en: {
      approval: t(`manageExams.approval.${approvalStatus}`, approvalStatus),
      rejectionReason: t('manageExams.rejectionReason'),
    },
    ar: {
      approval: approvalStatus === 'approved' ? 'موافق عليه' : approvalStatus === 'rejected' ? 'مرفوض' : 'قيد الانتظار',
      rejectionReason: 'سبب الرفض',
    }
  };
  const txt = isRtl ? labels.ar : labels.en;

  return (
    <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
      <span
        className={styles.badge}
        style={{
          color: statusInfo.color,
          backgroundColor: statusInfo.bg,
          borderColor: `${statusInfo.color}30`,
        }}
      >
        {isRtl ? translateStatusArabic(statusInfo.label) : translateStatusLabel(statusInfo.label, tFn)}
      </span>

      {showApproval && (
        <span
          className={styles.badge}
          style={{
            color: approvalStyle.color,
            backgroundColor: approvalStyle.bg,
            borderColor: `${approvalStyle.color}30`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {approvalStatus === 'approved' && <CheckCircle size={10} />}
          {approvalStatus === 'rejected' && <XCircle size={10} />}
          {approvalStatus === 'pending' && <Clock size={10} />}
          {txt.approval}
        </span>
      )}

      {approvalStatus === 'rejected' && exam.review_notes && (
        <div className={styles.rejectionNote}>
          <strong>{txt.rejectionReason}:</strong> {exam.review_notes}
        </div>
      )}
    </div>
  );
}
