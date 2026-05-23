import { useState } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GroupEnrollmentProps {
    onEnroll: (filters: { level?: string; major?: string }) => Promise<number>;
}

const LEVELS = ['1', '2', '3', '4', '5', '6'];
const MAJORS = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Cybersecurity',
    'Business Administration',
    'Accounting',
    'Medicine',
    'Pharmacy',
    'Law',
];

export function GroupEnrollment({ onEnroll }: GroupEnrollmentProps) {
    const { t } = useTranslation('common');
    const [level, setLevel] = useState('');
    const [major, setMajor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastResult, setLastResult] = useState<number | null>(null);

    const handleEnroll = async () => {
        if (!level && !major) return;
        setIsSubmitting(true);
        setLastResult(null);
        try {
            const count = await onEnroll({ level: level || undefined, major: major || undefined });
            setLastResult(count);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = level !== '' || major !== '';

    return (
        <div className="space-y-4 text-start">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('teacherCourses.modals.group.levelLabel', 'Academic Level')}</label>
                    <select
                        value={level}
                        onChange={(e) => { setLevel(e.target.value); setLastResult(null); }}
                        className={`w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-sm text-start`}
                    >
                        <option value="">{t('teacherCourses.modals.group.allLevels', 'All Levels')}</option>
                        {LEVELS.map((l) => (
                            <option key={l} value={l}>{t('teacherCourses.modals.group.level', 'Level')} {l}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('teacherCourses.modals.group.majorLabel', 'Major / Specialty')}</label>
                    <select
                        value={major}
                        onChange={(e) => { setMajor(e.target.value); setLastResult(null); }}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-sm text-start"
                    >
                        <option value="">{t('teacherCourses.modals.group.allMajors', 'All Majors')}</option>
                        {MAJORS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleEnroll}
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full justify-center"
            >
                <Users className="w-4 h-4" />
                {isSubmitting ? t('teacherCourses.modals.group.enrolling', 'Enrolling...') : t('teacherCourses.modals.group.enrollGroup', 'Enroll Group')}
            </button>

            {lastResult !== null && (
                <p className={`text-sm text-center font-medium ${lastResult > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {lastResult > 0
                        ? `✓ ${lastResult} ${t('teacherCourses.modals.group.successEnrolled', 'students enrolled successfully')}`
                        : t('teacherCourses.modals.group.noNewStudents', 'No new students found matching those filters')}
                </p>
            )}
        </div>
    );
}
