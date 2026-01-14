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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bounties: {
        Row: {
          claimed_by: string | null
          created_at: string
          description: string
          id: string
          reward_amount: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          claimed_by?: string | null
          created_at?: string
          description: string
          id?: string
          reward_amount: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          claimed_by?: string | null
          created_at?: string
          description?: string
          id?: string
          reward_amount?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_trials_detailed: {
        Row: {
          brief_summary: string | null
          completion_date: string | null
          conditions: string[] | null
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
          max_age: string | null
          min_age: string | null
          nct_id: string
          overall_status: string | null
          phase: string | null
          primary_outcomes: string[] | null
          primary_purpose: string | null
          raw_data: Json | null
          secondary_outcomes: string[] | null
          source_registry: string | null
          sponsor_name: string | null
          start_date: string | null
          study_type: string | null
          study_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          brief_summary?: string | null
          completion_date?: string | null
          conditions?: string[] | null
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
          max_age?: string | null
          min_age?: string | null
          nct_id: string
          overall_status?: string | null
          phase?: string | null
          primary_outcomes?: string[] | null
          primary_purpose?: string | null
          raw_data?: Json | null
          secondary_outcomes?: string[] | null
          source_registry?: string | null
          sponsor_name?: string | null
          start_date?: string | null
          study_type?: string | null
          study_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          brief_summary?: string | null
          completion_date?: string | null
          conditions?: string[] | null
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
          max_age?: string | null
          min_age?: string | null
          nct_id?: string
          overall_status?: string | null
          phase?: string | null
          primary_outcomes?: string[] | null
          primary_purpose?: string | null
          raw_data?: Json | null
          secondary_outcomes?: string[] | null
          source_registry?: string | null
          sponsor_name?: string | null
          start_date?: string | null
          study_type?: string | null
          study_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_anonymous: string | null
          content: string | null
          device_mentioned: string | null
          fetched_at: string
          id: string
          num_comments: number | null
          post_id: string
          published_at: string
          score: number | null
          sentiment: string | null
          source: string
          title: string
        }
        Insert: {
          author_anonymous?: string | null
          content?: string | null
          device_mentioned?: string | null
          fetched_at?: string
          id?: string
          num_comments?: number | null
          post_id: string
          published_at: string
          score?: number | null
          sentiment?: string | null
          source: string
          title: string
        }
        Update: {
          author_anonymous?: string | null
          content?: string | null
          device_mentioned?: string | null
          fetched_at?: string
          id?: string
          num_comments?: number | null
          post_id?: string
          published_at?: string
          score?: number | null
          sentiment?: string | null
          source?: string
          title?: string
        }
        Relationships: []
      }
      cure_milestones: {
        Row: {
          completed_date: string | null
          created_at: string
          description: string | null
          id: string
          status: string
          target_date: string | null
          therapy_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_date?: string | null
          therapy_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_date?: string | null
          therapy_id?: string
          title?: string
          updated_at?: string
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
          category: string
          confidence_score: number
          created_at: string
          description: string | null
          estimated_completion: string | null
          id: string
          name: string
          phase: string
          progress_percentage: number
          sponsor: string
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category: string
          confidence_score?: number
          created_at?: string
          description?: string | null
          estimated_completion?: string | null
          id?: string
          name: string
          phase: string
          progress_percentage?: number
          sponsor: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string
          confidence_score?: number
          created_at?: string
          description?: string | null
          estimated_completion?: string | null
          id?: string
          name?: string
          phase?: string
          progress_percentage?: number
          sponsor?: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      device_issues: {
        Row: {
          community_reports: number | null
          created_at: string
          description: string
          device_id: string
          frequency_percentage: number
          id: string
          issue_title: string
          severity: string
          solution: string | null
          source_url: string | null
          updated_at: string
          workaround: string | null
        }
        Insert: {
          community_reports?: number | null
          created_at?: string
          description: string
          device_id: string
          frequency_percentage: number
          id?: string
          issue_title: string
          severity: string
          solution?: string | null
          source_url?: string | null
          updated_at?: string
          workaround?: string | null
        }
        Update: {
          community_reports?: number | null
          created_at?: string
          description?: string
          device_id?: string
          frequency_percentage?: number
          id?: string
          issue_title?: string
          severity?: string
          solution?: string | null
          source_url?: string | null
          updated_at?: string
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
      device_issues_master: {
        Row: {
          created_at: string
          device_name: string
          id: string
          is_critical_safety_alert: boolean | null
          issue_title: string
          manufacturer_response_status: string | null
          root_cause_analysis: string | null
        }
        Insert: {
          created_at?: string
          device_name: string
          id?: string
          is_critical_safety_alert?: boolean | null
          issue_title: string
          manufacturer_response_status?: string | null
          root_cause_analysis?: string | null
        }
        Update: {
          created_at?: string
          device_name?: string
          id?: string
          is_critical_safety_alert?: boolean | null
          issue_title?: string
          manufacturer_response_status?: string | null
          root_cause_analysis?: string | null
        }
        Relationships: []
      }
      device_metrics: {
        Row: {
          created_at: string
          device_id: string
          id: string
          last_updated: string
          reliability_score: number
          social_setting_score: number
          total_reviews: number
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          last_updated?: string
          reliability_score: number
          social_setting_score: number
          total_reviews?: number
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          last_updated?: string
          reliability_score?: number
          social_setting_score?: number
          total_reviews?: number
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
      devices: {
        Row: {
          category: string
          common_issues: string[] | null
          cons: string[] | null
          created_at: string
          description: string | null
          fda_approved_date: string | null
          id: string
          image_url: string | null
          key_features: string[] | null
          manufacturer: string
          model_number: string | null
          name: string
          pros: string[] | null
          retail_price_usd: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category: string
          common_issues?: string[] | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          fda_approved_date?: string | null
          id?: string
          image_url?: string | null
          key_features?: string[] | null
          manufacturer: string
          model_number?: string | null
          name: string
          pros?: string[] | null
          retail_price_usd?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string
          common_issues?: string[] | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          fda_approved_date?: string | null
          id?: string
          image_url?: string | null
          key_features?: string[] | null
          manufacturer?: string
          model_number?: string | null
          name?: string
          pros?: string[] | null
          retail_price_usd?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      discoveries: {
        Row: {
          ai_analysis: Json | null
          category: string | null
          created_at: string | null
          credibility_factors: Json | null
          credibility_score: number | null
          cross_references: Json[] | null
          discovered_at: string | null
          discovery_type: string
          full_text: string | null
          id: string
          impact_level: string | null
          last_validated_at: string | null
          primary_source: string | null
          publication_date: string | null
          related_post_ids: string[] | null
          related_research_ids: string[] | null
          related_trial_ids: string[] | null
          search_vector: unknown
          source_urls: string[] | null
          summary: string
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string | null
          credibility_factors?: Json | null
          credibility_score?: number | null
          cross_references?: Json[] | null
          discovered_at?: string | null
          discovery_type: string
          full_text?: string | null
          id?: string
          impact_level?: string | null
          last_validated_at?: string | null
          primary_source?: string | null
          publication_date?: string | null
          related_post_ids?: string[] | null
          related_research_ids?: string[] | null
          related_trial_ids?: string[] | null
          search_vector?: unknown
          source_urls?: string[] | null
          summary: string
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          category?: string | null
          created_at?: string | null
          credibility_factors?: Json | null
          credibility_score?: number | null
          cross_references?: Json[] | null
          discovered_at?: string | null
          discovery_type?: string
          full_text?: string | null
          id?: string
          impact_level?: string | null
          last_validated_at?: string | null
          primary_source?: string | null
          publication_date?: string | null
          related_post_ids?: string[] | null
          related_research_ids?: string[] | null
          related_trial_ids?: string[] | null
          search_vector?: unknown
          source_urls?: string[] | null
          summary?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      discovery_cards: {
        Row: {
          created_at: string
          credibility: string
          icon_url: string
          id: string
          mechanism: string
          search_vector: unknown
          snippet: string
          sources: Json
          title: string
        }
        Insert: {
          created_at?: string
          credibility: string
          icon_url: string
          id?: string
          mechanism: string
          search_vector?: unknown
          snippet: string
          sources?: Json
          title: string
        }
        Update: {
          created_at?: string
          credibility?: string
          icon_url?: string
          id?: string
          mechanism?: string
          search_vector?: unknown
          snippet?: string
          sources?: Json
          title?: string
        }
        Relationships: []
      }
      drug_pricing_data: {
        Row: {
          created_at: string | null
          data_source: string | null
          drug_name: string
          id: string
          manufacturer: string | null
          medicare_price: number | null
          ndc_code: string | null
          unit_price: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          data_source?: string | null
          drug_name: string
          id?: string
          manufacturer?: string | null
          medicare_price?: number | null
          ndc_code?: string | null
          unit_price?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          data_source?: string | null
          drug_name?: string
          id?: string
          manufacturer?: string | null
          medicare_price?: number | null
          ndc_code?: string | null
          unit_price?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
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
          category: string
          description: string
          id: string
          link: string
          resource_title: string
        }
        Insert: {
          category: string
          description: string
          id?: string
          link: string
          resource_title: string
        }
        Update: {
          category?: string
          description?: string
          id?: string
          link?: string
          resource_title?: string
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change_percent: number | null
          company_name: string
          created_at: string | null
          current_price: number | null
          data_date: string
          id: string
          market_cap: number | null
          ticker_symbol: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          change_percent?: number | null
          company_name: string
          created_at?: string | null
          current_price?: number | null
          data_date: string
          id?: string
          market_cap?: number | null
          ticker_symbol: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          change_percent?: number | null
          company_name?: string
          created_at?: string | null
          current_price?: number | null
          data_date?: string
          id?: string
          market_cap?: number | null
          ticker_symbol?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      medical_research_papers: {
        Row: {
          abstract: string | null
          authors: string[] | null
          citation_count: number | null
          created_at: string
          device_mentions: string[] | null
          diabetes_relevance_score: number | null
          doi: string | null
          drug_mentions: string[] | null
          europe_pmc_id: string | null
          full_text_url: string | null
          id: string
          impact_factor: number | null
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
          source_database: string
          study_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          authors?: string[] | null
          citation_count?: number | null
          created_at?: string
          device_mentions?: string[] | null
          diabetes_relevance_score?: number | null
          doi?: string | null
          drug_mentions?: string[] | null
          europe_pmc_id?: string | null
          full_text_url?: string | null
          id?: string
          impact_factor?: number | null
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
          source_database: string
          study_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          authors?: string[] | null
          citation_count?: number | null
          created_at?: string
          device_mentions?: string[] | null
          diabetes_relevance_score?: number | null
          doi?: string | null
          drug_mentions?: string[] | null
          europe_pmc_id?: string | null
          full_text_url?: string | null
          id?: string
          impact_factor?: number | null
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
          source_database?: string
          study_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      medicare_coverage_data: {
        Row: {
          coverage_details: Json | null
          coverage_status: string | null
          created_at: string | null
          device_name: string
          effective_date: string | null
          id: string
          ncd_number: string | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          coverage_details?: Json | null
          coverage_status?: string | null
          created_at?: string | null
          device_name: string
          effective_date?: string | null
          id?: string
          ncd_number?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          coverage_details?: Json | null
          coverage_status?: string | null
          created_at?: string | null
          device_name?: string
          effective_date?: string | null
          id?: string
          ncd_number?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      onboarding_enrollment: {
        Row: {
          created_at: string
          current_day: number | null
          id: string
          is_active: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_day?: number | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_day?: number | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_tips: {
        Row: {
          day_number: number
          id: number
          tip_content: string
          tip_title: string
        }
        Insert: {
          day_number: number
          id?: number
          tip_content: string
          tip_title: string
        }
        Update: {
          day_number?: number
          id?: number
          tip_content?: string
          tip_title?: string
        }
        Relationships: []
      }
      patent_data: {
        Row: {
          abstract: string | null
          assignee: string | null
          created_at: string | null
          diabetes_relevance_score: number | null
          id: string
          inventors: string[] | null
          patent_date: string | null
          patent_id: string
          patent_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          abstract?: string | null
          assignee?: string | null
          created_at?: string | null
          diabetes_relevance_score?: number | null
          id?: string
          inventors?: string[] | null
          patent_date?: string | null
          patent_id: string
          patent_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          abstract?: string | null
          assignee?: string | null
          created_at?: string | null
          diabetes_relevance_score?: number | null
          id?: string
          inventors?: string[] | null
          patent_date?: string | null
          patent_id?: string
          patent_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      research_funding: {
        Row: {
          abstract: string | null
          created_at: string | null
          fiscal_year: number | null
          funding_amount: number | null
          id: string
          organization: string | null
          principal_investigator: string | null
          project_end_date: string | null
          project_number: string
          project_start_date: string | null
          project_title: string
          updated_at: string | null
        }
        Insert: {
          abstract?: string | null
          created_at?: string | null
          fiscal_year?: number | null
          funding_amount?: number | null
          id?: string
          organization?: string | null
          principal_investigator?: string | null
          project_end_date?: string | null
          project_number: string
          project_start_date?: string | null
          project_title: string
          updated_at?: string | null
        }
        Update: {
          abstract?: string | null
          created_at?: string | null
          fiscal_year?: number | null
          funding_amount?: number | null
          id?: string
          organization?: string | null
          principal_investigator?: string | null
          project_end_date?: string | null
          project_number?: string
          project_start_date?: string | null
          project_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      research_items: {
        Row: {
          authors: string[] | null
          created_at: string
          diabetes_relevance_score: number | null
          doi: string | null
          id: string
          impact_level: string | null
          keywords: string[] | null
          link: string
          publication_date: string | null
          raw_data: Json | null
          source: string
          study_type: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          authors?: string[] | null
          created_at?: string
          diabetes_relevance_score?: number | null
          doi?: string | null
          id?: string
          impact_level?: string | null
          keywords?: string[] | null
          link: string
          publication_date?: string | null
          raw_data?: Json | null
          source: string
          study_type?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          authors?: string[] | null
          created_at?: string
          diabetes_relevance_score?: number | null
          doi?: string | null
          id?: string
          impact_level?: string | null
          keywords?: string[] | null
          link?: string
          publication_date?: string | null
          raw_data?: Json | null
          source?: string
          study_type?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_insights: {
        Row: {
          card_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_insights_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "discovery_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          context: string
          created_at: string
          direction: string
          id: string
          shift_time: string
          tags: string[]
          user_id: string | null
        }
        Insert: {
          context: string
          created_at?: string
          direction: string
          id?: string
          shift_time: string
          tags: string[]
          user_id?: string | null
        }
        Update: {
          context?: string
          created_at?: string
          direction?: string
          id?: string
          shift_time?: string
          tags?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      simulations: {
        Row: {
          created_at: string
          event_name: string
          id: string
          params: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          params: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          params?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          responses: Json
          survey_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          responses?: Json
          survey_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          responses?: Json
          survey_id?: string
          updated_at?: string
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
          category: string
          created_at: string
          description: string | null
          id: string
          questions: Json
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          questions?: Json
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          questions?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      trend_analysis_metrics: {
        Row: {
          category: string
          id: string
          issue_title: string
          seven_day_count: number | null
          thirty_day_count: number | null
          updated_at: string
        }
        Insert: {
          category: string
          id?: string
          issue_title: string
          seven_day_count?: number | null
          thirty_day_count?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          id?: string
          issue_title?: string
          seven_day_count?: number | null
          thirty_day_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          errors_json: Json | null
          filename: string | null
          id: string
          status: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          errors_json?: Json | null
          filename?: string | null
          id?: string
          status?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          errors_json?: Json | null
          filename?: string | null
          id?: string
          status?: string | null
          uploaded_at?: string | null
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
          role: string
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
    }
    Views: {
      discovery_stats: {
        Row: {
          ai_correlations: number | null
          avg_credibility: number | null
          clinical_trials: number | null
          community_symptoms: number | null
          cure_breakthroughs: number | null
          latest_discovery: string | null
          research_papers: number | null
          total_discoveries: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_by_email: { Args: { user_email: string }; Returns: undefined }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      update_trends: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
