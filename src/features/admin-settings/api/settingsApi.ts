import { getServiceClient, supabase } from '../../../services/supabase';
import type { SystemSettings, SettingsPatch } from '../types';

const svc = getServiceClient();

export const settingsApi = {
  async getSettings(): Promise<SystemSettings> {
    const { data, error } = await svc
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return data as SystemSettings;
  },

  async updateSettings(patch: SettingsPatch): Promise<SystemSettings> {
    const { data, error } = await svc
      .from('system_settings')
      .update({ ...patch, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    return data as SystemSettings;
  },

  async uploadLogo(file: File): Promise<string> {
    const ext  = file.name.split('.').pop() ?? 'png';
    const path = `logos/site-logo.${ext}`;
    const { error } = await svc.storage
      .from('site-assets')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data: { publicUrl } } = svc.storage
      .from('site-assets')
      .getPublicUrl(path);
    return publicUrl;
  },

  /** Public-facing read — uses anon client so it works even for unauthenticated users. */
  async getPublicSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('maintenance_mode, maintenance_message, broadcast_message, site_name')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return data as Pick<SystemSettings, 'maintenance_mode' | 'maintenance_message' | 'broadcast_message' | 'site_name'>;
  },
};
