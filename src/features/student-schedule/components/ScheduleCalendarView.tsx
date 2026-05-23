import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../../../pages/student/StudentSchedule.module.css';
import { Exam } from '../../../services/examService';

interface ScheduleCalendarViewProps {
    view: 'month' | 'week';
    exams: Exam[];
    currentDate: Date;
    getStatus: (exam: Exam) => string;
    getStatusColor: (status: string) => { bg: string, text: string, border: string };
}

export default function ScheduleCalendarView({ view, exams, currentDate, getStatus, getStatusColor }: ScheduleCalendarViewProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.dir() === 'rtl';

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const isSameDate = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const renderDayCell = (dayDate: Date, isOutsideMonth: boolean = false) => {
        const dayExams = exams.filter(e => e.start_time && isSameDate(new Date(e.start_time), dayDate));
        const isToday = isSameDate(dayDate, new Date());

        const cellClasses = [
            styles.dayCell,
            dayExams.length > 0 ? styles.dayCellHasExams : '',
            isToday ? styles.dayCellToday : '',
            isOutsideMonth ? styles.dayCellOutside : '',
        ].filter(Boolean).join(' ');

        return (
            <div key={dayDate.toISOString()} className={cellClasses}
                onClick={() => {
                    if (dayExams.length > 0 && dayExams[0]?.id) {
                        navigate(`/student/exams/${dayExams[0].id}`);
                    }
                }}
            >
                <div className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>
                    {dayDate.getDate()}
                </div>

                <div className={styles.examChipsContainer}>
                    {dayExams.length === 0 && !isOutsideMonth && (
                        <div className={styles.examChipEmpty} style={{ opacity: 0 }}>
                            {t('studentSchedule.calendar.emptyDay', 'No exams')}
                        </div>
                    )}
                    {dayExams.map(exam => {
                        const status = getStatus(exam);
                        const colors = getStatusColor(status);
                        return (
                            <div key={exam.id}
                                className={styles.examChip}
                                style={{
                                    background: colors.bg,
                                    color: colors.text,
                                    borderLeft: isRtl ? 'none' : `2px solid ${colors.border}`,
                                    borderRight: isRtl ? `2px solid ${colors.border}` : 'none'
                                }}
                                title={`${exam.title} - ${new Date(exam.start_time!).toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`}
                            >
                                <span>{exam.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const daysOfWeek = [
        t('studentSchedule.calendar.sunday', 'Sun'),
        t('studentSchedule.calendar.monday', 'Mon'),
        t('studentSchedule.calendar.tuesday', 'Tue'),
        t('studentSchedule.calendar.wednesday', 'Wed'),
        t('studentSchedule.calendar.thursday', 'Thu'),
        t('studentSchedule.calendar.friday', 'Fri'),
        t('studentSchedule.calendar.saturday', 'Sat')
    ];


    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Fill empty slots before map (respect RTL)
        // If RTL, Sunday is on the far right, but the logic of CSS Grid might just flow elements. 
        // With direction: rtl on the container, grid flows items from right to left automatically!
        // We do not need to reverse the generated cells, we just let the CSS handle it.
        // Wait, if firstDay is 0 (Sunday), we need 0 empty slots before it. 

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayCellEmpty}`}></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(renderDayCell(new Date(year, month, day)));
        }

        // We let CSS grid auto-flow: column handles RTL natively.
        return (
            <div className={styles.calendarGrid} style={{ direction: i18n.dir() }}>
                {daysOfWeek.map(d => (
                    <div key={d} className={styles.dayHeader}>{d}</div>
                ))}
                {days}
            </div>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day); // Set to Sunday

        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(renderDayCell(date));
        }

        return (
            <div className={styles.calendarGrid} style={{ direction: i18n.dir() }}>
                {daysOfWeek.map(d => (
                    <div key={d} className={styles.dayHeader}>{d}</div>
                ))}
                {days}
            </div>
        );
    };

    return view === 'month' ? renderMonthView() : renderWeekView();
}
