// Using ESM dynamic import for xlsx compatibility
let XLSX: any = null;

async function loadXLSX() {
    if (!XLSX) {
        const module = await import('xlsx');
        XLSX = module.default || module;
    }
    return XLSX;
}

interface Submission {
    id: string;
    student_id: string;
    status: string;
    score: number | null;
    profiles?: {
        student_id: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

export async function exportSubmissionsToExcel(
    submissions: Submission[],
    examTitle: string,
    totalMarks: number
): Promise<number> {
    const gradedSubmissions = submissions.filter(s => s.status === 'submitted');

    if (gradedSubmissions.length === 0) {
        return 0;
    }

    const rows = gradedSubmissions.map(sub => ({
        'Student ID': sub.profiles?.student_id || 'N/A',
        'Name': sub.profiles?.full_name || 'Unknown',
        'Grade': totalMarks > 0
            ? `${Math.round(((sub.score || 0) / totalMarks) * 100)}%`
            : 'N/A'
    }));

    const xlsx = await loadXLSX();
    const ws = xlsx.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 10 }];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Grades');

    const filename = `${examTitle}-grades-${new Date().toISOString().split('T')[0]}.xlsx`;
    xlsx.writeFile(wb, filename);

    return rows.length;
}
