import { supabase } from './supabase';

export interface InstructorMetrics {
    totalCourses: number;
    activeStudents: number;
    examsPublished: number;
    totalSubmissions: number;
}

export const instructorService = {
    async getMetrics(instructorId: string): Promise<InstructorMetrics> {
        try {
            // 1. Get courses managed by this instructor
            const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('id')
                .eq('teacher_id', instructorId);

            if (coursesError) throw coursesError;

            const courseIds = courses?.map(c => c.id) || [];
            const totalCourses = courseIds.length;

            let activeStudents = 0;
            let examsPublished = 0;
            let totalSubmissions = 0;

            if (totalCourses > 0) {
                // 2. Get active students in these courses
                const { data: enrollments, error: uniqueStudentsError } = await supabase
                    .from('enrollments')
                    .select('student_id')
                    .in('course_id', courseIds)
                    .eq('status', 'enrolled');

                if (uniqueStudentsError) throw uniqueStudentsError;

                const uniqueStudentIds = new Set(enrollments?.map(e => e.student_id));
                activeStudents = uniqueStudentIds.size;

                // 3. Get exams and their IDs
                const { data: exams, error: examsError } = await supabase
                    .from('exams')
                    .select('id')
                    .in('course_id', courseIds);

                if (examsError) throw examsError;
                const examIds = exams?.map(e => e.id) || [];
                examsPublished = examIds.length;

                // 4. Get total submissions for those exams
                if (examIds.length > 0) {
                    const { count: subsCount, error: subsError } = await supabase
                        .from('submissions')
                        .select('id', { count: 'exact', head: true })
                        .in('exam_id', examIds);

                    if (!subsError) {
                        totalSubmissions = subsCount || 0;
                    }
                }
            }

            return {
                totalCourses,
                activeStudents,
                examsPublished,
                totalSubmissions
            };

        } catch (error) {
            console.error('Error fetching instructor metrics:', error);
            return {
                totalCourses: 0,
                activeStudents: 0,
                examsPublished: 0,
                totalSubmissions: 0
            };
        }
    }
};
