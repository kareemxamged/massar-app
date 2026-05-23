export interface QuestionReview {
    id: number | string;
    text: string;
    type: 'mcq' | 'true_false' | 'essay' | 'code' | string;
    marks: number;
    options?: string[];
    correctAnswer?: string;
    userAnswer: any;
    isCorrect?: boolean; // For auto-graded questions
    explanation?: string;
}

export interface ExamReviewData {
    examId: string;
    examTitle: string;
    score: number;
    totalScore: number;
    allow_review?: boolean;
    show_correct_answers?: boolean;
    questions: QuestionReview[];
}
