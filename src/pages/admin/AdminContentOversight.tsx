import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, FileSearch, Tag, AlertTriangle, CheckCircle, XCircle, ClipboardList, Paperclip, RefreshCw } from 'lucide-react';
import { useAdminContent } from '../../features/admin-control/api/useAdminContent';
import CourseApprovalQueue from '../../features/admin-control/components/CourseApprovalQueue';
import CourseReviewModal from '../../features/admin-control/components/CourseReviewModal';
import CategoryTaxonomyManager from '../../features/admin-control/components/CategoryTaxonomyManager';
import ReportsInbox from '../../features/admin-control/components/ReportsInbox';
import ExamApprovalQueue from '../../features/admin-control/components/ExamApprovalQueue';
import MaterialApprovalQueue from '../../features/admin-control/components/MaterialApprovalQueue';
import type { CourseForReview } from '../../features/admin-control/types';

type Tab = 'approvals' | 'exams' | 'materials' | 'categories' | 'reports';

export default function AdminContentOversight() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  const [reviewCourse, setReviewCourse] = useState<CourseForReview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'approvals', label: isRtl ? 'موافقة الدورات' : 'Course Approvals', icon: <FileSearch size={16} /> },
    { id: 'exams', label: isRtl ? 'الامتحانات' : 'Exams', icon: <ClipboardList size={16} /> },
    { id: 'materials', label: isRtl ? 'المرفقات' : 'Materials', icon: <Paperclip size={16} /> },
    { id: 'categories', label: isRtl ? 'التصنيفات' : 'Categories', icon: <Tag size={16} /> },
    { id: 'reports', label: isRtl ? 'التقارير' : 'Reports', icon: <AlertTriangle size={16} /> },
  ];

  const {
    courses, coursesLoading, queueFilter, setQueueFilter,
    approveCourse, rejectCourse, resetCourseToReview, refreshCourses,
    exams, examsLoading, examQueueFilter, setExamQueueFilter,
    approveExam, rejectExam, resetExamToReview, refreshExams,
    materials, materialsLoading, materialQueueFilter, setMaterialQueueFilter,
    approveMaterial, rejectMaterial, resetMaterialToReview, refreshMaterials,
    specialties, specialtiesLoading,
    createSpecialty, updateSpecialty, deleteSpecialty,
    academicLevels, levelsLoading,
    createLevel, updateLevel, deleteLevel,
    reports, reportsLoading, reportsFilter, setReportsFilter,
    resolveReport, submitReport, refreshReports,
    toast,
  } = useAdminContent();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'approvals') await refreshCourses();
      else if (activeTab === 'exams') await refreshExams();
      else if (activeTab === 'materials') await refreshMaterials();
      else if (activeTab === 'reports') await refreshReports();
    } finally {
      setRefreshing(false);
    }
  };

  const pendingCount = courses.filter(c => c.approval_status === 'pending').length;
  const pendingExamCount = exams.filter(e => e.approval_status === 'pending').length;
  const pendingMaterialCount = materials.filter(m => m.approval_status === 'pending').length;
  const openReports = reports.filter(r => r.status === 'open').length;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${isRtl ? 'font-tajawal' : ''}`}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <ShieldCheck size={26} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              {isRtl ? 'مراقبة المحتوى' : 'Content Oversight'}
            </h1>
            <p className="text-sm line-clamp-1" style={{ color: 'var(--text-muted)' }}>
              {isRtl ? 'إدارة ومراجعة الدورات والامتحانات المرفقات التعليمية المضافة حديثاً' : 'Manage and review newly added courses, exams, and materials'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 shrink-0"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }}
            title={isRtl ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {isRtl ? 'تحديث' : 'Refresh'}
          </button>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto hide-scrollbar whitespace-nowrap">
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                {isRtl ? `الدورات (${pendingCount})` : `Courses (${pendingCount})`}
              </span>
            )}
            {pendingExamCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                {isRtl ? `الامتحانات (${pendingExamCount})` : `Exams (${pendingExamCount})`}
              </span>
            )}
            {pendingMaterialCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                {isRtl ? `المرفقات (${pendingMaterialCount})` : `Materials (${pendingMaterialCount})`}
              </span>
            )}
            {openReports > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185' }}>
                {isRtl ? `التقارير (${openReports})` : `Reports (${openReports})`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-1 p-1 rounded-xl whitespace-nowrap inline-flex" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const hasBadge = (tab.id === 'approvals' && pendingCount > 0) || (tab.id === 'exams' && pendingExamCount > 0) || (tab.id === 'materials' && pendingMaterialCount > 0) || (tab.id === 'reports' && openReports > 0);
            const badgeCount = tab.id === 'approvals' ? pendingCount : tab.id === 'exams' ? pendingExamCount : tab.id === 'materials' ? pendingMaterialCount : openReports;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0"
                style={{
                  background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: isActive ? '#6366f1' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                }}
              >
                {tab.icon}
                {tab.label}
                {hasBadge && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold"
                    style={{ background: tab.id === 'reports' ? '#fb7185' : tab.id === 'exams' ? '#a78bfa' : tab.id === 'materials' ? '#38bdf8' : '#fbbf24', color: '#000', fontSize: 10 }}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full relative z-0">
        {activeTab === 'approvals' && (
          <CourseApprovalQueue
            courses={courses}
            loading={coursesLoading}
            filter={queueFilter}
            onFilterChange={setQueueFilter}
            onReview={setReviewCourse}
          />
        )}

        {activeTab === 'exams' && (
          <ExamApprovalQueue
            exams={exams}
            loading={examsLoading}
            filter={examQueueFilter}
            onFilterChange={setExamQueueFilter}
            onApprove={approveExam}
            onReject={rejectExam}
            onResetToReview={resetExamToReview}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialApprovalQueue
            materials={materials}
            loading={materialsLoading}
            filter={materialQueueFilter}
            onFilterChange={setMaterialQueueFilter}
            onApprove={approveMaterial}
            onReject={rejectMaterial}
            onResetToReview={resetMaterialToReview}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryTaxonomyManager
            specialties={specialties}
            specialtiesLoading={specialtiesLoading}
            onCreateSpecialty={createSpecialty}
            onUpdateSpecialty={updateSpecialty}
            onDeleteSpecialty={deleteSpecialty}
            academicLevels={academicLevels}
            levelsLoading={levelsLoading}
            onCreateLevel={createLevel}
            onUpdateLevel={updateLevel}
            onDeleteLevel={deleteLevel}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsInbox
            reports={reports}
            loading={reportsLoading}
            filter={reportsFilter}
            onFilterChange={setReportsFilter}
            onResolve={resolveReport}
          />
        )}
      </div>

      {reviewCourse && (
        <CourseReviewModal
          course={reviewCourse}
          onClose={() => setReviewCourse(null)}
          onApprove={approveCourse}
          onReject={rejectCourse}
          onResetToReview={resetCourseToReview}
          onReport={submitReport}
        />
      )}

      {/* Global Toast */}
      {toast && (
        <div
          className="fixed bottom-4 end-4 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? 'rgba(5,150,105,0.95)' : 'rgba(190,18,60,0.95)',
            border: `1px solid ${toast.type === 'success' ? '#059669' : '#be123c'}`,
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} className="shrink-0" /> : <XCircle size={16} className="shrink-0" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
