import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';

interface DashboardStats {
  totalExams: number;
  totalStudents: number;
  totalMaterials: number;
  pendingGrading: number;
  totalCourses: number;
  questionBankCount: number;
  indexedDocuments: number;
}

interface RecentActivity {
  id: string;
  type: 'exam_created' | 'submission' | 'ai_generation' | 'material_added';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
}

interface UpcomingExam {
  id: number;
  title: string;
  subject: string;
  start_time: string | null;
  duration_minutes: number;
  status: string;
  total_questions: number;
}

interface ExamScoreData {
  name: string;
  avgScore: number;
  submissions: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  upcomingExams: UpcomingExam[];
  examScores: ExamScoreData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const EMPTY_STATS: DashboardStats = {
  totalExams: 0,
  totalStudents: 0,
  totalMaterials: 0,
  pendingGrading: 0,
  totalCourses: 0,
  questionBankCount: 0,
  indexedDocuments: 0,
};

export function useTeacherDashboard(): DashboardData {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [examScores, setExamScores] = useState<ExamScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const teacherId = user.id;

      // Get teacher's courses first
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', teacherId);

      const courseIds = (courses ?? []).map((c: { id: number }) => c.id);

      if (courseIds.length === 0) {
        setStats(EMPTY_STATS);
        setUpcomingExams([]);
        setExamScores([]);
        setRecentActivity([]);
        setLoading(false);
        return;
      }

      // Parallel fetch all stats
      const [examsRes, enrollmentsRes, materialsRes, _submissionsRes, questionsRes, chunksRes] = await Promise.all([
        supabase.from('exams').select('id, status', { count: 'exact' }).in('course_id', courseIds),
        supabase.from('enrollments').select('id', { count: 'exact' }).in('course_id', courseIds),
        supabase.from('course_materials').select('id', { count: 'exact' }).in('course_id', courseIds),
        supabase.from('submissions').select('id, score, exam_id', { count: 'exact' })
          .eq('status', 'submitted')
          .gt('score', 0),
        supabase.from('question_bank').select('id', { count: 'exact' }).eq('teacher_id', teacherId),
        supabase.from('document_chunks').select('id', { count: 'exact' }),
      ]);
      void _submissionsRes;

      // Count pending grading: submissions with score=0 and status='submitted'
      const { count: pendingCount } = await supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'submitted')
        .eq('score', 0);

      setStats({
        totalExams: examsRes.count ?? 0,
        totalStudents: enrollmentsRes.count ?? 0,
        totalMaterials: materialsRes.count ?? 0,
        pendingGrading: pendingCount ?? 0,
        totalCourses: courseIds.length,
        questionBankCount: questionsRes.count ?? 0,
        indexedDocuments: chunksRes.count ?? 0,
      });

      // Fetch upcoming exams
      const { data: upcoming } = await supabase
        .from('exams')
        .select('id, title, subject, start_time, duration_minutes, status, total_questions')
        .in('course_id', courseIds)
        .in('status', ['upcoming', 'ongoing'])
        .order('start_time', { ascending: true })
        .limit(5);

      setUpcomingExams((upcoming ?? []) as unknown as UpcomingExam[]);

      // Fetch exam score distribution for chart
      const { data: examData } = await supabase
        .from('exams')
        .select('id, title')
        .in('course_id', courseIds)
        .limit(6);

      if (examData && examData.length > 0) {
        const examIds = examData.map((e: { id: number }) => e.id);
        const { data: subData } = await supabase
          .from('submissions')
          .select('exam_id, score')
          .in('exam_id', examIds)
          .eq('status', 'submitted');

        const scoreMap = new Map<number, { total: number; count: number }>();
        for (const s of (subData ?? []) as { exam_id: number; score: number }[]) {
          const cur = scoreMap.get(s.exam_id) ?? { total: 0, count: 0 };
          cur.total += Number(s.score);
          cur.count += 1;
          scoreMap.set(s.exam_id, cur);
        }

        const scores: ExamScoreData[] = examData.map((e: { id: number; title: string }) => {
          const data = scoreMap.get(e.id);
          return {
            name: e.title.length > 15 ? e.title.substring(0, 15) + '…' : e.title,
            avgScore: data ? Math.round(data.total / data.count) : 0,
            submissions: data?.count ?? 0,
          };
        });
        setExamScores(scores);
      }

      // Build recent activity feed
      const activities: RecentActivity[] = [];

      // Recent submissions
      const { data: recentSubs } = await supabase
        .from('submissions')
        .select('id, exam_id, score, submitted_at, student_id, exams(title)')
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(3);

      for (const s of (recentSubs ?? []) as Record<string, unknown>[]) {
        const examTitle = (s.exams as Record<string, unknown>)?.title ?? 'Exam';
        activities.push({
          id: s.id as string,
          type: 'submission',
          title: examTitle as string,
          subtitle: `Score: ${s.score}%`,
          timestamp: s.submitted_at as string,
          icon: '📝',
        });
      }

      // Recent exams created
      const { data: recentExams } = await supabase
        .from('exams')
        .select('id, title, created_at')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(3);

      for (const e of (recentExams ?? []) as Record<string, unknown>[]) {
        activities.push({
          id: String(e.id),
          type: 'exam_created',
          title: e.title as string,
          subtitle: 'New exam created',
          timestamp: e.created_at as string,
          icon: '📋',
        });
      }

      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 8));

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { stats, recentActivity, upcomingExams, examScores, loading, error, refetch: fetchDashboard };
}
