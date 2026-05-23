import { EssayQuestion as IEssayQuestion } from '../types';

interface Props {
    question: IEssayQuestion;
    answer: string;
    onChange: (val: string) => void;
}

export default function EssayQuestion({ question, answer, onChange }: Props) {
    const text = answer || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const limit = question.wordLimit || 500;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
                value={text}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type your answer here..."
                style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    resize: 'vertical'
                }}
            />
            <div style={{
                textAlign: 'right',
                fontSize: '0.9rem',
                color: wordCount > limit ? '#ef4444' : 'var(--text-muted)'
            }}>
                Word Count: {wordCount} / {limit}
            </div>
        </div>
    );
}
