import { CodeQuestion as ICodeQuestion } from '../types';

interface Props {
    question: ICodeQuestion;
    answer: string;
    onChange: (val: string) => void;
}

export default function CodeQuestion({ question, answer, onChange }: Props) {
    // If no answer yet, use initial code if available
    const code = answer !== undefined ? answer : question.initialCode || '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
                background: '#1e1e1e',
                padding: '0.5rem 1rem',
                borderRadius: '8px 8px 0 0',
                fontSize: '0.85rem',
                color: '#9cdcfe',
                borderBottom: '1px solid #333'
            }}>
                {question.language}
            </div>
            <textarea
                value={code}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                style={{
                    width: '100%',
                    minHeight: '300px',
                    padding: '1rem',
                    background: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '0 0 8px 8px',
                    color: '#d4d4d4',
                    fontFamily: 'Consolas, "Courier New", monospace',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    marginTop: '-1rem' // merge with header
                }}
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                * Basic code editor (Write your solution above)
            </div>
        </div>
    );
}
