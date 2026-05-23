import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase';
import { Course } from '../types';

export function useTeacherCourseOptions(teacherId: string | undefined) {
    const [options, setOptions] = useState<Pick<Course, 'id' | 'title' | 'code'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOptions = useCallback(async () => {
        if (!teacherId) return;
        setIsLoading(true);
        
        const { data, error } = await supabase
            .from('courses')
            .select('id, title, code')
            .eq('teacher_id', teacherId)
            .eq('visibility', 'active')
            .order('title', { ascending: true });

        if (error) {
            console.error('Failed to fetch courses:', error);
            setOptions([]);
        } else {
            setOptions(data ?? []);
        }
        
        setIsLoading(false);
    }, [teacherId]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    return { options, isLoading, refetch: fetchOptions };
}
