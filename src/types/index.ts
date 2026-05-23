export type AppRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url?: string;
    role: AppRole;
    status: 'active' | 'suspended';
    created_at: string;
    updated_at: string;
    date_of_birth?: string;
    student_id?: string;
    major_id?: number;
    major?: string;
    level_id?: number;
    level?: string;
    gpa?: number;
    // Teacher fields
    employee_id?: string;
    department?: string;
    specialization?: string;
    mobile?: string;
    headline?: string;
    bio?: string;
    academic_degree?: string;
    years_experience?: number;
}

export interface Major {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface AcademicLevel {
  id: number;
  name: string;
  code: string;
  display_order: number;
  created_at: string;
}

export interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    error: Error | null;
}
