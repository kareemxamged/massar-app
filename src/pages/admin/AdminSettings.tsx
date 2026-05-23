import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, GraduationCap, Server, CheckCircle, XCircle } from 'lucide-react';
import { useSystemSettings } from '../../features/system-settings/api/useSystemSettings';
import GeneralTab from '../../features/system-settings/components/GeneralTab';
import AcademicConfigTab from '../../features/system-settings/components/AcademicConfigTab';
import PlatformStatusTab from '../../features/system-settings/components/PlatformStatusTab';

type Tab = 'general' | 'academic' | 'status';

export default function AdminSettings() {
  const { i18n } = useTranslation('settings');
  const isRtl = i18n.language.startsWith('ar');
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const { settings, academicLevels, majors, loading, saving, saveSettings, toast, addLevel, removeLevel, addMajor, removeMajor } = useSystemSettings();

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: isRtl ? 'عام' : 'General', icon: <Globe size={18} /> },
    { id: 'academic', label: isRtl ? 'الأكاديمي' : 'Academic', icon: <GraduationCap size={18} /> },
    { id: 'status', label: isRtl ? 'حالة المنصة' : 'Status', icon: <Server size={18} /> },
  ];

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 ${isRtl ? 'font-tajawal' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary-500/10 shrink-0">
          <Settings size={28} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{isRtl ? 'إعدادات النظام' : 'System Settings'}</h1>
          <p className="text-sm text-gray-400">{isRtl ? 'إدارة الإعدادات العامة والتكوين الأكاديمي' : 'Manage general settings and academic configuration'}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-center gap-2 p-1.5 rounded-xl overflow-x-auto whitespace-nowrap hide-scrollbar bg-white/5 border border-white/10 w-full md:w-fit"
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading || !settings ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'general' && <GeneralTab settings={settings} saving={saving} onSave={saveSettings} />}
          {activeTab === 'academic' && <AcademicConfigTab levels={academicLevels || []} majors={majors || []} onAddLevel={addLevel} onRemoveLevel={removeLevel} onAddMajor={addMajor} onRemoveMajor={removeMajor} />}
          {activeTab === 'status' && <PlatformStatusTab settings={settings} saving={saving} onSave={saveSettings} />}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 ${isRtl ? 'start-6' : 'end-6'} z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-5`}
          style={{
            background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
            border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: '#fff',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
