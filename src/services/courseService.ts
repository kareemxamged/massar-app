
import { supabase } from './supabase';
import { Database } from '../types/supabase';

export type Course = Database['public']['Tables']['courses']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export interface EnrolledCourse extends Course {
    enrollment_status: 'enrolled' | 'completed' | 'dropped';
    progress: number; // calculated from completed exams
    exams_taken: number;
    total_exams: number;
    average_score: number;
    upcoming_exams: {
        id: number;
        title: string;
        date: string;
    }[];
}

export const courseService = {
    async getEnrolledCourses(): Promise<EnrolledCourse[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Fetch Enrollments with Course and Exam Data
        const response = await supabase
            .from('enrollments')
            .select(`
                status,
                courses (
                    *,
                    exams (
                        id,
                        title,
                        start_time,
                        status,
                        total_marks,
                        submissions (
                            id,
                            score,
                            status,
                            student_id
                        )
                    )
                )
            `)
            .eq('student_id', user.id);

        let enrollments = response.data;
        const error = response.error;

        if (error) {
            console.error("Error fetching enrollments:", error);
            throw error;
        }

        // 2. Auto-enroll if empty (for Demo/Real Data guarantee)
        if (!enrollments || enrollments.length === 0) {
            console.log("No enrollments found. Auto-enrolling user...");
            await this.seedEnrollments(user.id);
            // Retry fetch
            const retry = await supabase
                .from('enrollments')
                .select(`
                    status,
                    courses (
                        *,
                        exams (
                            id,
                            title,
                            start_time,
                            status,
                            total_marks,
                            submissions (
                                id,
                                score,
                                status,
                                student_id
                            )
                        )
                    )
                `)
                .eq('student_id', user.id);
            enrollments = retry.data || [];
        }

        // 3. Transform Data — only show approved + active courses to students
        const validEnrollments = enrollments.filter((enrol: any) =>
            enrol.courses !== null &&
            enrol.courses.approval_status === 'approved' &&
            enrol.courses.visibility === 'active'
        );

        return validEnrollments.map((enrol: any) => {
            const course = enrol.courses;
            const exams = course.exams || [];

            // Filter submissions for CURRENT USER only
            const userExams = exams.map((exam: any) => {
                const sub = exam.submissions?.find((s: any) => s.student_id === user.id);
                return {
                    ...exam,
                    submission: sub
                };
            });

            const completedExams = userExams.filter((e: any) => e.submission?.status === 'submitted');
            const totalExams = userExams.length;

            const totalScore = completedExams.reduce((acc: number, curr: any) => acc + (curr.submission?.score || 0), 0);
            const totalPossible = completedExams.reduce((acc: number, curr: any) => acc + (curr.total_marks || 100), 0); // Default 100 if null

            // Avoid division by zero
            const average = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
            const progress = totalExams > 0 ? Math.round((completedExams.length / totalExams) * 100) : 0;

            const upcoming = userExams
                .filter((e: any) => !e.submission && new Date(e.start_time) > new Date())
                .map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    date: new Date(e.start_time).toLocaleDateString()
                }));

            return {
                ...course,
                enrollment_status: enrol.status,
                progress,
                exams_taken: completedExams.length,
                total_exams: totalExams,
                average_score: average,
                upcoming_exams: upcoming
            };
        });
    },

    async getCourseDetails(courseId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Fetch Course + Exams + Submissions
        const { data: course, error } = await supabase
            .from('courses')
            .select(`
                *,
                exams (
                    *,
                    submissions (
                        status,
                        score,
                        student_id,
                        submitted_at
                    )
                )
            `)
            .eq('id', courseId)
            .single();

        if (error) throw error;

        // Process Exams to attach specific user status
        const exams = course.exams?.map((exam: any) => {
            const submission = exam.submissions?.find((s: any) => s.student_id === user.id);
            return {
                ...exam,
                user_status: submission?.status || 'pending',
                user_score: submission?.score,
                submitted_at: submission?.submitted_at
            };
        }) || [];

        // Calculate Performance
        const submittedExams = exams.filter((e: any) => e.user_status === 'submitted');

        // Mock Performance Logic for Attendance/Participation (since we don't track it yet)
        const performance = {
            grade: submittedExams.length > 0
                ? Math.round(submittedExams.reduce((acc: number, e: any) => acc + (e.user_score || 0), 0) / submittedExams.length) // Avg raw score for now
                : 100, // Default to 100 if new
            attendance: 95, // Mock
            participation: 90 // Mock
        };

        return {
            ...course,
            exams,
            performance
        };
    },

    async getMaterials(courseId: string) {
        const { data, error } = await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .eq('approval_status', 'approved')
            .order('week', { ascending: true })
            .order('id', { ascending: true });

        if (error) {
            console.error("Error fetching materials:", error);
            return [];
        }
        return data || [];
    },

    async seedEnrollments(userId: string) {
        const { data: courses } = await supabase.from('courses').select('id');
        if (courses && courses.length > 0) {
            const inserts = courses.map(c => ({
                student_id: userId,
                course_id: c.id,
                status: 'enrolled'
            }));
            await supabase.from('enrollments').insert(inserts);
        }
    }
};
