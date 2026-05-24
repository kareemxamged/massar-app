import { supabase } from '../../../services/supabase';

export interface AdminProfilePatch {
  full_name?: string | null;
  mobile?: string | null;
  date_of_birth?: string | null;
}

export interface AdminProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  mobile: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role: string;
  status: string;
}

export const adminProfileApi = {
  async getProfile(userId: string): Promise<AdminProfileRow> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, mobile, date_of_birth, avatar_url, created_at, updated_at, role, status')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as AdminProfileRow;
  },

  async updateProfile(userId: string, patch: AdminProfilePatch): Promise<AdminProfileRow> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, email, full_name, mobile, date_of_birth, avatar_url, created_at, updated_at, role, status')
      .single();
    if (error) throw error;
    return data as AdminProfileRow;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!file.type.match(/image\/(jpeg|png|webp|gif)/)) {
      throw new Error('Only JPEG, PNG, WEBP, or GIF images are allowed.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be less than 5 MB.');
    }

    // Resize to 256×256 webp via canvas
    const localUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = localUrl;
    await new Promise<void>(res => { img.onload = () => res(); });
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.getContext('2d')!.drawImage(img, 0, 0, 256, 256);
    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/webp', 0.85));
    URL.revokeObjectURL(localUrl);

    const path = `${userId}/avatar.webp`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/webp' });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

    await Promise.all([
      supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId),
      supabase.auth.updateUser({ data: { avatar_url: publicUrl } }),
    ]);

    return `${publicUrl}?t=${Date.now()}`;
  },
};
