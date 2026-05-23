import { Bell } from 'lucide-react';
import { Announcement } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
    announcements: Announcement[];
}

export default function RecentAnnouncements({ announcements }: Props) {
    const { t, i18n } = useTranslation('dashboard');
    if (!announcements || announcements.length === 0) return null;

    return (
        <div className="glass-card rounded-3xl p-6 lg:p-8 border border-white/5 relative overflow-hidden font-arabic">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
                    <Bell size={20} className="text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{t('student.recentAnnouncements')}</h3>
            </div>

            <div className="space-y-5 relative z-10">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="relative group pb-4 border-b border-white/5 last:border-0 last:pb-0 hover:bg-white/[0.02] p-2 -mx-2 rounded-xl transition-colors">
                        {!announcement.isRead && (
                            <span className={`absolute top-3 ${i18n.dir() === 'rtl' ? '-right-1' : '-left-1'} w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse`} />
                        )}

                        <div className="flex justify-between items-start gap-2">
                            <div className={`flex-1 ${i18n.dir() === 'rtl' ? 'pe-3' : 'ps-3'}`}>
                                <h4 className="font-bold text-white text-sm mb-1.5 line-clamp-1">{announcement.title}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-2">{announcement.content}</p>
                                <div className="text-[11px] font-medium text-gray-500" dir="ltr">{new Date(announcement.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' })}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
