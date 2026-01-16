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
          source_registry: string
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
          source_registry: string
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
      community_posts: {
        Row: {
          author_anonymous: string | null
          content: string | null
          device_mentioned: string | null
          fetched_at: string
          id: string
          num_comments: number | null
          post_id: string
          published_at: string | null
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
          published_at?: string | null
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
          published_at?: string | null
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
          category: string | null
          confidence_score: number | null
          created_at: string
          description: string | null
          estimated_completion: string | null
          id: string
          name: string
          phase: string | null
          progress_percentage: number | null
          sponsor: string | null
          status: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_completion?: string | null
          id?: string
          name: string
          phase?: string | null
          progress_percentage?: number | null
          sponsor?: string | null
          status?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_completion?: string | null
          id?: string
          name?: string
          phase?: string | null
          progress_percentage?: number | null
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
      device_issues: {
        Row: {
          community_reports: number | null
          created_at: string
          description: string | null
          device_id: string
          frequency_percentage: number | null
          id: string
          issue_title: string
          severity: string | null
          solution: string | null
          workaround: string | null
        }
        Insert: {
          community_reports?: number | null
          created_at?: string
          description?: string | null
          device_id: string
          frequency_percentage?: number | null
          id?: string
          issue_title: string
          severity?: string | null
          solution?: string | null
          workaround?: string | null
        }
        Update: {
          community_reports?: number | null
          created_at?: string
          description?: string | null
          device_id?: string
          frequency_percentage?: number | null
          id?: string
          issue_title?: string
          severity?: string | null
          solution?: string | null
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
      devices: {
        Row: {
          category: string | null
          cons: string[] | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          key_features: string[] | null
          manufacturer: string | null
          model_number: string | null
          name: string
          pros: string[] | null
          retail_price_usd: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          key_features?: string[] | null
          manufacturer?: string | null
          model_number?: string | null
          name: string
          pros?: string[] | null
          retail_price_usd?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          cons?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          key_features?: string[] | null
          manufacturer?: string | null
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
          credibility_factors: Json | null
          credibility_score: number | null
          cross_references: Json | null
          discovered_at: string
          discovery_type: string
          full_text: string | null
          id: string
          impact_level: string | null
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
          created_at: string
          device_mentions: string[] | null
          diabetes_relevance_score: number | null
          doi: string | null
          drug_mentions: string[] | null
          europe_pmc_id: string | null
          fields_of_study: string[] | null
          full_text_url: string | null
          id: string
          impact_factor: number | null
          influential_citation_count: number | null
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
          created_at?: string
          device_mentions?: string[] | null
          diabetes_relevance_score?: number | null
          doi?: string | null
          drug_mentions?: string[] | null
          europe_pmc_id?: string | null
          fields_of_study?: string[] | null
          full_text_url?: string | null
          id?: string
          impact_factor?: number | null
          influential_citation_count?: number | null
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
          created_at?: string
          device_mentions?: string[] | null
          diabetes_relevance_score?: number | null
          doi?: string | null
          drug_mentions?: string[] | null
          europe_pmc_id?: string | null
          fields_of_study?: string[] | null
          full_text_url?: string | null
          id?: string
          impact_factor?: number | null
          influential_citation_count?: number | null
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
          patent_date?: string | null
          patent_id?: string
          patent_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
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
      survey_responses: {
        Row: {
          created_at: string
          id: string
          responses: Json
          survey_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          responses: Json
          survey_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          responses?: Json
          survey_id?: string
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
          created_at: string
          description: string | null
          id: string
          questions: Json
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          questions?: Json
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
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
      uploads: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          storage_path: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path?: string | null
          uploaded_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
