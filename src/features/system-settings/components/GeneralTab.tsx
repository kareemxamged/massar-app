import React from 'react';
import { useTranslation } from 'react-i18next';
import { SystemSettings, SettingsPatch } from '../types';

interface Props {
    settings: SystemSettings;
    saving: boolean;
    onSave: (updates: SettingsPatch) => Promise<boolean>;
}

export default function GeneralTab({ settings, saving, onSave }: Props) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [formData, setFormData] = React.useState({
        site_name: settings.site_name || '',
        contact_email: settings.contact_email || '',
        support_phone: settings.support_phone || '',
        facebook: settings.social_links?.facebook || '',
        twitter: settings.social_links?.twitter || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            site_name: formData.site_name,
            contact_email: formData.contact_email,
            support_phone: formData.support_phone,
            social_links: {
                ...settings.social_links,
                facebook: formData.facebook,
                twitter: formData.twitter,
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">{isRtl ? 'عام' : 'General'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-start text-sm font-medium text-gray-300">
                        {isRtl ? 'اسم المنصة' : 'Site Name'}
                    </label>
                    <input
                        type="text"
                        name="site_name"
                        value={formData.site_name}
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 text-start"
                        dir="auto"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-start text-sm font-medium text-gray-300">
                        {isRtl ? 'البريد الإلكتروني للاتصال' : 'Contact Email'}
                    </label>
                    <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        placeholder={isRtl ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 text-end"
                        dir="ltr"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-start text-sm font-medium text-gray-300">
                        {isRtl ? 'هاتف الدعم' : 'Support Phone'}
                    </label>
                    <input
                        type="text"
                        name="support_phone"
                        value={formData.support_phone}
                        onChange={handleChange}
                        placeholder={isRtl ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 text-end"
                        dir="ltr"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-6">
                <h3 className="text-lg font-bold mb-4">{isRtl ? 'روابط التواصل الاجتماعي' : 'Social Links'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-start text-sm font-medium text-gray-300">Facebook</label>
                        <input
                            type="url"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 text-end"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-start text-sm font-medium text-gray-300">Twitter (X)</label>
                        <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 text-end"
                            dir="ltr"
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
