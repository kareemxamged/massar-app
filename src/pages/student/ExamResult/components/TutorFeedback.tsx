import { ExamResultData } from '../types';
import { useTranslation } from 'react-i18next';

interface TutorFeedbackProps {
    data: ExamResultData;
}

export default function TutorFeedback({ data }: TutorFeedbackProps) {
    const { t } = useTranslation('common');

    const translateFeedback = (text: string) => {
        if (!text) return "";
        if (text === "System Auto-Grader") return t('examResult.feedback.autoGrader');
        if (text === "No points scored yet. Some questions may still be pending manual review.") return t('examResult.feedback.noPoints');
        if (text === "This result is based on auto-graded objective questions. Subjective questions are pending instructor review.") return t('examResult.feedback.autoGraded');
        if (text === "Keep practising — you'll get there!") return t('examResult.feedback.keepPracticing');
        if (text === "No significant weak areas detected.") return t('examResult.feedback.noWeakAreas');

        // Dynamic strings
        const matchCorrect = text.match(/(.*) \((\d+)\/(\d+) correct\)/);
        if (matchCorrect) {
            const type = matchCorrect[1];
            const typeKey = type.toLowerCase().replace(/[^a-z0-9]/g, '');
            const typeLocal = t(`examResult.types.${typeKey}`, type);
            return t('examResult.feedback.correctFormat', { type: typeLocal, correct: matchCorrect[2], total: matchCorrect[3], defaultValue: text });
        }

        const matchPending = text.match(/(.*) — Awaiting Manual Review/);
        if (matchPending) {
            const type = matchPending[1];
            const typeKey = type.toLowerCase().replace(/[^a-z0-9]/g, '');
            const typeLocal = t(`examResult.types.${typeKey}`, type);
            return t('examResult.feedback.awaitingReviewFormat', { type: typeLocal, defaultValue: text });
        }

        return text;
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Tutor Note */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    {t('examResult.feedback.title')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#3b82f6'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{translateFeedback(data.tutorName)}:</div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            "{translateFeedback(data.tutorNote)}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                        {t('examResult.feedback.strengths')}
                    </div>
                    <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
                        {data.strengths.map((str, idx) => (
                            <li key={idx} style={{ marginBottom: '0.3rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', marginInlineStart: '-15px', color: 'rgba(255,255,255,0.3)' }}>•</span>
                                {translateFeedback(str)}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        {t('examResult.feedback.improve')}
                    </div>
                    <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
                        {data.weaknesses.map((weak, idx) => (
                            <li key={idx} style={{ marginBottom: '0.3rem', position: 'relative' }}>
                                <span style={{ position: 'absolute', marginInlineStart: '-15px', color: 'rgba(255,255,255,0.3)' }}>•</span>
                                {translateFeedback(weak)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
