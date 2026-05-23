import { QuestionReview } from '../../../../types/review';
import { useTranslation } from 'react-i18next';

interface ReviewCardProps {
    question: QuestionReview;
    index: number;
    showCorrectAnswer?: boolean;
}

export default function ReviewCard({ question, index, showCorrectAnswer = true }: ReviewCardProps) {
    const { t } = useTranslation('common');
    const isObjective = question.type === 'mcq' || question.type === 'true_false';
    const isCorrect = question.isCorrect;

    return (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '0', border: '1px solid rgba(255,255,255,0.05)', borderInlineStart: isObjective ? `5px solid ${isCorrect ? '#10b981' : '#ef4444'}` : '5px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('examReview.card.question')} {index + 1}</h3>
                {isObjective ? (
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isCorrect ? '#10b981' : '#ef4444',
                        border: isCorrect ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {isCorrect ? t('examReview.card.correct') : t('examReview.card.incorrect')}
                    </span>
                ) : (
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{t('examReview.card.pending')}</span>
                )}
            </div>

            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6', color: '#e2e8f0' }}>{question.text}</p>

            {/* Options / Answer Display */}
            <div style={{ marginBottom: '1.5rem' }}>
                {question.type === 'mcq' && (question as any).options.map((opt: string, idx: number) => {
                    const isSelected = question.userAnswer === opt;
                    const isCorrectOpt = (question as any).correctAnswer === opt;

                    let bg = 'rgba(255,255,255,0.02)';
                    let border = '1px solid rgba(255,255,255,0.08)';

                    if (isSelected && isCorrect) { bg = 'rgba(16, 185, 129, 0.15)'; border = '1px solid #10b981'; }
                    else if (isSelected && !isCorrect) { bg = 'rgba(239, 68, 68, 0.15)'; border = '1px solid #ef4444'; }
                    else if (!isSelected && isCorrectOpt && showCorrectAnswer) { bg = 'rgba(16, 185, 129, 0.1)'; border = '1px dashed #10b981'; }

                    return (
                        <div key={idx} style={{
                            padding: '1rem',
                            marginBottom: '0.5rem',
                            borderRadius: '8px',
                            background: bg,
                            border: border,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                border: isSelected || isCorrectOpt ? 'none' : '2px solid rgba(255,255,255,0.3)',
                                background: isSelected
                                    ? (isCorrect ? '#10b981' : '#ef4444')
                                    : (isCorrectOpt ? '#10b981' : 'transparent'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {(isSelected || isCorrectOpt) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" width="12" height="12">
                                        {isSelected && !isCorrect ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />}
                                    </svg>
                                )}
                            </div>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isSelected && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({t('examReview.card.yourAnswer')})</span>}
                            {showCorrectAnswer && isCorrectOpt && !isSelected && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{t('examReview.card.correctAnswer')}</span>}
                        </div>
                    );
                })}

                {question.type === 'true_false' && ['True', 'False'].map((opt) => {
                    // Safe Case-Insensitive Comparison
                    const userAnsStr = String(question.userAnswer || '').toLowerCase();
                    const correctAnsStr = String((question as any).correctAnswer || '').toLowerCase();
                    const currentOptStr = opt.toLowerCase();

                    const isSelected = userAnsStr === currentOptStr;
                    const isCorrectOpt = correctAnsStr === currentOptStr;

                    let bg = 'rgba(255,255,255,0.05)';
                    let border = '1px solid rgba(255,255,255,0.1)';

                    if (isSelected && isCorrect) { bg = 'rgba(16, 185, 129, 0.2)'; border = '1px solid #10b981'; }
                    else if (isSelected && !isCorrect) { bg = 'rgba(239, 68, 68, 0.2)'; border = '1px solid #ef4444'; }
                    else if (!isSelected && isCorrectOpt && showCorrectAnswer) { bg = 'rgba(16, 185, 129, 0.1)'; border = '1px dashed #10b981'; }

                    return (
                        <div key={opt} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            marginRight: '1rem',
                            borderRadius: '8px',
                            background: bg,
                            border: border,
                            minWidth: '100px',
                            justifyContent: 'center'
                        }}>
                            {opt}
                            {isSelected && (isCorrect ? '✅' : '❌')}
                            {showCorrectAnswer && !isSelected && isCorrectOpt && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✔ {t('examReview.card.correct')}</span>}
                        </div>
                    );
                })}

                {question.type === 'essay' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('examReview.card.yourAnswer')}:</div>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{question.userAnswer || t('examReview.card.noAnswer')}</p>
                    </div>
                )}
                {question.type === 'code' && (
                    <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('examReview.card.yourCode')}</div>
                        <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', color: '#e2e8f0', fontSize: '0.9rem' }}>{question.userAnswer || t('examReview.card.noCode')}</pre>
                    </div>
                )}
            </div>

            {/* Explanation Box */}
            {question.explanation && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderLeft: '4px solid #3b82f6',
                    borderRadius: '4px'
                }}>
                    <div style={{ fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625v-8.196c.306-.175.618-.313.938-.413A8.25 8.25 0 0012 2.99a8.25 8.25 0 00-4.686.291c.32.1.632.238.938.413v8.196" />
                        </svg>
                        {t('examReview.card.explanation')}
                    </div>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem', color: '#e2e8f0' }}>{question.explanation}</p>
                </div>
            )}
        </div>
    );
}
