import { TrueFalseQuestion as ITrueFalseQuestion } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
    question: ITrueFalseQuestion;
    answer: boolean | undefined;
    onChange: (val: boolean) => void;
}

export default function TrueFalseQuestion({ answer, onChange }: Props) {
    const { t } = useTranslation('common');
    return (
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
            {/* True Button */}
            <button
                onClick={() => onChange(true)}
                style={{
                    flex: 1,
                    maxWidth: '200px',
                    padding: '2rem',
                    background: answer === true ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${answer === true ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{
                    fontSize: '2rem',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: answer === true ? '#10b981' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white'
                }}>✓</div>
                <span style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white' }}>{t('examEngine.question.true')}</span>
            </button>

            {/* False Button */}
            <button
                onClick={() => onChange(false)}
                style={{
                    flex: 1,
                    maxWidth: '200px',
                    padding: '2rem',
                    background: answer === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${answer === false ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{
                    fontSize: '2rem',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: answer === false ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white'
                }}>✕</div>
                <span style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white' }}>{t('examEngine.question.false')}</span>
            </button>
        </div>
    );
}
