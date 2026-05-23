import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { examService } from '../../../services/examService';
import { ExamReviewData } from '../../../types/review';
import ReviewCard from './components/ReviewCard';
import LoadingSpinner from '../../../components/LoadingSpinner';

type FilterType = 'all' | 'correct' | 'wrong' | 'unanswered';

export default function ExamReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');

    const [data, setData] = useState<ExamReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const reviewData = await examService.getReviewData(id);
                setData(reviewData);
            } catch (error) {
                console.error("Failed to load review data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <LoadingSpinner fullScreen text={t('examReview.loading')} />;
    if (!data) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center', direction: i18n.dir() }}>{t('examReview.notFound')}</div>;

    // Block access if teacher disabled review
    if (data.allow_review === false) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'white', padding: '3rem', direction: i18n.dir() }}>
                <div style={{ fontSize: '3rem' }}>🔒</div>
                <h2 style={{ fontSize: '1.5rem' }}>{t('examReview.disabled.title')}</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
                    {t('examReview.disabled.message')}
                </p>
                <button onClick={() => navigate(`/student/exams/${id}/result`)} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {i18n.dir() === 'rtl' ? '→' : '←'} {t('examReview.backToResult')}
                </button>
            </div>
        );
    }

    const filteredQuestions = data.questions.filter(q => {
        if (filter === 'all') return true;

        // Handle undefined isCorrect (subjective questions)
        const isCorrect = q.isCorrect;

        if (filter === 'correct') return isCorrect === true;
        if (filter === 'wrong') return isCorrect === false; // Explicitly false, not undefined
        if (filter === 'unanswered') return !q.userAnswer;

        return true;
    });

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            maxWidth: '900px',
            margin: '0 auto',
            color: 'white',
            fontFamily: 'var(--font-primary)',
            direction: i18n.dir()
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <button
                        onClick={() => navigate(`/student/exams/${id}/result`)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            fontSize: '0.9rem', transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                            {i18n.dir() === 'rtl'
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 19.5L21 12m0 0l-7.5-7.5M21 12H3" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />}
                        </svg>
                        {t('examReview.backToResult')}
                    </button>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{t('examReview.title')} {data.examTitle}</h1>
                </div>

                <div className="glass-card" style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderRadius: '12px'
                }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('examReview.totalScore')}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.score} <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>/ {data.totalScore}</span></div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {[
                    { id: 'all', label: t('examReview.filters.all'), count: data.questions.length },
                    { id: 'correct', label: t('examReview.filters.correct'), count: data.questions.filter(q => q.isCorrect === true).length },
                    { id: 'wrong', label: t('examReview.filters.wrong'), count: data.questions.filter(q => q.isCorrect === false).length },
                ].map((item) => {
                    const isActive = filter === item.id;
                    let activeColor = '#3b82f6';
                    if (item.id === 'correct') activeColor = '#10b981';
                    if (item.id === 'wrong') activeColor = '#ef4444';

                    const borderColor = isActive ? activeColor : 'rgba(255,255,255,0.1)';
                    const bg = isActive ? `${activeColor}20` : 'rgba(255,255,255,0.03)';
                    const textColor = isActive ? activeColor : 'var(--text-muted)';

                    return (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id as FilterType)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '10px',
                                border: `1px solid ${borderColor}`,
                                background: bg,
                                color: textColor,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {item.label}
                            <span style={{
                                background: isActive ? activeColor : 'rgba(255,255,255,0.1)',
                                color: isActive ? 'white' : 'var(--text-muted)',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '99px',
                                fontSize: '0.75rem'
                            }}>
                                {item.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q, idx) => (
                        <ReviewCard key={q.id} question={q} index={idx} showCorrectAnswer={data.show_correct_answers !== false} />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                        {t('examReview.noQuestions')}
                    </div>
                )}
            </div>

        </div>
    );
}
