export type QuestionType = 'mcq' | 'true_false' | 'essay' | 'code';

export interface BaseQuestion {
    id: number;
    text: string;
    type: QuestionType;
    marks: number;
}

export interface MCQQuestion extends BaseQuestion {
    type: 'mcq';
    options: string[];
    correctAnswer?: string; // Optional for student view, present in backend
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: 'true_false';
    correctAnswer?: boolean;
}

export interface EssayQuestion extends BaseQuestion {
    type: 'essay';
    wordLimit?: number;
}

export interface CodeQuestion extends BaseQuestion {
    type: 'code';
    language: string;
    initialCode?: string;
}

export type Question = MCQQuestion | TrueFalseQuestion | EssayQuestion | CodeQuestion;

export interface Exam {
    id: string;
    title: string;
    end_time?: string;
    durationMinutes: number;
    totalQuestions: number;
    questions: Question[];
}

// Student's Progress State
export interface ExamProgress {
    answers: Record<number, string | boolean>; // questionId -> answer
    flags: Record<number, boolean>;
    currentQuestionIndex: number;
    timeLeft: number; // in seconds
    isComplete: boolean;
}
