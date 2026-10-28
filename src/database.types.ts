/**
 * Supabase DB 타입.
 * supabase/migrations 스키마를 기준으로 작성했다. Supabase 프로젝트 연결 후
 * `npm run type-gen`으로 생성한 파일로 덮어쓴다.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      academies: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          academy_id: string | null;
          role: Database["public"]["Enums"]["app_role"];
          name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          academy_id?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          grade: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          grade?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          grade?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          id: string;
          academy_id: string;
          class_id: string | null;
          profile_id: string | null;
          name: string;
          grade: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          class_id?: string | null;
          profile_id?: string | null;
          name: string;
          grade?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          class_id?: string | null;
          profile_id?: string | null;
          name?: string;
          grade?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "students_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      answer_sheets: {
        Row: {
          id: string;
          academy_id: string;
          type: Database["public"]["Enums"]["sheet_type"];
          title: string;
          category: string;
          subject: string;
          unit: string;
          name_region: Json | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          type: Database["public"]["Enums"]["sheet_type"];
          title: string;
          category?: string;
          subject?: string;
          unit?: string;
          name_region?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          type?: Database["public"]["Enums"]["sheet_type"];
          title?: string;
          category?: string;
          subject?: string;
          unit?: string;
          name_region?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      answer_items: {
        Row: {
          id: string;
          answer_sheet_id: string;
          question_no: number;
          question: string;
          points: number;
          accepted_answers: string[];
          choices: string[];
          correct_choice: number | null;
          region: Json | null;
        };
        Insert: {
          id?: string;
          answer_sheet_id: string;
          question_no: number;
          question?: string;
          points?: number;
          accepted_answers?: string[];
          choices?: string[];
          correct_choice?: number | null;
          region?: Json | null;
        };
        Update: {
          id?: string;
          answer_sheet_id?: string;
          question_no?: number;
          question?: string;
          points?: number;
          accepted_answers?: string[];
          choices?: string[];
          correct_choice?: number | null;
          region?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "answer_items_answer_sheet_id_fkey";
            columns: ["answer_sheet_id"];
            isOneToOne: false;
            referencedRelation: "answer_sheets";
            referencedColumns: ["id"];
          },
        ];
      };
      grading_jobs: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          answer_sheet_id: string;
          image_path: string | null;
          status: Database["public"]["Enums"]["grading_status"];
          score: number | null;
          ocr_confidence: number | null;
          uploaded_by: string | null;
          created_at: string;
          graded_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          answer_sheet_id: string;
          image_path?: string | null;
          status?: Database["public"]["Enums"]["grading_status"];
          score?: number | null;
          ocr_confidence?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
          graded_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          answer_sheet_id?: string;
          image_path?: string | null;
          status?: Database["public"]["Enums"]["grading_status"];
          score?: number | null;
          ocr_confidence?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
          graded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "grading_jobs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grading_jobs_answer_sheet_id_fkey";
            columns: ["answer_sheet_id"];
            isOneToOne: false;
            referencedRelation: "answer_sheets";
            referencedColumns: ["id"];
          },
        ];
      };
      grading_items: {
        Row: {
          id: string;
          grading_job_id: string;
          question_no: number;
          ocr_text: string | null;
          normalized_text: string | null;
          selected_choice: number | null;
          confidence: number | null;
          is_correct: boolean | null;
          needs_review: boolean;
          reviewed_text: string | null;
          reviewed_is_correct: boolean | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          grading_job_id: string;
          question_no: number;
          ocr_text?: string | null;
          normalized_text?: string | null;
          selected_choice?: number | null;
          confidence?: number | null;
          is_correct?: boolean | null;
          needs_review?: boolean;
          reviewed_text?: string | null;
          reviewed_is_correct?: boolean | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          grading_job_id?: string;
          question_no?: number;
          ocr_text?: string | null;
          normalized_text?: string | null;
          selected_choice?: number | null;
          confidence?: number | null;
          is_correct?: boolean | null;
          needs_review?: boolean;
          reviewed_text?: string | null;
          reviewed_is_correct?: boolean | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "grading_items_grading_job_id_fkey";
            columns: ["grading_job_id"];
            isOneToOne: false;
            referencedRelation: "grading_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_academy_id: { Args: Record<PropertyKey, never>; Returns: string };
      current_student_id: { Args: Record<PropertyKey, never>; Returns: string };
      is_teacher: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      app_role: "teacher" | "student";
      sheet_type: "subjective" | "objective";
      grading_status:
        "uploaded" | "processing" | "needs_review" | "completed" | "failed";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

/** 테이블 Row 타입. 예: Tables<"profiles"> */
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

/** 테이블 Insert 타입. 예: TablesInsert<"grading_jobs"> */
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

/** 테이블 Update 타입. 예: TablesUpdate<"profiles"> */
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

/** 열거형 타입. 예: Enums<"app_role"> */
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
