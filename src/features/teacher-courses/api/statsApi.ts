import { supabase } from '../../../services/supabase';

export interface CourseStats {
    totalStudents: number;
    totalMaterials: number;
    totalExams: number;
    averageScore?: number;
}

export interface StudentPerformance {
    studentId: string;
    studentName: string;
    examId: number;
    examTitle: string;
    score: number;
    maxScore: number;
    status: string;
    submittedAt: string;
}

export const statsApi = {
    /**
     * Fetch aggregate stats for a course
     */
    async getCourseStats(courseId: number): Promise<CourseStats> {
        // 1. Get total students
        const { count: studentCount, error: studentError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);
        if (studentError) throw studentError;

        // 2. Get total materials
        const { count: materialCount, error: materialError } = await supabase
            .from('course_materials')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);
        if (materialError) throw materialError;

        // 3. Get total exams
        const { data: exams, count: examCount, error: examError } = await supabase
            .from('exams')
            .select('id', { count: 'exact' })
            .eq('course_id', courseId);
        if (examError) throw examError;

        let averageScore: number | undefined = undefined;

        // 4. Calculate average score if exams exist
        if (exams && exams.length > 0) {
            const examIds = exams.map((e) => e.id);
            const { data: submissions, error: subError } = await supabase
                .from('submissions')
                .select('score, exam_id')
                .in('exam_id', examIds)
                .eq('status', 'submitted');

            if (subError) throw subError;

            if (submissions && submissions.length > 0) {
                // Fetch exams to get total marks for percentages
                const { data: examDetails } = await supabase
                    .from('exams')
                    .select('id, total_marks')
                    .in('id', examIds);

                if (examDetails) {
                    const examMaxMarks = new Map(examDetails.map(e => [e.id, e.total_marks || 100]));

                    let totalPercentage = 0;
                    let validSubmissions = 0;

                    submissions.forEach(sub => {
                        if (sub.score !== null) {
                            const max = examMaxMarks.get(sub.exam_id) || 100;
                            totalPercentage += (sub.score / max) * 100;
                            validSubmissions++;
                        }
                    });

                    if (validSubmissions > 0) {
                        averageScore = Math.round(totalPercentage / validSubmissions);
                    }
                }
            }
        }

        return {
            totalStudents: studentCount || 0,
            totalMaterials: materialCount || 0,
            totalExams: examCount || 0,
            averageScore,
        };
    },

    /**
     * Fetch a list of student submissions for a course's exams
     */
    async getStudentPerformance(courseId: number): Promise<StudentPerformance[]> {
        // 1. Get exams for this course
        const { data: exams, error: examError } = await supabase
            .from('exams')
            .select('id, title, total_marks')
            .eq('course_id', courseId);

        if (examError) throw examError;
        if (!exams || exams.length === 0) return [];

        const examMap = new Map(exams.map(e => [e.id, { title: e.title, total_marks: e.total_marks }]));
        const examIds = exams.map((e) => e.id);

        // 2. Get submissions for these exams
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select(`
        student_id,
        exam_id,
        score,
        status,
        submitted_at,
        profiles (
          full_name
        )
      `)
            .in('exam_id', examIds)
            .order('submitted_at', { ascending: false });

        if (subError) throw subError;

        // 3. Format the results
        return (submissions || []).map((sub: any) => {
            const examData = examMap.get(sub.exam_id);
            return {
                studentId: sub.student_id,
                studentName: sub.profiles?.full_name || 'Unknown Student',
                examId: sub.exam_id,
                examTitle: examData?.title || 'Unknown Exam',
                score: sub.score || 0,
                maxScore: examData?.total_marks || 100,
                status: sub.status,
                submittedAt: sub.submitted_at,
            };
        });
    }
};
