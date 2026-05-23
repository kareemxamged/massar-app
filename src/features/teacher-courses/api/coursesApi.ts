import { supabase } from '../../../services/supabase';
import { Course, CourseFormData } from '../types';

export const coursesApi = {
    async getCourses(teacherId: string): Promise<Course[]> {
        // Fetch courses
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!courses) return [];

        // Fetch counts for each course
        const coursesWithCounts = await Promise.all(
            courses.map(async (course) => {
                // Get student count from enrollments
                const { count: studentCount, error: studentError } = await supabase
                    .from('enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('course_id', course.id);

                // Get materials count
                const { count: materialsCount, error: materialsError } = await supabase
                    .from('course_materials')
                    .select('*', { count: 'exact', head: true })
                    .eq('course_id', course.id);

                if (studentError) console.error('Error fetching student count:', studentError);
                if (materialsError) console.error('Error fetching materials count:', materialsError);

                return {
                    ...course,
                    student_count: studentCount || 0,
                    materials_count: materialsCount || 0
                };
            })
        );

        return coursesWithCounts as Course[];
    },

    async createCourse(teacherId: string, courseData: CourseFormData): Promise<Course> {
        const { data, error } = await supabase
            .from('courses')
            .insert({
                teacher_id: teacherId,
                title: courseData.title,
                description: courseData.description || null,
                visibility: courseData.visibility,
                code: courseData.code,
                instructor: courseData.instructor || null,
                department: courseData.department || null,
                semester: courseData.semester || null,
                credits: courseData.credits || null
            })
            .select()
            .single();

        if (error) throw error;
        return data as Course;
    },

    async updateCourse(courseId: number, courseData: Partial<CourseFormData>): Promise<Course> {
        const updatePayload: any = { ...courseData };

        const { data, error } = await supabase
            .from('courses')
            .update(updatePayload)
            .eq('id', courseId)
            .select()
            .single();

        if (error) throw error;
        return data as Course;
    },

    async deleteCourse(courseId: number): Promise<void> {
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);

        if (error) throw error;
    }
};
