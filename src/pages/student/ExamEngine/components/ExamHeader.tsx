
import { useTranslation } from 'react-i18next';

interface ExamHeaderProps {
    title: string;
    timeLeft: number; // in seconds
    currentQuestionIndex: number;
    totalQuestions: number;
    isSaved: boolean;
}

export default function ExamHeader({
    title,
    timeLeft,
    currentQuestionIndex,
    totalQuestions,
    isSaved
}: ExamHeaderProps) {
    const { t } = useTranslation('common');

    // Format seconds to HH:MM:SS
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Progress Calculation
    const progress = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

    // Timer Color Logic
    const getTimerColor = () => {
        if (timeLeft < 60) return '#ef4444'; // Red (< 1 min)
        if (timeLeft < 300) return '#f59e0b'; // Yellow (< 5 min)
        return 'var(--text-primary)';
    };

    return (
        <header className="glass-card" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: '1rem 2rem',
            borderRadius: 0,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Top Row: Title, Timer, Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--primary)', display: 'flex' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{title}</h1>
                </div>

                {/* Timer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    color: getTimerColor(),
                    transition: 'color 0.3s ease'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTime(timeLeft)}</span>
                </div>

                {/* Save Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: isSaved ? '#10b981' : 'var(--text-muted)'
                }}>
                    {isSaved ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{t('examEngine.header.saved')}</span>
                        </>
                    ) : (
                        <span>{t('examEngine.header.saving')}</span>
                    )}
                </div>
            </div>

            {/* Bottom Row: Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary) 0%, #a855f7 100%)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' }}>
                    {currentQuestionIndex + 1}/{totalQuestions} ({progress}%)
                </span>
            </div>
        </header>
    );
}
