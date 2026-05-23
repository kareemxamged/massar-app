// Feature: Teacher Exams - Full Arabic RTL Support
export {
  ExamList,
  ExamCard,
  ExamStatusBadge,
  ExamFilters,
  ExamActions,
  type StatusFilter,
  type SortOrder,
} from './components';

export {
  useTeacherExams,
  usePrefetchTeacherExams,
  useExamSubmissions,
  useSubmissionStats,
  type SubmissionWithStudent,
} from './api';

export type {
  ExamWithSubmissions,
  ExamStats,
  ExamDerivedStatus,
  TeacherExamFilters,
  ExamQuickViewData,
} from './types';

export {
  getExamDerivedStatus,
  translateStatusLabel,
  getApprovalBadgeStyle,
  isExamEditable,
} from './utils';
