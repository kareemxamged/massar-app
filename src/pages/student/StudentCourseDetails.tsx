import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { courseService } from '../../services/courseService';

// Types & Utils
import { CourseData, Material, TabId, ExamItem } from '../../features/student-course-details/types';
import { getExamStatus } from '../../features/student-course-details/utils';

// Components
import CourseHeader from '../../features/student-course-details/components/CourseHeader';
import CourseTabs from '../../features/student-course-details/components/CourseTabs';
import OverviewTab from '../../features/student-course-details/components/OverviewTab';
import ExamsTab from '../../features/student-course-details/components/ExamsTab';
import GradesTab from '../../features/student-course-details/components/GradesTab';
import MaterialsTab from '../../features/student-course-details/components/MaterialsTab';

export default function StudentCourseDetails() {
    const { id } = useParams();
    const location = useLocation();
    const { t, i18n } = useTranslation('common');

    const initialTab = (location.state?.activeTab as TabId) || 'overview';
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [tabKey, setTabKey] = useState(0);

    const [course, setCourse] = useState<CourseData | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    const storageKey = `course_materials_viewed_${id}`;
    const [viewed, setViewed] = useState<Set<number>>(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            return raw ? new Set<number>(JSON.parse(raw) as number[]) : new Set<number>();
        } catch { return new Set<number>(); }
    });

    const toggleViewed = useCallback((matId: number) => {
        setViewed(prev => {
            const next = new Set(prev);
            next.has(matId) ? next.delete(matId) : next.add(matId);
            localStorage.setItem(storageKey, JSON.stringify([...next]));
            return next;
        });
    }, [storageKey]);

    const switchTab = (tab: TabId) => {
        setActiveTab(tab);
        setTabKey(k => k + 1);
    };

    useEffect(() => {
        if (!id) return;
        Promise.all([courseService.getCourseDetails(id), courseService.getMaterials(id)])
            .then(([courseData, matData]) => {
                setCourse(courseData as CourseData);
                setMaterials(matData as Material[]);
            })
            .catch(err => console.error('Failed to fetch course details', err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)', gap: '0.75rem', direction: i18n.dir() }}>
            <Clock size={18} /> {t('courseDetails.loading', 'Loading course…')}
        </div>
    );
    if (!course) return (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem', direction: i18n.dir() }}>
            {t('courseDetails.notFound', 'Course not found.')}
        </div>
    );

    // Derived data
    const allExams = course.exams ?? [];
    const pastResults = allExams
        .filter(e => e.user_status === 'submitted')
        .map(e => ({
            ...e
        }));

    const earnedPts = pastResults.reduce((s, r) => s + (r.user_score ?? 0), 0);
    const totalPts = pastResults.reduce((s, r) => s + (r.total_marks || 100), 0);
    const overallPct = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : 0;
    const avgGrade = course.performance?.grade ?? overallPct;

    const sortedExams = [...allExams].sort((a, b) => {
        const aStatus = getExamStatus(a);
        const bStatus = getExamStatus(b);
        if (aStatus === 'active' && bStatus !== 'active') return -1;
        if (bStatus === 'active' && aStatus !== 'active') return 1;
        if ((aStatus === 'completed' || aStatus === 'submitted') && bStatus === 'upcoming') return -1;
        if ((bStatus === 'completed' || bStatus === 'submitted') && aStatus === 'upcoming') return 1;
        const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
        const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
        return bTime - aTime;
    });

    const groupedExams = sortedExams.reduce<Record<string, ExamItem[]>>((acc, exam) => {
        const month = exam.start_time ? new Date(exam.start_time).toLocaleString('default', { month: 'long', year: 'numeric' }) : t('courseDetails.exams.alwaysAvailable', 'Always Available');
        (acc[month] ??= []).push(exam);
        return acc;
    }, {});

    const groupedMaterials = materials.reduce<Record<number, Material[]>>((acc, mat) => {
        const wk = mat.week ?? 0;
        (acc[wk] ??= []).push(mat);
        return acc;
    }, {});

    const tabCounts: Record<TabId, number | null> = {
        overview: null,
        exams: allExams.length,
        grades: pastResults.length,
        materials: materials.length,
    };

    const panelStyle: React.CSSProperties = {
        animation: 'cdFadeSlide 0.28s ease both',
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            <style>{`
                @keyframes cdFadeSlide {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cd-tab-btn { transition: color 0.18s, border-color 0.18s, background 0.18s; }
                .cd-tab-btn:hover { color: white !important; }
                .cd-viewed-btn { transition: opacity 0.18s, transform 0.18s; }
                .cd-viewed-btn:hover { transform: scale(1.12); }
            `}</style>

            <CourseHeader course={course} />

            <CourseTabs
                activeTab={activeTab}
                switchTab={switchTab}
                tabCounts={tabCounts}
            />

            {activeTab === 'overview' && (
                <OverviewTab
                    course={course}
                    pastResults={pastResults}
                    materials={materials}
                    avgGrade={avgGrade}
                    overallPct={overallPct}
                    allExams={allExams}
                    getExamStatus={getExamStatus}
                    switchTab={switchTab}
                    panelStyle={panelStyle}
                    tabKey={tabKey}
                />
            )}

            {activeTab === 'exams' && (
                <ExamsTab
                    groupedExams={groupedExams}
                    allExamsLength={allExams.length}
                    panelStyle={panelStyle}
                    tabKey={tabKey}
                />
            )}

            {activeTab === 'grades' && (
                <GradesTab
                    pastResults={pastResults}
                    earnedPts={earnedPts}
                    totalPts={totalPts}
                    overallPct={overallPct}
                    panelStyle={panelStyle}
                    tabKey={tabKey}
                />
            )}

            {activeTab === 'materials' && (
                <MaterialsTab
                    groupedMaterials={groupedMaterials}
                    materialsLength={materials.length}
                    viewed={viewed}
                    toggleViewed={toggleViewed}
                    panelStyle={panelStyle}
                    tabKey={tabKey}
                />
            )}
        </div>
    );
}
