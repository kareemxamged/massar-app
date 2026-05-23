import { useState } from 'react';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-hot-toast';

export function useAvatarUpload(onSuccess?: (url: string) => void) {
  const { user, updateLocalUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed.');
      return null;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2 MB.');
      return null;
    }

    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = localUrl;
      await new Promise<void>(res => { img.onload = () => res(); });
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      canvas.getContext('2d')!.drawImage(img, 0, 0, 256, 256);
      const blob = await new Promise<Blob>(res =>
        canvas.toBlob(b => res(b!), 'image/webp', 0.85)
      );

      const path = `${user.id}/avatar.webp`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/webp' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

      await Promise.all([
        supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id),
        supabase.auth.updateUser({ data: { avatar_url: publicUrl } }),
      ]);

      const busted = `${publicUrl}?t=${Date.now()}`;
      updateLocalUser({ avatar_url: publicUrl });
      onSuccess?.(busted);
      toast.success('Avatar updated');
      return busted;
    } catch {
      toast.error('Failed to upload avatar');
      return null;
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  const remove = async (): Promise<void> => {
    if (!user) return;
    setUploading(true);
    try {
      await supabase.storage.from('avatars').remove([`${user.id}/avatar.webp`]);
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      await supabase.auth.updateUser({ data: { avatar_url: null } });
      updateLocalUser({ avatar_url: undefined });
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  return { upload, remove, uploading };
}
