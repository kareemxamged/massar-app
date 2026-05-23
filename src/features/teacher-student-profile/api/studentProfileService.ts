import { supabase } from '../../../services/supabase';

export interface StudentProfile {
    id: string;
    full_name: string | null;
    email: string;
    student_code: string | null;
    avatar_url: string | null;
    role: string;
    level: string | null;
    major: string | null;
    mobile: string | null;
    created_at: string;
}

export interface StudentSubmission {
    id: string;
    exam_id: number;
    exam_title: string;
    exam_subject: string | null;
    score: number | null;
    total_marks: number;
    status: 'started' | 'submitted';
    started_at: string;
    submitted_at: string | null;
    percentage: number | null;
}

export interface StudentStats {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    passCount: number;
    failCount: number;
    passRate: number;
}

export const studentProfileService = {
    async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id, full_name, email, avatar_url, role, mobile, created_at,
                student_profiles (
                    student_code,
                    academic_levels ( name ),
                    majors ( name )
                )
            `)
            .eq('id', studentId)
            .eq('role', 'student')
            .single();

        if (error) {
            console.error('Error fetching student profile:', error);
            throw error;
        }

        if (!data) return null;

        const sp = (data as any).student_profiles;
        return {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            avatar_url: data.avatar_url,
            role: data.role,
            mobile: data.mobile,
            created_at: data.created_at,
            student_code: sp?.student_code ?? null,
            level: sp?.academic_levels?.name ?? null,
            major: sp?.majors?.name ?? null,
        };
    },

    async getStudentSubmissions(studentId: string): Promise<StudentSubmission[]> {
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                id,
                exam_id,
                score,
                status,
                started_at,
                submitted_at,
                exams:exam_id (
                    title,
                    subject,
                    total_marks
                )
            `)
            .eq('student_id', studentId)
            .eq('status', 'submitted')
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error('Error fetching student submissions:', error);
            throw error;
        }

        return (data || []).map((sub: any) => {
            const exam = sub.exams;
            const percentage = exam?.total_marks && sub.score !== null
                ? Math.round((sub.score / exam.total_marks) * 100)
                : null;

            return {
                id: sub.id,
                exam_id: sub.exam_id,
                exam_title: exam?.title || 'Unknown Exam',
                exam_subject: exam?.subject || null,
                score: sub.score,
                total_marks: exam?.total_marks || 0,
                status: sub.status,
                started_at: sub.started_at,
                submitted_at: sub.submitted_at,
                percentage
            };
        });
    },

    calculateStats(submissions: StudentSubmission[]): StudentStats {
        const completed = submissions.filter(s => s.status === 'submitted');
        const totalExams = submissions.length;
        const completedExams = completed.length;

        if (completedExams === 0) {
            return {
                totalExams,
                completedExams: 0,
                averageScore: 0,
                passCount: 0,
                failCount: 0,
                passRate: 0
            };
        }

        const scores = completed.map(s => s.percentage || 0);
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const passCount = scores.filter(s => s >= 60).length;
        const failCount = completedExams - passCount;
        const passRate = Math.round((passCount / completedExams) * 100);

        return {
            totalExams,
            completedExams,
            averageScore,
            passCount,
            failCount,
            passRate
        };
    }
};
