// Gerado por scripts/db/generate-types.ts — não edite manualmente.
// Para regenerar: pnpm db:types:local (offline) ou pnpm db:types (Supabase CLI).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          banner_id: string | null
          brand_id: string | null
          category_id: string | null
          created_at: string
          event_name: string
          id: number
          metadata: Json
          page_path: string | null
          product_id: string | null
          referrer: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          banner_id?: string | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          event_name: string
          id?: never
          metadata?: Json
          page_path?: string | null
          product_id?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          banner_id?: string | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          event_name?: string
          id?: never
          metadata?: Json
          page_path?: string | null
          product_id?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      attributes: {
        Row: {
          created_at: string
          group_name: string
          id: string
          is_filterable: boolean
          name: string
          slug: string
          sort_order: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_name?: string
          id?: string
          is_filterable?: boolean
          name: string
          slug: string
          sort_order?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          is_filterable?: boolean
          name?: string
          slug?: string
          sort_order?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
          user_id?: string | null
        }
        Relationships: [
        ]
      }
      banners: {
        Row: {
          button_text: string | null
          button_url: string | null
          created_at: string
          created_by: string | null
          desktop_image_url: string
          ends_at: string | null
          eyebrow: string | null
          id: string
          image_alt: string | null
          internal_name: string
          is_active: boolean
          mobile_image_url: string | null
          overlay_opacity: number
          placement: Database["public"]["Enums"]["banner_placement"]
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          text_position: Database["public"]["Enums"]["text_position"]
          title: string | null
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          created_by?: string | null
          desktop_image_url: string
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_alt?: string | null
          internal_name: string
          is_active?: boolean
          mobile_image_url?: string | null
          overlay_opacity?: number
          placement?: Database["public"]["Enums"]["banner_placement"]
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          text_position?: Database["public"]["Enums"]["text_position"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          created_by?: string | null
          desktop_image_url?: string
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_alt?: string | null
          internal_name?: string
          is_active?: boolean
          mobile_image_url?: string | null
          overlay_opacity?: number
          placement?: Database["public"]["Enums"]["banner_placement"]
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          text_position?: Database["public"]["Enums"]["text_position"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
        ]
      }
      blog_post_products: {
        Row: {
          post_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          post_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          post_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_products_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category_id: string | null
          content: string
          cover_alt: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          id: string
          is_featured: boolean
          og_image_url: string | null
          published_at: string | null
          reading_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category_id?: string | null
          content?: string
          cover_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          og_image_url?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category_id?: string | null
          content?: string
          cover_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          og_image_url?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
        ]
      }
      business_hours: {
        Row: {
          closes_at: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          note: string | null
          opens_at: string | null
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          note?: string | null
          opens_at?: string | null
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          note?: string | null
          opens_at?: string | null
          updated_at?: string
        }
        Relationships: [
        ]
      }
      business_information: {
        Row: {
          about_summary: string | null
          about_title: string | null
          city: string
          cnpj: string | null
          complement: string | null
          district: string | null
          email: string | null
          founded_year: number | null
          google_maps_url: string | null
          history: string | null
          id: number
          latitude: number | null
          legal_name: string | null
          longitude: number | null
          mission: string | null
          phone: string | null
          postal_code: string | null
          state: string
          street: string | null
          street_number: string | null
          trade_name: string | null
          updated_at: string
          updated_by: string | null
          values_text: string | null
        }
        Insert: {
          about_summary?: string | null
          about_title?: string | null
          city?: string
          cnpj?: string | null
          complement?: string | null
          district?: string | null
          email?: string | null
          founded_year?: number | null
          google_maps_url?: string | null
          history?: string | null
          id?: number
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          mission?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string
          street?: string | null
          street_number?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
          values_text?: string | null
        }
        Update: {
          about_summary?: string | null
          about_title?: string | null
          city?: string
          cnpj?: string | null
          complement?: string | null
          district?: string | null
          email?: string | null
          founded_year?: number | null
          google_maps_url?: string | null
          history?: string | null
          id?: number
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          mission?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string
          street?: string | null
          street_number?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
          values_text?: string | null
        }
        Relationships: [
        ]
      }
      categories: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          parent_id: string | null
          seo_content: string | null
          seo_description: string | null
          seo_title: string | null
          show_in_menu: boolean
          slug: string
          sort_order: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          parent_id?: string | null
          seo_content?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_menu?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          parent_id?: string | null
          seo_content?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_menu?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_attributes: {
        Row: {
          attribute_id: string
          category_id: string
          sort_order: number
        }
        Insert: {
          attribute_id: string
          category_id: string
          sort_order?: number
        }
        Update: {
          attribute_id?: string
          category_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_attributes_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_attributes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          max_items: number
          name: string
          placement: string
          slug: string
          sort_order: number
          source: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_items?: number
          name: string
          placement?: string
          slug: string
          sort_order?: number
          source?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_items?: number
          name?: string
          placement?: string
          slug?: string
          sort_order?: number
          source?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          handled_by: string | null
          id: string
          internal_notes: string | null
          message: string
          name: string
          phone: string | null
          source_page: string | null
          status: Database["public"]["Enums"]["lead_status"]
          subject: string
          updated_at: string
          utm: Json
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          handled_by?: string | null
          id?: string
          internal_notes?: string | null
          message: string
          name: string
          phone?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject: string
          updated_at?: string
          utm?: Json
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          handled_by?: string | null
          id?: string
          internal_notes?: string | null
          message?: string
          name?: string
          phone?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string
          updated_at?: string
          utm?: Json
          whatsapp?: string | null
        }
        Relationships: [
        ]
      }
      environments: {
        Row: {
          banner_url: string | null
          content: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          summary: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
        ]
      }
      faqs: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          product_id: string | null
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
        ]
      }
      product_environments: {
        Row: {
          environment_id: string
          product_id: string
        }
        Insert: {
          environment_id: string
          product_id: string
        }
        Update: {
          environment_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_environments_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_environments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          height: number | null
          id: string
          is_cover: boolean
          product_id: string
          sort_order: number
          storage_path: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_cover?: boolean
          product_id: string
          sort_order?: number
          storage_path?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_cover?: boolean
          product_id?: string
          sort_order?: number
          storage_path?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_relations: {
        Row: {
          product_id: string
          related_product_id: string
          relation_type: string
          sort_order: number
        }
        Insert: {
          product_id: string
          related_product_id: string
          relation_type?: string
          sort_order?: number
        }
        Update: {
          product_id?: string
          related_product_id?: string
          relation_type?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          attribute_id: string | null
          created_at: string
          id: string
          label: string | null
          product_id: string
          sort_order: number
          value: string
          value_slug: string
        }
        Insert: {
          attribute_id?: string | null
          created_at?: string
          id?: string
          label?: string | null
          product_id: string
          sort_order?: number
          value: string
          value_slug?: string
        }
        Update: {
          attribute_id?: string | null
          created_at?: string
          id?: string
          label?: string | null
          product_id?: string
          sort_order?: number
          value?: string
          value_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_options: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          name: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          name: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          name?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"] | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          option_id: string
          price: number | null
          product_id: string
          sale_price: number | null
          sku: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"] | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          option_id: string
          price?: number | null
          product_id: string
          sale_price?: number | null
          sku?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"] | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          option_id?: string
          price?: number | null
          product_id?: string
          sale_price?: number | null
          sku?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_variant_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          brand_id: string | null
          canonical_url: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          cta_label: string | null
          deleted_at: string | null
          description: string | null
          dimensions: string | null
          id: string
          is_featured: boolean
          is_new: boolean
          is_on_sale: boolean
          is_recommended: boolean
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          og_image_url: string | null
          package_contents: string | null
          price: number | null
          price_display: Database["public"]["Enums"]["price_display"]
          published_at: string | null
          sale_ends_at: string | null
          sale_label: string | null
          sale_price: number | null
          sale_starts_at: string | null
          search_text: string
          search_vector: unknown | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          unit: string
          updated_at: string
          updated_by: string | null
          video_url: string | null
          warranty: string | null
          weight_kg: number | null
          whatsapp_number: string | null
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          brand_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          deleted_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_featured?: boolean
          is_new?: boolean
          is_on_sale?: boolean
          is_recommended?: boolean
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          og_image_url?: string | null
          package_contents?: string | null
          price?: number | null
          price_display?: Database["public"]["Enums"]["price_display"]
          published_at?: string | null
          sale_ends_at?: string | null
          sale_label?: string | null
          sale_price?: number | null
          sale_starts_at?: string | null
          search_text?: string
          search_vector?: unknown | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          unit?: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          warranty?: string | null
          weight_kg?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          brand_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          deleted_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_featured?: boolean
          is_new?: boolean
          is_on_sale?: boolean
          is_recommended?: boolean
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          og_image_url?: string | null
          package_contents?: string | null
          price?: number | null
          price_display?: Database["public"]["Enums"]["price_display"]
          published_at?: string | null
          sale_ends_at?: string | null
          sale_label?: string | null
          sale_price?: number | null
          sale_starts_at?: string | null
          search_text?: string
          search_vector?: unknown | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          unit?: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          warranty?: string | null
          weight_kg?: number | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
        ]
      }
      quote_request_items: {
        Row: {
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          quote_request_id: string
          sku: string | null
          unit: string | null
          variant_label: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          product_name: string
          quantity: number
          quote_request_id: string
          sku?: string | null
          unit?: string | null
          variant_label?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          quote_request_id?: string
          sku?: string | null
          unit?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_request_items_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          channel: string
          created_at: string
          id: string
          internal_notes: string | null
          items_count: number
          note: string | null
          session_id: string | null
          source_page: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          utm: Json
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          items_count: number
          note?: string | null
          session_id?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm?: Json
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          items_count?: number
          note?: string | null
          session_id?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm?: Json
        }
        Relationships: [
        ]
      }
      rate_limits: {
        Row: {
          hits: number
          key: string
          window_start: string
        }
        Insert: {
          hits?: number
          key: string
          window_start: string
        }
        Update: {
          hits?: number
          key?: string
          window_start?: string
        }
        Relationships: [
        ]
      }
      redirects: {
        Row: {
          created_at: string
          created_by: string | null
          destination_path: string
          id: string
          is_active: boolean
          source_path: string
          status_code: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_path: string
          id?: string
          is_active?: boolean
          source_path: string
          status_code?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_path?: string
          id?: string
          is_active?: boolean
          source_path?: string
          status_code?: number
          updated_at?: string
        }
        Relationships: [
        ]
      }
      search_events: {
        Row: {
          created_at: string
          id: number
          normalized_query: string
          query: string
          results_count: number
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          normalized_query: string
          query: string
          results_count?: number
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          normalized_query?: string
          query?: string
          results_count?: number
          session_id?: string | null
        }
        Relationships: [
        ]
      }
      seo_settings: {
        Row: {
          bing_site_verification: string | null
          default_description: string
          default_og_image_url: string | null
          default_title: string
          google_site_verification: string | null
          id: number
          local_business_type: string
          noindex_site: boolean
          title_template: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bing_site_verification?: string | null
          default_description?: string
          default_og_image_url?: string | null
          default_title?: string
          google_site_verification?: string | null
          id?: number
          local_business_type?: string
          noindex_site?: boolean
          title_template?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bing_site_verification?: string | null
          default_description?: string
          default_og_image_url?: string | null
          default_title?: string
          google_site_verification?: string | null
          id?: number
          local_business_type?: string
          noindex_site?: boolean
          title_template?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
        ]
      }
      site_settings: {
        Row: {
          demo_notice_enabled: boolean
          description: string | null
          favicon_url: string | null
          ga4_id: string | null
          gtm_id: string | null
          id: number
          logo_dark_url: string | null
          logo_url: string | null
          meta_pixel_id: string | null
          nav_links: Json
          newsletter_enabled: boolean
          short_name: string
          site_name: string
          tagline: string | null
          theme: Json
          topbar_enabled: boolean
          topbar_link: string | null
          topbar_message: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          demo_notice_enabled?: boolean
          description?: string | null
          favicon_url?: string | null
          ga4_id?: string | null
          gtm_id?: string | null
          id?: number
          logo_dark_url?: string | null
          logo_url?: string | null
          meta_pixel_id?: string | null
          nav_links?: Json
          newsletter_enabled?: boolean
          short_name?: string
          site_name?: string
          tagline?: string | null
          theme?: Json
          topbar_enabled?: boolean
          topbar_link?: string | null
          topbar_message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          demo_notice_enabled?: boolean
          description?: string | null
          favicon_url?: string | null
          ga4_id?: string | null
          gtm_id?: string | null
          id?: number
          logo_dark_url?: string | null
          logo_url?: string | null
          meta_pixel_id?: string | null
          nav_links?: Json
          newsletter_enabled?: boolean
          short_name?: string
          site_name?: string
          tagline?: string | null
          theme?: Json
          topbar_enabled?: boolean
          topbar_link?: string | null
          topbar_message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
        ]
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
        ]
      }
      testimonials: {
        Row: {
          author_context: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          rating: number | null
          sort_order: number
          source: string | null
          updated_at: string
        }
        Insert: {
          author_context?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          rating?: number | null
          sort_order?: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          author_context?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          rating?: number | null
          sort_order?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: [
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
        ]
      }
      whatsapp_settings: {
        Row: {
          button_label: string
          country_code: string
          default_message: string
          floating_label: string
          id: number
          is_enabled: boolean
          out_of_hours_message: string
          phone_number: string | null
          product_intro: string
          product_outro: string
          quote_intro: string
          show_floating_button: boolean
          show_floating_label_mobile: boolean
          show_out_of_hours_notice: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          button_label?: string
          country_code?: string
          default_message?: string
          floating_label?: string
          id?: number
          is_enabled?: boolean
          out_of_hours_message?: string
          phone_number?: string | null
          product_intro?: string
          product_outro?: string
          quote_intro?: string
          show_floating_button?: boolean
          show_floating_label_mobile?: boolean
          show_out_of_hours_notice?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          button_label?: string
          country_code?: string
          default_message?: string
          floating_label?: string
          id?: number
          is_enabled?: boolean
          out_of_hours_message?: string
          phone_number?: string | null
          product_intro?: string
          product_outro?: string
          quote_intro?: string
          show_floating_button?: boolean
          show_floating_label_mobile?: boolean
          show_out_of_hours_notice?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard: {
        Args: { p_days?: number }
        Returns: Json
      }
      admin_duplicate_product: {
        Args: { p_id: string }
        Returns: string
      }
      admin_save_product: {
        Args: { p: Json }
        Returns: string
      }
      bootstrap_super_admin: {
        Args: { admin_email: string }
        Returns: undefined
      }
      catalog_count: {
        Args: { p_query?: string; p_category_slug?: string; p_brand_slugs?: string[]; p_environment_slug?: string; p_on_sale?: boolean; p_is_new?: boolean; p_availability?: string[]; p_attributes?: Json; p_price_min?: number; p_price_max?: number }
        Returns: number
      }
      catalog_facets: {
        Args: { p_query?: string; p_category_slug?: string; p_brand_slugs?: string[]; p_environment_slug?: string; p_on_sale?: boolean; p_is_new?: boolean; p_availability?: string[]; p_attributes?: Json }
        Returns: Json
      }
      catalog_filter: {
        Args: { p_query?: string; p_category_slug?: string; p_brand_slugs?: string[]; p_environment_slug?: string; p_on_sale?: boolean; p_is_new?: boolean; p_availability?: string[]; p_attributes?: Json; p_price_min?: number; p_price_max?: number; p_ignore_brand_filter?: boolean; p_ignore_attribute_filter?: boolean }
        Returns: { product_id: string; rank: number }[]
      }
      catalog_products: {
        Args: { p_query?: string; p_category_slug?: string; p_brand_slugs?: string[]; p_environment_slug?: string; p_on_sale?: boolean; p_is_new?: boolean; p_availability?: string[]; p_attributes?: Json; p_price_min?: number; p_price_max?: number; p_sort?: string; p_limit?: number; p_offset?: number }
        Returns: Database["public"]["Tables"]["products"]["Row"][]
        SetofOptions: { from: "*"; to: "products"; isOneToOne: false; isSetofReturn: true }
      }
      category_descendant_ids: {
        Args: { p_category_id: string }
        Returns: string[]
      }
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      f_unaccent: {
        Args: { value: string }
        Returns: string
      }
      has_min_role: {
        Args: { required: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_staff: {
        Args: never
        Returns: boolean
      }
      most_viewed_product_ids: {
        Args: { p_days?: number; p_limit?: number }
        Returns: { product_id: string; views: number }[]
      }
      normalize_search_term: {
        Args: { value: string }
        Returns: string
      }
      prefix_tsquery: {
        Args: { p_query: string }
        Returns: unknown
      }
      related_products: {
        Args: { p_product_id: string; p_limit?: number }
        Returns: Database["public"]["Tables"]["products"]["Row"][]
        SetofOptions: { from: "*"; to: "products"; isOneToOne: false; isSetofReturn: true }
      }
      search_suggestions: {
        Args: { p_query: string; p_limit?: number }
        Returns: Json
      }
      slugify: {
        Args: { value: string }
        Returns: string
      }
      submit_quote_request: {
        Args: { p_items: Json; p_note?: string; p_session_id?: string; p_source_page?: string; p_utm?: Json }
        Returns: string
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
      availability_status: "available_on_request" | "made_to_order" | "temporarily_unavailable" | "discontinued"
      banner_placement: "home_hero" | "home_middle" | "home_specialist" | "catalog_top"
      content_status: "draft" | "published" | "archived"
      lead_status: "new" | "in_progress" | "answered" | "archived"
      price_display: "show" | "consult" | "on_request" | "hidden"
      text_position: "left" | "center" | "right"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "editor"],
      availability_status: ["available_on_request", "made_to_order", "temporarily_unavailable", "discontinued"],
      banner_placement: ["home_hero", "home_middle", "home_specialist", "catalog_top"],
      content_status: ["draft", "published", "archived"],
      lead_status: ["new", "in_progress", "answered", "archived"],
      price_display: ["show", "consult", "on_request", "hidden"],
      text_position: ["left", "center", "right"],
    },
  },
} as const
