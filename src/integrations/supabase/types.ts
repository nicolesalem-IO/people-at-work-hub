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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      approvals: {
        Row: {
          comment: string | null
          decided_at: string | null
          decision: string
          entity_id: string
          entity_type: string
          id: string
          requested_at: string
          requested_by: string | null
          reviewer_id: string | null
        }
        Insert: {
          comment?: string | null
          decided_at?: string | null
          decision?: string
          entity_id: string
          entity_type: string
          id?: string
          requested_at?: string
          requested_by?: string | null
          reviewer_id?: string | null
        }
        Update: {
          comment?: string | null
          decided_at?: string | null
          decision?: string
          entity_id?: string
          entity_type?: string
          id?: string
          requested_at?: string
          requested_by?: string | null
          reviewer_id?: string | null
        }
        Relationships: []
      }
      assessment_access: {
        Row: {
          battery_id: string
          id: string
          permission: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          battery_id: string
          id?: string
          permission: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          battery_id?: string
          id?: string
          permission?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_access_battery_id_fkey"
            columns: ["battery_id"]
            isOneToOne: false
            referencedRelation: "assessment_batteries"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_attempts: {
        Row: {
          accommodation_request: string
          accommodation_status: string
          alternate_format: string
          answers: Json
          auto_scored_at: string | null
          battery_id: string
          campaign_id: string | null
          candidate_id: string | null
          completed_sections: Json
          created_at: string
          current_section: string | null
          expires_at: string
          extra_minutes: number
          id: string
          name: string
          option_order: Json
          practice_completed: Json
          privacy_accepted_at: string | null
          privacy_notice: string
          purged_at: string | null
          question_order: Json
          raters: Json
          reconciliations: Json
          revoked: boolean
          scores: Json
          section_deadlines: Json
          section_times: Json
          started_at: string | null
          status: string
          submitted_at: string | null
          token_hash: string | null
        }
        Insert: {
          accommodation_request?: string
          accommodation_status?: string
          alternate_format?: string
          answers?: Json
          auto_scored_at?: string | null
          battery_id: string
          campaign_id?: string | null
          candidate_id?: string | null
          completed_sections?: Json
          created_at?: string
          current_section?: string | null
          expires_at?: string
          extra_minutes?: number
          id?: string
          name: string
          option_order?: Json
          practice_completed?: Json
          privacy_accepted_at?: string | null
          privacy_notice?: string
          purged_at?: string | null
          question_order?: Json
          raters?: Json
          reconciliations?: Json
          revoked?: boolean
          scores?: Json
          section_deadlines?: Json
          section_times?: Json
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          token_hash?: string | null
        }
        Update: {
          accommodation_request?: string
          accommodation_status?: string
          alternate_format?: string
          answers?: Json
          auto_scored_at?: string | null
          battery_id?: string
          campaign_id?: string | null
          candidate_id?: string | null
          completed_sections?: Json
          created_at?: string
          current_section?: string | null
          expires_at?: string
          extra_minutes?: number
          id?: string
          name?: string
          option_order?: Json
          practice_completed?: Json
          privacy_accepted_at?: string | null
          privacy_notice?: string
          purged_at?: string | null
          question_order?: Json
          raters?: Json
          reconciliations?: Json
          revoked?: boolean
          scores?: Json
          section_deadlines?: Json
          section_times?: Json
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_battery_id_fkey"
            columns: ["battery_id"]
            isOneToOne: false
            referencedRelation: "assessment_batteries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "assessment_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "pipeline_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_batteries: {
        Row: {
          analysis_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          payload: Json
          status: string
        }
        Insert: {
          analysis_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          payload: Json
          status?: string
        }
        Update: {
          analysis_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          payload?: Json
          status?: string
        }
        Relationships: []
      }
      assessment_campaigns: {
        Row: {
          battery_id: string
          candidate_days: number
          closes_at: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          opens_at: string
          welcome_message: string
        }
        Insert: {
          battery_id: string
          candidate_days?: number
          closes_at?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          opens_at?: string
          welcome_message?: string
        }
        Update: {
          battery_id?: string
          candidate_days?: number
          closes_at?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          opens_at?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_campaigns_battery_id_fkey"
            columns: ["battery_id"]
            isOneToOne: false
            referencedRelation: "assessment_batteries"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_demographics: {
        Row: {
          attempt_id: string
          group_label: string
        }
        Insert: {
          attempt_id: string
          group_label?: string
        }
        Update: {
          attempt_id?: string
          group_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_demographics_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_rater_assignments: {
        Row: {
          attempt_id: string
          id: string
          item_id: string
          person_id: string
        }
        Insert: {
          attempt_id: string
          id?: string
          item_id: string
          person_id: string
        }
        Update: {
          attempt_id?: string
          id?: string
          item_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_rater_assignments_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_rater_assignments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "org_people"
            referencedColumns: ["id"]
          },
        ]
      }
      competencies: {
        Row: {
          analysis_version_id: string
          created_at: string
          definition: string
          id: string
          importance: number
          name: string
          required_at_entry: boolean
        }
        Insert: {
          analysis_version_id: string
          created_at?: string
          definition: string
          id?: string
          importance: number
          name: string
          required_at_entry?: boolean
        }
        Update: {
          analysis_version_id?: string
          created_at?: string
          definition?: string
          id?: string
          importance?: number
          name?: string
          required_at_entry?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "competencies_analysis_version_id_fkey"
            columns: ["analysis_version_id"]
            isOneToOne: false
            referencedRelation: "role_analysis_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_evidence: {
        Row: {
          competency_id: string
          evidence_id: string
        }
        Insert: {
          competency_id: string
          evidence_id: string
        }
        Update: {
          competency_id?: string
          evidence_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_evidence_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_evidence_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_items"
            referencedColumns: ["id"]
          },
        ]
      }
      conflict_evidence: {
        Row: {
          conflict_id: string
          evidence_id: string
        }
        Insert: {
          conflict_id: string
          evidence_id: string
        }
        Update: {
          conflict_id?: string
          evidence_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conflict_evidence_conflict_id_fkey"
            columns: ["conflict_id"]
            isOneToOne: false
            referencedRelation: "evidence_conflicts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflict_evidence_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_items"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          content: string
          contributor_id: string
          contributor_type: string
          created_at: string
          id: string
          job_role_id: string
        }
        Insert: {
          content: string
          contributor_id?: string
          contributor_type: string
          created_at?: string
          id?: string
          job_role_id: string
        }
        Update: {
          content?: string
          contributor_id?: string
          contributor_type?: string
          created_at?: string
          id?: string
          job_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_conflicts: {
        Row: {
          description: string
          id: string
          job_role_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          topic: string
        }
        Insert: {
          description: string
          id?: string
          job_role_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          topic: string
        }
        Update: {
          description?: string
          id?: string
          job_role_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_conflicts_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          added_by: string | null
          code: string
          created_at: string
          excerpt: string
          id: string
          job_role_id: string
          source_reference: string | null
          source_type: string
          title: string
        }
        Insert: {
          added_by?: string | null
          code: string
          created_at?: string
          excerpt: string
          id?: string
          job_role_id: string
          source_reference?: string | null
          source_type: string
          title: string
        }
        Update: {
          added_by?: string | null
          code?: string
          created_at?: string
          excerpt?: string
          id?: string
          job_role_id?: string
          source_reference?: string | null
          source_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      hiring_decisions: {
        Row: {
          attempt_id: string
          created_at: string
          decided_by: string | null
          decision: string
          id: string
          note: string
          outcome: string | null
          reason: string | null
        }
        Insert: {
          attempt_id: string
          created_at?: string
          decided_by?: string | null
          decision: string
          id?: string
          note: string
          outcome?: string | null
          reason?: string | null
        }
        Update: {
          attempt_id?: string
          created_at?: string
          decided_by?: string | null
          decision?: string
          id?: string
          note?: string
          outcome?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hiring_decisions_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      hiring_packages: {
        Row: {
          analysis_version_id: string
          created_at: string
          id: string
          job_role_id: string
          status: string
        }
        Insert: {
          analysis_version_id: string
          created_at?: string
          id?: string
          job_role_id: string
          status?: string
        }
        Update: {
          analysis_version_id?: string
          created_at?: string
          id?: string
          job_role_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiring_packages_analysis_version_id_fkey"
            columns: ["analysis_version_id"]
            isOneToOne: false
            referencedRelation: "role_analysis_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiring_packages_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_answers: {
        Row: {
          created_at: string
          evidence_id: string
          id: string
          module: string
          session_id: string
          source_id: string
          values: Json
        }
        Insert: {
          created_at?: string
          evidence_id: string
          id?: string
          module: string
          session_id: string
          source_id: string
          values: Json
        }
        Update: {
          created_at?: string
          evidence_id?: string
          id?: string
          module?: string
          session_id?: string
          source_id?: string
          values?: Json
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "interview_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_outputs: {
        Row: {
          content: string
          created_at: string
          evidence_ids: string[]
          id: string
          output_type: string
          session_id: string
          status: string
        }
        Insert: {
          content: string
          created_at?: string
          evidence_ids: string[]
          id?: string
          output_type: string
          session_id: string
          status?: string
        }
        Update: {
          content?: string
          created_at?: string
          evidence_ids?: string[]
          id?: string
          output_type?: string
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_outputs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          analysis_version_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          custom_output: string
          id: string
          incumbents: number
          is_fictional: boolean
          job_role_id: string
          locations: string
          predecessor_id: string | null
          purposes: string[]
          role_state: string
          source_types: string[]
          status: string
        }
        Insert: {
          analysis_version_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          custom_output?: string
          id?: string
          incumbents?: number
          is_fictional?: boolean
          job_role_id: string
          locations?: string
          predecessor_id?: string | null
          purposes?: string[]
          role_state?: string
          source_types?: string[]
          status?: string
        }
        Update: {
          analysis_version_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          custom_output?: string
          id?: string
          incumbents?: number
          is_fictional?: boolean
          job_role_id?: string
          locations?: string
          predecessor_id?: string | null
          purposes?: string[]
          role_state?: string
          source_types?: string[]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_analysis_version_id_fkey"
            columns: ["analysis_version_id"]
            isOneToOne: true
            referencedRelation: "role_analysis_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sources: {
        Row: {
          id: string
          name: string
          session_id: string
          source_type: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          session_id: string
          source_type: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          session_id?: string
          source_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_sources_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      job_roles: {
        Row: {
          created_at: string
          created_by: string | null
          department: string
          id: string
          is_fictional: boolean
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department: string
          id?: string
          is_fictional?: boolean
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string
          id?: string
          is_fictional?: boolean
          status?: string
          title?: string
        }
        Relationships: []
      }
      material_citations: {
        Row: {
          evidence_id: string
          id: string
          material_id: string
          statement: string
        }
        Insert: {
          evidence_id: string
          id?: string
          material_id: string
          statement: string
        }
        Update: {
          evidence_id?: string
          id?: string
          material_id?: string
          statement?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_citations_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_citations_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "package_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_drafts: {
        Row: {
          completed_at: string | null
          payload: Json
          step: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          payload?: Json
          step?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          payload?: Json
          step?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      org_assignments: {
        Row: {
          id: string
          permission: string
          person_id: string
          role_id: string
          source_id: string
        }
        Insert: {
          id?: string
          permission: string
          person_id: string
          role_id: string
          source_id?: string
        }
        Update: {
          id?: string
          permission?: string
          person_id?: string
          role_id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_assignments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "org_people"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          person_id: string
          revoked: boolean
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          person_id: string
          revoked?: boolean
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          person_id?: string
          revoked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "org_invitations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "org_people"
            referencedColumns: ["id"]
          },
        ]
      }
      org_people: {
        Row: {
          created_at: string
          email: string
          id: string
          last_active: string | null
          name: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_active?: string | null
          name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_active?: string | null
          name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      org_person_roles: {
        Row: {
          person_id: string
          role: string
        }
        Insert: {
          person_id: string
          role: string
        }
        Update: {
          person_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_person_roles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "org_people"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          candidate_days: number
          id: boolean
          logo_path: string
          name: string
          onet_mode: string
          privacy_notice: string
          retention_months: number
        }
        Insert: {
          candidate_days?: number
          id?: boolean
          logo_path?: string
          name?: string
          onet_mode?: string
          privacy_notice?: string
          retention_months?: number
        }
        Update: {
          candidate_days?: number
          id?: boolean
          logo_path?: string
          name?: string
          onet_mode?: string
          privacy_notice?: string
          retention_months?: number
        }
        Relationships: []
      }
      package_materials: {
        Row: {
          blocked_by_conflict_id: string | null
          content: string
          created_at: string
          id: string
          material_type: string
          package_id: string
          status: string
          updated_at: string
          version_label: string
        }
        Insert: {
          blocked_by_conflict_id?: string | null
          content?: string
          created_at?: string
          id?: string
          material_type: string
          package_id: string
          status?: string
          updated_at?: string
          version_label?: string
        }
        Update: {
          blocked_by_conflict_id?: string | null
          content?: string
          created_at?: string
          id?: string
          material_type?: string
          package_id?: string
          status?: string
          updated_at?: string
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_materials_blocked_by_conflict_id_fkey"
            columns: ["blocked_by_conflict_id"]
            isOneToOne: false
            referencedRelation: "evidence_conflicts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_materials_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "hiring_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_candidates: {
        Row: {
          campaign_id: string
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_candidates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "assessment_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_rater_scores: {
        Row: {
          attempt_id: string
          comment: string
          created_at: string
          id: string
          item_id: string
          rater_id: string
          ratings: Json
        }
        Insert: {
          attempt_id: string
          comment: string
          created_at?: string
          id?: string
          item_id: string
          rater_id: string
          ratings: Json
        }
        Update: {
          attempt_id?: string
          comment?: string
          created_at?: string
          id?: string
          item_id?: string
          rater_id?: string
          ratings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_rater_scores_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_responses: {
        Row: {
          answer: string
          attempt_id: string
          item_id: string
          time_seconds: number
          updated_at: string
        }
        Insert: {
          answer: string
          attempt_id: string
          item_id: string
          time_seconds?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          attempt_id?: string
          item_id?: string
          time_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_scores: {
        Row: {
          attempt_id: string
          created_at: string
          score_key: string
          score_type: string
          value: number
        }
        Insert: {
          attempt_id: string
          created_at?: string
          score_key: string
          score_type: string
          value: number
        }
        Update: {
          attempt_id?: string
          created_at?: string
          score_key?: string
          score_type?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_scores_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      role_analysis_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          job_role_id: string
          status: string
          summary: string
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          job_role_id: string
          status?: string
          summary?: string
          version_number: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          job_role_id?: string
          status?: string
          summary?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_analysis_versions_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assessment_analysis_ready: { Args: { v: Json }; Returns: boolean }
      assessment_candidate_action: {
        Args: { command: string; payload?: Json; token: string }
        Returns: Json
      }
      assessment_permission: {
        Args: { bid: string; p: string }
        Returns: boolean
      }
      assessment_ready: { Args: { v: Json }; Returns: boolean }
      can_edit_workspace: { Args: never; Returns: boolean }
      convert_contribution_to_evidence: {
        Args: {
          contribution_id: string
          evidence_code: string
          evidence_title: string
        }
        Returns: string
      }
      create_interview: { Args: { payload: Json }; Returns: string }
      has_role: {
        Args: { role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Returns: boolean
      }
      interview_core_complete: {
        Args: { m: string; v: Json }
        Returns: boolean
      }
      interview_covered: { Args: { sid: string }; Returns: boolean }
      interview_output_allowed: {
        Args: { custom: string; p: string[]; t: string }
        Returns: boolean
      }
      interview_required: { Args: { p: string[] }; Returns: string[] }
      onboarding_batteries: { Args: never; Returns: Json }
      onboarding_sme_save: { Args: { v: Json }; Returns: boolean }
      org_accept_invitation: { Args: { inv: string }; Returns: boolean }
      org_active: { Args: { uid: string }; Returns: boolean }
      org_assigned: {
        Args: { p: string; rid: string; uid: string }
        Returns: boolean
      }
      org_blind_work: { Args: { rid: string }; Returns: Json }
      org_can: { Args: { cap: string; rid?: string }; Returns: boolean }
      org_fairness_data: { Args: { rid: string }; Returns: Json }
      org_has_role: { Args: { r: string; uid: string }; Returns: boolean }
      org_retention_cleanup: { Args: never; Returns: number }
      org_save_person: { Args: { v: Json }; Returns: string }
      org_score_snapshot: {
        Args: { aid: string; item?: string }
        Returns: Json
      }
      org_server_score_snapshot: {
        Args: { actor: string; aid: string; item?: string }
        Returns: Json
      }
      org_server_store_score: {
        Args: {
          actor: string
          aid: string
          expected: Json
          item?: string
          recs: Json
          rs: Json
          sc: Json
          st: string
        }
        Returns: boolean
      }
      org_session: { Args: never; Returns: Json }
      org_store_score: {
        Args: {
          aid: string
          expected: Json
          item?: string
          recs: Json
          rs: Json
          sc: Json
          st: string
        }
        Returns: boolean
      }
      org_test_rule: { Args: { rule: string }; Returns: boolean }
      pipeline_accommodation: {
        Args: { aid: string; decision: string; extra: number; format: string }
        Returns: boolean
      }
      pipeline_candidate_action: {
        Args: { command: string; payload?: Json; token: string }
        Returns: Json
      }
      pipeline_hiring_decision: {
        Args: { aid: string; outcome: string; reason: string }
        Returns: boolean
      }
      pipeline_invite: {
        Args: { cid: string; hash: string; v: Json }
        Returns: string
      }
      pipeline_launch: { Args: { v: Json }; Returns: string }
      pipeline_rater_score: {
        Args: {
          aid: string
          comment: string
          consensus?: boolean
          item: string
          ratings: Json
        }
        Returns: boolean
      }
      pipeline_recalculate: { Args: { aid: string }; Returns: boolean }
      pipeline_server_accommodation: {
        Args: {
          actor: string
          aid: string
          decision: string
          extra: number
          format: string
        }
        Returns: boolean
      }
      pipeline_server_invite: {
        Args: { actor: string; cid: string; hash: string; v: Json }
        Returns: string
      }
      pipeline_server_rater_score: {
        Args: {
          actor: string
          aid: string
          comment: string
          consensus?: boolean
          item: string
          ratings: Json
        }
        Returns: boolean
      }
      revise_interview: { Args: { sid: string }; Returns: string }
      save_interview_answer: { Args: { payload: Json }; Returns: string }
      test_interview_rule: { Args: { test_name: string }; Returns: boolean }
      test_workspace_rule: { Args: { test_name: string }; Returns: boolean }
    }
    Enums: {
      app_role: "contributor" | "analyst" | "hr_reviewer" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["contributor", "analyst", "hr_reviewer", "admin"],
    },
  },
} as const
