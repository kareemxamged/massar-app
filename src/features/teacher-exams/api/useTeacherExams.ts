import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import type { ExamWithSubmissions } from '../types';

const TEACHER_EXAMS_QUERY_KEY = 'teacher-exams';

export interface UseTeacherExamsOptions {
  enabled?: boolean;
}

export function useTeacherExams(options: UseTeacherExamsOptions = {}) {
  const queryClient = useQueryClient();

  const query = useQuery<ExamWithSubmissions[]>({
    queryKey: [TEACHER_EXAMS_QUERY_KEY],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          courses:course_id (title),
          submissions:submissions(id)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teacher exams:', error);
        throw error;
      }

      return (data || []).map((exam: any) => ({
        ...exam,
        submissions_count: exam.submissions?.length || 0,
        course_name: exam.courses?.title || exam.subject,
      }));
    },
    enabled: options.enabled !== false,
  });

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: [TEACHER_EXAMS_QUERY_KEY] });
  };

  return {
    exams: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
  };
}

export function usePrefetchTeacherExams() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: [TEACHER_EXAMS_QUERY_KEY],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data } = await supabase
          .from('exams')
          .select(`
            *,
            courses:course_id (title),
            submissions:submissions(id)
          `)
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        return (data || []).map((exam: any) => ({
          ...exam,
          submissions_count: exam.submissions?.length || 0,
          course_name: exam.courses?.title || exam.subject,
        }));
      },
    });
  };
}
