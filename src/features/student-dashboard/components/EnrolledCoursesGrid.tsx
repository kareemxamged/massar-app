import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnrolledCourse } from '../types';
import EmptyState from './EmptyState';
import { useTranslation } from 'react-i18next';

interface Props {
    courses: EnrolledCourse[];
}

export default function EnrolledCoursesGrid({ courses }: Props) {
    const { t } = useTranslation('dashboard');
    if (!courses || courses.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-6 font-arabic">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white tracking-tight">{t('student.enrolledCourses')}</h2>
            </div>

            <div className="flex flex-col gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="glass-card rounded-3xl overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 border border-white/5 hover:border-white/10 p-6 relative">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-white line-clamp-1 relative z-10">{course.title}</h3>
                                <p className="text-sm text-gray-400 mt-1 relative z-10">{course.teacherName}</p>
                            </div>
                            <div className="shrink-0 ms-6 px-4 py-2 bg-primary-500/10 backdrop-blur-md rounded-xl text-xs font-bold text-primary-300 border border-primary-500/20 flex flex-col items-center gap-1 relative z-10 w-24">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse absolute top-3 right-3" />
                                <span className="text-lg">{course.progress}%</span>
                                <span className="text-[10px] text-gray-400">{t('student.completed')}</span>
                            </div>
                        </div>

                        <div className="w-full bg-black/30 rounded-full h-2.5 mb-6 border border-white/5 overflow-hidden relative z-10">
                            <div
                                className="bg-gradient-to-r from-primary-500 to-indigo-400 h-2.5 rounded-full transition-all duration-1000 relative"
                                style={{ width: `${course.progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link to={`/student/courses/${course.courseId}`} className="relative group/btn px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 overflow-hidden transition-all z-10 border border-white/10 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/20">
                                <div className="absolute inset-0 bg-white/5 group-hover/btn:bg-primary-500/20 transition-colors" />
                                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                                <span className="relative flex items-center justify-center gap-2 text-white group-hover/btn:text-primary-300 transition-colors">
                                    <Eye size={18} /> {t('student.details', 'التفاصيل')}
                                </span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
