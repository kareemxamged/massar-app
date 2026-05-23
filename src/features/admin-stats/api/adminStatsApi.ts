import { getServiceClient } from '../../../services/supabase';
import type { DashboardData, RegistrationPoint, CourseDistPoint, ActivityEntry } from '../types';

const svc = getServiceClient();

function buildTrend(rows: { created_at: string }[]): RegistrationPoint[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = r.created_at.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const result: RegistrationPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: counts.get(key) ?? 0,
    });
  }
  return result;
}

function buildDist(rows: { department: string | null }[]): CourseDistPoint[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const dept = r.department?.trim() || 'Uncategorised';
    counts.set(dept, (counts.get(dept) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const cutoff24h  = new Date(Date.now() - 24  * 60 * 60 * 1000).toISOString();
  const cutoff30d  = new Date(Date.now() - 30  * 24 * 60 * 60 * 1000).toISOString();
  const cutoff7d   = new Date(Date.now() -  7  * 24 * 60 * 60 * 1000).toISOString();

  const [
    profilesRes,
    coursesRes,
    examsRes,
    materialsRes,
    enrollmentsRes,
    submissionsAllRes,
    submissionsDoneRes,
    audit24hRes,
    auditRecentRes,
  ] = await Promise.all([
    svc.from('profiles').select('id, role, created_at'),
    svc.from('courses').select('approval_status, department'),
    svc.from('exams').select('*', { count: 'exact', head: true }),
    svc.from('course_materials').select('*', { count: 'exact', head: true }),
    svc.from('enrollments').select('*', { count: 'exact', head: true }),
    svc.from('submissions').select('*', { count: 'exact', head: true }),
    svc.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    svc.from('audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', cutoff24h),
    svc.from('audit_logs')
      .select('id, action_type, entity_affected, created_at, admin_id')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  // Build user stats
  const allProfiles = profilesRes.data ?? [];
  const users = {
    total_students:  allProfiles.filter(p => p.role === 'student').length,
    total_teachers:  allProfiles.filter(p => p.role === 'teacher').length,
    new_users_week:  allProfiles.filter(p => p.created_at >= cutoff7d).length,
    new_users_month: allProfiles.filter(p => p.created_at >= cutoff30d).length,
  };

  // Build content stats
  const allCourses = coursesRes.data ?? [];
  const content = {
    courses_approved:      allCourses.filter(c => c.approval_status === 'approved').length,
    courses_pending:       allCourses.filter(c => c.approval_status === 'pending').length,
    courses_total:         allCourses.length,
    total_exams:           examsRes.count ?? 0,
    total_materials:       materialsRes.count ?? 0,
    total_enrollments:     enrollmentsRes.count ?? 0,
    total_submissions:     submissionsAllRes.count ?? 0,
    completed_submissions: submissionsDoneRes.count ?? 0,
    audit_24h:             audit24hRes.count ?? 0,
  };

  // Registration trend (30 days)
  const trendProfiles = allProfiles.filter(p => p.created_at >= cutoff30d);
  const registrationTrend = buildTrend(trendProfiles);

  // Course distribution by department (approved only)
  const approvedCourses = allCourses.filter(c => c.approval_status === 'approved');
  const courseDistribution = buildDist(approvedCourses as { department: string | null }[]);

  // Recent activity — resolve admin names
  const auditRows = auditRecentRes.data ?? [];
  const adminIds = [...new Set(auditRows.map(r => r.admin_id).filter(Boolean))] as string[];
  const adminMap = new Map<string, string>();
  if (adminIds.length > 0) {
    const { data: admins } = await svc
      .from('profiles')
      .select('id, full_name')
      .in('id', adminIds);
    for (const a of admins ?? []) adminMap.set(a.id, a.full_name ?? 'Unknown');
  }
  const recentActivity: ActivityEntry[] = auditRows.map(r => ({
    id:               r.id as string,
    action_type:      r.action_type as string,
    entity_affected:  r.entity_affected as string,
    created_at:       r.created_at as string,
    admin_name:       adminMap.get(r.admin_id as string) ?? null,
  }));

  return { users, content, registrationTrend, courseDistribution, recentActivity };
}
