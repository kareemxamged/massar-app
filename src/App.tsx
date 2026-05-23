import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// import Register from './pages/Register'; // REMOVED: Admin-only account creation
import Unauthorized from './pages/Unauthorized';
import StudentDashboard from './pages/student/StudentDashboard';
import ExamsList from './pages/student/ExamsList';
import ExamDetails from './pages/student/ExamDetails';
import ExamEngine from './pages/student/ExamEngine/ExamEngine';
import ExamResult from './pages/student/ExamResult/ExamResult';
import ExamReview from './pages/student/ExamReview/ExamReview';
import StudentResults from './pages/student/StudentResults';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseDetails from './pages/student/StudentCourseDetails';
import StudentProfile from './pages/student/StudentProfile';
// ...
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses/TeacherCourses';
import ExamCreator from './features/exam-creator/ExamCreator';
import ManageExams from './pages/teacher/ManageExams/ManageExams';
import TeacherProfile from './pages/teacher/TeacherProfile/TeacherProfile';
import TeacherStudents from './pages/teacher/TeacherStudents/TeacherStudents';
import TeacherStudentProfile from './pages/teacher/TeacherStudentProfile/TeacherStudentProfile';
import TeacherNotifications from './pages/teacher/TeacherNotifications/TeacherNotifications';
import QuestionBank from './pages/teacher/QuestionBank/QuestionBank';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminContentOversight from './pages/admin/AdminContentOversight';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminNotifications from './pages/admin/AdminNotifications';
import PrivateRoute from './components/PrivateRoute';
import RootRedirect from './components/RootRedirect';
import Layout from './components/Layout';

function App() {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ... rest of routes */}
            {/* REMOVED: Public registration disabled - Admin-only account creation via dashboard */}
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Routes wrapped in common Layout */}

            {/* Fullscreen Exam Route (No Sidebar) */}
            <Route element={<PrivateRoute allowedRoles={['student']} />}>
                <Route path="/student/exams/:id/take" element={<ExamEngine />} />
            </Route>

            <Route element={<Layout />}>
                {/* Student Routes */}
                <Route element={<PrivateRoute allowedRoles={['student']} />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/exams" element={<ExamsList />} />
                    <Route path="/student/exams/:id" element={<ExamDetails />} />
                    <Route path="/student/exams/:id/result" element={<ExamResult />} />
                    <Route path="/student/exams/:id/review" element={<ExamReview />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    <Route path="/student/schedule" element={<StudentSchedule />} />
                    <Route path="/student/courses" element={<StudentCourses />} />
                    <Route path="/student/courses/:id" element={<StudentCourseDetails />} />
                    <Route path="/student/profile" element={<StudentProfile />} />
                    <Route path="/student/*" element={<Navigate to="/student/dashboard" replace />} />
                </Route>

                {/* Teacher Routes */}
                <Route element={<PrivateRoute allowedRoles={['teacher', 'admin']} />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/courses" element={<TeacherCourses />} />
                    <Route path="/teacher/create-exam" element={<ExamCreator />} />
                    <Route path="/teacher/exams" element={<ManageExams />} />
                    <Route path="/teacher/students" element={<TeacherStudents />} />
                    <Route path="/teacher/students/:studentId" element={<TeacherStudentProfile />} />
                    <Route path="/teacher/notifications" element={<TeacherNotifications />} />
                    <Route path="/teacher/question-bank" element={<QuestionBank />} />
                    <Route path="/teacher/profile" element={<TeacherProfile />} />
                    <Route path="/teacher/*" element={<Navigate to="/teacher/dashboard" replace />} />
                </Route>

                {/* Admin Routes - Account creation now Admin-only */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/students" element={<AdminStudents />} />
                    <Route path="/admin/teachers" element={<AdminTeachers />} />
                    <Route path="/admin/content" element={<AdminContentOversight />} />
                    <Route path="/admin/security" element={<AdminSecurity />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    <Route path="/admin/notifications" element={<AdminNotifications />} />
                    <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
