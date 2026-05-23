import { supabase } from '../../../services/supabase';
import { Question, CreateQuestionRequest, UpdateQuestionRequest, QuestionFilters } from '../types';

export const questionBankService = {
    // Get all questions with filters
    async getQuestions(filters?: QuestionFilters): Promise<Question[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        let query = supabase
            .from('question_bank')
            .select(`
                *,
                course:course_id (id, title, code)
            `)
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false });

        if (filters?.search) {
            query = query.ilike('content', `%${filters.search}%`);
        }

        if (filters?.course_id) {
            query = query.eq('course_id', filters.course_id);
        }

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.difficulty) {
            query = query.eq('difficulty', filters.difficulty);
        }

        if (filters?.tags && filters.tags.length > 0) {
            query = query.overlaps('tags', filters.tags);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }

        return data || [];
    },

    // Get single question by ID
    async getQuestionById(id: string): Promise<Question | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('question_bank')
            .select(`
                *,
                course:course_id (id, title, code)
            `)
            .eq('id', id)
            .eq('teacher_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Error fetching question:', error);
            throw error;
        }

        return data;
    },

    // Create new question
    async createQuestion(request: CreateQuestionRequest): Promise<Question> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('question_bank')
            .insert({
                teacher_id: user.id,
                course_id: request.course_id || null,
                content: request.content,
                type: request.type,
                difficulty: request.difficulty,
                options: request.options || null,
                correct_answer: request.correct_answer || null,
                explanation: request.explanation || null,
                tags: request.tags || []
            })
            .select(`
                *,
                course:course_id (id, title, code)
            `)
            .single();

        if (error) {
            console.error('Error creating question:', error);
            throw error;
        }

        return data;
    },

    // Update question
    async updateQuestion(request: UpdateQuestionRequest): Promise<Question> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (request.course_id !== undefined) updateData.course_id = request.course_id;
        if (request.content !== undefined) updateData.content = request.content;
        if (request.type !== undefined) updateData.type = request.type;
        if (request.difficulty !== undefined) updateData.difficulty = request.difficulty;
        if (request.options !== undefined) updateData.options = request.options;
        if (request.correct_answer !== undefined) updateData.correct_answer = request.correct_answer;
        if (request.explanation !== undefined) updateData.explanation = request.explanation;
        if (request.tags !== undefined) updateData.tags = request.tags;

        const { data, error } = await supabase
            .from('question_bank')
            .update(updateData)
            .eq('id', request.id)
            .eq('teacher_id', user.id)
            .select(`
                *,
                course:course_id (id, title, code)
            `)
            .single();

        if (error) {
            console.error('Error updating question:', error);
            throw error;
        }

        return data;
    },

    // Delete question
    async deleteQuestion(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('question_bank')
            .delete()
            .eq('id', id)
            .eq('teacher_id', user.id);

        if (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    },

    // Duplicate question
    async duplicateQuestion(id: string): Promise<Question> {
        const original = await this.getQuestionById(id);
        if (!original) throw new Error('Question not found');

        return this.createQuestion({
            course_id: original.course_id || undefined,
            content: original.content + ' (Copy)',
            type: original.type,
            difficulty: original.difficulty,
            options: original.options || undefined,
            correct_answer: original.correct_answer || undefined,
            explanation: original.explanation || undefined,
            tags: original.tags
        });
    },

    // Get all unique tags used by teacher
    async getUniqueTags(): Promise<string[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('question_bank')
            .select('tags')
            .eq('teacher_id', user.id);

        if (error) {
            console.error('Error fetching tags:', error);
            return [];
        }

        const allTags = data?.flatMap(q => q.tags || []) || [];
        return [...new Set(allTags)].sort();
    },

    // Get teacher's courses for dropdown
    async getTeacherCourses(): Promise<{ id: number; title: string; code: string }[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('courses')
            .select('id, title, code')
            .eq('teacher_id', user.id)
            .order('title');

        if (error) {
            console.error('Error fetching courses:', error);
            return [];
        }

        return data || [];
    }
};
