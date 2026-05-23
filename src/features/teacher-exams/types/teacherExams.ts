import { Exam as BaseExam } from '../../../services/examService';

export interface ExamWithSubmissions extends BaseExam {
  submissions_count: number;
  course_name?: string;
}

export interface ExamStats {
  totalQuestions: number;
  submissionsCount: number;
  averageScore?: number;
}

export interface ExamDerivedStatus {
  label: 'AlwaysAvailable' | 'Active' | 'Upcoming' | 'Expired' | 'Disabled';
  color: string;
  bg: string;
}

export interface TeacherExamFilters {
  searchQuery: string;
  statusFilter: 'All' | 'Always Available' | 'Active' | 'Upcoming' | 'Expired' | 'Disabled';
  courseFilter: string | 'All';
}

export interface ExamQuickViewData {
  id: number;
  title: string;
  courseName?: string;
  totalQuestions: number;
  submissionsCount: number;
  startTime?: string;
  endTime?: string;
  status: ExamDerivedStatus;
}
