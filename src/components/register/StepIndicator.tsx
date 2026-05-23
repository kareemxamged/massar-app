import styles from './StepIndicator.module.css';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div key={index} className={styles.stepWrapper}>
                        <div className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                            {isCompleted ? '✓' : stepNumber}
                        </div>
                        {index < totalSteps - 1 && (
                            <div className={`${styles.line} ${isCompleted ? styles.lineCompleted : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
