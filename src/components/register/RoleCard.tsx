import styles from './RoleCard.module.css';

interface RoleCardProps {
    role: string;
    label: string;
    icon: string;
    selected: boolean;
    onSelect: (role: string) => void;
}

export default function RoleCard({ role, label, icon, selected, onSelect }: RoleCardProps) {
    return (
        <div
            className={`${styles.card} ${selected ? styles.selected : ''}`}
            onClick={() => onSelect(role)}
        >
            <div className={styles.icon}>{icon}</div>
            <div className={styles.label}>{label}</div>
        </div>
    );
}
