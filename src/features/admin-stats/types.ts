export interface UserStats {
  total_students: number;
  total_teachers: number;
  new_users_week: number;
  new_users_month: number;
}

export interface ContentStats {
  courses_approved: number;
  courses_pending: number;
  courses_total: number;
  total_exams: number;
  total_materials: number;
  total_enrollments: number;
  total_submissions: number;
  completed_submissions: number;
  audit_24h: number;
}

export interface RegistrationPoint {
  day: string;
  users: number;
}

export interface CourseDistPoint {
  name: string;
  value: number;
}

export interface ActivityEntry {
  id: string;
  action_type: string;
  entity_affected: string;
  created_at: string;
  admin_name: string | null;
}

export interface DashboardData {
  users: UserStats;
  content: ContentStats;
  registrationTrend: RegistrationPoint[];
  courseDistribution: CourseDistPoint[];
  recentActivity: ActivityEntry[];
}
