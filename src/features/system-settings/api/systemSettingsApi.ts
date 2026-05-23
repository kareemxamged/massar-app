import { supabase } from '../../../services/supabase';
import { SystemSettings, SettingsPatch, AcademicLevel, Major } from '../types';

export const systemSettingsApi = {
    getSettings: async (): Promise<SystemSettings> => {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        // Handle generic JSONB parsing safely if needed
        let socialLinks = {};
        if (data.social_links) {
            socialLinks = typeof data.social_links === 'string'
                ? JSON.parse(data.social_links)
                : data.social_links;
        }

        return {
            ...data,
            social_links: socialLinks,
        };
    },

    updateSettings: async (updates: SettingsPatch): Promise<SystemSettings> => {
        const { data, error } = await supabase
            .from('system_settings')
            .update(updates)
            .eq('id', 1)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Academic Levels
    getAcademicLevels: async (): Promise<AcademicLevel[]> => {
        const { data, error } = await supabase
            .from('academic_levels')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    createAcademicLevel: async (level: Partial<AcademicLevel>): Promise<AcademicLevel> => {
        const { data, error } = await supabase
            .from('academic_levels')
            .insert([level])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteAcademicLevel: async (id: number): Promise<void> => {
        const { error } = await supabase.from('academic_levels').delete().eq('id', id);
        if (error) throw error;
    },

    // Majors / Specialties
    getMajors: async (): Promise<Major[]> => {
        const { data, error } = await supabase
            .from('majors')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    createMajor: async (major: Partial<Major>): Promise<Major> => {
        const { data, error } = await supabase
            .from('majors')
            .insert([major])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteMajor: async (id: number): Promise<void> => {
        const { error } = await supabase.from('majors').delete().eq('id', id);
        if (error) throw error;
    }
};
