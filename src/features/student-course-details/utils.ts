import { ExamItem } from './types';

export function getExamStatus(exam: ExamItem): 'upcoming' | 'active' | 'submitted' | 'completed' {
    if (exam.user_status === 'submitted') return 'submitted';
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(start.getTime() + exam.duration_minutes * 60000);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'completed';
}

export const STATUS_META: Record<string, { labelKey: string; color: string; bg: string }> = {
    upcoming: { labelKey: 'upcoming', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
    active: { labelKey: 'active', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    submitted: { labelKey: 'submitted', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    completed: { labelKey: 'completed', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};

export function gradeColor(pct: number) {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
}

export function gradeLetter(pct: number) {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
}
