import { Exam } from '../../../services/examService';
import { PlayCircle, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import EmptyState from './EmptyState';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Props {
    exams: Exam[];
    getExamStatus: (exam: Exam) => 'ongoing' | 'upcoming' | 'finished';
}

export default function ExamsGrid({ exams, getExamStatus }: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    if (!exams || exams.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-arabic">
            {exams.map((exam) => {
                const status = getExamStatus(exam);
                const isSubmitted = exam.submission_status === 'submitted';

                // Determine styling based on status
                let statusConfig = {
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-400/10',
                    border: 'border-emerald-400/20',
                    label: t('examsLibrary.badges.ongoing'),
                    btnText: exam.submission_status === 'started' ? t('examsLibrary.buttons.resume') : t('examsLibrary.buttons.startNow'),
                    btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400',
                    btnIcon: <PlayCircle size={18} />
                };

                if (isSubmitted || status === 'finished') {
                    statusConfig = {
                        color: 'text-gray-400',
                        bg: 'bg-gray-400/10',
                        border: 'border-gray-400/20',
                        label: t('examsLibrary.badges.finished'),
                        btnText: t('examsLibrary.buttons.viewResult'),
                        btnBg: 'bg-white/10 hover:bg-white/20 border border-white/5',
                        btnIcon: <CheckCircle size={18} />
                    };
                } else if (status === 'upcoming') {
                    statusConfig = {
                        color: 'text-amber-400',
                        bg: 'bg-amber-400/10',
                        border: 'border-amber-400/20',
                        label: t('examsLibrary.badges.upcoming'),
                        btnText: t('examsLibrary.buttons.waiting'),
                        btnBg: 'bg-white/5 text-gray-500 border border-white/5', // Disabled hover removed
                        btnIcon: <CalendarDays size={18} />
                    };
                }

                return (
                    <div key={exam.id} className="glass-card rounded-3xl overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 border border-white/5 hover:border-white/10 p-6 relative flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex justify-between items-start mb-4">
                            <span className={`shrink-0 px-3 py-1.5 backdrop-blur-md rounded-xl text-xs font-bold border flex items-center gap-2 relative z-10 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                {status === 'ongoing' && !isSubmitted && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                                {statusConfig.label}
                            </span>

                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary-400 border border-white/10 group-hover:scale-110 transition-transform">
                                <Clock size={24} />
                            </div>
                        </div>

                        <div className="flex-grow mb-6 relative z-10 mt-2">
                            <h3 className="font-bold text-xl text-white mb-2 line-clamp-2">{exam.title}</h3>
                            <p className="text-sm text-primary-300 font-medium mb-4">{exam.subject}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-2 rounded-xl border border-white/5">
                                    <Clock size={16} className="text-gray-500" />
                                    <span>{exam.duration_minutes || 60} {t('examsLibrary.minutes')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={() => navigate(`/student/exams/${exam.id}`)}
                                className="flex-1 relative px-3 py-3 rounded-2xl text-sm font-bold flex items-center justify-center transition-all z-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:shadow-lg"
                            >
                                {t('examsLibrary.buttons.details')}
                            </button>
                            <button
                                onClick={() => {
                                    if (isSubmitted || status === 'finished') {
                                        navigate(`/student/exams/${exam.id}/result`);
                                    } else if (status === 'ongoing') {
                                        navigate(`/student/exams/${exam.id}/take`);
                                    }
                                }}
                                disabled={status === 'upcoming' && !isSubmitted}
                                className={`flex-[1.5] relative px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all z-10 ${statusConfig.btnBg} ${status === 'upcoming' && !isSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                            >
                                <span className="relative flex items-center justify-center gap-2 z-10 text-white">
                                    {statusConfig.btnIcon} {statusConfig.btnText}
                                </span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
