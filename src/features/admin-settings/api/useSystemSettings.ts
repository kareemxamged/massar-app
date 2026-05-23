import { useState, useCallback, useEffect } from 'react';
import { settingsApi } from './settingsApi';
import type { SystemSettings, SettingsPatch } from '../types';

interface Toast { type: 'success' | 'error'; message: string }

export function useSystemSettings() {
  const [settings,  setSettings ] = useState<SystemSettings | null>(null);
  const [loading,   setLoading  ] = useState(true);
  const [saving,    setSaving   ] = useState(false);
  const [toast,     setToast    ] = useState<Toast | null>(null);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(await settingsApi.getSettings());
    } catch {
      showToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (patch: SettingsPatch) => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateSettings(patch);
      setSettings(updated);
      showToast('success', 'Settings saved successfully');
    } catch {
      showToast('error', 'Failed to save settings');
      throw new Error('save failed');
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, save, toast, refetch: load };
}
