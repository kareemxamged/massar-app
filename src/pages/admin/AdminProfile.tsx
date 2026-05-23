import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCog, User, ShieldCheck, Settings } from 'lucide-react';
import { useAdminProfile } from '../../features/admin-profile/api/useAdminProfile';
import ProfileHeader from '../../features/admin-profile/components/ProfileHeader';
import PersonalInfoForm from '../../features/admin-profile/components/PersonalInfoForm';
import SecuritySettings from '../../features/admin-profile/components/SecuritySettings';
import SystemPreferences from '../../features/admin-profile/components/SystemPreferences';

type Tab = 'personal' | 'security' | 'preferences';

export default function AdminProfile() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const {
    profile, authUser, avatarUrl,
    loading, saving, avatarUploading,
    updateInfo, uploadAvatar,
  } = useAdminProfile();

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: isRtl ? 'المعلومات الشخصية' : 'Personal Info', icon: <User size={15} /> },
    { id: 'security', label: isRtl ? 'الأمان وكلمة المرور' : 'Security', icon: <ShieldCheck size={15} /> },
    { id: 'preferences', label: isRtl ? 'تفضيلات النظام' : 'Preferences', icon: <Settings size={15} /> },
  ];

  return (
    <div
      className={`p-4 sm:p-6 max-w-3xl mx-auto space-y-6 ${isRtl ? 'font-tajawal' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary-500/10 shrink-0">
          <UserCog size={26} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{isRtl ? 'الملف الشخصي' : 'Admin Profile'}</h1>
          <p className="text-sm text-gray-400">
            {isRtl ? 'إدارة معلومات حسابك وتحديث تفضيلات الأمان' : 'Manage your account information and security preferences'}
          </p>
        </div>
      </div>

      {loading || !profile ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`rounded-2xl animate-pulse bg-white/5 ${i === 1 ? 'h-36' : 'h-24'}`} />
          ))}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
          {/* Profile Header — always visible */}
          <ProfileHeader
            name={profile.full_name}
            email={profile.email}
            avatarUrl={avatarUrl}
            uploading={avatarUploading}
            onAvatarChange={uploadAvatar}
          />

          {/* Tab Bar */}
          <div className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto whitespace-nowrap hide-scrollbar bg-black/20 border border-white/5 w-full">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all shrink-0 ${isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 font-bold'
                    : 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'personal' && (
              <PersonalInfoForm profile={profile} saving={saving} onSave={updateInfo} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings authUser={authUser} createdAt={profile.created_at} />
            )}
            {activeTab === 'preferences' && (
              <SystemPreferences />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
