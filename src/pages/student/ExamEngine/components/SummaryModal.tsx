import { Question } from '../types';
import { useTranslation } from 'react-i18next';

interface SummaryModalProps {
    questions: Question[];
    answers: Record<number, any>;
    flags: Record<number, boolean>;
    onClose: () => void;
    onJump: (index: number) => void;
    onSubmit: () => void;
}

export default function SummaryModal({
    questions,
    answers,
    flags,
    onClose,
    onJump,
    onSubmit
}: SummaryModalProps) {
    const { t, i18n } = useTranslation('common');
    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.values(flags).filter(Boolean).length;
    const unansweredCount = questions.length - answeredCount;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            direction: i18n.dir()
        }}>
            <div className="glass-card" style={{ width: '90%', maxWidth: '600px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{t('examEngine.summary.title')}</h2>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '0.5rem', color: '#10b981' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div style={{ color: '#10b981', fontWeight: 'bold' }}>{answeredCount} {t('examEngine.summary.answered')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '0.5rem', color: '#f59e0b' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                            </svg>
                        </div>
                        <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>{flaggedCount} {t('examEngine.summary.flagged')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '0.5rem', color: '#ef4444' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{unansweredCount} {t('examEngine.summary.left')}</div>
                    </div>
                </div>

                {/* Unanswered List */}
                {unansweredCount > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)' }}>{t('examEngine.summary.unansweredList')}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {questions.map((q, idx) => {
                                if (answers[q.id] === undefined) {
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => onJump(idx)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid #ef4444',
                                                color: '#ef4444',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            #{idx + 1}
                                        </button>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                    >
                        {t('examEngine.summary.backButton')}
                    </button>
                    <button
                        onClick={onSubmit}
                        className="btn-primary"
                        style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444', cursor: 'pointer' }}
                    >
                        {t('examEngine.summary.finishButton')}
                    </button>
                </div>
            </div>
        </div>
    );
}
