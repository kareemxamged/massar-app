import { Question } from '../types';
import { useTranslation } from 'react-i18next';
import MCQQuestion from './MCQQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import EssayQuestion from './EssayQuestion';
import CodeQuestion from './CodeQuestion';

interface QuestionAreaProps {
    question: Question;
    answer: any;
    onChange: (value: any) => void;
}

export default function QuestionArea({ question, answer, onChange }: QuestionAreaProps) {
    const { t } = useTranslation('common');
    return (
        <div className="glass-card" style={{
            padding: '2rem',
            marginBottom: '4rem', // Space for footer
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            {/* Question Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '1rem',
                marginBottom: '1rem'
            }}>
                <h2 dir="auto" style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'white',
                    lineHeight: '1.6',
                    margin: 0,
                    maxWidth: '85%'
                }}>
                    {question.text}
                </h2>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                }}>
                    {question.marks} {t('examEngine.question.marks')}
                </div>
            </div>

            {/* Answer Area */}
            <div style={{ flex: 1 }} dir="auto">
                {question.type === 'mcq' && (
                    <MCQQuestion
                        question={question as any}
                        answer={answer}
                        onChange={onChange}
                    />
                )}
                {question.type === 'true_false' && (
                    <TrueFalseQuestion
                        question={question as any}
                        answer={answer}
                        onChange={onChange}
                    />
                )}
                {question.type === 'essay' && (
                    <EssayQuestion
                        question={question as any}
                        answer={answer}
                        onChange={onChange}
                    />
                )}
                {question.type === 'code' && (
                    <CodeQuestion
                        question={question as any}
                        answer={answer}
                        onChange={onChange}
                    />
                )}
            </div>
        </div>
    );
}
