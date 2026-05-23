import { useState, useCallback, useEffect } from 'react';
import { systemSettingsApi } from './systemSettingsApi';
import { SystemSettings, SettingsPatch, AcademicLevel, Major } from '../types';

export function useSystemSettings() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
    const [majors, setMajors] = useState<Major[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [settingsData, levelsData, majorsData] = await Promise.all([
                systemSettingsApi.getSettings(),
                systemSettingsApi.getAcademicLevels(),
                systemSettingsApi.getMajors(),
            ]);
            setSettings(settingsData);
            setAcademicLevels(levelsData);
            setMajors(majorsData);
        } catch (err: any) {
            console.error('Error loading system settings:', err);
            showToast('خطأ في تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveSettings = async (updates: SettingsPatch) => {
        setSaving(true);
        try {
            const data = await systemSettingsApi.updateSettings(updates);
            setSettings(data);
            showToast('تم حفظ الإعدادات بنجاح', 'success');
            return true;
        } catch (err: any) {
            console.error('Error saving settings:', err);
            showToast('حدث خطأ أثناء الحفظ', 'error');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const addLevel = async (level: Partial<AcademicLevel>) => {
        try {
            const newLevel = await systemSettingsApi.createAcademicLevel(level);
            setAcademicLevels((prev) => [...prev, newLevel]);
            showToast('Level added successfully', 'success');
            return true;
        } catch (err: any) {
            console.error('Error adding level:', err);
            showToast('Error adding level', 'error');
            return false;
        }
    };

    const removeLevel = async (id: number) => {
        try {
            await systemSettingsApi.deleteAcademicLevel(id);
            setAcademicLevels((prev) => prev.filter((l) => l.id !== id));
            showToast('Level deleted successfully', 'success');
            return true;
        } catch (err: any) {
            console.error('Error deleting level:', err);
            showToast('Error deleting level', 'error');
            return false;
        }
    };

    const addMajor = async (major: Partial<Major>) => {
        try {
            const newMajor = await systemSettingsApi.createMajor(major);
            setMajors((prev) => [...prev, newMajor]);
            showToast('Major added successfully', 'success');
            return true;
        } catch (err: any) {
            console.error('Error adding major:', err);
            showToast('Error adding major', 'error');
            return false;
        }
    };

    const removeMajor = async (id: number) => {
        try {
            await systemSettingsApi.deleteMajor(id);
            setMajors((prev) => prev.filter((m) => m.id !== id));
            showToast('Major deleted successfully', 'success');
            return true;
        } catch (err: any) {
            console.error('Error deleting major:', err);
            showToast('Error deleting major', 'error');
            return false;
        }
    };

    return {
        settings,
        academicLevels,
        majors,
        loading,
        saving,
        saveSettings,
        toast,
        refresh: loadData,
        addLevel,
        removeLevel,
        addMajor,
        removeMajor
    };
}
