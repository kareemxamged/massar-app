import type { Exam } from '../../../services/examService';
import type { ExamDerivedStatus } from '../types';

export function getExamDerivedStatus(exam: Exam): ExamDerivedStatus {
  const isPublished = exam.is_published ?? true;
  const now = Date.now();
  const start = exam.start_time ? new Date(exam.start_time).getTime() : null;
  const end = exam.end_time ? new Date(exam.end_time).getTime() : null;

  if (!isPublished) {
    return { label: 'Disabled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  }

  if (exam.status === 'finished' || (end && end < now)) {
    return { label: 'Expired', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
  }

  if (!start) {
    return { label: 'AlwaysAvailable', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
  }

  if (start > now) {
    return { label: 'Upcoming', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' };
  }

  return { label: 'Active', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
}

export function translateStatusLabel(
  label: string,
  t: (key: string, defaultValue?: string) => string
): string {
  const key = label.replace(' ', '') as 'AlwaysAvailable' | 'Active' | 'Upcoming' | 'Expired' | 'Disabled';
  return t(`manageExams.status.${key}`, label);
}

export function getApprovalBadgeStyle(approvalStatus: string): { color: string; bg: string } {
  if (approvalStatus === 'approved') {
    return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' };
  }
  if (approvalStatus === 'rejected') {
    return { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.1)' };
  }
  return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
}

export function isExamEditable(exam: Exam): boolean {
  const status = getExamDerivedStatus(exam);
  return status.label === 'Upcoming';
}
