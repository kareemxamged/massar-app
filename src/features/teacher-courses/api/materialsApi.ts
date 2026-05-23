import { supabase } from '../../../services/supabase';

export type MaterialType = 'pdf' | 'video' | 'link';

export interface CourseMaterial {
    id: string;
    course_id: number;
    title: string;
    type: MaterialType;
    url: string;
    week: number | null;
    created_at: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    review_notes: string | null;
}

export interface CourseExam {
    id: number;
    course_id: number | null;
    title: string;
    subject: string;
    duration_minutes: number;
    status: 'upcoming' | 'ongoing' | 'finished' | null;
    total_questions: number | null;
    total_marks: number | null;
    start_time: string | null;
}

export const materialsApi = {
    /**
     * Fetch all materials (files & links) for a specific course
     */
    async getMaterials(courseId: number): Promise<CourseMaterial[]> {
        const { data, error } = await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CourseMaterial[];
    },

    /**
     * Upload a file (PDF or Video) to Supabase Storage and insert a record
     */
    async uploadMaterial(
        courseId: number,
        file: File,
        type: 'pdf' | 'video',
        title: string
    ): Promise<CourseMaterial> {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${courseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `materials/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('course-assets')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Add record to course_materials table
        const { data: publicUrlData } = supabase.storage
            .from('course-assets')
            .getPublicUrl(filePath);

        const { data, error: insertError } = await supabase
            .from('course_materials')
            .insert({
                course_id: courseId,
                title,
                type,
                url: publicUrlData.publicUrl,
                approval_status: 'pending',
            })
            .select()
            .single();

        if (insertError) throw insertError;
        return data as CourseMaterial;
    },

    /**
     * Add an external link material
     */
    async addLink(courseId: number, title: string, url: string): Promise<CourseMaterial> {
        const { data, error } = await supabase
            .from('course_materials')
            .insert({
                course_id: courseId,
                title,
                type: 'link',
                url,
                approval_status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;
        return data as CourseMaterial;
    },

    /**
     * Delete a material (also removes from storage if it's a file)
     */
    async deleteMaterial(id: string, type: MaterialType, url: string): Promise<void> {
        // 1. If it's a file, extract path and remove from storage
        if (type === 'pdf' || type === 'video') {
            try {
                // Extract 'materials/...' from the public URL
                const urlParts = url.split('/course-assets/');
                if (urlParts.length === 2) {
                    const filePath = urlParts[1].split('?')[0]; // Remove query params if any
                    if (filePath) {
                        await supabase.storage.from('course-assets').remove([filePath]);
                    }
                }
            } catch (err) {
                console.error('Failed to remove file from storage:', err);
                // Continue to delete the DB record even if storage deletion fails
            }
        }

        // 2. Delete database record
        const { error } = await supabase.from('course_materials').delete().eq('id', id);
        if (error) throw error;
    },

    /**
     * Fetch all exams specific to a course
     */
    async getCourseExams(courseId: number): Promise<CourseExam[]> {
        const { data, error } = await supabase
            .from('exams')
            .select('id, course_id, title, subject, duration_minutes, status, total_questions, total_marks, start_time')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CourseExam[];
    }
};
