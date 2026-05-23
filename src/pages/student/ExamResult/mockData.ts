import { ExamResultData } from './types';

export const MOCK_RESULT: ExamResultData = {
    id: 1,
    examTitle: "CS50: Introduction to Computer Science - Final",
    studentScore: 25.5,
    totalScore: 30,
    percentage: 85,
    isPassed: true,

    correctAnswers: 25,
    wrongAnswers: 5,
    skippedAnswers: 0,
    allowRetry: false,
    timeSpent: "45 minutes",
    rank: "3/50",

    breakdown: [
        {
            type: 'MCQ',
            total: 20,
            correct: 18,
            score: 18,
            totalScore: 20,
            performance: 'Excellent'
        },
        {
            type: 'True/False',
            total: 5,
            correct: 4,
            score: 4,
            totalScore: 5,
            performance: 'Very Good'
        },
        {
            type: 'Essay',
            total: 5,
            correct: 3,
            score: 3.5,
            totalScore: 5,
            performance: 'Good'
        }
    ],

    tutorName: "Dr. Ahmed Mahmoud",
    tutorNote: "أداء ممتاز! لكن انتبه أكثر للأسئلة المقالية واحرص على التفصيل في الشرح. لقد أظهرت فهماً عميقاً للمفاهيم الأساسية.",
    strengths: [
        "فهم React Hooks بشكل عميق",
        "إدارة الحالة (State Management) ممتازة",
        "حل المشكلات البرمجية بسرعة"
    ],
    weaknesses: [
        "تحسين الأداء (Performance Optimization)",
        "كتابة اختبارات شاملة (Testing Best Practices)"
    ],

    classAverage: 72,
    percentile: 85
};
