import { Check } from 'lucide-react';
import styles from '../ExamCreator.module.css';

interface StepperProps {
    currentStep: number;
    steps: { id: number; title: string }[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
    return (
        <div className={styles.stepper}>
            {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                    <div key={step.id} className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                        <div className={styles.stepIcon}>
                            {isCompleted ? <Check size={20} /> : step.id}
                        </div>
                        <span className={styles.stepLabel}>{step.title}</span>
                        <div className={styles.stepConnector} />
                    </div>
                );
            })}
        </div>
    );
}

export default Stepper;
