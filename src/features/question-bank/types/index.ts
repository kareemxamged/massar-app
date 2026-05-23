export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

export interface Question {
    id: string;
    teacher_id: string;
    course_id: number | null;
    content: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    options: QuestionOption[] | null;
    correct_answer: string | null;
    explanation: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
    course?: {
        id: number;
        title: string;
        code: string;
    } | null;
}

export interface CreateQuestionRequest {
    course_id?: number;
    content: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    options?: QuestionOption[];
    correct_answer?: string;
    explanation?: string;
    tags?: string[];
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
    id: string;
}

export interface QuestionFilters {
    search?: string;
    course_id?: number;
    type?: QuestionType;
    difficulty?: DifficultyLevel;
    tags?: string[];
}

export const questionTypeLabels: Record<QuestionType, string> = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True/False',
    essay: 'Subjective / Essay'
};

export const difficultyLabels: Record<DifficultyLevel, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
};

export const difficultyColors: Record<DifficultyLevel, string> = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444'
};
