import { z } from 'zod';

export const questionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Question text is required'),
    type: z.enum(['mcq', 'true_false', 'essay', 'short_answer', 'subjective']),
    options: z.array(z.string()).min(2, 'At least 2 options required').optional(),
    correct_answer: z.string().min(1, 'Please provide the correct answer'),
    marks: z.number().min(1, 'Marks must be at least 1'),
    image_url: z.string().nullable().optional(),
    explanation: z.string().optional(),
});

export const examSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    subject: z.string().min(2, 'Subject is required'),
    course_id: z.number().nullable().optional(),
    description: z.string().optional(),

    // Config
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    duration_minutes: z.number().min(5, 'Minimum 5 minutes'),
    total_marks: z.number().optional(),
    passing_score: z.number().min(1, 'Passing score is required').max(100),
    is_randomized: z.boolean(),
    allow_review: z.boolean(),
    show_correct_answers: z.boolean(),

    // Assignment - at least one must be specified
    target_group: z.string().nullable().optional(),
    target_student_ids: z.array(z.string()).optional(),

    status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),

    questions: z.array(questionSchema).min(1, 'Add at least one question'),
}).refine(
    (data) => {
        const hasTargetGroup = data.target_group && data.target_group.length > 0;
        const hasTargetStudents = data.target_student_ids && data.target_student_ids.length > 0;
        return hasTargetGroup || hasTargetStudents;
    },
    {
        message: 'Please select target students or an academic level',
        path: ['target_group'],
    }
).refine(
    (data) => {
        const start = new Date(data.start_time).getTime();
        const now = Date.now();
        return start > now;
    },
    {
        message: 'Start time must be in the future',
        path: ['start_time'],
    }
).refine(
    (data) => {
        const start = new Date(data.start_time).getTime();
        const end = new Date(data.end_time).getTime();
        return end > start;
    },
    {
        message: 'End time must be after start time',
        path: ['end_time'],
    }
);

export type ExamFormData = z.infer<typeof examSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
