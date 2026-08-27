export type UserRole = 'trainer' | 'client';
export type ProgramStatus = 'draft' | 'active' | 'completed';
export type PhaseType = 'G' | 'R' | 'O' | 'W';
export type ExerciseZone = 'upper_body' | 'lower_body' | 'core';
export type MovementType = 'push' | 'pull' | 'legs' | 'core' | 'cardio';
export type FrequencyScale = 'never' | 'sometimes' | 'often' | 'always';
export type DailyStatus = 'achieved' | 'in_progress' | 'missed';
export type SubscriptionPlan = 'free' | 'pro' | 'premium';
export type ProgramTemplateType = 'strength' | 'hypertrophy' | 'hiit' | 'mobility' | 'general';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          trainer_id: string | null;
          role: UserRole;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          nationality: string | null;
          sex: string | null;
          birth_date: string | null;
          objectives: string | null;
          onboarding_completed: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; role: UserRole };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      health_evaluation: {
        Row: {
          id: string;
          client_id: string;
          cardiac_condition: boolean;
          cardiac_detail: string | null;
          pathology: boolean;
          pathology_detail: string | null;
          bone_joint_condition: boolean;
          bone_joint_detail: string | null;
          medication: boolean;
          medication_detail: string | null;
          additional_notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['health_evaluation']['Row']> & { client_id: string };
        Update: Partial<Database['public']['Tables']['health_evaluation']['Row']>;
        Relationships: [];
      };
      lifestyle_evaluation: {
        Row: {
          id: string;
          client_id: string;
          smoking: FrequencyScale;
          alcohol: FrequencyScale;
          nutrition: FrequencyScale;
          physical_activity: FrequencyScale;
          other_activities: boolean;
          other_activities_detail: string | null;
          daily_steps: number | null;
          daily_active_hours: number | null;
          sleep_quality: number | null;
          stress: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['lifestyle_evaluation']['Row']> & { client_id: string };
        Update: Partial<Database['public']['Tables']['lifestyle_evaluation']['Row']>;
        Relationships: [];
      };
      cardiovascular_evaluation: {
        Row: {
          id: string;
          client_id: string;
          resting_hr: number | null;
          age: number | null;
          max_hr: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cardiovascular_evaluation']['Row']> & { client_id: string };
        Update: Partial<Database['public']['Tables']['cardiovascular_evaluation']['Row']>;
        Relationships: [];
      };
      body_measurements: {
        Row: {
          id: string;
          client_id: string;
          measured_at: string;
          weight: number | null;
          height: number | null;
          bicipital: number | null;
          tricipital: number | null;
          subscapular: number | null;
          suprailiac: number | null;
          body_fat_pct: number | null;
          fat_mass: number | null;
          lean_mass: number | null;
          bmi: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['body_measurements']['Row']> & { client_id: string };
        Update: Partial<Database['public']['Tables']['body_measurements']['Row']>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          trainer_id: string;
          name: string;
          muscle_group: string;
          zone: ExerciseZone;
          movement_type: MovementType;
          video_url: string | null;
          image_url: string | null;
          gif_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['exercises']['Row']> & {
          trainer_id: string;
          name: string;
          muscle_group: string;
          zone: ExerciseZone;
          movement_type: MovementType;
        };
        Update: Partial<Database['public']['Tables']['exercises']['Row']>;
        Relationships: [];
      };
      exercises_catalog: {
        Row: {
          id: string;
          name: string;
          name_es: string | null;
          category: string;
          equipment: string;
          target: string;
          muscle_group: string;
          secondary_muscles: string[];
          instructions_en: string | null;
          instructions_es: string | null;
          zone: ExerciseZone;
          movement_type: MovementType;
          image_url: string | null;
          gif_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['exercises_catalog']['Row']> & {
          id: string;
          name: string;
          category: string;
          equipment: string;
          target: string;
          muscle_group: string;
          zone: ExerciseZone;
          movement_type: MovementType;
        };
        Update: Partial<Database['public']['Tables']['exercises_catalog']['Row']>;
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          name: string;
          status: ProgramStatus;
          start_date: string;
          template_type: ProgramTemplateType | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['programs']['Row']> & {
          client_id: string;
          trainer_id: string;
          name: string;
          start_date: string;
        };
        Update: Partial<Database['public']['Tables']['programs']['Row']>;
        Relationships: [];
      };
      phases: {
        Row: {
          id: string;
          program_id: string;
          type: PhaseType;
          order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['phases']['Row']> & { program_id: string; type: PhaseType; order: number };
        Update: Partial<Database['public']['Tables']['phases']['Row']>;
        Relationships: [];
      };
      weeks: {
        Row: {
          id: string;
          phase_id: string;
          week_number: number;
          is_deload: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['weeks']['Row']> & { phase_id: string; week_number: number };
        Update: Partial<Database['public']['Tables']['weeks']['Row']>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          week_id: string;
          session_number: number;
          name: string | null;
          scheduled_date: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sessions']['Row']> & { week_id: string; session_number: number };
        Update: Partial<Database['public']['Tables']['sessions']['Row']>;
        Relationships: [];
      };
      session_exercises: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          order_index: number;
          sets: number | null;
          reps: string | null;
          weight: number | null;
          rir_rpe: string | null;
          rest: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['session_exercises']['Row']> & {
          session_id: string;
          exercise_id: string;
        };
        Update: Partial<Database['public']['Tables']['session_exercises']['Row']>;
        Relationships: [];
      };
      set_logs: {
        Row: {
          id: string;
          session_exercise_id: string;
          set_number: number;
          reps: number | null;
          weight: number | null;
          rpe: number | null;
          completed: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['set_logs']['Row']> & {
          session_exercise_id: string;
          set_number: number;
        };
        Update: Partial<Database['public']['Tables']['set_logs']['Row']>;
        Relationships: [];
      };
      progressions: {
        Row: {
          id: string;
          program_id: string;
          phase_id: string;
          muscle_group: string;
          week_number: number;
          target_sets: number | null;
          target_reps: string | null;
          target_intensity: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['progressions']['Row']> & {
          program_id: string;
          phase_id: string;
          muscle_group: string;
          week_number: number;
        };
        Update: Partial<Database['public']['Tables']['progressions']['Row']>;
        Relationships: [];
      };
      weekly_tracking: {
        Row: {
          id: string;
          client_id: string;
          week_start_date: string;
          sessions_completed: number | null;
          fatigue: number | null;
          recovery: number | null;
          weight: number | null;
          nutrition_adherence: number | null;
          satiety: number | null;
          hydration: number | null;
          plan_following: number | null;
          sleep_hours: number | null;
          sleep_quality: number | null;
          stress: number | null;
          motivation: number | null;
          energy: number | null;
          mood: number | null;
          proudest_moment: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['weekly_tracking']['Row']> & {
          client_id: string;
          week_start_date: string;
        };
        Update: Partial<Database['public']['Tables']['weekly_tracking']['Row']>;
        Relationships: [];
      };
      daily_log: {
        Row: {
          id: string;
          weekly_tracking_id: string;
          day_date: string;
          status: DailyStatus;
          observation: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['daily_log']['Row']> & {
          weekly_tracking_id: string;
          day_date: string;
        };
        Update: Partial<Database['public']['Tables']['daily_log']['Row']>;
        Relationships: [];
      };
      hr_zones: {
        Row: {
          id: string;
          client_id: string;
          zone_name: string;
          pct_min: number | null;
          pct_max: number | null;
          bpm_min: number | null;
          bpm_max: number | null;
          effect: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['hr_zones']['Row']> & { client_id: string; zone_name: string };
        Update: Partial<Database['public']['Tables']['hr_zones']['Row']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          trainer_id: string;
          plan: SubscriptionPlan;
          status: string;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & { trainer_id: string };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      seed_default_exercises: {
        Args: { p_trainer_id: string };
        Returns: undefined;
      };
      import_catalog_exercise: {
        Args: { p_catalog_id: string };
        Returns: string;
      };
    };
  };
}
