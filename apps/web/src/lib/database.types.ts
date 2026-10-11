// Bootstrap types for offline builds. Run `npm run db:types` after linking the
// staging project; the Supabase CLI then replaces this file from the applied schema.
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
      profiles: {
        Row: {
          id: string;
          display_name: string;
          locale: string;
          created_at: string;
        };
        Insert: { id: string; display_name: string; locale?: string };
        Update: { display_name?: string; locale?: string };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          kind: string;
          region: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          kind: string;
          region?: string | null;
        };
        Update: { name?: string; region?: string | null };
      };
      organization_memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: { organization_id: string; user_id: string; role: string };
        Update: { role?: string };
      };
      ventures: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          tagline: string;
          sector: string;
          stage: string;
          region: string;
          city: string | null;
          funding_need_min: number;
          funding_need_max: number;
          traction_level: number;
          impact_goals: string[];
          risk_level: number;
          consent_to_match: boolean;
          visibility: string;
          deletion_requested_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          tagline: string;
          sector: string;
          stage: string;
          region: string;
          city?: string | null;
          funding_need_min?: number;
          funding_need_max?: number;
          traction_level?: number;
          impact_goals?: string[];
          risk_level?: number;
          consent_to_match?: boolean;
          visibility?: string;
          deletion_requested_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ventures"]["Insert"]>;
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          token_hash: string;
          role: string;
          organization_id: string | null;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          token_hash: string;
          role: string;
          organization_id?: string | null;
          expires_at: string;
          invited_by: string;
        };
        Update: { accepted_at?: string | null; accepted_by?: string | null };
      };
      evidence_items: {
        Row: {
          id: string;
          venture_id: string;
          owner_id: string;
          title: string;
          file_name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          sha256: string | null;
          evidence_date: string;
          status: string;
          extracted_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          venture_id: string;
          owner_id: string;
          title: string;
          file_name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          evidence_date: string;
          status?: string;
        };
        Update: {
          status?: string;
          sha256?: string | null;
          extracted_text?: string | null;
          rejection_reason?: string | null;
        };
      };
      investor_theses: {
        Row: {
          id: string;
          owner_id: string;
          organization_id: string | null;
          sectors: string[];
          stages: string[];
          regions: string[];
          ticket_min: number;
          ticket_max: number;
          minimum_traction: number;
          impact_goals: string[];
          risk_tolerance: number;
          excluded_sectors: string[];
          mentorship_only: boolean;
          created_at: string;
        };
        Insert: {
          owner_id: string;
          organization_id?: string | null;
          sectors: string[];
          stages: string[];
          regions?: string[];
          ticket_min: number;
          ticket_max: number;
          minimum_traction?: number;
          impact_goals?: string[];
          risk_tolerance?: number;
          excluded_sectors?: string[];
          mentorship_only?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["investor_theses"]["Insert"]
        >;
      };
      readiness_snapshots: {
        Row: {
          id: string;
          venture_id: string;
          rubric_version: string;
          completion_percent: number;
          evidence_coverage_percent: number;
          dimensions: Json;
          created_at: string;
        };
        Insert: {
          venture_id: string;
          rubric_version: string;
          completion_percent: number;
          evidence_coverage_percent: number;
          dimensions: Json;
        };
        Update: never;
      };
      match_snapshots: {
        Row: {
          id: string;
          venture_id: string;
          thesis_id: string;
          reviewer_id: string;
          rubric_version: string;
          compatibility_score: number;
          factors: Json;
          reasons: Json;
          mismatches: Json;
          eligible: boolean;
          created_at: string;
        };
        Insert: {
          venture_id: string;
          thesis_id: string;
          reviewer_id: string;
          rubric_version: string;
          compatibility_score: number;
          factors: Json;
          reasons: Json;
          mismatches: Json;
          eligible: boolean;
        };
        Update: never;
      };
      claims: {
        Row: {
          id: string;
          venture_id: string;
          created_by: string;
          dimension: string;
          statement: string;
          status: string;
          created_at: string;
        };
        Insert: {
          venture_id: string;
          created_by: string;
          dimension: string;
          statement: string;
          status?: string;
        };
        Update: { statement?: string; status?: string };
      };
      cohorts: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          starts_on: string | null;
          ends_on: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          organization_id: string;
          name: string;
          starts_on?: string | null;
          ends_on?: string | null;
          status?: string;
        };
        Update: {
          name?: string;
          status?: string;
          starts_on?: string | null;
          ends_on?: string | null;
        };
      };
      blind_reveals: {
        Row: {
          id: string;
          venture_id: string;
          reviewer_id: string;
          reason: string;
          revealed_at: string;
        };
        Insert: { venture_id: string; reviewer_id: string; reason: string };
        Update: never;
      };
      introductions: {
        Row: {
          id: string;
          venture_id: string;
          thesis_id: string | null;
          requested_by: string;
          recipient_id: string;
          status: string;
          message: string;
          created_at: string;
        };
        Insert: {
          venture_id: string;
          thesis_id?: string | null;
          requested_by: string;
          recipient_id: string;
          status?: string;
          message: string;
        };
        Update: {
          status?: string;
          outcome?: string | null;
          meeting_at?: string | null;
        };
      };
      audit_events: {
        Row: {
          id: string;
          actor_id: string | null;
          organization_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          organization_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
        };
        Update: never;
      };
      consent_records: {
        Row: {
          id: string;
          user_id: string;
          purpose: string;
          granted: boolean;
          evidence_ids: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          purpose: string;
          granted: boolean;
          evidence_ids?: string[];
        };
        Update: never;
      };
      ai_runs: {
        Row: {
          id: string;
          user_id: string;
          venture_id: string | null;
          purpose: string;
          model: string;
          prompt_version: string;
          input_hash: string;
          evidence_ids: string[];
          status: string;
          latency_ms: number | null;
          usage: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          venture_id?: string | null;
          purpose: string;
          model: string;
          prompt_version: string;
          input_hash: string;
          evidence_ids?: string[];
          status: string;
          latency_ms?: number | null;
          usage?: Json;
        };
        Update: never;
      };
      pilot_applications: {
        Row: {
          id: string;
          name: string;
          email: string;
          organization: string;
          role: string;
          goals: string;
          region: string;
          consent: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          organization: string;
          role: string;
          goals: string;
          region: string;
          consent: boolean;
        };
        Update: { status?: string };
      };
    };
    Views: Record<string, never>;
    Functions: {
      activate_matching_rubric: {
        Args: { p_version: string };
        Returns: undefined;
      };
      accept_invitation: {
        Args: { p_token_hash: string };
        Returns: Json;
      };
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
      review_readiness_section: {
        Args: { p_venture_id: string; p_dimension: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
