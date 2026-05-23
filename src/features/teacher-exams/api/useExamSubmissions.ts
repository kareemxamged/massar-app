import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';

const EXAM_SUBMISSIONS_QUERY_KEY = 'exam-submissions';

export interface SubmissionWithStudent {
  id: string;
  exam_id: number;
  student_id: string;
  score: number | null;
  status: 'started' | 'submitted' | 'graded';
  started_at: string;
  submitted_at: string | null;
  student: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    student_code?: string;
  };
}

export function useExamSubmissions(examId: number | null) {
  return useQuery<SubmissionWithStudent[]>({
    queryKey: [EXAM_SUBMISSIONS_QUERY_KEY, examId],
    queryFn: async () => {
      if (!examId) return [];

      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          student:profiles!inner(
            id,
            full_name,
            avatar_url,
            student_profiles(student_code)
          )
        `)
        .eq('exam_id', examId)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching exam submissions:', error);
        throw error;
      }

      return (data || []).map((submission: any) => ({
        ...submission,
        student: {
          id: submission.student.id,
          full_name: submission.student.full_name,
          avatar_url: submission.student.avatar_url,
          student_code: submission.student.student_profiles?.[0]?.student_code,
        },
      }));
    },
    enabled: !!examId,
  });
}

export function useSubmissionStats(examId: number | null) {
  const { data: submissions, isLoading } = useExamSubmissions(examId);

  const safeSubmissions = submissions ?? [];
  const stats = {
    total: safeSubmissions.length,
    submitted: safeSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length,
    inProgress: safeSubmissions.filter(s => s.status === 'started').length,
    graded: safeSubmissions.filter(s => s.status === 'graded').length,
    averageScore: safeSubmissions.length > 0
      ? safeSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / safeSubmissions.filter(s => s.score !== null).length || 0
      : 0,
  };

  return {
    submissions,
    stats,
    isLoading,
  };
}
