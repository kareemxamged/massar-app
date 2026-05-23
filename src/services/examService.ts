
import { supabase } from './supabase';
import { Database } from '../types/supabase';
import { Exam as EngineExam, Question } from '../pages/student/ExamEngine/types';
import { ExamResultData } from '../pages/student/ExamResult/types';

export type Exam = Database['public']['Tables']['exams']['Row'] & {
    score?: number;
    submission_id?: string;
    submission_status?: 'started' | 'submitted';
    is_published?: boolean;
    is_randomized?: boolean;
    end_time?: string | null;
};

export const examService = {
    async getExams() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Fetch user profile to know their level and role
        const { data: profileRaw } = await supabase
            .from('profiles')
            .select('role, student_profiles(academic_levels(name))')
            .eq('id', user.id)
            .single();
        const sp = Array.isArray((profileRaw as any).student_profiles) ? (profileRaw as any).student_profiles[0] : (profileRaw as any).student_profiles;
        const profile = profileRaw ? {
            role: (profileRaw as any).role,
            level: sp?.academic_levels?.name ?? null,
        } : null;

        // Fetch exams — teachers see only their own, students see all then filter in JS
        const baseQuery = supabase
            .from('exams')
            .select(`
                *,
                submissions (
                    id,
                    score,
                    status
                )
            `)
            .order('start_time', { ascending: false });

        const { data, error } = await (
            (profile?.role === 'teacher' || profile?.role === 'admin')
                ? baseQuery.eq('teacher_id', user.id)
                : baseQuery
        );

        if (error) {
            console.error('Error fetching exams:', error);
            throw error;
        }

        let filteredData = data;

        // Apply Exam Assignment rules for students
        if (profile?.role === 'student') {
            const now = Date.now();
            filteredData = data.filter((exam: any) => {
                // Hide unapproved or unpublished exams
                if (exam.approval_status !== 'approved') return false;
                if (exam.is_published === false) return false;

                // Hide exams that have ended (end_time has passed)
                if (exam.end_time && new Date(exam.end_time).getTime() < now) return false;

                const hasSpecificStudents = exam.target_student_ids && exam.target_student_ids.length > 0;

                if (hasSpecificStudents) {
                    // strictly restricted to these specific students
                    return exam.target_student_ids.includes(user.id);
                }

                if (exam.target_group) {
                    // strictly restricted to this level
                    return exam.target_group === profile.level;
                }

                // unrestricted global exam
                return true;
            });
        }

        // Sort order: active → upcoming → finished
        const statusOrder: Record<string, number> = { active: 0, ongoing: 0, upcoming: 1, finished: 2, completed: 2 };

        // Helper to determine if exam is currently active
        const isActive = (exam: any): boolean => {
            const now = Date.now();
            const start = exam.start_time ? new Date(exam.start_time).getTime() : 0;
            const duration = (exam.duration_minutes || 30) * 60000;
            return now >= start && now <= start + duration;
        };

        return filteredData
            .map((exam: any) => {
                const submission = exam.submissions?.find((s: any) => s.student_id === user.id) || exam.submissions?.[0];
                return {
                    ...exam,
                    submission_id: submission?.id,
                    submission_status: submission?.status,
                    score: submission?.score,
                    _isActive: isActive(exam),
                    _status: isActive(exam) ? 'ongoing' : (exam.status || 'finished')
                };
            })
            .sort((a: any, b: any) => {
                // Primary: active exams first
                if (a._isActive !== b._isActive) {
                    return a._isActive ? -1 : 1;
                }

                // Secondary: by status order
                const aOrder = statusOrder[a._status] ?? 3;
                const bOrder = statusOrder[b._status] ?? 3;
                if (aOrder !== bOrder) return aOrder - bOrder;

                // Tertiary: within same status, newest first
                const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
                const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
                return bTime - aTime;
            });
    },

    async getExamSubmissions(examId: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // RLS policy handles authorization - teachers/admins can view, students can only view their own
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                profiles:student_id (
                    id,
                    full_name,
                    avatar_url,
                    student_profiles ( student_code )
                )
            `)
            .eq('exam_id', examId)
            .order('started_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions:', error);
            throw error;
        }

        return data || [];
    },

    async getExamById(id: number) {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('exams')
            .select(`
                *,
                submissions (
                    id,
                    score,
                    status
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching exam ${id}:`, error);
            throw error;
        }

        // Transform to include user-specific status
        const submission = data.submissions?.find((s: any) => s.student_id === user?.id) || data.submissions?.[0]; // RLS should handle filtering, but being safe

        return {
            ...data,
            submission_id: submission?.id,
            submission_status: submission?.status,
            score: submission?.score
        };
    },

    // --- Exam Engine Methods ---

    async startExam(examId: number): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check if exam is expired before starting
        const { data: examData, error: examError } = await supabase
            .from('exams')
            .select('end_time')
            .eq('id', examId)
            .single();

        if (examError) throw examError;
        if (examData.end_time && new Date(examData.end_time).getTime() < Date.now()) {
            throw new Error('This exam has expired and can no longer be started.');
        }

        // Helper to fetch existing submission
        const fetchExisting = async () => {
            const { data } = await supabase
                .from('submissions')
                .select('*')
                .eq('exam_id', examId)
                .eq('student_id', user.id)
                .maybeSingle();
            return data;
        };

        // Check for existing submission first
        const existing = await fetchExisting();
        if (existing) {
            if (existing.status === 'submitted') {
                throw new Error('EXAM_ALREADY_SUBMITTED');
            }
            return existing;
        }

        // Try to create new submission
        try {
            const { data, error } = await supabase
                .from('submissions')
                .insert({
                    exam_id: examId,
                    student_id: user.id,
                    status: 'started',
                    started_at: new Date().toISOString(),
                    answers: {}
                })
                .select()
                .single();

            if (error) {
                // Check for duplicate key errors (409 Conflict, 23505 unique violation)
                const isDuplicate = error.code === '23505' || 
                                   error.code === '409' || 
                                   error.message?.includes('duplicate') ||
                                   error.message?.includes('unique constraint');
                
                if (isDuplicate) {
                    // Fetch and return existing submission
                    const existingSubmission = await fetchExisting();
                    if (existingSubmission) {
                        if (existingSubmission.status === 'submitted') {
                            throw new Error('EXAM_ALREADY_SUBMITTED');
                        }
                        return existingSubmission;
                    }
                }
                throw error;
            }

            return data;
        } catch (err: any) {
            // Check for duplicate key errors in caught errors too
            const isDuplicate = err?.code === '23505' || 
                               err?.code === '409' || 
                               err?.message?.includes('duplicate') ||
                               err?.message?.includes('unique constraint');
            
            if (isDuplicate) {
                const existingSubmission = await fetchExisting();
                if (existingSubmission) {
                    if (existingSubmission.status === 'submitted') {
                        throw new Error('EXAM_ALREADY_SUBMITTED');
                    }
                    return existingSubmission;
                }
            }
            
            // Re-throw EXAM_ALREADY_SUBMITTED
            if (err?.message === 'EXAM_ALREADY_SUBMITTED') {
                throw err;
            }
            
            throw err;
        }
    },

    async getExamWithQuestions(examId: number): Promise<EngineExam> {
        // 1. Fetch Exam Details
        const { data: examData, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .single();

        if (examError) throw examError;

        // 2. Fetch Questions
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('id', { ascending: true }); // Keep order stable

        if (questionsError) throw questionsError;

        let processedQuestions = questionsData;
        if (examData.is_randomized) {
            processedQuestions = [...questionsData];
            for (let i = processedQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [processedQuestions[i], processedQuestions[j]] = [processedQuestions[j], processedQuestions[i]];
            }
        }

        // 3. Map to Engine Types
        const questions: Question[] = processedQuestions.map((q: any) => {
            const base = {
                id: q.id,
                text: q.text,
                marks: q.marks,
                type: q.type as any
            };

            if (q.type === 'mcq') {
                // options is stored as JSONB object {A: "...", B: "..."} — convert to string[]
                let opts: string[] = [];
                if (Array.isArray(q.options)) {
                    opts = q.options; // already an array, passthrough
                } else if (q.options && typeof q.options === 'object') {
                    // Convert {A: "text", B: "text"} → ["A. text", "B. text"]
                    opts = Object.entries(q.options as Record<string, string>)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([key, val]) => `${key}. ${val}`);
                }
                return { ...base, options: opts };
            }
            if (q.type === 'code') {
                // For now, mock initial code if not in DB options
                return { ...base, language: 'javascript', initialCode: '// Write your code here...' };
            }
            if (q.type === 'essay') {
                return { ...base, wordLimit: 200 }; // Default limit
            }

            return base;
        });

        return {
            id: String(examData.id), // Ensure ID is string for Engine compatibility if needed, or update types
            title: examData.title,
            end_time: examData.end_time ? new Date(examData.end_time).toISOString() : undefined,
            durationMinutes: examData.duration_minutes,
            totalQuestions: examData.total_questions,
            questions: questions
        };
    },

    async submitAnswer(submissionId: string, answers: any) {
        // Just update answers column
        // We need to fetch existing answers first OR use jsonb_set provided by Postgrest/Supabase if possible, 
        // but simplest is to just overwrite the JSON blob if we have the full state on client.
        // Or better: update the specific key.
        // For simplicity in this project: The client sends the FULL answers object.

        const { error } = await supabase
            .from('submissions')
            .update({ answers })
            .eq('id', submissionId);

        if (error) throw error;
    },

    async finishExam(submissionId: string, answers: any, examId: number) {
        // Fetch questions to calculate score
        const { data: questions } = await supabase
            .from('questions')
            .select('id, type, correct_answer, marks')
            .eq('exam_id', examId);

        let totalScore = 0;
        let correctCount = 0;

        // Simple Grading Logic
        if (questions) {
            questions.forEach(q => {
                const rawAnswer = answers[q.id];
                if (rawAnswer === undefined) return;

                if (q.type === 'mcq' || q.type === 'true_false') {
                    // Normalize MCQ answer: "B. useState" → "B" (handles both plain key and prefixed format)
                    const normalizedAnswer = q.type === 'mcq'
                        ? String(rawAnswer).split('.')[0].trim()
                        : String(rawAnswer);

                    if (normalizedAnswer === String(q.correct_answer)) {
                        totalScore += q.marks;
                        correctCount++;
                    }
                }
                // Essay/Code: manual review, score stays 0
            });
        }

        const { error } = await supabase
            .from('submissions')
            .update({
                answers,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
                score: totalScore
            })
            .eq('id', submissionId);

        if (error) throw error;
    },

    async getReviewData(examId: string): Promise<import('../types/review').ExamReviewData | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch submission
        const { data: submission } = await supabase
            .from('submissions')
            .select('*')
            .eq('exam_id', examId)
            .eq('student_id', user.id)
            .maybeSingle();

        if (!submission) return null;

        // Fetch Exam & Questions
        const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
        const { data: questionsData } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('id', { ascending: true });

        if (!examData || !questionsData) return null;

        // Merge Data
        const questions = questionsData.map((q: any) => {
            const userAnswer = submission.answers[q.id];
            let isCorrect = undefined;

            if (q.type === 'mcq' || q.type === 'true_false') {
                // Normalize MCQ answer: "B. useState" → "B"
                const normalizedAnswer = q.type === 'mcq'
                    ? String(userAnswer ?? '').split('.')[0].trim()
                    : String(userAnswer ?? '');
                isCorrect = normalizedAnswer === String(q.correct_answer);
            }

            const baseRequest = {
                id: q.id,
                text: q.text,
                type: q.type,
                marks: q.marks,
                userAnswer,
                isCorrect,
                explanation: q.explanation,
                correctAnswer: q.correct_answer // Include correct answer for review
            };

            if (q.type === 'mcq') {
                // Normalize options: {A: "...", B: "..."} → ["A. ...", "B. ..."]
                let opts: string[] = [];
                if (Array.isArray(q.options)) {
                    opts = q.options;
                } else if (q.options && typeof q.options === 'object') {
                    opts = Object.entries(q.options as Record<string, string>)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([key, val]) => `${key}. ${val}`);
                }
                return { ...baseRequest, options: opts };
            }
            if (q.type === 'code') return { ...baseRequest, language: 'javascript', initialCode: '// ...' };
            if (q.type === 'essay') return { ...baseRequest, wordLimit: 200 };

            return baseRequest;
        });

        return {
            examId: String(examData.id),
            examTitle: examData.title,
            score: submission.score || 0,
            totalScore: examData.total_marks,
            allow_review: examData.allow_review ?? true,
            show_correct_answers: examData.show_correct_answers ?? true,
            questions: (examData.show_correct_answers ?? true)
                ? questions as any
                : (questions as any[]).map((q: any) => { const { correctAnswer, ...rest } = q; return rest; })
        };
    },

    async getSubmissionResult(examId: string): Promise<ExamResultData | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch submission
        const { data: submission, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('exam_id', examId)
            .eq('student_id', user.id)
            .maybeSingle();

        if (subError || !submission) return null;

        // Fetch Exam & Questions to build result
        const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
        const { data: questions } = await supabase.from('questions').select('*').eq('exam_id', examId);

        if (!examData || !questions) return null;

        // Calculate Stats — per-question accuracy
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let skippedAnswers = 0;
        const earnedScore = submission.score || 0;
        const totalScore = examData.total_marks;
        const answers = submission.answers || {};

        // Bucket per-type stats for breakdown
        const typeMap: Record<string, { total: number; correct: number; score: number; totalScore: number }> = {};

        questions.forEach((q: any) => {
            const ans = answers[q.id];
            const typeKey =
                q.type === 'mcq' ? 'MCQ' :
                    q.type === 'true_false' ? 'True/False' :
                        q.type === 'essay' ? 'Essay' :
                            q.type === 'code' ? 'Code' : q.type;

            if (!typeMap[typeKey]) typeMap[typeKey] = { total: 0, correct: 0, score: 0, totalScore: 0 };
            typeMap[typeKey].total++;
            typeMap[typeKey].totalScore += q.marks ?? 1;

            if (q.type === 'mcq' || q.type === 'true_false') {
                if (ans === undefined || ans === null || ans === '') {
                    skippedAnswers++;
                } else {
                    // Normalize: "B. useState" → "B"
                    const normalizedAns = q.type === 'mcq'
                        ? String(ans).split('.')[0].trim()
                        : String(ans);
                    if (normalizedAns === String(q.correct_answer)) {
                        correctAnswers++;
                        typeMap[typeKey].correct++;
                        typeMap[typeKey].score += q.marks ?? 1;
                    } else {
                        wrongAnswers++;
                    }
                }
            }
            // Essay/Code: objective auto-grade = 0, pending manual review
        });

        // Derive performance label per type
        const perfLabel = (pct: number, isPending: boolean): string => {
            if (isPending) return 'Pending Review';
            if (pct >= 90) return 'Excellent';
            if (pct >= 75) return 'Very Good';
            if (pct >= 60) return 'Good';
            return 'Needs Improvement';
        };

        const breakdown = Object.entries(typeMap).map(([type, stats]) => {
            const isPending = type === 'Essay' || type === 'Code';
            const pct = stats.totalScore > 0 ? (stats.score / stats.totalScore) * 100 : 0;
            return {
                type: type as any,
                total: stats.total,
                correct: stats.correct,
                score: stats.score,
                totalScore: stats.totalScore,
                performance: perfLabel(pct, isPending) as any,
            };
        });

        // Derive strengths / weaknesses from real breakdown
        const strengths = breakdown
            .filter(b => b.performance === 'Excellent' || b.performance === 'Very Good')
            .map(b => `${b.type} (${b.correct}/${b.total} correct)`);
        const weaknesses = breakdown
            .filter(b => b.performance === 'Needs Improvement' || b.performance === 'Pending Review')
            .map(b => b.performance === 'Pending Review'
                ? `${b.type} — Awaiting Manual Review`
                : `${b.type} (${b.correct}/${b.total} correct)`);

        return {
            id: submission.id,
            examTitle: examData.title,
            studentScore: earnedScore,
            totalScore: totalScore,
            percentage: Math.round((earnedScore / totalScore) * 100),
            isPassed: (earnedScore / totalScore) >= 0.5,

            correctAnswers,
            wrongAnswers,
            skippedAnswers,
            timeSpent: "45 mins", // Mock — would come from submission timestamps
            rank: "5/20",        // Mock — would come from class aggregation
            breakdown,

            tutorName: "System Auto-Grader",
            tutorNote: earnedScore === 0
                ? "No points scored yet. Some questions may still be pending manual review."
                : "This result is based on auto-graded objective questions. Subjective questions are pending instructor review.",
            strengths: strengths.length > 0 ? strengths : ["Keep practising — you'll get there!"],
            weaknesses: weaknesses.length > 0 ? weaknesses : ["No significant weak areas detected."],

            allowRetry: true,
            classAverage: 75,
            percentile: 80
        };
    },

    async getUserResults() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                exams (
                    id,
                    title,
                    total_marks,
                    subject
                )
            `)
            .eq('student_id', user.id)
            .eq('status', 'submitted')
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        return data.map((sub: any) => ({
            id: sub.id,
            examId: sub.exams.id,
            title: sub.exams.title,
            subject: sub.exams.subject,
            score: sub.score,
            totalMarks: sub.exams.total_marks,
            percentage: Math.round((sub.score / sub.exams.total_marks) * 100),
            date: sub.submitted_at,
            status: (sub.score / sub.exams.total_marks) >= 0.5 ? 'Passed' : 'Failed'
        }));
    },

    // --- Manage Exams Methods ---

    async toggleExamPublishStatus(examId: number, isPublished: boolean): Promise<void> {
        const { error } = await supabase
            .from('exams')
            .update({ is_published: isPublished })
            .eq('id', examId);
        if (error) throw error;
    },

    async toggleExamRandomization(examId: number, isRandomized: boolean): Promise<void> {
        const { error } = await supabase
            .from('exams')
            .update({ is_randomized: isRandomized })
            .eq('id', examId);
        if (error) throw error;
    },

    async deleteExam(examId: number): Promise<void> {
        // Due to foreign key constraints, deleting an exam might require cascade rules in DB.
        // If not set up properly, questions/submissions might block it. Assuming DB cascade is configured.
        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', examId);
        if (error) throw error;
    },

    async duplicateExam(examId: number): Promise<any> {
        // 1. Fetch original exam
        const { data: originalExam, error: fetchExamError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .single();

        if (fetchExamError) throw fetchExamError;

        // 2. Insert new exam (remove id, created_at to trigger generation; update title)
        const { id, created_at, status, ...examData } = originalExam as any;
        const { data: newExam, error: insertExamError } = await supabase
            .from('exams')
            .insert({
                ...examData,
                title: `${examData.title} (Copy)`,
                status: 'upcoming'
            })
            .select()
            .single();

        if (insertExamError) throw insertExamError;

        // 3. Fetch original questions
        const { data: originalQuestions, error: fetchQsError } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId);

        if (fetchQsError) throw fetchQsError;

        // 4. Insert copied questions tied to the new exam ID
        if (originalQuestions && originalQuestions.length > 0) {
            const newQuestions = originalQuestions.map((q: any) => {
                const { id, created_at, exam_id, ...qData } = q;
                return {
                    ...qData,
                    exam_id: newExam.id
                };
            });

            const { error: insertQsError } = await supabase
                .from('questions')
                .insert(newQuestions);

            if (insertQsError) throw insertQsError;
        }

        return newExam;
    },

    async getExamForEdit(examId: number): Promise<any> {
        // 1. Fetch Exam
        const { data: examData, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .single();

        if (examError) throw examError;

        // 2. Fetch Questions
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('id', { ascending: true });

        if (questionsError) throw questionsError;

        // Helper to safely parse options which might be stored as strings or JSON
        const parseOptions = (optionsRaw: any) => {
            if (Array.isArray(optionsRaw)) return optionsRaw;
            if (typeof optionsRaw === 'string') {
                try {
                    return JSON.parse(optionsRaw);
                } catch {
                    return ['', '', '', ''];
                }
            }
            return ['', '', '', ''];
        };

        // 3. Format Questions for the Form
        const formattedQuestions = questionsData.map((q: any) => ({
            text: q.text,
            type: q.type,
            options: parseOptions(q.options),
            correct_answer: q.correct_answer || '',
            marks: q.marks || 1,
            explanation: q.explanation || '',
            image_url: q.image_url || ''
        }));

        // 4. Return combined format matching ExamFormData
        return {
            ...examData,
            // Format datetime-local string if possible (YYYY-MM-DDThh:mm)
            start_time: examData.start_time ? new Date(new Date(examData.start_time).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
            end_time: examData.end_time ? new Date(new Date(examData.end_time).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
            questions: formattedQuestions.length > 0 ? formattedQuestions : [
                { text: '', type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1, explanation: '' }
            ]
        };
    },

    async updateExam(examId: number, data: any): Promise<void> {
        // 1. Fetch current exam to enforce strictly "Upcoming" rule
        const { data: currentExam, error: fetchError } = await supabase
            .from('exams')
            .select('status, start_time')
            .eq('id', examId)
            .single();

        if (fetchError) throw fetchError;

        const now = Date.now();
        const startTime = currentExam.start_time ? new Date(currentExam.start_time).getTime() : null;

        if (currentExam.status !== 'upcoming' || (startTime && startTime <= now)) {
            throw new Error('This exam has already started and can no longer be edited.');
        }

        // 2. Calculate Total Marks
        const totalMarks = data.questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);

        // 3. Update Exam record
        const examRecord = {
            title: data.title,
            subject: data.subject,
            description: data.description,
            course_id: data.course_id || null,
            start_time: data.start_time ? new Date(data.start_time).toISOString() : null,
            end_time: data.end_time ? new Date(data.end_time).toISOString() : null,
            duration_minutes: data.duration_minutes,
            passing_score: data.passing_score,
            is_randomized: data.is_randomized,
            total_marks: totalMarks,
            total_questions: data.questions.length,
            allow_review: data.allow_review,
            show_correct_answers: data.show_correct_answers,
            target_group: data.target_group || null,
            target_student_ids: data.target_student_ids && data.target_student_ids.length > 0
                ? data.target_student_ids
                : null,
        };

        const { error: updateError } = await supabase
            .from('exams')
            .update(examRecord)
            .eq('id', examId);

        if (updateError) throw updateError;

        // 4. Delete existing questions cleanly
        const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('exam_id', examId);

        if (deleteError) throw deleteError;

        // 5. Insert updated questions
        const questionsToInsert = data.questions.map((q: any) => ({
            exam_id: examId,
            text: q.text,
            type: q.type,
            options: q.type === 'mcq' ? (q.options?.filter(Boolean) || null) : null,
            correct_answer: q.correct_answer,
            marks: q.marks,
            image_url: q.image_url || null,
            explanation: q.explanation || null,
        }));

        const { error: questionsError } = await supabase
            .from('questions')
            .insert(questionsToInsert);

        if (questionsError) throw questionsError;
    }
};
