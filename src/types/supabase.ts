export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      course_materials: {
        Row: {
          approval_status: string
          review_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          course_id: number
          created_at: string
          description: string | null
          duration: string | null
          file_size: string | null
          id: number
          title: string
          type: string
          url: string | null
          week: number | null
        }
        Insert: {
          approval_status?: string
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          course_id: number
          created_at?: string
          description?: string | null
          duration?: string | null
          file_size?: string | null
          id?: number
          title: string
          type: string
          url?: string | null
          week?: number | null
        }
        Update: {
          approval_status?: string
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          course_id?: number
          created_at?: string
          description?: string | null
          duration?: string | null
          file_size?: string | null
          id?: number
          title?: string
          type?: string
          url?: string | null
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          approval_status: string
          code: string
          created_at: string | null
          credits: number | null
          department: string | null
          description: string | null
          id: number
          instructor: string | null
          review_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          semester: string | null
          teacher_id: string | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["course_visibility"]
        }
        Insert: {
          approval_status?: string
          code: string
          created_at?: string | null
          credits?: number | null
          department?: string | null
          description?: string | null
          id?: number
          instructor?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          semester?: string | null
          teacher_id?: string | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["course_visibility"]
        }
        Update: {
          approval_status?: string
          code?: string
          created_at?: string | null
          credits?: number | null
          department?: string | null
          description?: string | null
          id?: number
          instructor?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          semester?: string | null
          teacher_id?: string | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["course_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_level: string | null
          course_id: number | null
          enrolled_at: string | null
          enrollment_type: Database["public"]["Enums"]["enrollment_type"]
          grade: number | null
          id: string
          specialty: string | null
          status: Database["public"]["Enums"]["enrollment_status"] | null
          student_id: string | null
        }
        Insert: {
          academic_level?: string | null
          course_id?: number | null
          enrolled_at?: string | null
          enrollment_type?: Database["public"]["Enums"]["enrollment_type"]
          grade?: number | null
          id?: string
          specialty?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id?: string | null
        }
        Update: {
          academic_level?: string | null
          course_id?: number | null
          enrolled_at?: string | null
          enrollment_type?: Database["public"]["Enums"]["enrollment_type"]
          grade?: number | null
          id?: string
          specialty?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          allow_review: boolean
          approval_status: string
          course_id: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          end_time: string | null
          id: number
          instructions: string[] | null
          is_published: boolean | null
          is_randomized: boolean | null
          passing_score: number | null
          review_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          show_correct_answers: boolean
          start_time: string | null
          status: Database["public"]["Enums"]["exam_status"] | null
          subject: string
          subject_color: string | null
          subject_icon: string | null
          target_group: string | null
          target_student_ids: string[] | null
          teacher_id: string | null
          title: string
          topics: string[] | null
          total_marks: number | null
          total_questions: number | null
          tutor_name: string | null
        }
        Insert: {
          allow_review?: boolean
          approval_status?: string
          course_id?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          end_time?: string | null
          id?: number
          instructions?: string[] | null
          is_published?: boolean | null
          is_randomized?: boolean | null
          passing_score?: number | null
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          show_correct_answers?: boolean
          start_time?: string | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          subject: string
          subject_color?: string | null
          subject_icon?: string | null
          target_group?: string | null
          target_student_ids?: string[] | null
          teacher_id?: string | null
          title: string
          topics?: string[] | null
          total_marks?: number | null
          total_questions?: number | null
          tutor_name?: string | null
        }
        Update: {
          allow_review?: boolean
          approval_status?: string
          course_id?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          end_time?: string | null
          id?: number
          instructions?: string[] | null
          is_published?: boolean | null
          is_randomized?: boolean | null
          passing_score?: number | null
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          show_correct_answers?: boolean
          start_time?: string | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          subject?: string
          subject_color?: string | null
          subject_icon?: string | null
          target_group?: string | null
          target_student_ids?: string[] | null
          teacher_id?: string | null
          title?: string
          topics?: string[] | null
          total_marks?: number | null
          total_questions?: number | null
          tutor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_degree: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          full_name: string | null
          headline: string | null
          id: string
          level: string | null
          major: string | null
          mobile: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          specialization: string | null
          student_id: string | null
          subjects: string | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          academic_degree?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          headline?: string | null
          id: string
          level?: string | null
          major?: string | null
          mobile?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          specialization?: string | null
          student_id?: string | null
          subjects?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          academic_degree?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          level?: string | null
          major?: string | null
          mobile?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          specialization?: string | null
          student_id?: string | null
          subjects?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          exam_id: number
          explanation: string | null
          id: number
          image_url: string | null
          marks: number | null
          options: Json | null
          text: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          exam_id: number
          explanation?: string | null
          id?: number
          image_url?: string | null
          marks?: number | null
          options?: Json | null
          text: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          exam_id?: number
          explanation?: string | null
          id?: number
          image_url?: string | null
          marks?: number | null
          options?: Json | null
          text?: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          answers: Json | null
          exam_id: number | null
          id: string
          score: number | null
          started_at: string | null
          status: string | null
          student_id: string | null
          submitted_at: string | null
        }
        Insert: {
          answers?: Json | null
          exam_id?: number | null
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          answers?: Json | null
          exam_id?: number | null
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_enrolled_courses: {
        Args: { p_student_id: string }
        Returns: {
          code: string
          created_at: string | null
          credits: number | null
          department: string | null
          description: string | null
          id: number
          instructor: string | null
          semester: string | null
          teacher_id: string | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["course_visibility"]
        }[]
        SetofOptions: {
          from: "*"
          to: "courses"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_role: { Args: never; Returns: string }
      is_staff: { Args: never; Returns: boolean }
      is_student_enrolled_in_course: {
        Args: { p_course_id: number; p_student_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
      course_visibility: "active" | "hidden" | "disabled"
      enrollment_status: "enrolled" | "completed" | "dropped"
      enrollment_type: "individual" | "group"
      exam_status: "upcoming" | "ongoing" | "finished"
      material_type: "pdf" | "video" | "link"
      question_type: "mcq" | "true_false" | "essay" | "code"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student"],
      course_visibility: ["active", "hidden", "disabled"],
      enrollment_status: ["enrolled", "completed", "dropped"],
      enrollment_type: ["individual", "group"],
      exam_status: ["upcoming", "ongoing", "finished"],
      material_type: ["pdf", "video", "link"],
      question_type: ["mcq", "true_false", "essay", "code"],
    },
  },
} as const
