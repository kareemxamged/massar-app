import { Award, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

export default function WelcomeSection() {
    const { t } = useTranslation('dashboard');
    const { user } = useAuth();

    // Extract first name or fallback
    const firstName = user?.full_name?.split(' ')[0] || (user?.role === 'student' ? 'طالب' : '');

    return (
        <div className="glass-card rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />

            <div className="absolute right-10 top-10 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                <Sparkles size={48} className="text-primary-300 animate-pulse-slow" />
            </div>

            <div className="text-start relative z-10 font-arabic">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
                    {t('student.welcome', { name: firstName })}
                </h2>
                <p className="text-primary-200/80 text-base lg:text-lg font-medium">
                    {t('student.dashboardSubtitle')}
                </p>
            </div>

            <div className="shrink-0 flex gap-4 relative z-10">
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Award className="text-white" size={24} />
                    </div>
                    <div className="text-start font-arabic">
                        <p className="text-xs text-gray-400 mb-1">{t('student.level')}</p>
                        <p className="text-lg font-bold text-white tracking-wide">Level 3</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
