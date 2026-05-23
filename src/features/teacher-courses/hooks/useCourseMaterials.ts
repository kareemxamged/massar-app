import { useState, useCallback } from 'react';
import { materialsApi, CourseMaterial, CourseExam, MaterialType } from '../api/materialsApi';

interface UseCourseMaterialsReturn {
    materials: CourseMaterial[];
    exams: CourseExam[];
    isLoading: boolean;
    isUploading: boolean;
    fetchMaterials: (courseId: number) => Promise<void>;
    fetchExams: (courseId: number) => Promise<void>;
    uploadFile: (courseId: number, file: File, title: string) => Promise<void>;
    addLink: (courseId: number, title: string, url: string) => Promise<void>;
    deleteMaterial: (id: string, type: MaterialType, url: string) => Promise<void>;
}

export function useCourseMaterials(): UseCourseMaterialsReturn {
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [exams, setExams] = useState<CourseExam[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fetchMaterials = useCallback(async (courseId: number) => {
        setIsLoading(true);
        try {
            const data = await materialsApi.getMaterials(courseId);
            setMaterials(data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchExams = useCallback(async (courseId: number) => {
        setIsLoading(true);
        try {
            const data = await materialsApi.getCourseExams(courseId);
            setExams(data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadFile = useCallback(
        async (courseId: number, file: File, title: string) => {
            setIsUploading(true);
            try {
                const type = file.type.startsWith('video/') ? 'video' : 'pdf';
                const newMaterial = await materialsApi.uploadMaterial(courseId, file, type, title);
                setMaterials((prev) => [newMaterial, ...prev]);
            } finally {
                setIsUploading(false);
            }
        },
        []
    );

    const addLink = useCallback(
        async (courseId: number, title: string, url: string) => {
            setIsUploading(true);
            try {
                const newMaterial = await materialsApi.addLink(courseId, title, url);
                setMaterials((prev) => [newMaterial, ...prev]);
            } finally {
                setIsUploading(false);
            }
        },
        []
    );

    const deleteMaterial = useCallback(
        async (id: string, type: MaterialType, url: string) => {
            await materialsApi.deleteMaterial(id, type, url);
            setMaterials((prev) => prev.filter((m) => m.id !== id));
        },
        []
    );

    return {
        materials,
        exams,
        isLoading,
        isUploading,
        fetchMaterials,
        fetchExams,
        uploadFile,
        addLink,
        deleteMaterial,
    };
}
