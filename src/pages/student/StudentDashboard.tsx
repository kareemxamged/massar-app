import WelcomeSection from '../../features/student-dashboard/components/WelcomeSection';
import QuickStats from '../../features/student-dashboard/components/QuickStats';
import EnrolledCoursesGrid from '../../features/student-dashboard/components/EnrolledCoursesGrid';
import UpcomingTasks from '../../features/student-dashboard/components/UpcomingTasks';
import RecentAnnouncements from '../../features/student-dashboard/components/RecentAnnouncements';
import { useStudentDashboard } from '../../features/student-dashboard/api/useStudentDashboard';

export default function StudentDashboard() {
    const { stats, enrolledCourses, upcomingTasks, recentAnnouncements, loading } = useStudentDashboard();

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6 lg:space-y-8 font-arabic">
                {/* Premium Welcome Skeleton */}
                <div className="h-32 glass-card rounded-2xl w-full relative overflow-hidden border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full" />
                </div>

                {/* Premium Stats Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 glass-card rounded-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full" style={{ animationDelay: `${i * 0.15}s` }} />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Courses Grid Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-10 w-48 glass-card rounded-xl rounded-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={`course-${i}`} className="h-64 glass-card rounded-2xl relative overflow-hidden border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full" style={{ animationDelay: `${i * 0.2}s` }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1 space-y-6 lg:space-y-8">
                        <div className="h-64 glass-card rounded-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full" delay-100 />
                        </div>
                        <div className="h-64 glass-card rounded-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full" delay-200 />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 lg:space-y-8 font-arabic">

            {/* Top Section */}
            <WelcomeSection />

            {/* Quick Statistics */}
            {stats && <QuickStats stats={stats} />}

            {/* Main Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Main Column (Courses) */}
                <div className="lg:col-span-2">
                    {enrolledCourses && <EnrolledCoursesGrid courses={enrolledCourses} />}
                </div>

                {/* Sidebar Column (Tasks & Tickers) */}
                <div className="lg:col-span-1 space-y-6 lg:space-y-8">
                    {upcomingTasks && <UpcomingTasks tasks={upcomingTasks} />}
                    {recentAnnouncements && <RecentAnnouncements announcements={recentAnnouncements} />}
                </div>

            </div>
        </div>
    );
}
