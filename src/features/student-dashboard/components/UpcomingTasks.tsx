import { CalendarClock, ArrowLeftCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UpcomingTask } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
    tasks: UpcomingTask[];
}

export default function UpcomingTasks({ tasks }: Props) {
    const { t, i18n } = useTranslation('dashboard');
    if (!tasks || tasks.length === 0) return null;

    return (
        <div className="glass-card rounded-2xl p-6 space-y-4 font-arabic relative overflow-hidden">
            <div className="absolute -left-10 top-0 w-32 h-32 bg-primary-500/10 blur-[50px] pointer-events-none" />
            <div className="flex items-center justify-between mb-2 relative z-10">
                <h3 className="text-lg font-bold text-white">{t('student.upcomingTasks')}</h3>
            </div>

            <div className="space-y-3 relative z-10">
                {tasks.map((task) => {
                    const isExam = task.type === 'exam';
                    return (
                        <Link to={`/student/exams/${task.examId}`} key={task.id} className="relative block group p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-all cursor-pointer">
                            <div className={`absolute top-0 bottom-0 ${i18n.dir() === 'rtl' ? 'right-0 rounded-r-xl' : 'left-0 rounded-l-xl'} w-1 ${isExam ? 'bg-danger-500' : 'bg-primary-500'}`} />

                            <div className={`flex justify-between items-start ${i18n.dir() === 'rtl' ? 'pe-2' : 'ps-2'}`}>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">{task.title}</h4>
                                    <p className="text-xs text-gray-400">{task.courseTitle}</p>
                                    <div className="flex items-center text-xs text-gray-500 mt-2 gap-1.5">
                                        <CalendarClock size={12} className={isExam ? 'text-danger-400' : 'text-primary-400'} />
                                        <span dir="ltr">{new Date(task.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="text-gray-500 group-hover:text-white transition-colors self-center">
                                    <ArrowLeftCircle size={18} className={i18n.dir() === 'rtl' ? '' : 'rotate-180'} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
