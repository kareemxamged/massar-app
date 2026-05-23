import { useTranslation } from 'react-i18next';
import CourseCard from './CourseCard';
import styles from '../../../pages/student/StudentCourses.module.css';
import { EnrolledCourse } from '../../../services/courseService';

interface CourseListProps {
    filteredCourses: EnrolledCourse[];
    activeTab: 'current' | 'past' | 'all';
    onReport: (course: EnrolledCourse) => void;
}

export default function CourseList({ filteredCourses, onReport }: CourseListProps) {
    const { i18n } = useTranslation('common');

    return (
        <div className={styles.courseList} style={{ direction: i18n.dir() }}>
            {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} onReport={onReport} />
            ))}
        </div>
    );
}
