export type TabId = 'overview' | 'exams' | 'grades' | 'materials';

export interface CourseData {
    id: number;
    name: string;
    code: string;
    description?: string;
    instructor?: string;
    department?: string;
    credits?: number;
    semester?: string;
    performance?: { grade: number; attendance: number; participation: number };
    exams?: ExamItem[];
}

export interface ExamItem {
    id: number;
    title: string;
    start_time: string;
    duration_minutes: number;
    total_questions: number;
    total_marks: number;
    status: string;
    user_status?: string;
    user_score?: number;
}

export interface Material {
    id: number;
    title: string;
    description?: string;
    type: 'pdf' | 'video' | 'slides' | 'link' | 'code';
    url?: string;
    file_size?: string;
    duration?: string;
    week?: number;
}
