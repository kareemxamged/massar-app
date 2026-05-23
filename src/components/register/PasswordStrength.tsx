import styles from './PasswordStrength.module.css';

interface PasswordStrengthProps {
    password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
    const getStrength = (pass: string) => {
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const score = getStrength(password);
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['#fb7185', '#fb7185', '#fbbf24', '#34d399', '#2dd4bf'];

    return (
        <div className={styles.container}>
            <div className={styles.bars}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className={styles.bar}
                        style={{
                            backgroundColor: index < score ? colors[score - 1] : 'rgba(255,255,255,0.1)',
                        }}
                    />
                ))}
            </div>
            <div className={styles.label} style={{ color: colors[score - 1] || '#94a3b8' }}>
                {password ? labels[Math.min(score, 4)] : ''}
            </div>
        </div>
    );
}
