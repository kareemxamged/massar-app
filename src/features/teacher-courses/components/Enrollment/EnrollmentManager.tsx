import { useEffect, useState } from 'react';
import { X, Users, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCourseEnrollment } from '../../hooks/useCourseEnrollment';
import { StudentSearch } from './StudentSearch';
import { GroupEnrollment } from './GroupEnrollment';
import { EnrolledStudentsList } from './EnrolledStudentsList';

interface EnrollmentManagerProps {
    courseId: number;
    courseTitle: string;
    onClose: () => void;
}

export function EnrollmentManager({ courseId, courseTitle, onClose }: EnrollmentManagerProps) {
    const { t, i18n } = useTranslation('common');
    const {
        enrolledStudents,
        searchResults,
        isLoading,
        isSearching,
        fetchEnrolled,
        searchStudents,
        enrollStudent,
        enrollGroup,
        removeEnrollment,
        clearSearch,
    } = useCourseEnrollment();

    const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');

    useEffect(() => {
        void fetchEnrolled(courseId);
    }, [courseId, fetchEnrolled]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex justify-end" dir={i18n.dir()}>
            <div className="w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="text-start">
                        <h2 className="text-xl font-bold text-white tracking-tight">{t('teacherCourses.modals.enrollment.title', 'Manage Students')}</h2>
                        <p className="text-sm text-slate-400 mt-1 truncate max-w-[300px]">{courseTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Add Section */}
                    <div className="p-6 border-b border-slate-800/60 bg-slate-950/20 text-start">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">{t('teacherCourses.modals.enrollment.addStudents', 'Add Students')}</h3>

                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800 mb-5">
                            <button
                                onClick={() => setActiveTab('individual')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'individual'
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                {t('teacherCourses.modals.enrollment.individual', 'Individual')}
                            </button>
                            <button
                                onClick={() => setActiveTab('group')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'group'
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                {t('teacherCourses.modals.enrollment.bulkGroup', 'Bulk Group')}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[120px]">
                            {activeTab === 'individual' ? (
                                <StudentSearch
                                    courseId={courseId}
                                    onSearch={searchStudents}
                                    onSelect={(student) => void enrollStudent(courseId, student.id)}
                                    results={searchResults}
                                    isSearching={isSearching}
                                    onClear={clearSearch}
                                />
                            ) : (
                                <GroupEnrollment onEnroll={(filters) => enrollGroup(courseId, filters)} />
                            )}
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                {t('teacherCourses.modals.enrollment.enrolledStudents', 'Enrolled Students')}
                            </h3>
                            <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2 py-1 rounded">
                                {enrolledStudents.length}
                            </span>
                        </div>

                        <EnrolledStudentsList
                            students={enrolledStudents}
                            isLoading={isLoading}
                            onRemove={removeEnrollment}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
