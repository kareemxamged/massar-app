import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResultHeader from './components/ResultHeader';
import PerformanceBreakdown from './components/PerformanceBreakdown';
import TutorFeedback from './components/TutorFeedback';
import ComparisonChart from './components/ComparisonChart';
import ResultFooter from './components/ResultFooter';
import { examService } from '../../../services/examService';
import { ExamResultData } from './types';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function ExamResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');

    // State
    const [result, setResult] = useState<ExamResultData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            if (!id) return;
            try {
                const data = await examService.getSubmissionResult(id);
                setResult(data);
            } catch (error) {
                console.error("Failed to load result:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (isLoading) return <LoadingSpinner fullScreen text={t('examResult.loading')} />;

    if (!result) return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass-card" style={{
                padding: '3rem',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="40" height="40">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>

                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('examResult.notFound.title')}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {t('examResult.notFound.message')}
                    </p>
                </div>

                <button
                    onClick={() => navigate('/student/exams')}
                    className="btn-primary"
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        {i18n.dir() === 'rtl'
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l6 6m0 0l-6 6m6-6H3" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />}
                    </svg>
                    {t('examResult.backToLibrary')}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            color: 'white',
            direction: i18n.dir()
        }}>
            {/* Nav Back */}
            <button
                onClick={() => navigate('/student/exams')}
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                    {i18n.dir() === 'rtl'
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 19.5L21 12m0 0l-7.5-7.5M21 12H3" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />}
                </svg>
                {t('examResult.backToLibrary')}
            </button>

            <ResultHeader data={result} />

            <PerformanceBreakdown data={result} />

            <TutorFeedback data={result} />

            <ComparisonChart data={result} />

            <ResultFooter data={result} />

        </div>
    );
}
