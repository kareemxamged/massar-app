import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import {
    CoursesGrid,
    CourseForm,
    useCourses,
    Course,
    CourseFormData,
    CourseContentTabs,
    CourseExamStats,
    DeleteConfirmModal,
    CourseManagementHeader,
    CourseManagementFilterBar,
} from '../../../features/teacher-courses';
import { EnrollmentManager } from '../../../features/teacher-courses/components/Enrollment/EnrollmentManager';
import { toast } from 'react-hot-toast';

export default function TeacherCourses() {
    const { user } = useAuth();
    const { i18n } = useTranslation('common');
    const { courses, isLoading, createCourse, updateCourse, deleteCourse } = useCourses(user?.id);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [managingCourse, setManagingCourse] = useState<Course | null>(null);
    const [contentCourse, setContentCourse] = useState<Course | null>(null);
    const [statsCourse, setStatsCourse] = useState<Course | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenForm = (course?: Course) => {
        setEditingCourse(course || null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingCourse(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (data: CourseFormData) => {
        try {
            if (editingCourse) {
                await updateCourse(editingCourse.id, data);
                toast.success('Course updated successfully');
            } else {
                await createCourse(data);
                toast.success('Course created successfully');
            }
            handleCloseForm();
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while saving the course');
        }
    };

    const handleDeleteClick = (id: number) => {
        const course = courses.find(c => c.id === id);
        if (course) setCourseToDelete(course);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        setIsDeleting(true);
        try {
            await deleteCourse(courseToDelete.id);
            toast.success('Course deleted successfully');
            setCourseToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete the course');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleVisibility = async (id: number, currentVisibility: Course['visibility']) => {
        const newVisibility = currentVisibility === 'active' ? 'hidden' : 'active';
        try {
            await updateCourse(id, { visibility: newVisibility });
            toast.success(newVisibility === 'active' ? 'Course is now active' : 'Course is now hidden');
        } catch (error) {
            console.error(error);
            toast.error('Failed to toggle course visibility');
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl mx-auto" dir={i18n.dir()}>
            <CourseManagementHeader onCreateNew={() => handleOpenForm()} />

            <CourseManagementFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Course Grid */}
            <CoursesGrid
                courses={filteredCourses}
                isLoading={isLoading}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
                onToggleVisibility={handleToggleVisibility}
                onManageStudents={setManagingCourse}
                onManageContent={setContentCourse}
                onViewStats={setStatsCourse}
                onCreateFirst={() => handleOpenForm()}
            />

            {/* Create/Edit Modal */}
            {isFormOpen && (
                <CourseForm
                    course={editingCourse}
                    onSubmit={handleSubmit}
                    onClose={handleCloseForm}
                />
            )}

            {/* Enrollment Manager Side Panel */}
            {managingCourse && (
                <EnrollmentManager
                    courseId={managingCourse.id}
                    courseTitle={managingCourse.title}
                    onClose={() => setManagingCourse(null)}
                />
            )}

            {/* Content Tabs Side Panel */}
            {contentCourse && (
                <CourseContentTabs
                    courseId={contentCourse.id}
                    courseTitle={contentCourse.title}
                    onClose={() => setContentCourse(null)}
                />
            )}

            {/* Stats Modal */}
            {statsCourse && (
                <CourseExamStats
                    courseId={statsCourse.id}
                    courseTitle={statsCourse.title}
                    onClose={() => setStatsCourse(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {courseToDelete && (
                <DeleteConfirmModal
                    title="Delete Course"
                    itemName={courseToDelete.title}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    onCancel={() => !isDeleting && setCourseToDelete(null)}
                />
            )}
        </div>
    );
}
