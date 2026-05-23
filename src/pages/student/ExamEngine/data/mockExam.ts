import { Exam } from '../types';

export const MOCK_EXAM: Exam = {
    id: 'exam_123',
    title: 'Advanced React Development',
    durationMinutes: 45,
    totalQuestions: 5, // Small number for testing
    questions: [
        {
            id: 1,
            type: 'mcq',
            text: 'What is the Hook used to manage state in React?',
            marks: 2,
            options: [
                'useState',
                'useEffect',
                'useContext',
                'useReducer'
            ]
        },
        {
            id: 2,
            type: 'true_false',
            text: 'React is a full-featured Framework like Angular.',
            marks: 1
        },
        {
            id: 3,
            type: 'mcq',
            text: 'Which of the following is NOT a React Hook?',
            marks: 2,
            options: [
                'useMemo',
                'useCallback',
                'useRouter',
                'useRef'
            ]
        },
        {
            id: 4,
            type: 'essay',
            text: 'Explain the difference between Props and State.',
            marks: 5,
            wordLimit: 200
        },
        {
            id: 5,
            type: 'code',
            text: 'Complete the following code to create a Counter component.',
            marks: 10,
            language: 'javascript',
            initialCode: `function Counter() {
  const [count, setCount] = ________;
  
  return (
    <button onClick={() => _________}>
      Count: {count}
    </button>
  );
}`
        }
    ]
};
