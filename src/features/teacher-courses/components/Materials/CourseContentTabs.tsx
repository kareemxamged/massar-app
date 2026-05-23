import { useState, useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';
import { useCourseMaterials } from '../../hooks/useCourseMaterials';
import { useTranslation } from 'react-i18next';
import { MaterialUploader } from './MaterialUploader';
import { MaterialsList } from './MaterialsList';
import { CourseExamsList } from './CourseExamsList';

interface CourseContentTabsProps {
    courseId: number;
    courseTitle: string;
    onClose: () => void;
}

export function CourseContentTabs({ courseId, courseTitle, onClose }: CourseContentTabsProps) {
    const { t, i18n } = useTranslation('common');
    const [activeTab, setActiveTab] = useState<'materials' | 'exams'>('materials');
    const {
        materials,
        exams,
        isLoading,
        isUploading,
        fetchMaterials,
        fetchExams,
        uploadFile,
        addLink,
        deleteMaterial,
    } = useCourseMaterials();

    useEffect(() => {
        void fetchMaterials(courseId);
        void fetchExams(courseId);
    }, [courseId, fetchMaterials, fetchExams]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex justify-end" dir={i18n.dir()}>
            <div className="w-full max-w-lg bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-start">
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-400" />
                                {t('teacherCourses.modals.content.title', 'Course Content')}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1 truncate max-w-[320px]">{courseTitle}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Master Tabs */}
                    <div className="flex gap-6 border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'materials' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            {t('teacherCourses.modals.content.materialsTab', 'Materials & Resources')}
                            {activeTab === 'materials' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('exams')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'exams' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            {t('teacherCourses.modals.content.examsTab', 'Linked Exams')}
                            {activeTab === 'exams' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'materials' ? (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <section className="text-start">
                                <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                                    {t('teacherCourses.modals.content.addNewMaterial', 'Add New Material')}
                                </h3>
                                <MaterialUploader
                                    isUploading={isUploading}
                                    onUploadFile={(file, title) => uploadFile(courseId, file, title)}
                                    onAddLink={(title, url) => addLink(courseId, title, url)}
                                />
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                        {t('teacherCourses.modals.content.publishedMaterials', 'Published Materials')}
                                    </h3>
                                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2 py-1 rounded">
                                        {materials.length}
                                    </span>
                                </div>
                                <MaterialsList
                                    materials={materials}
                                    isLoading={isLoading}
                                    onDelete={deleteMaterial}
                                />
                            </section>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    {t('teacherCourses.modals.content.courseExams', 'Course Exams')}
                                </h3>
                                <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2 py-1 rounded">
                                    {exams.length}
                                </span>
                            </div>
                            <CourseExamsList exams={exams} isLoading={isLoading} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
