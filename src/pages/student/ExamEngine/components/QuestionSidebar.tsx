import styles from '../ExamEngine.module.css';

interface QuestionSidebarProps {
    questions: any[];
    currentIndex: number;
    answers: Record<number, any>;
    flags: Set<number>;
    onSelectQuestion: (index: number) => void;
}

export default function QuestionSidebar({ questions, currentIndex, answers, flags, onSelectQuestion }: QuestionSidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                Questions Navigation
            </div>
            <div className={styles.questionGrid}>
                {questions.map((q, index) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flags.has(q.id);
                    const isActive = index === currentIndex;
                    
                    return (
                        <button
                            key={q.id}
                            className={`
                                ${styles.qNumBtn}
                                ${isActive ? styles.active : ''}
                                ${isAnswered ? styles.answered : ''}
                                ${isFlagged ? styles.flagged : ''}
                            `}
                            onClick={() => onSelectQuestion(index)}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
