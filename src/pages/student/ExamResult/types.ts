export interface QuestionTypePerformance {
    type: 'MCQ' | 'True/False' | 'Essay' | 'Code';
    total: number;
    correct: number;
    score: number;
    totalScore: number;
    performance: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' | 'Pending Review';
}

export interface ExamResultData {
    id: number;
    examTitle: string;
    studentScore: number;
    totalScore: number;
    percentage: number;
    isPassed: boolean;

    // Stats
    correctAnswers: number;
    wrongAnswers: number;
    skippedAnswers: number;
    timeSpent: string; // e.g., "45 mins"
    rank: string; // e.g., "3/50"

    // Performance Breakdown
    breakdown: QuestionTypePerformance[];

    // Tutor Feedback
    tutorName: string;
    tutorNote: string;
    strengths: string[];
    weaknesses: string[];

    // Comparison Chart Data (Mock distribution)
    classAverage: number;
    percentile: number;

    // Config
    allowRetry: boolean;
}
