import { supabase } from './supabase';

export async function submitCourseReport(courseId: number, reason: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('content_reports')
    .insert({ reporter_id: user.id, course_id: courseId, reason } as Record<string, unknown>);
  if (error) throw error;
}
