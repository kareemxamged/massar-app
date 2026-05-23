import { BookOpen, Sparkles, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EmptyState() {
    const { t } = useTranslation('dashboard');
    return (
        <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center font-arabic border border-white/5 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_60px_rgba(99,102,241,0.15)] group">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-pulse-slow" />
                <BookOpen size={40} className="text-primary-400 group-hover:scale-110 transition-transform duration-500" />
                <Sparkles size={16} className="absolute -top-1 -right-1 text-purple-400 animate-pulse" />
            </div>

            <h3 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-3 relative z-10">
                {t('student.enrollmentsEmptyTitle')}
            </h3>

            <p className="text-gray-400 max-w-md mb-10 text-sm lg:text-base leading-relaxed relative z-10">
                {t('student.enrollmentsEmptyDesc')}
            </p>

            <button className="relative z-10 group relative px-8 py-3.5 rounded-xl font-bold text-sm w-full sm:w-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                <span className="relative flex items-center justify-center gap-2 text-white">
                    <Compass size={18} />
                    {t('student.continue')}
                </span>
            </button>
        </div>
    );
}
