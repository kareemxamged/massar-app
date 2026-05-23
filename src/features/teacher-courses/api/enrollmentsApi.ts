import { supabase } from '../../../services/supabase';
import { Database } from '../../../types/supabase';

export type EnrolledStudent = {
    id: string;
    student_id: string | null;
    enrolled_at: string | null;
    enrollment_type: Database['public']['Enums']['enrollment_type'];
    status: Database['public']['Enums']['enrollment_status'] | null;
    academic_level: string | null;
    specialty: string | null;
    profiles: {
        id: string;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
        student_profiles: {
            student_code: string | null;
            academic_levels: { name: string | null } | null;
            majors: { name: string | null } | null;
        } | null;
    } | null;
};

export type StudentProfile = {
    id: string;
    full_name: string | null;
    email: string | null;
    student_id: string | null;
    avatar_url: string | null;
    level: string | null;
    major: string | null;
};

export const enrollmentsApi = {
    /** Fetch all students enrolled in a course (with profile details) */
    async getEnrolledStudents(courseId: number): Promise<EnrolledStudent[]> {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
        id,
        student_id,
        enrolled_at,
        enrollment_type,
        status,
        academic_level,
        specialty,
        profiles:student_id (
          id,
          full_name,
          email,
          avatar_url,
          student_profiles (
            student_code,
            academic_levels ( name ),
            majors ( name )
          )
        )
      `)
            .eq('course_id', courseId)
            .order('enrolled_at', { ascending: false });

        if (error) throw error;
        return (data ?? []) as unknown as EnrolledStudent[];
    },

    /** Search students by name or student code (not yet enrolled in this course) */
    async searchStudents(query: string, courseId: number): Promise<StudentProfile[]> {
        const { data: enrolled } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);

        const enrolledIds = (enrolled ?? []).map((e) => e.student_id).filter(Boolean) as string[];

        // Resolve any student_profiles rows whose student_code matches the query
        const { data: codeMatches } = await supabase
            .from('student_profiles')
            .select('id')
            .ilike('student_code', `%${query}%`)
            .limit(10);
        const codeMatchIds = (codeMatches ?? []).map((r) => r.id);

        // Build combined filter: name OR student_code match
        let q = supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, student_profiles(student_code, academic_levels(name), majors(name))')
            .eq('role', 'student');

        if (codeMatchIds.length > 0) {
            q = q.or(`full_name.ilike.%${query}%,id.in.(${codeMatchIds.join(',')})`);
        } else {
            q = q.ilike('full_name', `%${query}%`);
        }

        q = q.limit(10);

        if (enrolledIds.length > 0) {
            q = q.not('id', 'in', `(${enrolledIds.join(',')})`);
        }

        const { data, error } = await q;
        if (error) throw error;
        return (data ?? []).map((p: any) => {
            const sp = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;
            return {
                id: p.id,
                full_name: p.full_name,
                email: p.email,
                student_id: sp?.student_code ?? null,
                avatar_url: p.avatar_url,
                level: sp?.academic_levels?.name ?? null,
                major: sp?.majors?.name ?? null,
            };
        }) as StudentProfile[];
    },

    /** Enroll a single student (individual) */
    async enrollStudent(courseId: number, studentId: string): Promise<void> {
        const { error } = await supabase.from('enrollments').insert({
            course_id: courseId,
            student_id: studentId,
            enrollment_type: 'individual',
            status: 'enrolled',
        });
        if (error) throw error;
    },

    /** Bulk enroll all students matching a level and/or major (group) */
    async enrollGroup(
        courseId: number,
        filters: { level?: string; major?: string }
    ): Promise<number> {
        let spQuery = supabase.from('student_profiles').select('id');

        if (filters.level) {
            const { data: lvl } = await supabase
                .from('academic_levels')
                .select('id')
                .eq('name', filters.level)
                .maybeSingle();
            if (lvl) spQuery = spQuery.eq('level_id', lvl.id);
            else return 0;
        }

        if (filters.major) {
            const { data: maj } = await supabase
                .from('majors')
                .select('id')
                .eq('name', filters.major)
                .maybeSingle();
            if (maj) spQuery = spQuery.eq('major_id', maj.id);
            else return 0;
        }

        const { data: students, error: fetchError } = await spQuery;
        if (fetchError) throw fetchError;
        if (!students || students.length === 0) return 0;

        const { data: existing } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);

        const existingIds = new Set((existing ?? []).map((e) => e.student_id));

        const toInsert = students
            .filter((s) => !existingIds.has(s.id))
            .map((s) => ({
                course_id: courseId,
                student_id: s.id,
                enrollment_type: 'group' as const,
                status: 'enrolled' as const,
                academic_level: filters.level ?? null,
                specialty: filters.major ?? null,
            }));

        if (toInsert.length === 0) return 0;

        const { error } = await supabase.from('enrollments').insert(toInsert);
        if (error) throw error;
        return toInsert.length;
    },

    /** Remove a student from a course */
    async removeEnrollment(enrollmentId: string): Promise<void> {
        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentId);
        if (error) throw error;
    },
};
