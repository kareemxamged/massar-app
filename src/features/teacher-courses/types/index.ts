import { Database } from '../../../types/supabase';

export type CourseVisibility = Database['public']['Enums']['course_visibility'];

export type CourseApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Course {
    id: number; // Keep bigint returned as number from supabase types
    teacher_id: string | null;
    title: string;
    description: string | null;
    visibility: CourseVisibility;
    approval_status: CourseApprovalStatus;
    review_notes: string | null;
    created_at: string | null;
    updated_at: string;
    // Preserve existing fields that might be used elsewhere
    code: string;
    credits: number | null;
    department: string | null;
    instructor: string | null;
    semester: string | null;
    student_count?: number;
    materials_count?: number;
}

export interface CourseFormData {
    title: string;
    description?: string;
    visibility: CourseVisibility;
    code: string;
    instructor?: string;
    department?: string;
    semester?: string;
    credits?: number;
}
