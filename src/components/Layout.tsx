import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useMaintenanceMode } from '../hooks/useMaintenanceMode';
import { useDirection } from '../hooks/useDirection';
import UserAvatar from './UserAvatar';
import NotificationBell from '../features/notifications/components/NotificationBell/NotificationBell';
import MaintenanceScreen from './MaintenanceScreen';
import LanguageToggle from './LanguageToggle';
import styles from './Layout.module.css';

import {
    LayoutDashboard, BookOpen, FileText, Users, Bell,
    Database, PlusCircle, Settings, LogOut, ShieldCheck,
    UserCircle, Menu, X, CheckSquare, Calendar, RotateCcw
} from 'lucide-react';

const Icons = {
    Dashboard: LayoutDashboard,
    Exams: CheckSquare,
    Results: FileText,
    Schedule: Calendar,
    Subjects: Database,
    Users: Users,
    Settings: Settings,
    Logout: LogOut,
    Plus: PlusCircle,
    Menu: Menu,
    Close: X,
    Notifications: Bell,
    BookOpen: BookOpen,
    Students: Users,
    Teachers: UserCircle,
    Security: ShieldCheck,
    Profile: UserCircle,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Layout() {
    const { user, signOut } = useAuth();
    const { t, i18n } = useTranslation('common');
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsedState, setIsCollapsed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [pageKey, setPageKey] = useState(0);
    const handlePageRefresh = useCallback(() => setPageKey(k => k + 1), []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dynamically set favicon based on user role
    useEffect(() => {
        if (!user?.role) return;
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) return;

        let emoji = '🎓'; // Default / Student
        if (user.role === 'admin') emoji = '🛡️';
        else if (user.role === 'teacher') emoji = '👨‍🏫';

        link.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
    }, [user?.role]);

    const isMobile = windowWidth <= 1024;
    const isCollapsed = isCollapsedState && !isMobile;
    const [broadcastDismissed, setBroadcastDismissed] = useState(false);
    const { maintenanceMode, maintenanceMessage, broadcastMessage, siteName, loading: maintenanceLoading } = useMaintenanceMode();
    useDirection();

    const isRtl = i18n.language.startsWith('ar');

    // Collapse chevron: in RTL the sidebar is on the right, so rotation is mirrored
    const chevronDeg = isCollapsed
        ? (isRtl ? 0 : 180)
        : (isRtl ? 180 : 0);

    const handleLogout = async () => {
        const isAdmin = user?.role === 'admin';
        await signOut();
        navigate(isAdmin ? '/admin/login' : '/login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    if (!user) return <Navigate to="/login" replace />;

    if (!maintenanceLoading && maintenanceMode && user.role !== 'admin') {
        return <MaintenanceScreen message={maintenanceMessage} siteName={siteName} />;
    }

    return (
        <div className={styles.layout}>
            {/* Mobile Menu Button */}
            <button
                className={styles.mobileMenuBtn}
                onClick={toggleSidebar}
                title={t('nav.openMenu')}
            >
                <Icons.Menu />
            </button>

            {/* Mobile Overlay */}
            <div
                className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.showOverlay : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${sidebarOpen ? styles.open : ''}`}>

                {/* Close Button (Mobile) */}
                <button
                    className={styles.closeBtn}
                    onClick={closeSidebar}
                    title={t('nav.closeMenu')}
                >
                    <Icons.Close />
                </button>

                {/* Collapse Toggle (Desktop) */}
                <button
                    className={styles.collapseBtn}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24"
                        strokeWidth={2} stroke="currentColor"
                        width="20" height="20"
                        style={{ transform: `rotate(${chevronDeg}deg)`, transition: 'transform 0.3s' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Profile Section */}
                <div className={styles.profileSection}>
                    <UserAvatar
                        url={user.avatar_url}
                        name={user.full_name || user.email}
                        size={48}
                        className={styles.avatar}
                    />
                    {!isCollapsed && (
                        <div className={styles.profileInfo}>
                            <div className={styles.profileName}>
                                {user.full_name || 'User'}
                            </div>
                            <div className={styles.profileEmail}>
                                {user.email}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {user.role === 'student' && (
                        <>
                            <Link to="/student/dashboard" title={t('nav.dashboard')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/student/dashboard' ? styles.activeLink : ''}`}>
                                <Icons.Dashboard /> {!isCollapsed && <span>{t('nav.dashboard')}</span>}
                            </Link>
                            <Link to="/student/exams" title={t('nav.myExams')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/exams') ? styles.activeLink : ''}`}>
                                <Icons.Exams /> {!isCollapsed && <span>{t('nav.myExams')}</span>}
                            </Link>
                            <Link to="/student/results" title={t('nav.myResults')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/results') ? styles.activeLink : ''}`}>
                                <Icons.Results /> {!isCollapsed && <span>{t('nav.myResults')}</span>}
                            </Link>
                            <Link to="/student/schedule" title={t('nav.schedule')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/schedule') ? styles.activeLink : ''}`}>
                                <Icons.Schedule /> {!isCollapsed && <span>{t('nav.schedule')}</span>}
                            </Link>
                            <Link to="/student/courses" title={t('nav.myCourses')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/courses') ? styles.activeLink : ''}`}>
                                <Icons.Subjects /> {!isCollapsed && <span>{t('nav.myCourses')}</span>}
                            </Link>
                        </>
                    )}

                    {user.role === 'teacher' && (
                        <>
                            <Link to="/teacher/dashboard" title={t('nav.dashboard')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/teacher/dashboard' ? styles.activeLink : ''}`}>
                                <Icons.Dashboard /> {!isCollapsed && <span>{t('nav.dashboard')}</span>}
                            </Link>
                            <Link to="/teacher/courses" title={t('nav.manageCourses')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/courses') ? styles.activeLink : ''}`}>
                                <Icons.Subjects /> {!isCollapsed && <span>{t('nav.manageCourses')}</span>}
                            </Link>
                            <Link to="/teacher/exams" title={t('nav.manageExams')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/exams') ? styles.activeLink : ''}`}>
                                <Icons.Exams /> {!isCollapsed && <span>{t('nav.manageExams')}</span>}
                            </Link>
                            <Link to="/teacher/students" title={t('nav.students')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/students') ? styles.activeLink : ''}`}>
                                <Icons.Users /> {!isCollapsed && <span>{t('nav.students')}</span>}
                            </Link>
                            <Link to="/teacher/notifications" title={t('nav.notifications')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/notifications') ? styles.activeLink : ''}`}>
                                <Icons.Notifications /> {!isCollapsed && <span>{t('nav.notifications')}</span>}
                            </Link>
                            <Link to="/teacher/question-bank" title={t('nav.questionBank')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/question-bank') ? styles.activeLink : ''}`}>
                                <Icons.BookOpen /> {!isCollapsed && <span>{t('nav.questionBank')}</span>}
                            </Link>
                            <Link to="/teacher/create-exam" title={t('nav.createExam')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/create-exam') ? styles.activeLink : ''}`}>
                                <Icons.Plus /> {!isCollapsed && <span>{t('nav.createExam')}</span>}
                            </Link>
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <Link to="/admin/dashboard" title={t('nav.dashboard')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/dashboard' ? styles.activeLink : ''}`}>
                                <Icons.Dashboard /> {!isCollapsed && <span>{t('nav.dashboard')}</span>}
                            </Link>
                            <Link to="/admin/students" title={t('nav.students')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/students' ? styles.activeLink : ''}`}>
                                <Icons.Students /> {!isCollapsed && <span>{t('nav.students')}</span>}
                            </Link>
                            <Link to="/admin/teachers" title={t('nav.teachers')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/teachers' ? styles.activeLink : ''}`}>
                                <Icons.Teachers /> {!isCollapsed && <span>{t('nav.teachers')}</span>}
                            </Link>
                            <Link to="/admin/content" title={t('nav.content')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/content' ? styles.activeLink : ''}`}>
                                <Icons.BookOpen /> {!isCollapsed && <span>{t('nav.content')}</span>}
                            </Link>
                            <Link to="/admin/notifications" title={isRtl ? 'إدارة الإشعارات' : 'Notifications'} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/notifications' ? styles.activeLink : ''}`}>
                                <Icons.Notifications /> {!isCollapsed && <span>{isRtl ? 'الإشعارات' : 'Notifications'}</span>}
                            </Link>
                            <Link to="/admin/security" title={t('nav.security')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/security' ? styles.activeLink : ''}`}>
                                <Icons.Security /> {!isCollapsed && <span>{t('nav.security')}</span>}
                            </Link>
                            <Link to="/admin/settings" title={t('nav.settings')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/settings' ? styles.activeLink : ''}`}>
                                <Icons.Settings /> {!isCollapsed && <span>{t('nav.settings')}</span>}
                            </Link>
                            <Link to="/admin/profile" title={t('nav.myProfile')} onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/profile' ? styles.activeLink : ''}`}>
                                <Icons.Profile /> {!isCollapsed && <span>{t('nav.myProfile')}</span>}
                            </Link>
                        </>
                    )}
                    {/* Profile link for non-admin roles */}
                    {user.role !== 'admin' && (
                        <div style={{ marginTop: 'auto', padding: isCollapsed ? '0' : '0 0.5rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <Link
                                to={user?.role === 'student' ? '/student/profile' : '/teacher/profile'}
                                title={t('nav.profile')}
                                onClick={closeSidebar}
                                className={`${styles.navLink} ${location.pathname.includes('/profile') ? styles.activeLink : ''}`}
                                style={{ marginBottom: '0.5rem', justifyContent: isCollapsed ? 'center' : 'flex-start', width: isCollapsed ? '44px' : '100%', boxSizing: 'border-box' }}
                            >
                                <Icons.Profile /> {!isCollapsed && <span>{t('nav.profile')}</span>}
                            </Link>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        title={t('nav.logout')}
                        className={styles.logoutBtn}
                        style={{ marginTop: user.role === 'admin' ? 'auto' : undefined, justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        <Icons.Logout /> {!isCollapsed && <span>{t('nav.logout')}</span>}
                    </button>
                </nav>
            </aside>

            <div className={`${styles.contentWrapper} ${isCollapsed ? styles.collapsedWrapper : ''}`}>
                {broadcastMessage && !broadcastDismissed && (
                    <div
                        className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm"
                        style={{ background: 'rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.25)', color: '#c7d2fe', flexShrink: 0 }}
                    >
                        <span className="flex-1 text-center">{broadcastMessage}</span>
                        <button
                            onClick={() => setBroadcastDismissed(true)}
                            className="flex-shrink-0 hover:opacity-70 transition-opacity"
                            aria-label="Dismiss"
                            style={{ color: '#818cf8' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <main className={styles.mainContent}>
                    {user.role === 'student' && (
                        <div className={styles.studentHeader}>
                            <h2 className={styles.pageTitle}>{t('portal.student')}</h2>
                            <div className={styles.headerActions}>
                                {isRtl && <LanguageToggle />}
                                <button
                                    onClick={handlePageRefresh}
                                    className={styles.refreshBtn}
                                    title={isRtl ? 'تحديث الصفحة' : 'Refresh page'}
                                    aria-label={isRtl ? 'تحديث الصفحة' : 'Refresh page'}
                                >
                                    <RotateCcw size={16} />
                                </button>
                                <NotificationBell />
                                {!isRtl && <LanguageToggle />}
                            </div>
                        </div>
                    )}
                    {user.role === 'teacher' && (
                        <div className={styles.studentHeader}>
                            <h2 className={styles.pageTitle}>{t('portal.teacher')}</h2>
                            <div className={styles.headerActions}>
                                {isRtl && <LanguageToggle />}
                                <button
                                    onClick={handlePageRefresh}
                                    className={styles.refreshBtn}
                                    title={isRtl ? 'تحديث الصفحة' : 'Refresh page'}
                                    aria-label={isRtl ? 'تحديث الصفحة' : 'Refresh page'}
                                >
                                    <RotateCcw size={16} />
                                </button>
                                <NotificationBell />
                                {!isRtl && <LanguageToggle />}
                            </div>
                        </div>
                    )}
                    {user.role === 'admin' && (
                        <div className={styles.studentHeader}>
                            <div className={styles.headerActions} style={{ marginInlineStart: 'auto' }}>
                                {isRtl && <LanguageToggle />}
                                <button
                                    onClick={handlePageRefresh}
                                    className={styles.refreshBtn}
                                    title={isRtl ? 'تحديث الصفحة' : 'Refresh page'}
                                    aria-label={isRtl ? 'تحديث الصفحة' : 'Refresh page'}
                                >
                                    <RotateCcw size={16} />
                                </button>
                                {!isRtl && <LanguageToggle />}
                            </div>
                        </div>
                    )}
                    <Outlet key={pageKey} />
                </main>
            </div>
        </div>
    );
}
