
export type ExamStatus = 'upcoming' | 'ongoing' | 'finished';

export interface Exam {
    id: number;
    title: string;
    subject: string;
    subjectIcon: string;
    subjectColor: string;
    date: string;
    duration: string;
    questions: number;
    tutor: string;
    status: ExamStatus;
    score?: number;
    // New fields for Details Page
    totalMarks?: number;
    questionTypes?: {
        mcq: number;
        trueFalse: number;
        essay: number;
    };
    topics?: string[];
    instructions?: string[];
}

export const MOCK_EXAMS: Exam[] = [
    {
        id: 1,
        title: 'Advanced React Patterns',
        subject: 'Frontend',
        subjectIcon: '⚛️',
        subjectColor: '#61dafb',
        date: '2023-12-21 10:00 AM',
        duration: '60 mins',
        questions: 30,
        tutor: 'Dr. Ahmed',
        status: 'upcoming',
        totalMarks: 30,
        questionTypes: { mcq: 20, trueFalse: 5, essay: 5 },
        topics: ['React Hooks', 'State Management', 'React Router', 'Performance Optimization', 'Testing'],
        instructions: [
            'Each question has only one correct answer.',
            'You cannot go back to the previous question after submitting.',
            'Ensure you have a stable internet connection.',
            'The exam will auto-submit when the timer ends.'
        ]
    },
    {
        id: 2,
        title: 'Node.js Microservices',
        subject: 'Backend',
        subjectIcon: '🟢',
        subjectColor: '#68a063',
        date: '2023-12-25 02:00 PM',
        duration: '90 mins',
        questions: 45,
        tutor: 'Dr. Sarah',
        status: 'upcoming',
        totalMarks: 50,
        questionTypes: { mcq: 30, trueFalse: 10, essay: 5 }
    },
    {
        id: 3,
        title: 'PostgreSQL Optimization',
        subject: 'Database',
        subjectIcon: '🐘',
        subjectColor: '#336791',
        date: '2023-12-20 09:00 AM',
        duration: '120 mins',
        questions: 50,
        tutor: 'Dr. Mohamed',
        status: 'ongoing',
        totalMarks: 100
    },
    {
        id: 4,
        title: 'UI/UX Principles',
        subject: 'Design',
        subjectIcon: '🎨',
        subjectColor: '#ff6b6b',
        date: '2023-12-15',
        duration: '45 mins',
        questions: 25,
        tutor: 'Dr. Laila',
        status: 'finished',
        score: 92,
        totalMarks: 25
    },
    {
        id: 5,
        title: 'Docker & Kubernetes',
        subject: 'DevOps',
        subjectIcon: '🐳',
        subjectColor: '#2496ed',
        date: '2023-12-10',
        duration: '60 mins',
        questions: 35,
        tutor: 'Eng. Omar',
        status: 'finished',
        score: 78,
        totalMarks: 35
    },
    {
        id: 6,
        title: 'Advanced CSS Grid',
        subject: 'Frontend',
        subjectIcon: '💅',
        subjectColor: '#264de4',
        date: '2023-12-05',
        duration: '40 mins',
        questions: 20,
        tutor: 'Dr. Ahmed',
        status: 'finished',
        score: 88,
        totalMarks: 20
    },
];
