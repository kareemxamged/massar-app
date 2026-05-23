/**
 * AI Question Generator Types
 * Types for AI-powered question generation from documents
 */

export interface GeneratedQuestion {
    text: string;
    type: 'mcq' | 'true_false' | 'essay' | 'short_answer';
    options?: string[];
    correct_answer: string;
    explanation?: string;
    marks: number;
}

export interface AIGenerationConfig {
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    types: ('mcq' | 'true_false' | 'essay' | 'short_answer')[];
    courseId?: number;
    language: 'ar' | 'en';
}

export interface DocumentSource {
    type: 'upload' | 'course_material';
    file?: File;
    materialId?: number;
    materialIds?: number[]; // For multiple materials
    materialUrl?: string;
    materialUrls?: string[]; // For multiple materials
    title: string;
}

export interface AIProcessingState {
    status: 'idle' | 'uploading' | 'extracting' | 'generating' | 'complete' | 'error';
    progress: number;
    message: string;
    questions?: GeneratedQuestion[];
    error?: string;
    provider?: string;
}
