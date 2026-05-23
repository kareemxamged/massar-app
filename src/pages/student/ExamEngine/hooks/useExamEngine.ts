import { useState, useEffect, useCallback, useRef } from 'react';
import { Exam } from '../types';
import { examService } from '../../../../services/examService';

export function useExamEngine(exam: Exam | null, submission: any | null) {
    // Core State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [flags, setFlags] = useState<Record<number, boolean>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSaved, setIsSaved] = useState(true);
    const [status, setStatus] = useState<'active' | 'finished'>('active');

    // Initialize State from Submission
    useEffect(() => {
        if (exam && submission) {
            // Restore Answers
            if (submission.answers) {
                setAnswers(submission.answers);
            }

            // Calculate Remaining Time from Server Start Time
            if (submission.started_at) {
                const startTime = new Date(submission.started_at).getTime();
                const durationMs = exam.durationMinutes * 60 * 1000;
                const hardDeadline = exam.end_time ? new Date(exam.end_time).getTime() : Infinity;
                const endTime = Math.min(startTime + durationMs, hardDeadline);
                const now = Date.now();
                const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

                setTimeLeft(remainingSeconds);
                if (remainingSeconds === 0) {
                    setStatus('finished');
                }
            } else {
                // Fallback if no started_at (shouldn't happen with new service)
                setTimeLeft(exam.durationMinutes * 60);
            }
        }
    }, [exam, submission]);

    // Helper to handle auto-submit avoid closure staleness
    // We can't easily call `finishExam` from the interval if it depends on `answers` state which changes
    // BUT `finishExam` depends on `answers`.
    // Let's use a Ref for answers to ensure we submit the latest.
    const answersRef = useRef(answers);
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const handleAutoSubmit = useCallback(async () => {
        if (!submission?.id || !exam) return;
        try {
            // Use current answers from Ref
            await examService.finishExam(submission.id, answersRef.current, Number(exam.id));
            setStatus('finished');
        } catch (error) {
            console.error("Auto-submit failed", error);
            setStatus('finished'); // Force finish UI even if DB fail (prevent loop)
        }
    }, [submission?.id, exam]);

    // Timer Logic (Server-Sync based)
    useEffect(() => {
        if (status === 'finished' || !exam || !submission?.started_at) return;

        const interval = setInterval(() => {
            const startTime = new Date(submission.started_at).getTime();
            const durationMs = exam.durationMinutes * 60 * 1000;
            const hardDeadline = exam.end_time ? new Date(exam.end_time).getTime() : Infinity;
            const endTime = Math.min(startTime + durationMs, hardDeadline);
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

            setTimeLeft(remaining);

            if (remaining <= 0) {
                // Auto-submit when time expires
                // We access the LATEST answers via the ref or state (state is tricky in interval closure)
                // Actually `finishExam` uses the `answers` state. 
                // But `answers` in this closure might be stale if strict mode.
                // It's better to rely on `finishExam` function which we'll call safely.
                // However, accessing `finishExam` (which relies on `answers` state) inside `setInterval` is risky due to closure staleness.
                // Better approach: Set a flag "shouldSubmit" or just set status to finished and have another effect trigger the DB call?
                // Or use a ref for answers.
                clearInterval(interval);
                handleAutoSubmit();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [status, exam, submission, handleAutoSubmit]); // Dependencies need care to avoid timer reset, but `exam` and `submission` are stable after load.


    // Prevent Window Close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (status === 'active') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [status]);

    // Navigation
    const nextQuestion = () => {
        if (!exam) return;
        if (currentQuestionIndex < exam.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const jumpToQuestion = (index: number) => {
        if (!exam) return;
        if (index >= 0 && index < exam.questions.length) {
            setCurrentQuestionIndex(index);
        }
    };

    // Actions
    const answerQuestion = useCallback(async (value: any) => {
        if (!exam || !submission?.id) return;

        setIsSaved(false);
        const currentQId = exam.questions[currentQuestionIndex].id;

        const newAnswers = {
            ...answers,
            [currentQId]: value
        };

        setAnswers(newAnswers);

        try {
            // Auto-Save to Backend
            await examService.submitAnswer(submission.id, newAnswers);
            setIsSaved(true);
        } catch (error) {
            console.error("Failed to save answer:", error);
            setIsSaved(false); // keep it unsaved to retry or alert
        }
    }, [currentQuestionIndex, exam, submission, answers]);

    const toggleFlag = () => {
        if (!exam) return;
        const currentQId = exam.questions[currentQuestionIndex].id;
        setFlags(prev => ({
            ...prev,
            [currentQId]: !prev[currentQId]
        }));
    };

    const finishExam = async () => {
        if (!submission?.id || !exam) return;
        try {
            await examService.finishExam(submission.id, answers, Number(exam.id));
            setStatus('finished');
        } catch (error) {
            console.error("Failed to finish exam:", error);
            alert("Error submitting exam. Please check your connection.");
        }
    };

    return {
        // State
        currentQuestion: exam ? exam.questions[currentQuestionIndex] : null,
        currentQuestionIndex,
        totalQuestions: exam ? exam.questions.length : 0,
        answers,
        flags,
        timeLeft,
        isSaved,
        status,

        // Actions
        nextQuestion,
        prevQuestion,
        jumpToQuestion,
        answerQuestion,
        toggleFlag,
        finishExam
    };
}
