import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExamEngine } from './hooks/useExamEngine';
import ExamHeader from './components/ExamHeader';
import ExamSidebar from './components/ExamSidebar';
import QuestionArea from './components/QuestionArea';
import ExamFooter from './components/ExamFooter';
import SummaryModal from './components/SummaryModal';
import ConfirmSubmitModal from './components/ConfirmSubmitModal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { examService } from '../../../services/examService';
import { supabase } from '../../../services/supabase';
import { Exam } from './types';

export default function ExamEngine() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');

    // Remote Data State
    const [exam, setExam] = useState<Exam | null>(null);
    const [submission, setSubmission] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Prevents blank flash when redirecting to result
    const isRedirecting = useRef(false);

    // Initialization
    useEffect(() => {
        const initExam = async () => {
            if (!id) return;
            try {
                // Check submission status FIRST — if already submitted, redirect to result
                const subData = await examService.startExam(Number(id));

                if (subData?.status === 'submitted') {
                    isRedirecting.current = true;
                    navigate(`/student/exams/${id}/result`, { replace: true });
                    return;
                }

                // Load exam data only if not already submitted
                const examData = await examService.getExamWithQuestions(Number(id));
                setExam(examData);
                setSubmission(subData);
            } catch (err: any) {
                console.error("Failed to initialize exam:", err);

                // Handle special case: exam already submitted
                if (err?.message === 'EXAM_ALREADY_SUBMITTED') {
                    isRedirecting.current = true;
                    navigate(`/student/exams/${id}/result`, { replace: true });
                    return;
                }

                const errorMessage = err?.message || 'Failed to load exam. Please try again.';
                setError(errorMessage);
            } finally {
                // Don't remove the loading spinner if we're redirecting
                if (!isRedirecting.current) {
                    setIsLoading(false);
                }
            }
        };

        initExam();
    }, [id, navigate]);

    // Fast Real-Time Kickout if Unpublished Mid-exam
    useEffect(() => {
        if (!exam) return;

        const channel = supabase
            .channel(`exam-engine-status-${exam.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'exams', filter: `id=eq.${exam.id}` },
                (payload: any) => {
                    const updatedExam = payload.new;
                    if (updatedExam.is_published === false) {
                        alert(t('examEngine.alerts.unpublished'));
                        navigate('/student/exams', { replace: true });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [exam, navigate]);

    const {
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        answers,
        flags,
        timeLeft,
        isSaved,
        status,
        nextQuestion,
        prevQuestion,
        jumpToQuestion,
        answerQuestion,
        toggleFlag,
        finishExam
    } = useExamEngine(exam, submission);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    // Mobile Responsive
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    // Handle Finish
    useEffect(() => {
        if (status === 'finished') {
            // Redirect to real result page
            navigate(`/student/exams/${id}/result`, { replace: true });
        }
    }, [status, navigate, id]);

    const handleConfirmSubmit = () => {
        finishExam();
    };

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (error) return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)',
            color: 'white',
            padding: '2rem'
        }}>
            <div className="glass-card" style={{
                padding: '3rem',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.05)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    color: '#f87171'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', fontFamily: 'inherit' }}>{t('examEngine.errors.failedToLoad')}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
                <button
                    className="btn-primary"
                    onClick={() => window.location.reload()}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {t('examEngine.errors.retry')}
                </button>
            </div>
        </div>
    );
    if (!exam) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>{t('examEngine.errors.notFound')}</div>;
    if (!currentQuestion) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>{t('examEngine.errors.noQuestions')}</div>;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-app)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            direction: i18n.dir(),
        }}>

            <ExamHeader
                title={exam.title}
                timeLeft={timeLeft}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                isSaved={isSaved}
            />

            <main style={{
                flex: 1,
                marginTop: '100px',
                marginBottom: '80px',
                padding: '2rem',
                marginInlineEnd: isSidebarOpen ? '300px' : '0',
                transition: 'margin-inline-end 0.3s ease',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{ width: '100%', maxWidth: '900px' }}>

                    {/* Toggle Sidebar */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            position: 'fixed',
                            [i18n.dir() === 'rtl' ? 'left' : 'right']: '0',
                            top: '120px',
                            zIndex: 60,
                            background: 'var(--primary)',
                            border: 'none',
                            [i18n.dir() === 'rtl' ? 'borderTopRightRadius' : 'borderTopLeftRadius']: '8px',
                            [i18n.dir() === 'rtl' ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: '8px',
                            width: '32px',
                            height: '50px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'none',
                            outline: 'none',
                            boxShadow: i18n.dir() === 'rtl' ? '2px 0 10px rgba(0,0,0,0.1)' : '-2px 0 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            width="16"
                            height="16"
                            style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    <QuestionArea
                        question={currentQuestion}
                        answer={answers[currentQuestion.id]}
                        onChange={answerQuestion}
                    />

                </div>
            </main >

            <ExamSidebar
                questions={exam.questions}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                flags={flags}
                onJump={jumpToQuestion}
                isOpen={isSidebarOpen}
            />

            <ExamFooter
                onNext={nextQuestion}
                onPrev={prevQuestion}
                onFlag={toggleFlag}
                onOverview={() => setShowSummary(true)}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === totalQuestions - 1}
                isFlagged={!!flags[currentQuestion.id]}
            />

            {/* Modals */}
            {
                showSummary && (
                    <SummaryModal
                        questions={exam.questions}
                        answers={answers}
                        flags={flags}
                        onClose={() => setShowSummary(false)}
                        onJump={(idx) => {
                            jumpToQuestion(idx);
                            setShowSummary(false);
                        }}
                        onSubmit={() => {
                            setShowSummary(false);
                            setShowConfirmSubmit(true);
                        }}
                    />
                )
            }

            {
                showConfirmSubmit && (
                    <ConfirmSubmitModal
                        onCancel={() => setShowConfirmSubmit(false)}
                        onConfirm={handleConfirmSubmit}
                        unansweredCount={totalQuestions - Object.keys(answers).length}
                        timeLeft={timeLeft}
                    />
                )
            }

        </div >
    );
}
