

export type ExamStatus = 'all' | 'ongoing' | 'upcoming' | 'finished';

export interface ExamFilterState {
    status: ExamStatus;
    searchQuery: string;
}
