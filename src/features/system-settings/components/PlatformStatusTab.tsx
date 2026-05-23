import React from 'react';
import { useTranslation } from 'react-i18next';
import { SystemSettings, SettingsPatch } from '../types';

interface Props {
    settings: SystemSettings;
    saving: boolean;
    onSave: (updates: SettingsPatch) => Promise<boolean>;
}

export default function PlatformStatusTab({ settings, saving, onSave }: Props) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [maintenanceMode, setMaintenanceMode] = React.useState(settings.maintenance_mode);
    const [maintenanceMessage, setMaintenanceMessage] = React.useState(settings.maintenance_message || '');
    const [allowRegistration, setAllowRegistration] = React.useState(settings.allow_student_registration);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            maintenance_mode: maintenanceMode,
            maintenance_message: maintenanceMessage,
            allow_student_registration: allowRegistration,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">{isRtl ? 'حالة المنصة' : 'Platform Status'}</h2>

            <div className="space-y-6">
                <div className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-white text-start">{isRtl ? 'السماح بتسجيل الطلاب' : 'Allow Student Registration'}</h3>
                            <p className="text-sm text-gray-400 text-start">{isRtl ? 'فتح أو إغلاق باب التسجيل للطلاب الجدد' : 'Enable or disable new student registrations'}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={allowRegistration}
                                onChange={(e) => setAllowRegistration(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-danger-500/20 bg-danger-500/5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-danger-400 text-start">{isRtl ? 'وضع الصيانة' : 'Maintenance Mode'}</h3>
                            <p className="text-sm text-gray-400 text-start">{isRtl ? 'إيقاف النظام عن العمل للطلاب والمدرسين' : 'Disable platform access for students and teachers'}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={maintenanceMode}
                                onChange={(e) => setMaintenanceMode(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger-500"></div>
                        </label>
                    </div>

                    <div className={`transition-all overflow-hidden ${maintenanceMode ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <label className="block text-sm text-gray-300 mb-2 text-start">{isRtl ? 'رسالة الصيانة' : 'Maintenance Message'}</label>
                        <textarea
                            className="w-full bg-black/40 border border-danger-500/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-danger-500 resize-none text-start"
                            rows={3}
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            placeholder={isRtl ? 'سيظهر هذا النص للمستخدمين أثناء وضع الصيانة...' : 'This will be shown to users during maintenance...'}
                            disabled={!maintenanceMode}
                            dir="auto"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary w-full sm:w-auto px-8 py-2.5"
                >
                    {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
            </div>
        </form>
    );
}
