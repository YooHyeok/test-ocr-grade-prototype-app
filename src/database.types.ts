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
        Row: {
          id: string;
          name: string;
          image_retention_months: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_retention_months?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_retention_months?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          academy_id: string | null;
          role: Database["public"]["Enums"]["app_role"];
          name: string;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          academy_id?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          name?: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          name?: string;
          is_admin?: boolean;
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
          image_purged_at: string | null;
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
          image_purged_at?: string | null;
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
          image_purged_at?: string | null;
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
      report_logs: {
        Row: {
          id: string;
          academy_id: string;
          period_start: string;
          period_end: string;
          status: Database["public"]["Enums"]["report_status"];
          recipient_count: number;
          job_count: number;
          purged_image_count: number;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          period_start: string;
          period_end: string;
          status: Database["public"]["Enums"]["report_status"];
          recipient_count?: number;
          job_count?: number;
          purged_image_count?: number;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          period_start?: string;
          period_end?: string;
          status?: Database["public"]["Enums"]["report_status"];
          recipient_count?: number;
          job_count?: number;
          purged_image_count?: number;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_logs_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
        ];
      };
      system_setting_groups: {
        Row: {
          prop_grp_id: string;
          prop_grp_nm: string;
          prop_grp_desc: string | null;
        };
        Insert: {
          prop_grp_id: string;
          prop_grp_nm: string;
          prop_grp_desc?: string | null;
        };
        Update: {
          prop_grp_id?: string;
          prop_grp_nm?: string;
          prop_grp_desc?: string | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          prop_id: string;
          prop_key: string;
          prop_grp: string;
          prop_sub_grp: string | null;
          prop_type: "STR" | "NUM" | "BOOL";
          prop_spr_type: string | null;
          prop_val: string | null;
          prop_spr_val: string | null;
          prop_desc: string | null;
          prop_usr_rgh: "R" | "W" | "H";
          eg_rst_flag: string | null;
          wm_rst_flag: string | null;
          prop_name: string;
        };
        Insert: {
          prop_id?: string;
          prop_key: string;
          prop_grp: string;
          prop_sub_grp?: string | null;
          prop_type: "STR" | "NUM" | "BOOL";
          prop_spr_type?: string | null;
          prop_val?: string | null;
          prop_spr_val?: string | null;
          prop_desc?: string | null;
          prop_usr_rgh?: "R" | "W" | "H";
          eg_rst_flag?: string | null;
          wm_rst_flag?: string | null;
          prop_name: string;
        };
        Update: {
          prop_id?: string;
          prop_key?: string;
          prop_grp?: string;
          prop_sub_grp?: string | null;
          prop_type?: "STR" | "NUM" | "BOOL";
          prop_spr_type?: string | null;
          prop_val?: string | null;
          prop_spr_val?: string | null;
          prop_desc?: string | null;
          prop_usr_rgh?: "R" | "W" | "H";
          eg_rst_flag?: string | null;
          wm_rst_flag?: string | null;
          prop_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "system_settings_prop_grp_fkey";
            columns: ["prop_grp"];
            isOneToOne: false;
            referencedRelation: "system_setting_groups";
            referencedColumns: ["prop_grp_id"];
          },
        ];
      };
      system_setting_histories: {
        Row: {
          hist_id: string;
          prop_id: string;
          prop_name: string | null;
          sys_group_id: string;
          sys_group_name: string | null;
          now_value: string | null;
          prev_value: string | null;
          prop_action: "I" | "U" | "D" | null;
          reg_dt: string | null;
          reg_id: string | null;
          reg_name: string | null;
          prop_key: string | null;
        };
        Insert: {
          hist_id?: string;
          prop_id: string;
          prop_name?: string | null;
          sys_group_id: string;
          sys_group_name?: string | null;
          now_value?: string | null;
          prev_value?: string | null;
          prop_action?: "I" | "U" | "D" | null;
          reg_dt?: string | null;
          reg_id?: string | null;
          reg_name?: string | null;
          prop_key?: string | null;
        };
        Update: {
          hist_id?: string;
          prop_id?: string;
          prop_name?: string | null;
          sys_group_id?: string;
          sys_group_name?: string | null;
          now_value?: string | null;
          prev_value?: string | null;
          prop_action?: "I" | "U" | "D" | null;
          reg_dt?: string | null;
          reg_id?: string | null;
          reg_name?: string | null;
          prop_key?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_academy_id: { Args: Record<PropertyKey, never>; Returns: string };
      current_student_id: { Args: Record<PropertyKey, never>; Returns: string };
      is_teacher: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      app_role: "teacher" | "student";
      sheet_type: "subjective" | "objective";
      grading_status:
        "uploaded" | "processing" | "needs_review" | "completed" | "failed";
      report_status: "sent" | "skipped" | "failed";
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
