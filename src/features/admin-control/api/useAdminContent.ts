import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { adminControlApi } from './adminControlApi';
import type {
  CourseForReview,
  CourseApprovalStatus,
  ExamForReview,
  MaterialForReview,
  Specialty,
  SpecialtyInput,
  ContentReport,
  AdminContentToast,
} from '../types';

export function useAdminContent() {
  const { user } = useAuth();
  const adminId = user?.id ?? '';

  // ─── Course Queue ──────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<CourseForReview[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [queueFilter, setQueueFilter] = useState<CourseApprovalStatus | undefined>(undefined);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await adminControlApi.getCourseQueue(queueFilter);
      setCourses(data);
    } catch {
      showToast('error', 'Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  }, [queueFilter]);

  useEffect(() => { void loadCourses(); }, [loadCourses]);

  const resetCourseToReview = async (id: number) => {
    try {
      await adminControlApi.resetCourseToReview(id);
      showToast('success', 'Course returned to review queue');
      await loadCourses();
    } catch {
      showToast('error', 'Failed to reset course');
      throw new Error('reset failed');
    }
  };

  const approveCourse = async (id: number, notes?: string) => {
    try {
      await adminControlApi.approveCourse(id, adminId, notes);
      showToast('success', 'Course approved successfully');
      await loadCourses();
    } catch {
      showToast('error', 'Failed to approve course');
      throw new Error('approve failed');
    }
  };

  const rejectCourse = async (id: number, notes: string) => {
    if (!notes.trim()) throw new Error('Rejection reason is required');
    try {
      await adminControlApi.rejectCourse(id, adminId, notes);
      showToast('success', 'Course rejected');
      await loadCourses();
    } catch {
      showToast('error', 'Failed to reject course');
      throw new Error('reject failed');
    }
  };

  // ─── Specialties ──────────────────────────────────────────────────────────
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true);

  const loadSpecialties = useCallback(async () => {
    setSpecialtiesLoading(true);
    try {
      const data = await adminControlApi.getSpecialties();
      setSpecialties(data);
    } catch {
      showToast('error', 'Failed to load specialties');
    } finally {
      setSpecialtiesLoading(false);
    }
  }, []);

  useEffect(() => { void loadSpecialties(); }, [loadSpecialties]);

  const createSpecialty = async (input: SpecialtyInput) => {
    try {
      await adminControlApi.createSpecialty(input);
      showToast('success', 'Specialty created');
      await loadSpecialties();
    } catch {
      showToast('error', 'Failed to create specialty');
      throw new Error('create failed');
    }
  };

  const updateSpecialty = async (id: number, input: SpecialtyInput) => {
    try {
      await adminControlApi.updateSpecialty(id, input);
      showToast('success', 'Specialty updated');
      await loadSpecialties();
    } catch {
      showToast('error', 'Failed to update specialty');
      throw new Error('update failed');
    }
  };

  const deleteSpecialty = async (id: number) => {
    try {
      await adminControlApi.deleteSpecialty(id);
      showToast('success', 'Specialty deleted');
      await loadSpecialties();
    } catch {
      showToast('error', 'Failed to delete specialty');
      throw new Error('delete failed');
    }
  };

  // ─── Academic Levels ──────────────────────────────────────────────────────
  const [academicLevels, setAcademicLevels] = useState<{ id: number; name: string; code: string | null; display_order: number | null }[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);

  const loadLevels = useCallback(async () => {
    setLevelsLoading(true);
    try {
      const data = await adminControlApi.getAcademicLevels();
      setAcademicLevels(data);
    } catch {
      showToast('error', 'Failed to load academic levels');
    } finally {
      setLevelsLoading(false);
    }
  }, []);

  useEffect(() => { void loadLevels(); }, [loadLevels]);

  const createLevel = async (input: { name: string; code: string; display_order: number }) => {
    try {
      await adminControlApi.createAcademicLevel(input);
      showToast('success', 'Academic level created');
      await loadLevels();
    } catch {
      showToast('error', 'Failed to create level');
      throw new Error('create failed');
    }
  };

  const updateLevel = async (id: number, input: { name: string; code: string; display_order: number }) => {
    try {
      await adminControlApi.updateAcademicLevel(id, input);
      showToast('success', 'Academic level updated');
      await loadLevels();
    } catch {
      showToast('error', 'Failed to update level');
      throw new Error('update failed');
    }
  };

  const deleteLevel = async (id: number) => {
    try {
      await adminControlApi.deleteAcademicLevel(id);
      showToast('success', 'Academic level deleted');
      await loadLevels();
    } catch {
      showToast('error', 'Failed to delete level');
      throw new Error('delete failed');
    }
  };

  // ─── Reports ──────────────────────────────────────────────────────────────
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsFilter, setReportsFilter] = useState<'open' | 'resolved' | undefined>(undefined);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const data = await adminControlApi.getContentReports(reportsFilter);
      setReports(data);
    } catch {
      showToast('error', 'Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  }, [reportsFilter]);

  useEffect(() => { void loadReports(); }, [loadReports]);

  const resolveReport = async (id: string) => {
    try {
      await adminControlApi.resolveReport(id);
      showToast('success', 'Report resolved');
      await loadReports();
    } catch {
      showToast('error', 'Failed to resolve report');
      throw new Error('resolve failed');
    }
  };

  const submitReport = async (courseId: number, reason: string) => {
    try {
      await adminControlApi.submitCourseReport(courseId, adminId, reason);
      showToast('success', 'Report filed successfully');
      await loadReports();
    } catch {
      showToast('error', 'Failed to file report');
      throw new Error('report failed');
    }
  };

  // ─── Exam Queue ───────────────────────────────────────────────────────────
  const [exams, setExams] = useState<ExamForReview[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examQueueFilter, setExamQueueFilter] = useState<CourseApprovalStatus | undefined>(undefined);

  const loadExams = useCallback(async () => {
    setExamsLoading(true);
    try {
      const data = await adminControlApi.getExamQueue(examQueueFilter);
      setExams(data);
    } catch {
      showToast('error', 'Failed to load exam queue');
    } finally {
      setExamsLoading(false);
    }
  }, [examQueueFilter]);

  useEffect(() => { void loadExams(); }, [loadExams]);

  const resetExamToReview = async (id: number) => {
    try {
      await adminControlApi.resetExamToReview(id);
      showToast('success', 'Exam returned to review queue');
      await loadExams();
    } catch {
      showToast('error', 'Failed to reset exam');
      throw new Error('reset failed');
    }
  };

  const approveExam = async (id: number, notes?: string) => {
    try {
      await adminControlApi.approveExam(id, adminId, notes);
      showToast('success', 'Exam approved — now visible to students');
      await loadExams();
    } catch {
      showToast('error', 'Failed to approve exam');
      throw new Error('approve failed');
    }
  };

  const rejectExam = async (id: number, notes: string) => {
    if (!notes.trim()) throw new Error('Rejection reason is required');
    try {
      await adminControlApi.rejectExam(id, adminId, notes);
      showToast('success', 'Exam rejected');
      await loadExams();
    } catch {
      showToast('error', 'Failed to reject exam');
      throw new Error('reject failed');
    }
  };

  // ─── Material Queue ───────────────────────────────────────────────────────
  const [materials, setMaterials] = useState<MaterialForReview[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialQueueFilter, setMaterialQueueFilter] = useState<CourseApprovalStatus | undefined>(undefined);

  const loadMaterials = useCallback(async () => {
    setMaterialsLoading(true);
    try {
      const data = await adminControlApi.getMaterialQueue(materialQueueFilter);
      setMaterials(data);
    } catch {
      showToast('error', 'Failed to load material queue');
    } finally {
      setMaterialsLoading(false);
    }
  }, [materialQueueFilter]);

  useEffect(() => { void loadMaterials(); }, [loadMaterials]);

  const resetMaterialToReview = async (id: number) => {
    try {
      await adminControlApi.resetMaterialToReview(id);
      showToast('success', 'Material returned to review queue');
      await loadMaterials();
    } catch {
      showToast('error', 'Failed to reset material');
      throw new Error('reset failed');
    }
  };

  const approveMaterial = async (id: number, notes?: string) => {
    try {
      await adminControlApi.approveMaterial(id, adminId, notes);
      showToast('success', 'Material approved — now visible to students');
      await loadMaterials();
    } catch {
      showToast('error', 'Failed to approve material');
      throw new Error('approve failed');
    }
  };

  const rejectMaterial = async (id: number, notes: string) => {
    if (!notes.trim()) throw new Error('Rejection reason is required');
    try {
      await adminControlApi.rejectMaterial(id, adminId, notes);
      showToast('success', 'Material rejected');
      await loadMaterials();
    } catch {
      showToast('error', 'Failed to reject material');
      throw new Error('reject failed');
    }
  };

  // ─── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<AdminContentToast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  return {
    // courses
    courses, coursesLoading, queueFilter, setQueueFilter,
    approveCourse, rejectCourse, resetCourseToReview, refreshCourses: loadCourses,
    // exams
    exams, examsLoading, examQueueFilter, setExamQueueFilter,
    approveExam, rejectExam, resetExamToReview, refreshExams: loadExams,
    // specialties
    specialties, specialtiesLoading,
    createSpecialty, updateSpecialty, deleteSpecialty,
    // levels
    academicLevels, levelsLoading,
    createLevel, updateLevel, deleteLevel,
    // materials
    materials, materialsLoading, materialQueueFilter, setMaterialQueueFilter,
    approveMaterial, rejectMaterial, resetMaterialToReview, refreshMaterials: loadMaterials,
    // reports
    reports, reportsLoading, reportsFilter, setReportsFilter,
    resolveReport, submitReport, refreshReports: loadReports,
    // ui
    toast,
  };
}
