export type CourseApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface CourseForReview {
  id: number;
  code: string;
  title: string;
  description: string | null;
  department: string | null;
  semester: string | null;
  credits: number | null;
  visibility: 'active' | 'hidden' | 'disabled';
  approval_status: CourseApprovalStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer: { full_name: string; email: string } | null;
  created_at: string;
  updated_at: string;
  teacher_id: string | null;
  teacher: { full_name: string; email: string } | null;
  materials_count: number;
  exams_count: number;
}

export interface CourseDetails extends CourseForReview {
  materials: CourseMaterial[];
  exams: CourseExam[];
}

export interface CourseMaterial {
  id: number;
  title: string;
  type: string;
  url: string | null;
  week: number | null;
}

export interface CourseExam {
  id: number;
  title: string;
  status: string;
  total_questions: number;
  duration_minutes: number;
}

export interface Specialty {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpecialtyInput {
  name: string;
  code: string;
  description: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  course_id: number;
  reason: string;
  status: 'open' | 'resolved';
  created_at: string;
  reporter: { full_name: string; email: string } | null;
  course: { title: string; code: string } | null;
}

export interface ExamForReview {
  id: number;
  title: string;
  subject: string;
  description: string | null;
  duration_minutes: number;
  total_questions: number | null;
  total_marks: number | null;
  approval_status: CourseApprovalStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer: { full_name: string; email: string } | null;
  is_published: boolean | null;
  created_at: string | null;
  teacher_id: string | null;
  course_id: number | null;
  teacher: { full_name: string; email: string } | null;
  course: { title: string; code: string } | null;
}

export interface MaterialForReview {
  id: number;
  title: string;
  type: string;
  url: string | null;
  week: number | null;
  approval_status: CourseApprovalStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer: { full_name: string; email: string } | null;
  created_at: string | null;
  course_id: number;
  course: { title: string; code: string } | null;
  teacher: { full_name: string; email: string } | null;
}

export interface AdminContentToast {
  type: 'success' | 'error';
  message: string;
}
