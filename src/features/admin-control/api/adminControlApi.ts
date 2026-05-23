import { getServiceClient } from '../../../services/supabase';
import type {
  CourseApprovalStatus,
  CourseForReview,
  CourseDetails,
  ExamForReview,
  MaterialForReview,
  Specialty,
  SpecialtyInput,
  ContentReport,
} from '../types';

const svc = getServiceClient();

async function _sendContentNotification(
  adminId: string,
  teacherId: string,
  type: 'course' | 'exam' | 'material',
  contentTitle: string,
  decision: 'approved' | 'rejected',
  notes?: string,
): Promise<void> {
  const isApproved = decision === 'approved';
  const actionKeyPart = isApproved ? 'Approved' : 'Rejected';

  const title = JSON.stringify({
    key: `notifications.system.${type}${actionKeyPart}Title`,
    params: { contentTitle }
  });

  const message = JSON.stringify({
    key: `notifications.system.${type}${actionKeyPart}Msg`,
    params: isApproved ? { contentTitle } : { contentTitle, notes: notes ?? '' }
  });

  const { data: notif, error } = await svc
    .from('notifications')
    .insert({ sender_id: adminId, target_type: 'individual', target_id: teacherId, title, message } as Record<string, unknown>)
    .select('id')
    .single();
  if (error) { console.error('content notification failed:', error); return; }
  await svc
    .from('notification_recipients')
    .insert({ notification_id: (notif as Record<string, unknown>).id, student_id: teacherId } as Record<string, unknown>);
}


export const adminControlApi = {
  // ─── Course Approval ───────────────────────────────────────────────────────

  async getCourseQueue(status?: CourseApprovalStatus): Promise<CourseForReview[]> {
    let query = svc
      .from('courses')
      .select(`
        id, code, title, description, department, semester, credits,
        visibility, approval_status, review_notes, reviewed_by, reviewed_at,
        created_at, updated_at, teacher_id,
        teacher:profiles!courses_teacher_id_fkey(full_name, email),
        reviewer:profiles!courses_reviewed_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('approval_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const ids = (data ?? []).map(c => c.id as number);

    const [materialsRes, examsRes] = await Promise.all([
      svc.from('course_materials').select('course_id').in('course_id', ids.length ? ids : [0]),
      svc.from('exams').select('course_id').in('course_id', ids.length ? ids : [0]),
    ]);

    const matCount: Record<number, number> = {};
    const examCount: Record<number, number> = {};
    (materialsRes.data ?? []).forEach(m => { matCount[m.course_id] = (matCount[m.course_id] ?? 0) + 1; });
    (examsRes.data ?? []).forEach(e => { examCount[e.course_id] = (examCount[e.course_id] ?? 0) + 1; });

    return (data ?? []).map(c => ({
      ...c,
      teacher: Array.isArray(c.teacher) ? (c.teacher[0] ?? null) : (c.teacher as { full_name: string; email: string } | null),
      reviewer: Array.isArray(c.reviewer) ? (c.reviewer[0] ?? null) : (c.reviewer as { full_name: string; email: string } | null),
      materials_count: matCount[c.id as number] ?? 0,
      exams_count: examCount[c.id as number] ?? 0,
    })) as CourseForReview[];
  },

  async getCourseDetails(courseId: number): Promise<CourseDetails> {
    const { data: course, error } = await svc
      .from('courses')
      .select(`
        id, code, title, description, department, semester, credits,
        visibility, approval_status, review_notes, created_at, updated_at, teacher_id,
        teacher:profiles!courses_teacher_id_fkey(full_name, email)
      `)
      .eq('id', courseId)
      .single();
    if (error) throw error;

    const [matRes, examRes] = await Promise.all([
      svc.from('course_materials').select('id, title, type, url, week').eq('course_id', courseId),
      svc.from('exams').select('id, title, status, total_questions, duration_minutes').eq('course_id', courseId),
    ]);

    const teacher = Array.isArray(course.teacher)
      ? (course.teacher[0] ?? null)
      : (course.teacher as { full_name: string; email: string } | null);

    return {
      ...course,
      teacher,
      materials_count: matRes.data?.length ?? 0,
      exams_count: examRes.data?.length ?? 0,
      materials: (matRes.data ?? []) as CourseDetails['materials'],
      exams: (examRes.data ?? []) as CourseDetails['exams'],
    } as CourseDetails;
  },

  async resetCourseToReview(courseId: number): Promise<void> {
    const { error } = await svc
      .from('courses')
      .update({ approval_status: 'pending', review_notes: null, reviewed_by: null, reviewed_at: null, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', courseId);
    if (error) throw error;
  },

  async approveCourse(courseId: number, adminId: string, notes?: string): Promise<void> {
    const { error } = await svc
      .from('courses')
      .update({ approval_status: 'approved', review_notes: notes ?? null, reviewed_by: adminId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', courseId);
    if (error) throw error;
    const { data: c } = await svc.from('courses').select('teacher_id, title').eq('id', courseId).single();
    if (c?.teacher_id) await _sendContentNotification(adminId, c.teacher_id, 'course', c.title, 'approved', notes);
  },

  async rejectCourse(courseId: number, adminId: string, notes: string): Promise<void> {
    const { error } = await svc
      .from('courses')
      .update({ approval_status: 'rejected', review_notes: notes, reviewed_by: adminId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', courseId);
    if (error) throw error;
    const { data: c } = await svc.from('courses').select('teacher_id, title').eq('id', courseId).single();
    if (c?.teacher_id) await _sendContentNotification(adminId, c.teacher_id, 'course', c.title, 'rejected', notes);
  },

  // ─── Exam Approval ────────────────────────────────────────────────────────

  async getExamQueue(status?: CourseApprovalStatus): Promise<ExamForReview[]> {
    let query = svc
      .from('exams')
      .select(`
        id, title, subject, description, duration_minutes, total_questions, total_marks,
        approval_status, review_notes, reviewed_by, reviewed_at,
        is_published, created_at, teacher_id, course_id,
        teacher:profiles!exams_teacher_id_fkey(full_name, email),
        course:courses!exams_course_id_fkey(title, code),
        reviewer:profiles!exams_reviewed_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('approval_status', status);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map(e => ({
      ...e,
      teacher: Array.isArray(e.teacher) ? (e.teacher[0] ?? null) : (e.teacher as ExamForReview['teacher']),
      course: Array.isArray(e.course) ? (e.course[0] ?? null) : (e.course as ExamForReview['course']),
      reviewer: Array.isArray(e.reviewer) ? (e.reviewer[0] ?? null) : (e.reviewer as ExamForReview['reviewer']),
    })) as ExamForReview[];
  },

  async resetExamToReview(examId: number): Promise<void> {
    const { error } = await svc
      .from('exams')
      .update({ approval_status: 'pending', review_notes: null, reviewed_by: null, reviewed_at: null, is_published: false } as Record<string, unknown>)
      .eq('id', examId);
    if (error) throw error;
  },

  async approveExam(examId: number, adminId: string, notes?: string): Promise<void> {
    const { error } = await svc
      .from('exams')
      .update({ approval_status: 'approved', review_notes: notes ?? null, reviewed_by: adminId, reviewed_at: new Date().toISOString(), is_published: true } as Record<string, unknown>)
      .eq('id', examId);
    if (error) throw error;
    const { data: e } = await svc.from('exams').select('teacher_id, title').eq('id', examId).single();
    if (e?.teacher_id) await _sendContentNotification(adminId, e.teacher_id, 'exam', e.title, 'approved', notes);
  },

  async rejectExam(examId: number, adminId: string, notes: string): Promise<void> {
    const { error } = await svc
      .from('exams')
      .update({ approval_status: 'rejected', review_notes: notes, reviewed_by: adminId, reviewed_at: new Date().toISOString(), is_published: false } as Record<string, unknown>)
      .eq('id', examId);
    if (error) throw error;
    const { data: e } = await svc.from('exams').select('teacher_id, title').eq('id', examId).single();
    if (e?.teacher_id) await _sendContentNotification(adminId, e.teacher_id, 'exam', e.title, 'rejected', notes);
  },

  // ─── Material Approval ────────────────────────────────────────────────────

  async getMaterialQueue(status?: CourseApprovalStatus): Promise<MaterialForReview[]> {
    let query = svc
      .from('course_materials')
      .select(`
        id, title, type, url, week, approval_status, review_notes,
        reviewed_by, reviewed_at, created_at, course_id,
        course:courses!course_materials_course_id_fkey(title, code, teacher_id,
          teacher:profiles!courses_teacher_id_fkey(full_name, email)
        ),
        reviewer:profiles!course_materials_reviewed_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('approval_status', status);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map(m => {
      const courseRaw = Array.isArray(m.course) ? (m.course[0] ?? null) : (m.course as any);
      const teacher = courseRaw
        ? (Array.isArray(courseRaw.teacher) ? (courseRaw.teacher[0] ?? null) : courseRaw.teacher)
        : null;
      return {
        ...m,
        course: courseRaw ? { title: courseRaw.title, code: courseRaw.code } : null,
        teacher: teacher as MaterialForReview['teacher'],
        reviewer: Array.isArray(m.reviewer) ? (m.reviewer[0] ?? null) : (m.reviewer as MaterialForReview['reviewer']),
      };
    }) as MaterialForReview[];
  },

  async resetMaterialToReview(materialId: number): Promise<void> {
    const { error } = await svc
      .from('course_materials')
      .update({ approval_status: 'pending', review_notes: null, reviewed_by: null, reviewed_at: null } as Record<string, unknown>)
      .eq('id', materialId);
    if (error) throw error;
  },

  async approveMaterial(materialId: number, adminId: string, notes?: string): Promise<void> {
    const { error } = await svc
      .from('course_materials')
      .update({ approval_status: 'approved', review_notes: notes ?? null, reviewed_by: adminId, reviewed_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', materialId);
    if (error) throw error;
    const { data: m } = await svc.from('course_materials').select('title, course_id').eq('id', materialId).single();
    if (m?.course_id) {
      const { data: course } = await svc.from('courses').select('teacher_id').eq('id', m.course_id).single();
      if (course?.teacher_id) await _sendContentNotification(adminId, course.teacher_id, 'material', (m as Record<string, unknown>).title as string ?? 'Material', 'approved', notes);
    }
  },

  async rejectMaterial(materialId: number, adminId: string, notes: string): Promise<void> {
    const { error } = await svc
      .from('course_materials')
      .update({ approval_status: 'rejected', review_notes: notes, reviewed_by: adminId, reviewed_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', materialId);
    if (error) throw error;
    const { data: m } = await svc.from('course_materials').select('title, course_id').eq('id', materialId).single();
    if (m?.course_id) {
      const { data: course } = await svc.from('courses').select('teacher_id').eq('id', m.course_id).single();
      if (course?.teacher_id) await _sendContentNotification(adminId, course.teacher_id, 'material', (m as Record<string, unknown>).title as string ?? 'Material', 'rejected', notes);
    }
  },

  // ─── Specialties ──────────────────────────────────────────────────────────

  async getSpecialties(): Promise<Specialty[]> {
    const { data, error } = await svc
      .from('specialties')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data ?? []) as Specialty[];
  },

  async createSpecialty(input: SpecialtyInput): Promise<Specialty> {
    const { data, error } = await svc
      .from('specialties')
      .insert({ name: input.name.trim(), code: input.code.trim() || null, description: input.description.trim() || null })
      .select()
      .single();
    if (error) throw error;
    return data as Specialty;
  },

  async updateSpecialty(id: number, input: SpecialtyInput): Promise<void> {
    const { error } = await svc
      .from('specialties')
      .update({ name: input.name.trim(), code: input.code.trim() || null, description: input.description.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteSpecialty(id: number): Promise<void> {
    const { error } = await svc.from('specialties').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Academic Levels (read + write via service client) ────────────────────

  async getAcademicLevels() {
    const { data, error } = await svc
      .from('academic_levels')
      .select('id, name, code, display_order')
      .order('display_order');
    if (error) throw error;
    return data ?? [];
  },

  async createAcademicLevel(input: { name: string; code: string; display_order: number }) {
    const { data, error } = await svc
      .from('academic_levels')
      .insert({ name: input.name.trim(), code: input.code.trim() || null, display_order: input.display_order })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAcademicLevel(id: number, input: { name: string; code: string; display_order: number }) {
    const { error } = await svc
      .from('academic_levels')
      .update({ name: input.name.trim(), code: input.code.trim() || null, display_order: input.display_order })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteAcademicLevel(id: number): Promise<void> {
    const { error } = await svc.from('academic_levels').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Content Reports ──────────────────────────────────────────────────────

  async getContentReports(status?: 'open' | 'resolved'): Promise<ContentReport[]> {
    let query = svc
      .from('content_reports')
      .select(`
        id, reporter_id, course_id, reason, status, created_at,
        reporter:profiles!content_reports_reporter_id_fkey(full_name, email),
        course:courses!content_reports_course_id_fkey(title, code)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map(r => ({
      ...r,
      reporter: Array.isArray(r.reporter) ? (r.reporter[0] ?? null) : (r.reporter as ContentReport['reporter']),
      course: Array.isArray(r.course) ? (r.course[0] ?? null) : (r.course as ContentReport['course']),
    })) as ContentReport[];
  },

  async resolveReport(reportId: string): Promise<void> {
    const { error } = await svc
      .from('content_reports')
      .update({ status: 'resolved' })
      .eq('id', reportId);
    if (error) throw error;
  },

  async submitCourseReport(courseId: number, reporterId: string, reason: string): Promise<void> {
    const { error } = await svc
      .from('content_reports')
      .insert({ reporter_id: reporterId, course_id: courseId, reason } as Record<string, unknown>);
    if (error) throw error;
  },
};
