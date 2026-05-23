import { MCQQuestion as IMCQQuestion } from '../types';

interface Props {
    question: IMCQQuestion;
    answer: string;
    onChange: (val: string) => void;
}

export default function MCQQuestion({ question, answer, onChange }: Props) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {question.options.map((option, idx) => {
                const isSelected = answer === option;
                return (
                    <label
                        key={idx}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.5rem',
                            background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '1rem'
                        }}
                    >
                        <input
                            type="radio"
                            name={`q-${question.id}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => onChange(option)}
                            style={{
                                width: '1.2rem',
                                height: '1.2rem',
                                accentColor: 'var(--primary)'
                            }}
                        />
                        <span style={{ color: isSelected ? 'white' : 'var(--text-primary)' }}>
                            {option}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
