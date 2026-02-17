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
      adult_content_posts: {
        Row: {
          author_username: string | null
          category: string | null
          comments_count: number | null
          confidence_score: number | null
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          post_type: string | null
          sentiment: string | null
          source_platform: string | null
          source_type: string | null
          source_url: string | null
          tips: string[] | null
          title: string
          topic_tags: string[] | null
          updated_at: string | null
          upvotes: number | null
          warnings: string[] | null
        }
        Insert: {
          author_username?: string | null
          category?: string | null
          comments_count?: number | null
          confidence_score?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          post_type?: string | null
          sentiment?: string | null
          source_platform?: string | null
          source_type?: string | null
          source_url?: string | null
          tips?: string[] | null
          title: string
          topic_tags?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
          warnings?: string[] | null
        }
        Update: {
          author_username?: string | null
          category?: string | null
          comments_count?: number | null
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          post_type?: string | null
          sentiment?: string | null
          source_platform?: string | null
          source_type?: string | null
          source_url?: string | null
          tips?: string[] | null
          title?: string
          topic_tags?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
          warnings?: string[] | null
        }
        Relationships: []
      }
      adult_content_submissions: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      advocate_applications: {
        Row: {
          advocacy_interests: string[] | null
          approved_at: string | null
          availability: string | null
          city: string | null
          connection_to_t1d: string | null
          consent_to_contact: boolean | null
          consent_to_share_story: boolean | null
          country: string | null
          created_at: string | null
          diagnosis_year: number | null
          email: string
          full_name: string
          how_heard_about: string | null
          id: string
          notes: string | null
          personal_story: string | null
          phone: string | null
          prior_advocacy_experience: string | null
          skills: string[] | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          advocacy_interests?: string[] | null
          approved_at?: string | null
          availability?: string | null
          city?: string | null
          connection_to_t1d?: string | null
          consent_to_contact?: boolean | null
          consent_to_share_story?: boolean | null
          country?: string | null
          created_at?: string | null
          diagnosis_year?: number | null
          email: string
          full_name: string
          how_heard_about?: string | null
          id?: string
          notes?: string | null
          personal_story?: string | null
          phone?: string | null
          prior_advocacy_experience?: string | null
          skills?: string[] | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          advocacy_interests?: string[] | null
          approved_at?: string | null
          availability?: string | null
          city?: string | null
          connection_to_t1d?: string | null
          consent_to_contact?: boolean | null
          consent_to_share_story?: boolean | null
          country?: string | null
          created_at?: string | null
          diagnosis_year?: number | null
          email?: string
          full_name?: string
          how_heard_about?: string | null
          id?: string
          notes?: string | null
          personal_story?: string | null
          phone?: string | null
          prior_advocacy_experience?: string | null
          skills?: string[] | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      ai_found_connections: {
        Row: {
          ai_analysis: Json | null
          biological_mechanism: string | null
          community_mentions: number | null
          confidence_score: number | null
          connection_type: string
          created_at: string
          cross_validation_count: number | null
          description: string
          id: string
          keywords: string[] | null
          last_analyzed_at: string | null
          novelty_score: number | null
          practical_implications: string[] | null
          research_citations: number | null
          source_fda_data: Json | null
          source_papers: Json | null
          source_posts: Json | null
          source_trials: Json | null
          title: string
          updated_at: string
          validation_status: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          biological_mechanism?: string | null
          community_mentions?: number | null
          confidence_score?: number | null
          connection_type: string
          created_at?: string
          cross_validation_count?: number | null
          description: string
          id?: string
          keywords?: string[] | null
          last_analyzed_at?: string | null
          novelty_score?: number | null
          practical_implications?: string[] | null
          research_citations?: number | null
          source_fda_data?: Json | null
          source_papers?: Json | null
          source_posts?: Json | null
          source_trials?: Json | null
          title: string
          updated_at?: string
          validation_status?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          biological_mechanism?: string | null
          community_mentions?: number | null
          confidence_score?: number | null
          connection_type?: string
          created_at?: string
          cross_validation_count?: number | null
          description?: string
          id?: string
          keywords?: string[] | null
          last_analyzed_at?: string | null
          novelty_score?: number | null
          practical_implications?: string[] | null
          research_citations?: number | null
          source_fda_data?: Json | null
          source_papers?: Json | null
          source_posts?: Json | null
          source_trials?: Json | null
          title?: string
          updated_at?: string
          validation_status?: string | null
        }
        Relationships: []
      }
      ai_healthcare_recommendations: {
        Row: {
          analysis_summary: string | null
          based_on_count: number | null
          category: string
          created_at: string | null
          id: string
          recommendation: string
        }
        Insert: {
          analysis_summary?: string | null
          based_on_count?: number | null
          category: string
          created_at?: string | null
          id?: string
          recommendation: string
        }
        Update: {
          analysis_summary?: string | null
          based_on_count?: number | null
          category?: string
          created_at?: string | null
          id?: string
          recommendation?: string
        }
        Relationships: []
      }
      app_community_buzz: {
        Row: {
          app_id: string | null
          app_name: string
          author_anonymous: string | null
          category: string | null
          content: string
          created_at: string
          id: string
          published_at: string | null
          sentiment: string | null
          source_platform: string
          source_url: string | null
          upvotes: number | null
        }
        Insert: {
          app_id?: string | null
          app_name: string
          author_anonymous?: string | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          published_at?: string | null
          sentiment?: string | null
          source_platform?: string
          source_url?: string | null
          upvotes?: number | null
        }
        Update: {
          app_id?: string | null
          app_name?: string
          author_anonymous?: string | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          published_at?: string | null
          sentiment?: string | null
          source_platform?: string
          source_url?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_community_buzz_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "diabetes_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      app_reviews: {
        Row: {
          app_id: string | null
          author: string | null
          content: string
          created_at: string | null
          id: string
          rating: number | null
          source_platform: string | null
          source_url: string | null
        }
        Insert: {
          app_id?: string | null
          author?: string | null
          content: string
          created_at?: string | null
          id?: string
          rating?: number | null
          source_platform?: string | null
          source_url?: string | null
        }
        Update: {
          app_id?: string | null
          author?: string | null
          content?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          source_platform?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_reviews_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "diabetes_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: Json
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          reading_time_mins: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: Json
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          reading_time_mins?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: Json
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          reading_time_mins?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      backfill_audit: {
        Row: {
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          performed_at: string
          performed_by: string
          post_id: string
          reason: string | null
        }
        Insert: {
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string
          post_id: string
          reason?: string | null
        }
        Update: {
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string
          post_id?: string
          reason?: string | null
        }
        Relationships: []
      }
      bounties: {
        Row: {
          category: string | null
          claimed_by: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          reward_amount: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          claimed_by?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          reward_amount?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          claimed_by?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          reward_amount?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      burnout_comments: {
        Row: {
          author_anonymous: string | null
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          score: number | null
        }
        Insert: {
          author_anonymous?: string | null
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          score?: number | null
        }
        Update: {
          author_anonymous?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "burnout_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "burnout_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "burnout_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "burnout_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      burnout_community_posts: {
        Row: {
          author_anonymous: string | null
          burnout_category: string | null
          content: string | null
          created_at: string
          id: string
          num_comments: number | null
          published_at: string | null
          score: number | null
          sentiment: string | null
          source: string
          source_url: string | null
          title: string
          topic_tags: string[] | null
        }
        Insert: {
          author_anonymous?: string | null
          burnout_category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          num_comments?: number | null
          published_at?: string | null
          score?: number | null
          sentiment?: string | null
          source?: string
          source_url?: string | null
          title: string
          topic_tags?: string[] | null
        }
        Update: {
          author_anonymous?: string | null
          burnout_category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          num_comments?: number | null
          published_at?: string | null
          score?: number | null
          sentiment?: string | null
          source?: string
          source_url?: string | null
          title?: string
          topic_tags?: string[] | null
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string | null
          completed: boolean | null
          completed_at: string | null
          id: string
          joined_at: string | null
          progress: number | null
          target: number | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          target?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          target?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context_id: string | null
          context_name: string | null
          context_type: string | null
          created_at: string | null
          id: string
          messages: Json | null
          saved_issue_id: string | null
          suggested_questions: Json | null
          summary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_id?: string | null
          context_name?: string | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          saved_issue_id?: string | null
          suggested_questions?: Json | null
          summary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_id?: string | null
          context_name?: string | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          saved_issue_id?: string | null
          suggested_questions?: Json | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_saved_issue_id_fkey"
            columns: ["saved_issue_id"]
            isOneToOne: false
            referencedRelation: "user_saved_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      claimed_projects: {
        Row: {
          claimed_at: string | null
          claimed_tasks: string[] | null
          completed_tasks: string[] | null
          id: string
          notes: string | null
          progress: number | null
          project_id: string
          project_title: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_tasks?: string[] | null
          completed_tasks?: string[] | null
          id?: string
          notes?: string | null
          progress?: number | null
          project_id: string
          project_title: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_tasks?: string[] | null
          completed_tasks?: string[] | null
          id?: string
          notes?: string | null
          progress?: number | null
          project_id?: string
          project_title?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clinical_trials_detailed: {
        Row: {
          accepts_healthy_volunteers: boolean | null
          age_requirement_max: number | null
          age_requirement_min: number | null
          brief_summary: string | null
          completion_date: string | null
          conditions: string[] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          detailed_description: string | null
          eligibility_criteria: string | null
          enrollment_count: number | null
          gender: string | null
          id: string
          intervention_type: string | null
          interventions: string[] | null
          last_update_date: string | null
          lead_sponsor_class: string | null
          location_countries: string[] | null
          locations: Json | null
          max_age: string | null
          min_age: string | null
          nct_id: string
          overall_status: string | null
          phase: string | null
          primary_outcomes: string[] | null
          primary_purpose: string | null
          raw_data: Json | null
          recruiting_status: string | null
          secondary_outcomes: string[] | null
          source_registry: string
          sponsor_name: string | null
          start_date: string | null
          study_type: string | null
          study_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accepts_healthy_volunteers?: boolean | null
          age_requirement_max?: number | null
          age_requirement_min?: number | null
          brief_summary?: string | null
          completion_date?: string | null
          conditions?: string[] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          detailed_description?: string | null
          eligibility_criteria?: string | null
          enrollment_count?: number | null
          gender?: string | null
          id?: string
          intervention_type?: string | null
          interventions?: string[] | null
          last_update_date?: string | null
          lead_sponsor_class?: string | null
          location_countries?: string[] | null
          locations?: Json | null
          max_age?: string | null
          min_age?: string | null
          nct_id: string
          overall_status?: string | null
          phase?: string | null
          primary_outcomes?: string[] | null
          primary_purpose?: string | null
          raw_data?: Json | null
          recruiting_status?: string | null
          secondary_outcomes?: string[] | null
          source_registry: string
          sponsor_name?: string | null
          start_date?: string | null
          study_type?: string | null
          study_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accepts_healthy_volunteers?: boolean | null
          age_requirement_max?: number | null
          age_requirement_min?: number | null
          brief_summary?: string | null
          completion_date?: string | null
          conditions?: string[] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          detailed_description?: string | null
          eligibility_criteria?: string | null
          enrollment_count?: number | null
          gender?: string | null
          id?: string
          intervention_type?: string | null
          interventions?: string[] | null
          last_update_date?: string | null
          lead_sponsor_class?: string | null
          location_countries?: string[] | null
          locations?: Json | null
          max_age?: string | null
          min_age?: string | null
          nct_id?: string
          overall_status?: string | null
          phase?: string | null
          primary_outcomes?: string[] | null
          primary_purpose?: string | null
          raw_data?: Json | null
          recruiting_status?: string | null
          secondary_outcomes?: string[] | null
          source_registry?: string
          sponsor_name?: string | null
          start_date?: string | null
          study_type?: string | null
          study_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_challenges: {
        Row: {
          challenge_type: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          participant_count: number | null
          reward_badge_id: string | null
          reward_points: number | null
          start_date: string | null
          title: string
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          participant_count?: number | null
          reward_badge_id?: string | null
          reward_points?: number | null
          start_date?: string | null
          title: string
        }
        Update: {
          challenge_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          participant_count?: number | null
          reward_badge_id?: string | null
          reward_points?: number | null
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_anonymous: string | null
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string
          score: number | null
          updated_at: string | null
        }
        Insert: {
          author_anonymous?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          score?: number | null
          updated_at?: string | null
        }
        Update: {
          author_anonymous?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_anonymous: string | null
          canonical_url: string | null
          confidence_score: number | null
          content: string | null
          device_mentioned: string | null
          fetched_at: string
          id: string
          is_solution: boolean | null
          link_status: Json | null
          num_comments: number | null
          parent_post_id: string | null
          post_id: string
          post_type: string | null
          published_at: string | null
          quarantined: boolean | null
          raw_payload_hash: string | null
          score: number | null
          sentiment: string | null
          source: string
          source_link_verified: boolean | null
          source_link_verified_at: string | null
          title: string
          topic_tags: string[] | null
          url: string | null
        }
        Insert: {
          author_anonymous?: string | null
          canonical_url?: string | null
          confidence_score?: number | null
          content?: string | null
          device_mentioned?: string | null
          fetched_at?: string
          id?: string
          is_solution?: boolean | null
          link_status?: Json | null
          num_comments?: number | null
          parent_post_id?: string | null
          post_id: string
          post_type?: string | null
          published_at?: string | null
          quarantined?: boolean | null
          raw_payload_hash?: string | null
          score?: number | null
          sentiment?: string | null
          source: string
          source_link_verified?: boolean | null
          source_link_verified_at?: string | null
          title: string
          topic_tags?: string[] | null
          url?: string | null
        }
        Update: {
          author_anonymous?: string | null
          canonical_url?: string | null
          confidence_score?: number | null
          content?: string | null
          device_mentioned?: string | null
          fetched_at?: string
          id?: string
          is_solution?: boolean | null
          link_status?: Json | null
          num_comments?: number | null
          parent_post_id?: string | null
          post_id?: string
          post_type?: string | null
          published_at?: string | null
          quarantined?: boolean | null
          raw_payload_hash?: string | null
          score?: number | null
          sentiment?: string | null
          source?: string
          source_link_verified?: boolean | null
          source_link_verified_at?: string | null
          title?: string
          topic_tags?: string[] | null
          url?: string | null
        }
        Relationships: []
      }
      community_statements: {
        Row: {
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          statement: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          statement: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          statement?: string
          user_id?: string | null
        }
        Relationships: []
      }
      connection_requests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          status: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          status?: string
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          status?: string
          to_user_id?: string
        }
        Relationships: []
      }
      cure_milestones: {
        Row: {
          completed_date: string | null
          created_at: string
          description: string | null
          id: string
          status: string | null
          target_date: string | null
          therapy_id: string
          title: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          target_date?: string | null
          therapy_id: string
          title: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          target_date?: string | null
          therapy_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cure_milestones_therapy_id_fkey"
            columns: ["therapy_id"]
            isOneToOne: false
            referencedRelation: "cure_therapies"
            referencedColumns: ["id"]
          },
        ]
      }
      cure_therapies: {
        Row: {
          advantages: string[] | null
          approach_type: string | null
          category: string | null
          clinical_trial_ids: string[] | null
          confidence_score: number | null
          created_at: string
          current_status_text: string | null
          description: string | null
          estimated_availability_text: string | null
          estimated_completion: string | null
          id: string
          is_featured: boolean | null
          life_after_treatment: string | null
          link_verified: boolean | null
          link_verified_at: string | null
          mechanism: string | null
          name: string
          phase: string | null
          progress_percentage: number | null
          requirements: string[] | null
          risks: string[] | null
          sponsor: string | null
          status: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          advantages?: string[] | null
          approach_type?: string | null
          category?: string | null
          clinical_trial_ids?: string[] | null
          confidence_score?: number | null
          created_at?: string
          current_status_text?: string | null
          description?: string | null
          estimated_availability_text?: string | null
          estimated_completion?: string | null
          id?: string
          is_featured?: boolean | null
          life_after_treatment?: string | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          mechanism?: string | null
          name: string
          phase?: string | null
          progress_percentage?: number | null
          requirements?: string[] | null
          risks?: string[] | null
          sponsor?: string | null
          status?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          advantages?: string[] | null
          approach_type?: string | null
          category?: string | null
          clinical_trial_ids?: string[] | null
          confidence_score?: number | null
          created_at?: string
          current_status_text?: string | null
          description?: string | null
          estimated_availability_text?: string | null
          estimated_completion?: string | null
          id?: string
          is_featured?: boolean | null
          life_after_treatment?: string | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          mechanism?: string | null
          name?: string
          phase?: string | null
          progress_percentage?: number | null
          requirements?: string[] | null
          risks?: string[] | null
          sponsor?: string | null
          status?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      data_refresh_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          functions_failed: number | null
          functions_succeeded: number | null
          id: string
          records_fetched: number | null
          refresh_type: string
          started_at: string
          status: string
          summary: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          functions_failed?: number | null
          functions_succeeded?: number | null
          id?: string
          records_fetched?: number | null
          refresh_type?: string
          started_at?: string
          status?: string
          summary?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          functions_failed?: number | null
          functions_succeeded?: number | null
          id?: string
          records_fetched?: number | null
          refresh_type?: string
          started_at?: string
          status?: string
          summary?: Json | null
        }
        Relationships: []
      }
      device_improvements: {
        Row: {
          created_at: string | null
          description: string | null
          device_id: string | null
          id: string
          improvement_title: string
          release_date: string | null
          source_url: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          improvement_title: string
          release_date?: string | null
          source_url?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          improvement_title?: string
          release_date?: string | null
          source_url?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_improvements_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_issues: {
        Row: {
          community_reports: number | null
          created_at: string
          description: string | null
          device_id: string
          fda_maude_count: number | null
          fda_recall_count: number | null
          frequency_percentage: number | null
          id: string
          issue_category: string | null
          issue_title: string
          last_fda_update: string | null
          severity: string | null
          solution: string | null
          source_url: string | null
          workaround: string | null
        }
        Insert: {
          community_reports?: number | null
          created_at?: string
          description?: string | null
          device_id: string
          fda_maude_count?: number | null
          fda_recall_count?: number | null
          frequency_percentage?: number | null
          id?: string
          issue_category?: string | null
          issue_title: string
          last_fda_update?: string | null
          severity?: string | null
          solution?: string | null
          source_url?: string | null
          workaround?: string | null
        }
        Update: {
          community_reports?: number | null
          created_at?: string
          description?: string | null
          device_id?: string
          fda_maude_count?: number | null
          fda_recall_count?: number | null
          frequency_percentage?: number | null
          id?: string
          issue_category?: string | null
          issue_title?: string
          last_fda_update?: string | null
          severity?: string | null
          solution?: string | null
          source_url?: string | null
          workaround?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_issues_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_metrics: {
        Row: {
          device_id: string
          id: string
          last_updated: string
          reliability_score: number | null
          social_setting_score: number | null
          total_reviews: number | null
        }
        Insert: {
          device_id: string
          id?: string
          last_updated?: string
          reliability_score?: number | null
          social_setting_score?: number | null
          total_reviews?: number | null
        }
        Update: {
          device_id?: string
          id?: string
          last_updated?: string
          reliability_score?: number | null
          social_setting_score?: number | null
          total_reviews?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "device_metrics_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_reviews: {
        Row: {
          cons: string[] | null
          content: string
          created_at: string | null
          device_id: string
          helpful_count: number | null
          id: string
          ownership_duration: string | null
          pros: string[] | null
          rating: number
          title: string
          updated_at: string | null
          user_id: string
          verified_owner: boolean | null
        }
        Insert: {
          cons?: string[] | null
          content: string
          created_at?: string | null
          device_id: string
          helpful_count?: number | null
          id?: string
          ownership_duration?: string | null
          pros?: string[] | null
          rating: number
          title: string
          updated_at?: string | null
          user_id: string
          verified_owner?: boolean | null
        }
        Update: {
          cons?: string[] | null
          content?: string
          created_at?: string | null
          device_id?: string
          helpful_count?: number | null
          id?: string
          ownership_duration?: string | null
          pros?: string[] | null
          rating?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          verified_owner?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "device_reviews_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_user_fixes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          detailed_steps: string[] | null
          device_id: string
          difficulty: string | null
          id: string
          is_verified: boolean | null
          source: string | null
          source_url: string | null
          success_rate: number | null
          title: string
          updated_at: string | null
          votes: number | null
          warnings: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          detailed_steps?: string[] | null
          device_id: string
          difficulty?: string | null
          id?: string
          is_verified?: boolean | null
          source?: string | null
          source_url?: string | null
          success_rate?: number | null
          title: string
          updated_at?: string | null
          votes?: number | null
          warnings?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          detailed_steps?: string[] | null
          device_id?: string
          difficulty?: string | null
          id?: string
          is_verified?: boolean | null
          source?: string | null
          source_url?: string | null
          success_rate?: number | null
          title?: string
          updated_at?: string | null
          votes?: number | null
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "device_user_fixes_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          accuracy_mard: string | null
          app_compatibility: Json | null
          autonomy_level: string | null
          availability: string | null
          avg_rating: number | null
          battery_life: string | null
          category: string | null
          change_frequency: string | null
          charging_frequency: string | null
          charging_method: string | null
          compatibility: Json | null
          cons: string[] | null
          created_at: string
          decision_automation: string | null
          description: string | null
          device_type: string | null
          fda_510k_number: string | null
          fda_clearance_date: string | null
          fda_pma_number: string | null
          fda_status: string | null
          future_device_plans: string | null
          future_updates: Json | null
          id: string
          image_url: string | null
          insurance_coverage: string | null
          key_features: string[] | null
          latest_update_date: string | null
          latest_update_features: string[] | null
          latest_update_version: string | null
          learning_capability: boolean | null
          manufacturer: string | null
          model_number: string | null
          name: string
          price_range: string | null
          pros: string[] | null
          regulatory_class: string | null
          retail_price_usd: number | null
          review_count: number | null
          sensor_wear_days: number | null
          specifications: Json | null
          support_email: string | null
          support_phone: string | null
          update_frequency: string | null
          updated_at: string
          user_input_required: string[] | null
          user_manual_url: string | null
          warmup_time: string | null
          waterproof_rating: string | null
          website_url: string | null
        }
        Insert: {
          accuracy_mard?: string | null
          app_compatibility?: Json | null
          autonomy_level?: string | null
          availability?: string | null
          avg_rating?: number | null
          battery_life?: string | null
          category?: string | null
          change_frequency?: string | null
          charging_frequency?: string | null
          charging_method?: string | null
          compatibility?: Json | null
          cons?: string[] | null
          created_at?: string
          decision_automation?: string | null
          description?: string | null
          device_type?: string | null
          fda_510k_number?: string | null
          fda_clearance_date?: string | null
          fda_pma_number?: string | null
          fda_status?: string | null
          future_device_plans?: string | null
          future_updates?: Json | null
          id?: string
          image_url?: string | null
          insurance_coverage?: string | null
          key_features?: string[] | null
          latest_update_date?: string | null
          latest_update_features?: string[] | null
          latest_update_version?: string | null
          learning_capability?: boolean | null
          manufacturer?: string | null
          model_number?: string | null
          name: string
          price_range?: string | null
          pros?: string[] | null
          regulatory_class?: string | null
          retail_price_usd?: number | null
          review_count?: number | null
          sensor_wear_days?: number | null
          specifications?: Json | null
          support_email?: string | null
          support_phone?: string | null
          update_frequency?: string | null
          updated_at?: string
          user_input_required?: string[] | null
          user_manual_url?: string | null
          warmup_time?: string | null
          waterproof_rating?: string | null
          website_url?: string | null
        }
        Update: {
          accuracy_mard?: string | null
          app_compatibility?: Json | null
          autonomy_level?: string | null
          availability?: string | null
          avg_rating?: number | null
          battery_life?: string | null
          category?: string | null
          change_frequency?: string | null
          charging_frequency?: string | null
          charging_method?: string | null
          compatibility?: Json | null
          cons?: string[] | null
          created_at?: string
          decision_automation?: string | null
          description?: string | null
          device_type?: string | null
          fda_510k_number?: string | null
          fda_clearance_date?: string | null
          fda_pma_number?: string | null
          fda_status?: string | null
          future_device_plans?: string | null
          future_updates?: Json | null
          id?: string
          image_url?: string | null
          insurance_coverage?: string | null
          key_features?: string[] | null
          latest_update_date?: string | null
          latest_update_features?: string[] | null
          latest_update_version?: string | null
          learning_capability?: boolean | null
          manufacturer?: string | null
          model_number?: string | null
          name?: string
          price_range?: string | null
          pros?: string[] | null
          regulatory_class?: string | null
          retail_price_usd?: number | null
          review_count?: number | null
          sensor_wear_days?: number | null
          specifications?: Json | null
          support_email?: string | null
          support_phone?: string | null
          update_frequency?: string | null
          updated_at?: string
          user_input_required?: string[] | null
          user_manual_url?: string | null
          warmup_time?: string | null
          waterproof_rating?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      diabetes_apps: {
        Row: {
          avg_rating: number | null
          category: string | null
          cons: string[] | null
          created_at: string | null
          description: string | null
          developer: string | null
          download_urls: Json | null
          features: string[] | null
          id: string
          is_featured: boolean | null
          last_update: string | null
          logo_url: string | null
          name: string
          platforms: string[] | null
          pros: string[] | null
          review_count: number | null
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          category?: string | null
          cons?: string[] | null
          created_at?: string | null
          description?: string | null
          developer?: string | null
          download_urls?: Json | null
          features?: string[] | null
          id?: string
          is_featured?: boolean | null
          last_update?: string | null
          logo_url?: string | null
          name: string
          platforms?: string[] | null
          pros?: string[] | null
          review_count?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          category?: string | null
          cons?: string[] | null
          created_at?: string | null
          description?: string | null
          developer?: string | null
          download_urls?: Json | null
          features?: string[] | null
          id?: string
          is_featured?: boolean | null
          last_update?: string | null
          logo_url?: string | null
          name?: string
          platforms?: string[] | null
          pros?: string[] | null
          review_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      diabetes_emergence_data: {
        Row: {
          age_group: string | null
          created_at: string | null
          diagnoses_count: number | null
          id: string
          region: string | null
          source: string | null
          source_url: string | null
          year: number
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          diagnoses_count?: number | null
          id?: string
          region?: string | null
          source?: string | null
          source_url?: string | null
          year: number
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          diagnoses_count?: number | null
          id?: string
          region?: string | null
          source?: string | null
          source_url?: string | null
          year?: number
        }
        Relationships: []
      }
      diabetes_myths: {
        Row: {
          autonomous_explanation: string | null
          autonomous_reasoning: string | null
          autonomous_verdict: string | null
          created_at: string | null
          id: string
          myth: string
          official_explanation: string | null
          official_sources: string[] | null
          official_verdict: string | null
        }
        Insert: {
          autonomous_explanation?: string | null
          autonomous_reasoning?: string | null
          autonomous_verdict?: string | null
          created_at?: string | null
          id?: string
          myth: string
          official_explanation?: string | null
          official_sources?: string[] | null
          official_verdict?: string | null
        }
        Update: {
          autonomous_explanation?: string | null
          autonomous_reasoning?: string | null
          autonomous_verdict?: string | null
          created_at?: string | null
          id?: string
          myth?: string
          official_explanation?: string | null
          official_sources?: string[] | null
          official_verdict?: string | null
        }
        Relationships: []
      }
      diabetes_organizations: {
        Row: {
          acronym: string | null
          annual_donations: number | null
          annual_revenue: number | null
          charity_navigator_rating: number | null
          country: string | null
          created_at: string | null
          current_projects: Json | null
          donate_url: string | null
          executive_compensation: Json | null
          facebook_url: string | null
          founded_year: number | null
          future_plans: string | null
          guidestar_rating: string | null
          headquarters: string | null
          history_summary: string | null
          id: string
          instagram_url: string | null
          is_verified: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          mission_statement: string | null
          name: string
          notable_achievements: Json | null
          org_type: string | null
          purpose: string | null
          recent_projects: Json | null
          staff_count: number | null
          twitter_url: string | null
          updated_at: string | null
          volunteer_count: number | null
          website_url: string | null
        }
        Insert: {
          acronym?: string | null
          annual_donations?: number | null
          annual_revenue?: number | null
          charity_navigator_rating?: number | null
          country?: string | null
          created_at?: string | null
          current_projects?: Json | null
          donate_url?: string | null
          executive_compensation?: Json | null
          facebook_url?: string | null
          founded_year?: number | null
          future_plans?: string | null
          guidestar_rating?: string | null
          headquarters?: string | null
          history_summary?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          mission_statement?: string | null
          name: string
          notable_achievements?: Json | null
          org_type?: string | null
          purpose?: string | null
          recent_projects?: Json | null
          staff_count?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          volunteer_count?: number | null
          website_url?: string | null
        }
        Update: {
          acronym?: string | null
          annual_donations?: number | null
          annual_revenue?: number | null
          charity_navigator_rating?: number | null
          country?: string | null
          created_at?: string | null
          current_projects?: Json | null
          donate_url?: string | null
          executive_compensation?: Json | null
          facebook_url?: string | null
          founded_year?: number | null
          future_plans?: string | null
          guidestar_rating?: string | null
          headquarters?: string | null
          history_summary?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          mission_statement?: string | null
          name?: string
          notable_achievements?: Json | null
          org_type?: string | null
          purpose?: string | null
          recent_projects?: Json | null
          staff_count?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          volunteer_count?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      diabetic_health_projects: {
        Row: {
          affected_population_estimate: number | null
          category: string
          commonly_misdiagnosed_as: string[] | null
          community_insights_summary: string | null
          condition_triggers: string[] | null
          created_at: string
          description: string
          featured: boolean | null
          id: string
          management_difficulty: string | null
          official_research_summary: string | null
          possible_causes: string[] | null
          prevalence_percentage: number | null
          related_conditions: string[] | null
          search_volume_monthly: number | null
          slug: string
          status: string
          symptoms: string[] | null
          time_to_diagnosis_avg: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          affected_population_estimate?: number | null
          category: string
          commonly_misdiagnosed_as?: string[] | null
          community_insights_summary?: string | null
          condition_triggers?: string[] | null
          created_at?: string
          description: string
          featured?: boolean | null
          id?: string
          management_difficulty?: string | null
          official_research_summary?: string | null
          possible_causes?: string[] | null
          prevalence_percentage?: number | null
          related_conditions?: string[] | null
          search_volume_monthly?: number | null
          slug: string
          status?: string
          symptoms?: string[] | null
          time_to_diagnosis_avg?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          affected_population_estimate?: number | null
          category?: string
          commonly_misdiagnosed_as?: string[] | null
          community_insights_summary?: string | null
          condition_triggers?: string[] | null
          created_at?: string
          description?: string
          featured?: boolean | null
          id?: string
          management_difficulty?: string | null
          official_research_summary?: string | null
          possible_causes?: string[] | null
          prevalence_percentage?: number | null
          related_conditions?: string[] | null
          search_volume_monthly?: number | null
          slug?: string
          status?: string
          symptoms?: string[] | null
          time_to_diagnosis_avg?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      diabetic_profiles: {
        Row: {
          bio_snippet: string | null
          city: string
          created_at: string
          device_setup: string | null
          diagnosis_year: number | null
          display_name: string
          id: string
          is_visible: boolean
          latitude: number | null
          longitude: number | null
          looking_for: string[] | null
          state: string
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          bio_snippet?: string | null
          city: string
          created_at?: string
          device_setup?: string | null
          diagnosis_year?: number | null
          display_name: string
          id?: string
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          looking_for?: string[] | null
          state: string
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          bio_snippet?: string | null
          city?: string
          created_at?: string
          device_setup?: string | null
          diagnosis_year?: number | null
          display_name?: string
          id?: string
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          looking_for?: string[] | null
          state?: string
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      discoveries: {
        Row: {
          ai_analysis: Json | null
          category: string | null
          credibility_factors: Json | null
          credibility_score: number | null
          cross_references: Json | null
          discovered_at: string
          discovery_type: string
          full_text: string | null
          id: string
          impact_level: string | null
          links_verified: boolean | null
          links_verified_at: string | null
          primary_source: string | null
          publication_date: string | null
          source_urls: string[] | null
          summary: string | null
          title: string
        }
        Insert: {
          ai_analysis?: Json | null
          category?: string | null
          credibility_factors?: Json | null
          credibility_score?: number | null
          cross_references?: Json | null
          discovered_at?: string
          discovery_type: string
          full_text?: string | null
          id?: string
          impact_level?: string | null
          links_verified?: boolean | null
          links_verified_at?: string | null
          primary_source?: string | null
          publication_date?: string | null
          source_urls?: string[] | null
          summary?: string | null
          title: string
        }
        Update: {
          ai_analysis?: Json | null
          category?: string | null
          credibility_factors?: Json | null
          credibility_score?: number | null
          cross_references?: Json | null
          discovered_at?: string
          discovery_type?: string
          full_text?: string | null
          id?: string
          impact_level?: string | null
          links_verified?: boolean | null
          links_verified_at?: string | null
          primary_source?: string | null
          publication_date?: string | null
          source_urls?: string[] | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      discovery_cards: {
        Row: {
          category: string | null
          created_at: string
          credibility: string | null
          icon_url: string | null
          id: string
          mechanism: string | null
          snippet: string | null
          sources: Json | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          credibility?: string | null
          icon_url?: string | null
          id?: string
          mechanism?: string | null
          snippet?: string | null
          sources?: Json | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          credibility?: string | null
          icon_url?: string | null
          id?: string
          mechanism?: string | null
          snippet?: string | null
          sources?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donation_subscriptions: {
        Row: {
          amount_cents: number
          created_at: string | null
          frequency: string | null
          id: string
          next_charge_date: string | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          frequency?: string | null
          id?: string
          next_charge_date?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          frequency?: string | null
          id?: string
          next_charge_date?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          completed_at: string | null
          created_at: string | null
          donor_email: string | null
          id: string
          status: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          completed_at?: string | null
          created_at?: string | null
          donor_email?: string | null
          id?: string
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string | null
          donor_email?: string | null
          id?: string
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      donations_data: {
        Row: {
          advocacy_allocation_percent: number | null
          created_at: string
          education_allocation_percent: number | null
          id: string
          impact_patients_helped: number | null
          impact_studies_funded: number | null
          impact_trials_supported: number | null
          logo_url: string | null
          notable_donors: string[] | null
          operations_allocation_percent: number | null
          organization_name: string
          organization_type: string
          research_allocation_percent: number | null
          sector_corporate: number | null
          sector_foundation: number | null
          sector_government: number | null
          sector_individual: number | null
          source_990_url: string | null
          top_programs: string[] | null
          total_donations: number | null
          updated_at: string
          website_url: string | null
          year: number
        }
        Insert: {
          advocacy_allocation_percent?: number | null
          created_at?: string
          education_allocation_percent?: number | null
          id?: string
          impact_patients_helped?: number | null
          impact_studies_funded?: number | null
          impact_trials_supported?: number | null
          logo_url?: string | null
          notable_donors?: string[] | null
          operations_allocation_percent?: number | null
          organization_name: string
          organization_type?: string
          research_allocation_percent?: number | null
          sector_corporate?: number | null
          sector_foundation?: number | null
          sector_government?: number | null
          sector_individual?: number | null
          source_990_url?: string | null
          top_programs?: string[] | null
          total_donations?: number | null
          updated_at?: string
          website_url?: string | null
          year: number
        }
        Update: {
          advocacy_allocation_percent?: number | null
          created_at?: string
          education_allocation_percent?: number | null
          id?: string
          impact_patients_helped?: number | null
          impact_studies_funded?: number | null
          impact_trials_supported?: number | null
          logo_url?: string | null
          notable_donors?: string[] | null
          operations_allocation_percent?: number | null
          organization_name?: string
          organization_type?: string
          research_allocation_percent?: number | null
          sector_corporate?: number | null
          sector_foundation?: number | null
          sector_government?: number | null
          sector_individual?: number | null
          source_990_url?: string | null
          top_programs?: string[] | null
          total_donations?: number | null
          updated_at?: string
          website_url?: string | null
          year?: number
        }
        Relationships: []
      }
      drug_pricing_data: {
        Row: {
          created_at: string
          data_source: string | null
          drug_name: string
          id: string
          manufacturer: string | null
          medicare_price: number | null
          ndc_code: string | null
          unit_price: number | null
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          drug_name: string
          id?: string
          manufacturer?: string | null
          medicare_price?: number | null
          ndc_code?: string | null
          unit_price?: number | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          data_source?: string | null
          drug_name?: string
          id?: string
          manufacturer?: string | null
          medicare_price?: number | null
          ndc_code?: string | null
          unit_price?: number | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      education_topics: {
        Row: {
          category: string | null
          content: Json | null
          created_at: string | null
          difficulty: string | null
          id: string
          illustrations: Json | null
          is_published: boolean | null
          related_topics: string[] | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: Json | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          illustrations?: Json | null
          is_published?: boolean | null
          related_topics?: string[] | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: Json | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          illustrations?: Json | null
          is_published?: boolean | null
          related_topics?: string[] | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_digest_logs: {
        Row: {
          error_message: string | null
          id: string
          papers_included: number | null
          recipient_count: number | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          papers_included?: number | null
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          papers_included?: number | null
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          preferences: Json | null
          subscription_type: string
          unsubscribe_token: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          preferences?: Json | null
          subscription_type?: string
          unsubscribe_token?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          preferences?: Json | null
          subscription_type?: string
          unsubscribe_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experience_submissions: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      external_device_reviews: {
        Row: {
          author_anonymous: string | null
          content: string
          created_at: string | null
          device_id: string | null
          device_mentioned: string | null
          external_id: string
          fetched_at: string | null
          helpful_count: number | null
          id: string
          published_at: string | null
          rating: number | null
          sentiment: string | null
          source: string
          source_url: string | null
          subreddit: string | null
          title: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          author_anonymous?: string | null
          content: string
          created_at?: string | null
          device_id?: string | null
          device_mentioned?: string | null
          external_id: string
          fetched_at?: string | null
          helpful_count?: number | null
          id?: string
          published_at?: string | null
          rating?: number | null
          sentiment?: string | null
          source: string
          source_url?: string | null
          subreddit?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          author_anonymous?: string | null
          content?: string
          created_at?: string | null
          device_id?: string | null
          device_mentioned?: string | null
          external_id?: string
          fetched_at?: string | null
          helpful_count?: number | null
          id?: string
          published_at?: string | null
          rating?: number | null
          sentiment?: string | null
          source?: string
          source_url?: string | null
          subreddit?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "external_device_reviews_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      external_medication_reviews: {
        Row: {
          author_anonymous: string | null
          content: string
          created_at: string | null
          external_id: string | null
          fetched_at: string | null
          helpful_count: number | null
          id: string
          medication_id: string | null
          published_at: string | null
          sentiment: string | null
          source: string
          source_url: string | null
          subreddit: string | null
          title: string | null
        }
        Insert: {
          author_anonymous?: string | null
          content: string
          created_at?: string | null
          external_id?: string | null
          fetched_at?: string | null
          helpful_count?: number | null
          id?: string
          medication_id?: string | null
          published_at?: string | null
          sentiment?: string | null
          source: string
          source_url?: string | null
          subreddit?: string | null
          title?: string | null
        }
        Update: {
          author_anonymous?: string | null
          content?: string
          created_at?: string | null
          external_id?: string | null
          fetched_at?: string | null
          helpful_count?: number | null
          id?: string
          medication_id?: string | null
          published_at?: string | null
          sentiment?: string | null
          source?: string
          source_url?: string | null
          subreddit?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_medication_reviews_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      fda_device_events: {
        Row: {
          created_at: string
          device_name: string | null
          event_date: string | null
          event_description: string | null
          event_type: string
          fda_event_id: string
          id: string
          manufacturer_name: string | null
          raw_data: Json | null
          severity_level: string | null
          source_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          event_date?: string | null
          event_description?: string | null
          event_type: string
          fda_event_id: string
          id?: string
          manufacturer_name?: string | null
          raw_data?: Json | null
          severity_level?: string | null
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          event_date?: string | null
          event_description?: string | null
          event_type?: string
          fda_event_id?: string
          id?: string
          manufacturer_name?: string | null
          raw_data?: Json | null
          severity_level?: string | null
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_resources: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          eligibility_info: string | null
          id: string
          link: string | null
          provider: string | null
          resource_title: string
          resource_type: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          eligibility_info?: string | null
          id?: string
          link?: string | null
          provider?: string | null
          resource_title: string
          resource_type?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          eligibility_info?: string | null
          id?: string
          link?: string | null
          provider?: string | null
          resource_title?: string
          resource_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      glucose_analysis_entries: {
        Row: {
          auto_detected: boolean | null
          avg_glucose: number | null
          context: string | null
          created_at: string | null
          glucose_direction: string | null
          id: string
          pattern_type: string | null
          time_of_day: string | null
          upload_id: string | null
          user_id: string
        }
        Insert: {
          auto_detected?: boolean | null
          avg_glucose?: number | null
          context?: string | null
          created_at?: string | null
          glucose_direction?: string | null
          id?: string
          pattern_type?: string | null
          time_of_day?: string | null
          upload_id?: string | null
          user_id: string
        }
        Update: {
          auto_detected?: boolean | null
          avg_glucose?: number | null
          context?: string | null
          created_at?: string | null
          glucose_direction?: string | null
          id?: string
          pattern_type?: string | null
          time_of_day?: string | null
          upload_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "glucose_analysis_entries_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      healthcare_experiences: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          location_state: string | null
          sentiment: string | null
          source_platform: string | null
          source_url: string | null
          title: string
          upvotes: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          location_state?: string | null
          sentiment?: string | null
          source_platform?: string | null
          source_url?: string | null
          title: string
          upvotes?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          location_state?: string | null
          sentiment?: string | null
          source_platform?: string | null
          source_url?: string | null
          title?: string
          upvotes?: number | null
        }
        Relationships: []
      }
      healthcare_partner_inquiries: {
        Row: {
          contact_name: string
          created_at: string | null
          email: string
          id: string
          interest_areas: string[] | null
          message: string | null
          organization_name: string
          organization_type: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          interest_areas?: string[] | null
          message?: string | null
          organization_name: string
          organization_type?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          interest_areas?: string[] | null
          message?: string | null
          organization_name?: string
          organization_type?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      low_blood_sugar_stories: {
        Row: {
          author_username: string | null
          category: string | null
          content: string
          created_at: string | null
          id: string
          illustration_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          source_platform: string | null
          source_url: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_username?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          illustration_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          source_platform?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_username?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          illustration_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          source_platform?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      manufacturer_support_resources: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          manufacturer: string
          phone_number: string | null
          resource_type: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          manufacturer: string
          phone_number?: string | null
          resource_type: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          manufacturer?: string
          phone_number?: string | null
          resource_type?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change_percent: number | null
          company_name: string
          created_at: string
          current_price: number | null
          data_date: string
          id: string
          market_cap: number | null
          ticker_symbol: string
          updated_at: string
          volume: number | null
        }
        Insert: {
          change_percent?: number | null
          company_name: string
          created_at?: string
          current_price?: number | null
          data_date: string
          id?: string
          market_cap?: number | null
          ticker_symbol: string
          updated_at?: string
          volume?: number | null
        }
        Update: {
          change_percent?: number | null
          company_name?: string
          created_at?: string
          current_price?: number | null
          data_date?: string
          id?: string
          market_cap?: number | null
          ticker_symbol?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      medical_research_papers: {
        Row: {
          abstract: string | null
          authors: string[] | null
          citation_count: number | null
          classification_confidence: number | null
          created_at: string
          device_mentions: string[] | null
          diabetes_relevance_score: number | null
          diabetes_type: string | null
          doi: string | null
          drug_mentions: string[] | null
          europe_pmc_id: string | null
          fields_of_study: string[] | null
          full_text_url: string | null
          id: string
          impact_factor: number | null
          influential_citation_count: number | null
          is_type1_relevant: boolean | null
          journal_name: string | null
          keywords: string[] | null
          mesh_terms: string[] | null
          open_access: boolean | null
          paper_id: string
          pdf_url: string | null
          pmc_id: string | null
          pmid: string | null
          publication_date: string | null
          raw_data: Json | null
          semantic_scholar_id: string | null
          source_database: string
          study_type: string | null
          title: string
          tldr_summary: string | null
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          authors?: string[] | null
          citation_count?: number | null
          classification_confidence?: number | null
          created_at?: string
          device_mentions?: string[] | null
          diabetes_relevance_score?: number | null
          diabetes_type?: string | null
          doi?: string | null
          drug_mentions?: string[] | null
          europe_pmc_id?: string | null
          fields_of_study?: string[] | null
          full_text_url?: string | null
          id?: string
          impact_factor?: number | null
          influential_citation_count?: number | null
          is_type1_relevant?: boolean | null
          journal_name?: string | null
          keywords?: string[] | null
          mesh_terms?: string[] | null
          open_access?: boolean | null
          paper_id: string
          pdf_url?: string | null
          pmc_id?: string | null
          pmid?: string | null
          publication_date?: string | null
          raw_data?: Json | null
          semantic_scholar_id?: string | null
          source_database: string
          study_type?: string | null
          title: string
          tldr_summary?: string | null
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          authors?: string[] | null
          citation_count?: number | null
          classification_confidence?: number | null
          created_at?: string
          device_mentions?: string[] | null
          diabetes_relevance_score?: number | null
          diabetes_type?: string | null
          doi?: string | null
          drug_mentions?: string[] | null
          europe_pmc_id?: string | null
          fields_of_study?: string[] | null
          full_text_url?: string | null
          id?: string
          impact_factor?: number | null
          influential_citation_count?: number | null
          is_type1_relevant?: boolean | null
          journal_name?: string | null
          keywords?: string[] | null
          mesh_terms?: string[] | null
          open_access?: boolean | null
          paper_id?: string
          pdf_url?: string | null
          pmc_id?: string | null
          pmid?: string | null
          publication_date?: string | null
          raw_data?: Json | null
          semantic_scholar_id?: string | null
          source_database?: string
          study_type?: string | null
          title?: string
          tldr_summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medicare_coverage_data: {
        Row: {
          coverage_details: Json | null
          coverage_status: string | null
          created_at: string
          device_name: string
          effective_date: string | null
          id: string
          ncd_number: string | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          coverage_details?: Json | null
          coverage_status?: string | null
          created_at?: string
          device_name: string
          effective_date?: string | null
          id?: string
          ncd_number?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          coverage_details?: Json | null
          coverage_status?: string | null
          created_at?: string
          device_name?: string
          effective_date?: string | null
          id?: string
          ncd_number?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medication_community_buzz: {
        Row: {
          author_handle: string | null
          created_at: string | null
          engagement_score: number | null
          id: string
          is_verified: boolean | null
          medication_id: string | null
          post_content: string
          post_date: string | null
          post_url: string | null
          sentiment: string | null
          source: string
        }
        Insert: {
          author_handle?: string | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          is_verified?: boolean | null
          medication_id?: string | null
          post_content: string
          post_date?: string | null
          post_url?: string | null
          sentiment?: string | null
          source: string
        }
        Update: {
          author_handle?: string | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          is_verified?: boolean | null
          medication_id?: string | null
          post_content?: string
          post_date?: string | null
          post_url?: string | null
          sentiment?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_community_buzz_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_community_feedback: {
        Row: {
          content: string
          created_at: string | null
          feedback_type: string | null
          id: string
          medication_id: string | null
          source: string | null
          source_url: string | null
          title: string
          votes: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          medication_id?: string | null
          source?: string | null
          source_url?: string | null
          title: string
          votes?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          medication_id?: string | null
          source?: string | null
          source_url?: string | null
          title?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_community_feedback_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_interactions: {
        Row: {
          clinical_effects: string | null
          created_at: string
          description: string
          id: string
          interacting_drug_category: string | null
          interacting_drug_name: string
          management_recommendation: string | null
          medication_id: string | null
          severity: string
          source: string | null
          updated_at: string
        }
        Insert: {
          clinical_effects?: string | null
          created_at?: string
          description: string
          id?: string
          interacting_drug_category?: string | null
          interacting_drug_name: string
          management_recommendation?: string | null
          medication_id?: string | null
          severity: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          clinical_effects?: string | null
          created_at?: string
          description?: string
          id?: string
          interacting_drug_category?: string | null
          interacting_drug_name?: string
          management_recommendation?: string | null
          medication_id?: string | null
          severity?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_interactions_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_reviews: {
        Row: {
          cons: string[] | null
          content: string
          created_at: string | null
          duration_of_use: string | null
          ease_of_use_rating: number | null
          effectiveness_rating: number | null
          helpful_count: number | null
          id: string
          medication_id: string | null
          pros: string[] | null
          rating: number | null
          side_effects_rating: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          would_recommend: boolean | null
        }
        Insert: {
          cons?: string[] | null
          content: string
          created_at?: string | null
          duration_of_use?: string | null
          ease_of_use_rating?: number | null
          effectiveness_rating?: number | null
          helpful_count?: number | null
          id?: string
          medication_id?: string | null
          pros?: string[] | null
          rating?: number | null
          side_effects_rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          would_recommend?: boolean | null
        }
        Update: {
          cons?: string[] | null
          content?: string
          created_at?: string | null
          duration_of_use?: string | null
          ease_of_use_rating?: number | null
          effectiveness_rating?: number | null
          helpful_count?: number | null
          id?: string
          medication_id?: string | null
          pros?: string[] | null
          rating?: number | null
          side_effects_rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_reviews_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          administration_route: string | null
          avg_price: number | null
          brand_names: string[] | null
          category: string
          clinical_notes: string | null
          common_side_effects: string[] | null
          cons: string[] | null
          contraindications: string[] | null
          created_at: string | null
          description: string | null
          duration: string | null
          fda_approval_date: string | null
          fda_status: string | null
          featured: boolean | null
          future_developments: string | null
          generic_name: string | null
          id: string
          image_url: string | null
          insurance_coverage_notes: string | null
          key_features: string[] | null
          last_updated_date: string | null
          logo_url: string | null
          manufacturer: string | null
          manufacturer_logo_url: string | null
          manufacturer_website: string | null
          mechanism_of_action: string | null
          medicare_price: number | null
          name: string
          ndc_code: string | null
          onset_time: string | null
          peak_time: string | null
          popularity_rank: number | null
          prescribing_info_url: string | null
          pros: string[] | null
          rating_avg: number | null
          review_count: number | null
          serious_warnings: string[] | null
          storage_requirements: string | null
          subcategory: string | null
          typical_dosing: string | null
          updated_at: string | null
          usage_statistics: Json | null
        }
        Insert: {
          administration_route?: string | null
          avg_price?: number | null
          brand_names?: string[] | null
          category: string
          clinical_notes?: string | null
          common_side_effects?: string[] | null
          cons?: string[] | null
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          fda_approval_date?: string | null
          fda_status?: string | null
          featured?: boolean | null
          future_developments?: string | null
          generic_name?: string | null
          id?: string
          image_url?: string | null
          insurance_coverage_notes?: string | null
          key_features?: string[] | null
          last_updated_date?: string | null
          logo_url?: string | null
          manufacturer?: string | null
          manufacturer_logo_url?: string | null
          manufacturer_website?: string | null
          mechanism_of_action?: string | null
          medicare_price?: number | null
          name: string
          ndc_code?: string | null
          onset_time?: string | null
          peak_time?: string | null
          popularity_rank?: number | null
          prescribing_info_url?: string | null
          pros?: string[] | null
          rating_avg?: number | null
          review_count?: number | null
          serious_warnings?: string[] | null
          storage_requirements?: string | null
          subcategory?: string | null
          typical_dosing?: string | null
          updated_at?: string | null
          usage_statistics?: Json | null
        }
        Update: {
          administration_route?: string | null
          avg_price?: number | null
          brand_names?: string[] | null
          category?: string
          clinical_notes?: string | null
          common_side_effects?: string[] | null
          cons?: string[] | null
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          fda_approval_date?: string | null
          fda_status?: string | null
          featured?: boolean | null
          future_developments?: string | null
          generic_name?: string | null
          id?: string
          image_url?: string | null
          insurance_coverage_notes?: string | null
          key_features?: string[] | null
          last_updated_date?: string | null
          logo_url?: string | null
          manufacturer?: string | null
          manufacturer_logo_url?: string | null
          manufacturer_website?: string | null
          mechanism_of_action?: string | null
          medicare_price?: number | null
          name?: string
          ndc_code?: string | null
          onset_time?: string | null
          peak_time?: string | null
          popularity_rank?: number | null
          prescribing_info_url?: string | null
          pros?: string[] | null
          rating_avg?: number | null
          review_count?: number | null
          serious_warnings?: string[] | null
          storage_requirements?: string | null
          subcategory?: string | null
          typical_dosing?: string | null
          updated_at?: string | null
          usage_statistics?: Json | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          categories: Json | null
          created_at: string | null
          email_frequency: string | null
          id: string
          in_app_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string | null
          email_frequency?: string | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string | null
          email_frequency?: string | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_citations: {
        Row: {
          cited_paper_id: string | null
          citing_paper_id: string | null
          created_at: string | null
          id: string
          is_influential: boolean | null
        }
        Insert: {
          cited_paper_id?: string | null
          citing_paper_id?: string | null
          created_at?: string | null
          id?: string
          is_influential?: boolean | null
        }
        Update: {
          cited_paper_id?: string | null
          citing_paper_id?: string | null
          created_at?: string | null
          id?: string
          is_influential?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_citations_cited_paper_id_fkey"
            columns: ["cited_paper_id"]
            isOneToOne: false
            referencedRelation: "medical_research_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_citations_citing_paper_id_fkey"
            columns: ["citing_paper_id"]
            isOneToOne: false
            referencedRelation: "medical_research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      patent_data: {
        Row: {
          abstract: string | null
          assignee: string | null
          created_at: string
          diabetes_relevance_score: number | null
          id: string
          inventors: string[] | null
          link_verified: boolean | null
          link_verified_at: string | null
          patent_date: string | null
          patent_id: string
          patent_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          assignee?: string | null
          created_at?: string
          diabetes_relevance_score?: number | null
          id?: string
          inventors?: string[] | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          patent_date?: string | null
          patent_id: string
          patent_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          assignee?: string | null
          created_at?: string
          diabetes_relevance_score?: number | null
          id?: string
          inventors?: string[] | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          patent_date?: string | null
          patent_id?: string
          patent_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      population_insights: {
        Row: {
          affected_percentage: number | null
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          insight_type: string
        }
        Insert: {
          affected_percentage?: number | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          insight_type: string
        }
        Update: {
          affected_percentage?: number | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          insight_type?: string
        }
        Relationships: []
      }
      post_quarantine: {
        Row: {
          id: string
          post_id: string | null
          raw_payload: Json
          received_at: string
          review_notes: string | null
          reviewed: boolean | null
          reviewer: string | null
          validation_errors: Json
        }
        Insert: {
          id?: string
          post_id?: string | null
          raw_payload: Json
          received_at?: string
          review_notes?: string | null
          reviewed?: boolean | null
          reviewer?: string | null
          validation_errors: Json
        }
        Update: {
          id?: string
          post_id?: string | null
          raw_payload?: Json
          received_at?: string
          review_notes?: string | null
          reviewed?: boolean | null
          reviewer?: string | null
          validation_errors?: Json
        }
        Relationships: []
      }
      potential_warriors: {
        Row: {
          contact_info: string | null
          created_at: string | null
          detected_keywords: string[] | null
          id: string
          platform: string
          post_content: string | null
          post_url: string | null
          status: string | null
          username: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          detected_keywords?: string[] | null
          id?: string
          platform: string
          post_content?: string | null
          post_url?: string | null
          status?: string | null
          username?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          detected_keywords?: string[] | null
          id?: string
          platform?: string
          post_content?: string | null
          post_url?: string | null
          status?: string | null
          username?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          author: string | null
          content: string
          created_at: string | null
          id: string
          product_id: string | null
          rating: number | null
          source_platform: string | null
          source_url: string | null
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          source_platform?: string | null
          source_url?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          source_platform?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "t1d_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auto_nickname: string | null
          avatar_style: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_nickname?: string | null
          avatar_style?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_nickname?: string | null
          avatar_style?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_community_solutions: {
        Row: {
          created_at: string
          effectiveness_rating: number | null
          id: string
          project_id: string
          solution_description: string
          solution_title: string
          source: string | null
          source_url: string | null
          upvotes: number | null
        }
        Insert: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          project_id: string
          solution_description: string
          solution_title: string
          source?: string | null
          source_url?: string | null
          upvotes?: number | null
        }
        Update: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          project_id?: string
          solution_description?: string
          solution_title?: string
          source?: string | null
          source_url?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_community_solutions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "diabetic_health_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_research_links: {
        Row: {
          authors: string | null
          created_at: string
          doi: string | null
          id: string
          key_findings: string | null
          project_id: string
          publication: string | null
          publication_date: string | null
          relevance_score: number | null
          research_type: string
          title: string
          url: string | null
        }
        Insert: {
          authors?: string | null
          created_at?: string
          doi?: string | null
          id?: string
          key_findings?: string | null
          project_id: string
          publication?: string | null
          publication_date?: string | null
          relevance_score?: number | null
          research_type?: string
          title: string
          url?: string | null
        }
        Update: {
          authors?: string | null
          created_at?: string
          doi?: string | null
          id?: string
          key_findings?: string | null
          project_id?: string
          publication?: string | null
          publication_date?: string | null
          relevance_score?: number | null
          research_type?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_research_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "diabetic_health_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          personal_experience: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggested_solutions: string | null
          supporting_links: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          personal_experience?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_solutions?: string | null
          supporting_links?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          personal_experience?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_solutions?: string | null
          supporting_links?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      public_glucose_data: {
        Row: {
          age_range: string | null
          anonymized_user_id: string | null
          basal_rate: number | null
          carb_ratio: number | null
          carbs: number | null
          cgm_model: string | null
          control_level: string | null
          correction_factor: number | null
          created_at: string | null
          diabetes_duration_years: number | null
          gender: string | null
          glucose_value: number | null
          id: string
          insulin_dose: number | null
          location_region: string | null
          notes: string | null
          pump_model: string | null
          source_dataset: string
          timestamp: string | null
        }
        Insert: {
          age_range?: string | null
          anonymized_user_id?: string | null
          basal_rate?: number | null
          carb_ratio?: number | null
          carbs?: number | null
          cgm_model?: string | null
          control_level?: string | null
          correction_factor?: number | null
          created_at?: string | null
          diabetes_duration_years?: number | null
          gender?: string | null
          glucose_value?: number | null
          id?: string
          insulin_dose?: number | null
          location_region?: string | null
          notes?: string | null
          pump_model?: string | null
          source_dataset: string
          timestamp?: string | null
        }
        Update: {
          age_range?: string | null
          anonymized_user_id?: string | null
          basal_rate?: number | null
          carb_ratio?: number | null
          carbs?: number | null
          cgm_model?: string | null
          control_level?: string | null
          correction_factor?: number | null
          created_at?: string | null
          diabetes_duration_years?: number | null
          gender?: string | null
          glucose_value?: number | null
          id?: string
          insulin_dose?: number | null
          location_region?: string | null
          notes?: string | null
          pump_model?: string | null
          source_dataset?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh_key: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh_key: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh_key?: string
          user_id?: string
        }
        Relationships: []
      }
      quality_of_life_experiences: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          impact: string | null
          source: string | null
          source_url: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
          verified: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          impact?: string | null
          source?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          verified?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          impact?: string | null
          source?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          verified?: boolean | null
        }
        Relationships: []
      }
      quality_of_life_resources: {
        Row: {
          availability: string | null
          benefits_for_t1d: string | null
          category: string
          community_testimonials: Json | null
          cost_range: string | null
          created_at: string
          description: string | null
          dosage_info: string | null
          id: string
          image_url: string | null
          name: string
          precautions: string | null
          recommended_by_community: boolean | null
          scientific_evidence_level: string | null
          source_url: string | null
          success_stories: Json | null
          updated_at: string
          user_tips: string[] | null
        }
        Insert: {
          availability?: string | null
          benefits_for_t1d?: string | null
          category: string
          community_testimonials?: Json | null
          cost_range?: string | null
          created_at?: string
          description?: string | null
          dosage_info?: string | null
          id?: string
          image_url?: string | null
          name: string
          precautions?: string | null
          recommended_by_community?: boolean | null
          scientific_evidence_level?: string | null
          source_url?: string | null
          success_stories?: Json | null
          updated_at?: string
          user_tips?: string[] | null
        }
        Update: {
          availability?: string | null
          benefits_for_t1d?: string | null
          category?: string
          community_testimonials?: Json | null
          cost_range?: string | null
          created_at?: string
          description?: string | null
          dosage_info?: string | null
          id?: string
          image_url?: string | null
          name?: string
          precautions?: string | null
          recommended_by_community?: boolean | null
          scientific_evidence_level?: string | null
          source_url?: string | null
          success_stories?: Json | null
          updated_at?: string
          user_tips?: string[] | null
        }
        Relationships: []
      }
      research_funding: {
        Row: {
          abstract: string | null
          created_at: string
          fiscal_year: number | null
          funding_amount: number | null
          id: string
          organization: string | null
          principal_investigator: string | null
          project_end_date: string | null
          project_number: string
          project_start_date: string | null
          project_title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          created_at?: string
          fiscal_year?: number | null
          funding_amount?: number | null
          id?: string
          organization?: string | null
          principal_investigator?: string | null
          project_end_date?: string | null
          project_number: string
          project_start_date?: string | null
          project_title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          created_at?: string
          fiscal_year?: number | null
          funding_amount?: number | null
          id?: string
          organization?: string | null
          principal_investigator?: string | null
          project_end_date?: string | null
          project_number?: string
          project_start_date?: string | null
          project_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_items: {
        Row: {
          created_at: string
          id: string
          impact_level: string | null
          link: string | null
          link_verified: boolean | null
          link_verified_at: string | null
          source: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact_level?: string | null
          link?: string | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          source?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          impact_level?: string | null
          link?: string | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          source?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "device_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_insights: {
        Row: {
          card_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          context: string | null
          created_at: string
          direction: string | null
          id: string
          shift_time: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          shift_time?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          shift_time?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          created_at: string | null
          id: string
          products: Json
          shipping_info: Json | null
          status: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          total_cents: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          products: Json
          shipping_info?: Json | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_cents: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          products?: Json
          shipping_info?: Json | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_cents?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          category: string | null
          created_at: string | null
          customization_options: Json | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          price_cents: number
          stock_status: string | null
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          customization_options?: Json | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price_cents: number
          stock_status?: string | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          customization_options?: Json | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price_cents?: number
          stock_status?: string | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      simulations: {
        Row: {
          created_at: string
          event_name: string
          id: string
          params: Json | null
          results: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          params?: Json | null
          results?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          params?: Json | null
          results?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      state_diabetes_forms: {
        Row: {
          created_at: string | null
          form_category: string
          form_description: string | null
          form_name: string
          form_url: string | null
          id: string
          issuing_agency: string | null
          last_verified_at: string | null
          notes: string | null
          state_code: string
          state_name: string
        }
        Insert: {
          created_at?: string | null
          form_category: string
          form_description?: string | null
          form_name: string
          form_url?: string | null
          id?: string
          issuing_agency?: string | null
          last_verified_at?: string | null
          notes?: string | null
          state_code: string
          state_name: string
        }
        Update: {
          created_at?: string | null
          form_category?: string
          form_description?: string | null
          form_name?: string
          form_url?: string | null
          id?: string
          issuing_agency?: string | null
          last_verified_at?: string | null
          notes?: string | null
          state_code?: string
          state_name?: string
        }
        Relationships: []
      }
      survey_demographics: {
        Row: {
          a1c_range: string | null
          age_range: string | null
          cgm_usage: string | null
          country: string | null
          created_at: string | null
          diabetes_type: string | null
          diagnosis_year: number | null
          gender: string | null
          id: string
          pump_usage: string | null
          therapy_type: string | null
          updated_at: string | null
          user_id: string
          years_with_diabetes: number | null
        }
        Insert: {
          a1c_range?: string | null
          age_range?: string | null
          cgm_usage?: string | null
          country?: string | null
          created_at?: string | null
          diabetes_type?: string | null
          diagnosis_year?: number | null
          gender?: string | null
          id?: string
          pump_usage?: string | null
          therapy_type?: string | null
          updated_at?: string | null
          user_id: string
          years_with_diabetes?: number | null
        }
        Update: {
          a1c_range?: string | null
          age_range?: string | null
          cgm_usage?: string | null
          country?: string | null
          created_at?: string | null
          diabetes_type?: string | null
          diagnosis_year?: number | null
          gender?: string | null
          id?: string
          pump_usage?: string | null
          therapy_type?: string | null
          updated_at?: string | null
          user_id?: string
          years_with_diabetes?: number | null
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          completed_at: string | null
          consent_given: boolean | null
          created_at: string
          device_type: string | null
          id: string
          is_complete: boolean | null
          metadata: Json | null
          responses: Json
          session_id: string | null
          survey_id: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          consent_given?: boolean | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_complete?: boolean | null
          metadata?: Json | null
          responses: Json
          session_id?: string | null
          survey_id: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          consent_given?: boolean | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_complete?: boolean | null
          metadata?: Json | null
          responses?: Json
          session_id?: string | null
          survey_id?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          category: string | null
          consent_text: string | null
          created_at: string
          description: string | null
          estimated_time_minutes: number | null
          id: string
          institution_partner: string | null
          irb_number: string | null
          is_anonymous: boolean | null
          metadata: Json | null
          questions: Json
          requires_demographics: boolean | null
          research_category: string | null
          status: string | null
          survey_type: string | null
          target_responses: number | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          category?: string | null
          consent_text?: string | null
          created_at?: string
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          institution_partner?: string | null
          irb_number?: string | null
          is_anonymous?: boolean | null
          metadata?: Json | null
          questions?: Json
          requires_demographics?: boolean | null
          research_category?: string | null
          status?: string | null
          survey_type?: string | null
          target_responses?: number | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          category?: string | null
          consent_text?: string | null
          created_at?: string
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          institution_partner?: string | null
          irb_number?: string | null
          is_anonymous?: boolean | null
          metadata?: Json | null
          questions?: Json
          requires_demographics?: boolean | null
          research_category?: string | null
          status?: string | null
          survey_type?: string | null
          target_responses?: number | null
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      t1d_common_issues: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          search_keywords: string[] | null
          solution_count: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          search_keywords?: string[] | null
          solution_count?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          search_keywords?: string[] | null
          solution_count?: number | null
          title?: string
        }
        Relationships: []
      }
      t1d_community_directory: {
        Row: {
          city: string | null
          created_at: string
          description: string
          id: string
          is_national: boolean
          name: string
          organization_type: string
          region: string | null
          state: string | null
          url: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          description: string
          id?: string
          is_national?: boolean
          name: string
          organization_type: string
          region?: string | null
          state?: string | null
          url: string
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string
          id?: string
          is_national?: boolean
          name?: string
          organization_type?: string
          region?: string | null
          state?: string | null
          url?: string
        }
        Relationships: []
      }
      t1d_companies: {
        Row: {
          acquired_by: string | null
          acquisition_date: string | null
          clinical_stage: string | null
          company_type: string | null
          country: string | null
          created_at: string | null
          crunchbase_url: string | null
          data_source: string | null
          description: string | null
          employee_count: string | null
          focus_areas: string[] | null
          founded_year: number | null
          funding_rounds: number | null
          funding_stage: string | null
          headquarters: string | null
          id: string
          investors: Json | null
          is_active: boolean | null
          key_people: Json | null
          last_funding_date: string | null
          link_verified: boolean | null
          link_verified_at: string | null
          linkedin_url: string | null
          logo_url: string | null
          name: string
          parent_company: string | null
          product_image_url: string | null
          products: Json | null
          technology_summary: string | null
          total_funding_usd: number | null
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          acquired_by?: string | null
          acquisition_date?: string | null
          clinical_stage?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string | null
          crunchbase_url?: string | null
          data_source?: string | null
          description?: string | null
          employee_count?: string | null
          focus_areas?: string[] | null
          founded_year?: number | null
          funding_rounds?: number | null
          funding_stage?: string | null
          headquarters?: string | null
          id?: string
          investors?: Json | null
          is_active?: boolean | null
          key_people?: Json | null
          last_funding_date?: string | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name: string
          parent_company?: string | null
          product_image_url?: string | null
          products?: Json | null
          technology_summary?: string | null
          total_funding_usd?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          acquired_by?: string | null
          acquisition_date?: string | null
          clinical_stage?: string | null
          company_type?: string | null
          country?: string | null
          created_at?: string | null
          crunchbase_url?: string | null
          data_source?: string | null
          description?: string | null
          employee_count?: string | null
          focus_areas?: string[] | null
          founded_year?: number | null
          funding_rounds?: number | null
          funding_stage?: string | null
          headquarters?: string | null
          id?: string
          investors?: Json | null
          is_active?: boolean | null
          key_people?: Json | null
          last_funding_date?: string | null
          link_verified?: boolean | null
          link_verified_at?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name?: string
          parent_company?: string | null
          product_image_url?: string | null
          products?: Json | null
          technology_summary?: string | null
          total_funding_usd?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      t1d_events: {
        Row: {
          address: string | null
          city: string | null
          cost_info: string | null
          country: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          image_url: string | null
          is_free: boolean | null
          is_virtual: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          max_attendees: number | null
          organizer: string | null
          registration_url: string | null
          start_date: string
          state: string | null
          tags: string[] | null
          title: string
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cost_info?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          max_attendees?: number | null
          organizer?: string | null
          registration_url?: string | null
          start_date: string
          state?: string | null
          tags?: string[] | null
          title: string
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cost_info?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          is_virtual?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          max_attendees?: number | null
          organizer?: string | null
          registration_url?: string | null
          start_date?: string
          state?: string | null
          tags?: string[] | null
          title?: string
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      t1d_history_events: {
        Row: {
          category: string
          created_at: string | null
          decade: string | null
          decade_summary: string | null
          detailed_description: string
          era: string | null
          id: string
          image_caption: string | null
          image_url: string | null
          impact_score: number | null
          interesting_facts: string[] | null
          short_description: string
          sources: string[] | null
          subcategory: string | null
          title: string
          updated_at: string | null
          year: number
          year_end: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          decade?: string | null
          decade_summary?: string | null
          detailed_description: string
          era?: string | null
          id?: string
          image_caption?: string | null
          image_url?: string | null
          impact_score?: number | null
          interesting_facts?: string[] | null
          short_description: string
          sources?: string[] | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          year: number
          year_end?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          decade?: string | null
          decade_summary?: string | null
          detailed_description?: string
          era?: string | null
          id?: string
          image_caption?: string | null
          image_url?: string | null
          impact_score?: number | null
          interesting_facts?: string[] | null
          short_description?: string
          sources?: string[] | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          year?: number
          year_end?: number | null
        }
        Relationships: []
      }
      t1d_news_articles: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string | null
          relevance_score: number | null
          source_name: string | null
          source_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          relevance_score?: number | null
          source_name?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          relevance_score?: number | null
          source_name?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      t1d_products: {
        Row: {
          avg_rating: number | null
          category: string | null
          cons: string[] | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          price_range: string | null
          pros: string[] | null
          purchase_url: string | null
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          category?: string | null
          cons?: string[] | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          price_range?: string | null
          pros?: string[] | null
          purchase_url?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          category?: string | null
          cons?: string[] | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          price_range?: string | null
          pros?: string[] | null
          purchase_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      t1d_resources: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          external_url: string | null
          featured: boolean | null
          icon_name: string | null
          id: string
          internal_route: string | null
          is_internal_tool: boolean | null
          priority: number | null
          resource_type: string | null
          subcategory: string | null
          tags: string[] | null
          target_audience: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          featured?: boolean | null
          icon_name?: string | null
          id?: string
          internal_route?: string | null
          is_internal_tool?: boolean | null
          priority?: number | null
          resource_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          featured?: boolean | null
          icon_name?: string | null
          id?: string
          internal_route?: string | null
          is_internal_tool?: boolean | null
          priority?: number | null
          resource_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      t1d_supplement_deficiencies: {
        Row: {
          created_at: string
          food_sources: string[] | null
          id: string
          interaction_with_insulin: string | null
          nutrient_name: string
          optimal_timing: string | null
          prevalence_in_t1d: number | null
          recommended_daily_amount: string | null
          supplement_form: string | null
          symptoms_of_deficiency: string[] | null
          testing_method: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          food_sources?: string[] | null
          id?: string
          interaction_with_insulin?: string | null
          nutrient_name: string
          optimal_timing?: string | null
          prevalence_in_t1d?: number | null
          recommended_daily_amount?: string | null
          supplement_form?: string | null
          symptoms_of_deficiency?: string[] | null
          testing_method?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          food_sources?: string[] | null
          id?: string
          interaction_with_insulin?: string | null
          nutrient_name?: string
          optimal_timing?: string | null
          prevalence_in_t1d?: number | null
          recommended_daily_amount?: string | null
          supplement_form?: string | null
          symptoms_of_deficiency?: string[] | null
          testing_method?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trend_analysis_metrics: {
        Row: {
          calculated_at: string
          category: string | null
          id: string
          metric_name: string
          metric_value: number | null
          seven_day_count: number | null
          thirty_day_count: number | null
          trend_direction: string | null
        }
        Insert: {
          calculated_at?: string
          category?: string | null
          id?: string
          metric_name: string
          metric_value?: number | null
          seven_day_count?: number | null
          thirty_day_count?: number | null
          trend_direction?: string | null
        }
        Update: {
          calculated_at?: string
          category?: string | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          seven_day_count?: number | null
          thirty_day_count?: number | null
          trend_direction?: string | null
        }
        Relationships: []
      }
      trending_device_issues: {
        Row: {
          affected_users_estimate: number | null
          created_at: string | null
          device_id: string | null
          first_reported: string | null
          id: string
          issue_description: string | null
          issue_title: string
          last_reported: string | null
          sources: Json | null
          status: string | null
        }
        Insert: {
          affected_users_estimate?: number | null
          created_at?: string | null
          device_id?: string | null
          first_reported?: string | null
          id?: string
          issue_description?: string | null
          issue_title: string
          last_reported?: string | null
          sources?: Json | null
          status?: string | null
        }
        Update: {
          affected_users_estimate?: number | null
          created_at?: string | null
          device_id?: string | null
          first_reported?: string | null
          id?: string
          issue_description?: string | null
          issue_title?: string
          last_reported?: string | null
          sources?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trending_device_issues_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          agp_data: Json | null
          ai_insights: Json | null
          analysis_results: Json | null
          confidence_band: string | null
          confidence_score: number | null
          daily_data: Json | null
          data_quality: Json | null
          day_night_analysis: Json | null
          detailed_analysis: Json | null
          device_metadata: Json | null
          file_name: string
          file_size: number | null
          file_type: string | null
          gap_analysis: Json | null
          hourly_data: Json | null
          id: string
          insights: string[] | null
          insulin_events: Json | null
          meal_events: Json | null
          novel_signals: Json | null
          patterns: Json | null
          readings_count: number | null
          recommendations: string[] | null
          status: string | null
          storage_path: string | null
          uploaded_at: string
          user_id: string
          validation_flags: Json | null
          wear_time_percent: number | null
        }
        Insert: {
          agp_data?: Json | null
          ai_insights?: Json | null
          analysis_results?: Json | null
          confidence_band?: string | null
          confidence_score?: number | null
          daily_data?: Json | null
          data_quality?: Json | null
          day_night_analysis?: Json | null
          detailed_analysis?: Json | null
          device_metadata?: Json | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          gap_analysis?: Json | null
          hourly_data?: Json | null
          id?: string
          insights?: string[] | null
          insulin_events?: Json | null
          meal_events?: Json | null
          novel_signals?: Json | null
          patterns?: Json | null
          readings_count?: number | null
          recommendations?: string[] | null
          status?: string | null
          storage_path?: string | null
          uploaded_at?: string
          user_id: string
          validation_flags?: Json | null
          wear_time_percent?: number | null
        }
        Update: {
          agp_data?: Json | null
          ai_insights?: Json | null
          analysis_results?: Json | null
          confidence_band?: string | null
          confidence_score?: number | null
          daily_data?: Json | null
          data_quality?: Json | null
          day_night_analysis?: Json | null
          detailed_analysis?: Json | null
          device_metadata?: Json | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          gap_analysis?: Json | null
          hourly_data?: Json | null
          id?: string
          insights?: string[] | null
          insulin_events?: Json | null
          meal_events?: Json | null
          novel_signals?: Json | null
          patterns?: Json | null
          readings_count?: number | null
          recommendations?: string[] | null
          status?: string | null
          storage_path?: string | null
          uploaded_at?: string
          user_id?: string
          validation_flags?: Json | null
          wear_time_percent?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          badge_icon: string | null
          badge_name: string
          category: string | null
          created_at: string | null
          description: string | null
          earned_at: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          target: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          badge_icon?: string | null
          badge_name: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          target?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          badge_icon?: string | null
          badge_name?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          target?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          bookmark_type: string
          created_at: string | null
          id: string
          resource_description: string | null
          resource_icon: string | null
          resource_id: string | null
          resource_title: string
          resource_url: string
          user_id: string | null
        }
        Insert: {
          bookmark_type: string
          created_at?: string | null
          id?: string
          resource_description?: string | null
          resource_icon?: string | null
          resource_id?: string | null
          resource_title: string
          resource_url: string
          user_id?: string | null
        }
        Update: {
          bookmark_type?: string
          created_at?: string | null
          id?: string
          resource_description?: string | null
          resource_icon?: string | null
          resource_id?: string | null
          resource_title?: string
          resource_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_dashboards: {
        Row: {
          created_at: string
          id: string
          layout: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follow_type: string
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follow_type: string
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follow_type?: string
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      user_milestones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          milestone_date: string | null
          milestone_type: string
          remind_me: boolean | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          milestone_date?: string | null
          milestone_type: string
          remind_me?: boolean | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          milestone_date?: string | null
          milestone_type?: string
          remind_me?: boolean | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          cgm_device_id: string | null
          content_interests: string[] | null
          created_at: string | null
          device_brands: string[] | null
          diagnosis_year: number | null
          id: string
          onboarding_completed: boolean | null
          primary_challenges: string[] | null
          primary_medication_id: string | null
          pump_device_id: string | null
          therapy_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cgm_device_id?: string | null
          content_interests?: string[] | null
          created_at?: string | null
          device_brands?: string[] | null
          diagnosis_year?: number | null
          id?: string
          onboarding_completed?: boolean | null
          primary_challenges?: string[] | null
          primary_medication_id?: string | null
          pump_device_id?: string | null
          therapy_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cgm_device_id?: string | null
          content_interests?: string[] | null
          created_at?: string | null
          device_brands?: string[] | null
          diagnosis_year?: number | null
          id?: string
          onboarding_completed?: boolean | null
          primary_challenges?: string[] | null
          primary_medication_id?: string | null
          pump_device_id?: string | null
          therapy_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_saved_issues: {
        Row: {
          ai_summary: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          solutions_found: Json | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          solutions_found?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          solutions_found?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_saved_posts: {
        Row: {
          community_post_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          community_post_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          community_post_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_posts_community_post_id_fkey"
            columns: ["community_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_posts_community_post_id_fkey"
            columns: ["community_post_id"]
            isOneToOne: false
            referencedRelation: "vw_posts_link_health"
            referencedColumns: ["post_id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_view_history: {
        Row: {
          id: string
          item_id: string
          item_title: string | null
          item_type: string
          item_url: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          item_id: string
          item_title?: string | null
          item_type: string
          item_url?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          item_title?: string | null
          item_type?: string
          item_url?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      volunteer_interests: {
        Row: {
          availability: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          portfolio_url: string | null
          roles: string[]
          skills: string | null
          status: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          portfolio_url?: string | null
          roles: string[]
          skills?: string | null
          status?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          portfolio_url?: string | null
          roles?: string[]
          skills?: string | null
          status?: string | null
        }
        Relationships: []
      }
      warrior_stories: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          obstacles: string[] | null
          original_post_date: string | null
          permission_status: string | null
          person_name: string | null
          platform: string | null
          social_handle: string | null
          source_link_verified: boolean | null
          source_link_verified_at: string | null
          source_type: string | null
          source_url: string | null
          story_content: string
          title: string
          triumphs: string[] | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          obstacles?: string[] | null
          original_post_date?: string | null
          permission_status?: string | null
          person_name?: string | null
          platform?: string | null
          social_handle?: string | null
          source_link_verified?: boolean | null
          source_link_verified_at?: string | null
          source_type?: string | null
          source_url?: string | null
          story_content: string
          title: string
          triumphs?: string[] | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          obstacles?: string[] | null
          original_post_date?: string | null
          permission_status?: string | null
          person_name?: string | null
          platform?: string | null
          social_handle?: string | null
          source_link_verified?: boolean | null
          source_link_verified_at?: string | null
          source_type?: string | null
          source_url?: string | null
          story_content?: string
          title?: string
          triumphs?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vw_posts_link_health: {
        Row: {
          canonical_url: string | null
          confidence_score: number | null
          http_code: number | null
          last_checked: string | null
          link_status_val: string | null
          post_id: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          canonical_url?: string | null
          confidence_score?: number | null
          http_code?: never
          last_checked?: never
          link_status_val?: never
          post_id?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          canonical_url?: string | null
          confidence_score?: number | null
          http_code?: never
          last_checked?: never
          link_status_val?: never
          post_id?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      vw_quarantine_error_summary: {
        Row: {
          err_text: string | null
          occurrences: number | null
        }
        Relationships: []
      }
      vw_quarantine_priority: {
        Row: {
          error_count: number | null
          priority_score: number | null
          quarantine_id: string | null
          received_at: string | null
          recency_score: number | null
          reviewed: boolean | null
          title: string | null
          validation_errors: Json | null
        }
        Insert: {
          error_count?: never
          priority_score?: never
          quarantine_id?: string | null
          received_at?: string | null
          recency_score?: never
          reviewed?: boolean | null
          title?: never
          validation_errors?: Json | null
        }
        Update: {
          error_count?: never
          priority_score?: never
          quarantine_id?: string | null
          received_at?: string | null
          recency_score?: never
          reviewed?: boolean | null
          title?: never
          validation_errors?: Json | null
        }
        Relationships: []
      }
      vw_quarantine_recent: {
        Row: {
          body_snippet: string | null
          post_id: string | null
          quarantine_id: string | null
          raw_payload: Json | null
          received_at: string | null
          review_notes: string | null
          reviewed: boolean | null
          reviewer: string | null
          source: string | null
          source_url: string | null
          title: string | null
          validation_errors: Json | null
        }
        Insert: {
          body_snippet?: never
          post_id?: string | null
          quarantine_id?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          review_notes?: string | null
          reviewed?: boolean | null
          reviewer?: string | null
          source?: never
          source_url?: never
          title?: never
          validation_errors?: Json | null
        }
        Update: {
          body_snippet?: never
          post_id?: string | null
          quarantine_id?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          review_notes?: string | null
          reviewed?: boolean | null
          reviewer?: string | null
          source?: never
          source_url?: never
          title?: never
          validation_errors?: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_glucose_filter_options: { Args: never; Returns: Json }
      get_high_performer_benchmarks: { Args: never; Returns: Json }
      get_public_glucose_summary: {
        Args: {
          p_age_range?: string
          p_cgm?: string
          p_dataset?: string
          p_pump?: string
          p_region?: string
        }
        Returns: Json
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      update_trends: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
