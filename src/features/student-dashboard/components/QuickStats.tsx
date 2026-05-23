import { BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardStats } from '../types';

interface Props {
    stats: DashboardStats;
}

export default function QuickStats({ stats }: Props) {
    const { t } = useTranslation('dashboard');
    const cards = [
        {
            label: t('student.quickStats.inProgress'),
            value: stats.coursesInProgress,
            icon: BookOpen,
            color: 'text-primary-400',
            bg: 'bg-primary-400/10',
            border: 'border-primary-400/20'
        },
        {
            label: t('student.quickStats.completedExams'),
            value: stats.completedExams,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-400/20'
        },
        {
            label: t('student.quickStats.avgScore'),
            value: `${stats.averageScore}%`,
            icon: TrendingUp,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-400/20'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((stat, idx) => (
                <div key={idx} className="glass-card rounded-3xl p-6 flex items-center justify-between border border-white/5 font-arabic group transition-all duration-300 hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="text-start relative z-10">
                        <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
                        <h4 className="text-3xl font-extrabold text-white tracking-tight" dir="ltr">{stat.value}</h4>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 relative z-10 ${stat.bg} ${stat.color} ${stat.border}`}>
                        <stat.icon size={26} />
                    </div>
                </div>
            ))}
        </div>
    );
}
