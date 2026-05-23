import { Question } from '../types';
import { useTranslation } from 'react-i18next';

interface ExamSidebarProps {
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<number, any>;
    flags: Record<number, boolean>;
    onJump: (index: number) => void;
    isOpen: boolean; // For mobile toggle
}

export default function ExamSidebar({
    questions,
    currentQuestionIndex,
    answers,
    flags,
    onJump,
    isOpen
}: ExamSidebarProps) {
    const { t, i18n } = useTranslation('common');
    return (
        <aside className="glass-card" style={{
            position: 'fixed',
            top: '100px', // Below header
            [i18n.dir() === 'rtl' ? 'left' : 'right']: isOpen ? '1rem' : '-300px', // Slide in/out
            bottom: '100px', // Above footer
            width: '280px',
            padding: '1.5rem',
            overflowY: 'auto',
            transition: `${i18n.dir() === 'rtl' ? 'left' : 'right'} 0.3s ease`,
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-muted)' }}>{t('examEngine.sidebar.title')}</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem'
            }}>
                {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flags[q.id];
                    const isCurrent = currentQuestionIndex === idx;

                    let bg = 'rgba(255,255,255,0.05)';
                    let border = '1px solid rgba(255,255,255,0.1)';
                    let color = 'var(--text-muted)';

                    if (isCurrent) {
                        bg = 'rgba(99, 102, 241, 0.2)'; // Primary tint
                        border = '1px solid var(--primary)';
                        color = 'white';
                    } else if (isFlagged) {
                        bg = 'rgba(245, 158, 11, 0.1)'; // Yellow tint
                        border = '1px solid #f59e0b';
                        color = '#f59e0b';
                    } else if (isAnswered) {
                        bg = 'rgba(16, 185, 129, 0.1)'; // Green tint
                        border = '1px solid #10b981';
                        color = '#10b981';
                    }

                    return (
                        <button
                            key={q.id}
                            onClick={() => onJump(idx)}
                            style={{
                                width: '100%',
                                aspectRatio: '1',
                                background: bg,
                                border: border,
                                borderRadius: '8px',
                                color: color,
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                transition: 'all 0.2s ease'
                            }}
                            title={t('examEngine.sidebar.questionNum', { num: idx + 1 })}
                        >
                            {idx + 1}
                            {isFlagged && <span style={{ position: 'absolute', top: -2, right: -2, fontSize: '8px' }}>⚠️</span>}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} /> {t('examEngine.sidebar.legend.current')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} /> {t('examEngine.sidebar.legend.answered')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} /> {t('examEngine.sidebar.legend.flagged')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} /> {t('examEngine.sidebar.legend.notAnswered')}
                </div>
            </div>
        </aside>
    );
}
