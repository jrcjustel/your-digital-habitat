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
      activity_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      alert_notifications: {
        Row: {
          alert_id: string
          asset_id: string
          created_at: string
          id: string
          is_read: boolean
          matched_criteria: Json | null
          notified_at: string | null
          user_id: string
        }
        Insert: {
          alert_id: string
          asset_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          matched_criteria?: Json | null
          notified_at?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string
          asset_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          matched_criteria?: Json | null
          notified_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_notifications_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_notifications_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          assets_by_province: Json | null
          assets_by_type: Json | null
          avg_lead_score: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          offers_by_status: Json | null
          pending_offers: number | null
          published_assets: number | null
          snapshot_date: string
          total_assets: number | null
          total_leads: number | null
          total_offers: number | null
          total_subscribers: number | null
          total_users: number | null
        }
        Insert: {
          assets_by_province?: Json | null
          assets_by_type?: Json | null
          avg_lead_score?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          offers_by_status?: Json | null
          pending_offers?: number | null
          published_assets?: number | null
          snapshot_date?: string
          total_assets?: number | null
          total_leads?: number | null
          total_offers?: number | null
          total_subscribers?: number | null
          total_users?: number | null
        }
        Update: {
          assets_by_province?: Json | null
          assets_by_type?: Json | null
          avg_lead_score?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          offers_by_status?: Json | null
          pending_offers?: number | null
          published_assets?: number | null
          snapshot_date?: string
          total_assets?: number | null
          total_leads?: number | null
          total_offers?: number | null
          total_subscribers?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      asset_images: {
        Row: {
          asset_id: string
          caption: string | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          is_cover: boolean
          sort_order: number
          uploaded_by: string | null
        }
        Insert: {
          asset_id: string
          caption?: string | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          uploaded_by?: string | null
        }
        Update: {
          asset_id?: string
          caption?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_images_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_images_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_settings: {
        Row: {
          asset_id: string
          auction_type: string
          bid_increment: number | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          min_bid: number | null
          start_date: string | null
        }
        Insert: {
          asset_id: string
          auction_type?: string
          bid_increment?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_bid?: number | null
          start_date?: string | null
        }
        Update: {
          asset_id?: string
          auction_type?: string
          bid_increment?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_bid?: number | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_settings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_settings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          asset_id: string
          cif: string | null
          created_at: string
          email: string
          empresa: string | null
          full_name: string
          id: string
          notes: string | null
          persona_tipo: string | null
          phone: string | null
          representacion: string | null
          represented_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          asset_id: string
          cif?: string | null
          created_at?: string
          email: string
          empresa?: string | null
          full_name: string
          id?: string
          notes?: string | null
          persona_tipo?: string | null
          phone?: string | null
          representacion?: string | null
          represented_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          asset_id?: string
          cif?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          persona_tipo?: string | null
          phone?: string | null
          representacion?: string | null
          represented_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_messages: {
        Row: {
          channel: Database["public"]["Enums"]["channel_type"]
          content: string
          created_at: string
          failed_count: number | null
          id: string
          metadata: Json | null
          sent_at: string | null
          sent_count: number | null
          status: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["channel_type"]
          content: string
          created_at?: string
          failed_count?: number | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel_type"]
          content?: string
          created_at?: string
          failed_count?: number | null
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
        }
        Relationships: []
      }
      channel_subscribers: {
        Row: {
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          display_name: string | null
          external_id: string | null
          id: string
          is_active: boolean
          preferences: Json
          segments: string[]
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          display_name?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          preferences?: Json
          segments?: string[]
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          display_name?: string | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          preferences?: Json
          segments?: string[]
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_log: {
        Row: {
          ai_response: string | null
          asset_id: string | null
          asset_reference: string | null
          channel: string
          comunidad_autonoma: string | null
          created_at: string
          gestor_id: string | null
          gestor_notified: boolean
          gestor_notified_at: string | null
          id: string
          lead_email: string | null
          lead_name: string | null
          lead_phone: string | null
          message: string | null
          provincia: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          ai_response?: string | null
          asset_id?: string | null
          asset_reference?: string | null
          channel?: string
          comunidad_autonoma?: string | null
          created_at?: string
          gestor_id?: string | null
          gestor_notified?: boolean
          gestor_notified_at?: string | null
          id?: string
          lead_email?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          message?: string | null
          provincia?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          ai_response?: string | null
          asset_id?: string | null
          asset_reference?: string | null
          channel?: string
          comunidad_autonoma?: string | null
          created_at?: string
          gestor_id?: string | null
          gestor_notified?: boolean
          gestor_notified_at?: string | null
          id?: string
          lead_email?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          message?: string | null
          provincia?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_log_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_log_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_log_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          mensaje: string
          nombre: string
          servicio: string | null
          status: string
          telefono: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          mensaje: string
          nombre: string
          servicio?: string | null
          status?: string
          telefono?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          mensaje?: string
          nombre?: string
          servicio?: string | null
          status?: string
          telefono?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_confidential: boolean
          mime_type: string | null
          npl_asset_id: string | null
          property_id: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_confidential?: boolean
          mime_type?: string | null
          npl_asset_id?: string | null
          property_id?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_confidential?: boolean
          mime_type?: string | null
          npl_asset_id?: string | null
          property_id?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_npl_asset_id_fkey"
            columns: ["npl_asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_npl_asset_id_fkey"
            columns: ["npl_asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: []
      }
      gestores: {
        Row: {
          comunidades_autonomas: string[]
          created_at: string
          email: string
          id: string
          is_active: boolean
          nombre: string
          provincias: string[]
          telefono: string | null
          tipos_activo: string[]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          comunidades_autonomas?: string[]
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          nombre: string
          provincias?: string[]
          telefono?: string | null
          tipos_activo?: string[]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          comunidades_autonomas?: string[]
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          nombre?: string
          provincias?: string[]
          telefono?: string | null
          tipos_activo?: string[]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      historial_cambios: {
        Row: {
          campo_modificado: string
          created_at: string
          entidad_id: string
          entidad_tipo: string
          id: string
          ip_address: string | null
          usuario_id: string | null
          usuario_nombre: string | null
          valor_anterior: string | null
          valor_nuevo: string | null
        }
        Insert: {
          campo_modificado: string
          created_at?: string
          entidad_id: string
          entidad_tipo: string
          id?: string
          ip_address?: string | null
          usuario_id?: string | null
          usuario_nombre?: string | null
          valor_anterior?: string | null
          valor_nuevo?: string | null
        }
        Update: {
          campo_modificado?: string
          created_at?: string
          entidad_id?: string
          entidad_tipo?: string
          id?: string
          ip_address?: string | null
          usuario_id?: string | null
          usuario_nombre?: string | null
          valor_anterior?: string | null
          valor_nuevo?: string | null
        }
        Relationships: []
      }
      inversiones: {
        Row: {
          creado_por: string | null
          created_at: string
          duracion_meses: number | null
          estado: string
          fecha_cierre: string | null
          fecha_inversion: string
          gastos_totales: number
          id: string
          inversion_total: number
          margen_neto: number | null
          notas: string | null
          oportunidad_id: string
          precio_compra: number
          roi: number | null
          tir: number | null
          updated_at: string
          valor_venta_estimado: number | null
        }
        Insert: {
          creado_por?: string | null
          created_at?: string
          duracion_meses?: number | null
          estado?: string
          fecha_cierre?: string | null
          fecha_inversion?: string
          gastos_totales?: number
          id?: string
          inversion_total?: number
          margen_neto?: number | null
          notas?: string | null
          oportunidad_id: string
          precio_compra?: number
          roi?: number | null
          tir?: number | null
          updated_at?: string
          valor_venta_estimado?: number | null
        }
        Update: {
          creado_por?: string | null
          created_at?: string
          duracion_meses?: number | null
          estado?: string
          fecha_cierre?: string | null
          fecha_inversion?: string
          gastos_totales?: number
          id?: string
          inversion_total?: number
          margen_neto?: number | null
          notas?: string | null
          oportunidad_id?: string
          precio_compra?: number
          roi?: number | null
          tir?: number | null
          updated_at?: string
          valor_venta_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inversiones_oportunidad_id_fkey"
            columns: ["oportunidad_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inversiones_oportunidad_id_fkey"
            columns: ["oportunidad_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_asset_matches: {
        Row: {
          asset_id: string
          created_at: string
          criteria: Json | null
          id: string
          investor_id: string
          notified: boolean | null
          score: number
          viewed: boolean | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          criteria?: Json | null
          id?: string
          investor_id: string
          notified?: boolean | null
          score?: number
          viewed?: boolean | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          criteria?: Json | null
          id?: string
          investor_id?: string
          notified?: boolean | null
          score?: number
          viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_asset_matches_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_asset_matches_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      npl_assets: {
        Row: {
          anio_construccion: number | null
          asset_id: string | null
          cartera: string | null
          cesion_credito: boolean | null
          cesion_remate: boolean | null
          codigo_postal: string | null
          comision_porcentaje: number | null
          comunidad_autonoma: string | null
          created_at: string
          deposito_porcentaje: number | null
          descripcion: string | null
          deuda_ob: number | null
          direccion: string | null
          estado: string | null
          estado_judicial: string | null
          estado_ocupacional: string | null
          fase_judicial: string | null
          finca_registral: string | null
          id: string
          importe_preaprobado: number | null
          judicializado: boolean | null
          municipio: string | null
          name_debtor: string | null
          ndg: string | null
          num_titulares: number | null
          oferta_aprobada: boolean | null
          persona_tipo: string | null
          postura_subasta: boolean | null
          precio_orientativo: number | null
          propiedad_sin_posesion: boolean | null
          provincia: string | null
          publicado: boolean | null
          rango_deuda: string | null
          ref_catastral: string | null
          referencia_fencia: string | null
          registro_propiedad: string | null
          servicer: string | null
          sqm: number | null
          tipo_activo: string | null
          tipo_procedimiento: string | null
          valor_activo: number | null
          valor_mercado: number | null
          vpo: boolean | null
        }
        Insert: {
          anio_construccion?: number | null
          asset_id?: string | null
          cartera?: string | null
          cesion_credito?: boolean | null
          cesion_remate?: boolean | null
          codigo_postal?: string | null
          comision_porcentaje?: number | null
          comunidad_autonoma?: string | null
          created_at?: string
          deposito_porcentaje?: number | null
          descripcion?: string | null
          deuda_ob?: number | null
          direccion?: string | null
          estado?: string | null
          estado_judicial?: string | null
          estado_ocupacional?: string | null
          fase_judicial?: string | null
          finca_registral?: string | null
          id?: string
          importe_preaprobado?: number | null
          judicializado?: boolean | null
          municipio?: string | null
          name_debtor?: string | null
          ndg?: string | null
          num_titulares?: number | null
          oferta_aprobada?: boolean | null
          persona_tipo?: string | null
          postura_subasta?: boolean | null
          precio_orientativo?: number | null
          propiedad_sin_posesion?: boolean | null
          provincia?: string | null
          publicado?: boolean | null
          rango_deuda?: string | null
          ref_catastral?: string | null
          referencia_fencia?: string | null
          registro_propiedad?: string | null
          servicer?: string | null
          sqm?: number | null
          tipo_activo?: string | null
          tipo_procedimiento?: string | null
          valor_activo?: number | null
          valor_mercado?: number | null
          vpo?: boolean | null
        }
        Update: {
          anio_construccion?: number | null
          asset_id?: string | null
          cartera?: string | null
          cesion_credito?: boolean | null
          cesion_remate?: boolean | null
          codigo_postal?: string | null
          comision_porcentaje?: number | null
          comunidad_autonoma?: string | null
          created_at?: string
          deposito_porcentaje?: number | null
          descripcion?: string | null
          deuda_ob?: number | null
          direccion?: string | null
          estado?: string | null
          estado_judicial?: string | null
          estado_ocupacional?: string | null
          fase_judicial?: string | null
          finca_registral?: string | null
          id?: string
          importe_preaprobado?: number | null
          judicializado?: boolean | null
          municipio?: string | null
          name_debtor?: string | null
          ndg?: string | null
          num_titulares?: number | null
          oferta_aprobada?: boolean | null
          persona_tipo?: string | null
          postura_subasta?: boolean | null
          precio_orientativo?: number | null
          propiedad_sin_posesion?: boolean | null
          provincia?: string | null
          publicado?: boolean | null
          rango_deuda?: string | null
          ref_catastral?: string | null
          referencia_fencia?: string | null
          registro_propiedad?: string | null
          servicer?: string | null
          sqm?: number | null
          tipo_activo?: string | null
          tipo_procedimiento?: string | null
          valor_activo?: number | null
          valor_mercado?: number | null
          vpo?: boolean | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          offer_amount: number
          phone: string | null
          property_id: string
          property_reference: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          offer_amount: number
          phone?: string | null
          property_id: string
          property_reference?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          offer_amount?: number
          phone?: string | null
          property_id?: string
          property_reference?: string | null
          status?: string
        }
        Relationships: []
      }
      oportunidades_extra: {
        Row: {
          created_at: string
          created_by: string | null
          fecha_publicacion: string | null
          gastos_fiscales: number | null
          gastos_judiciales: number | null
          gastos_notariales: number | null
          gastos_reforma: number | null
          id: string
          liquidez_score: number | null
          notas: string | null
          npl_asset_id: string
          riesgo_judicial: number | null
          roi_estimado: number | null
          score_inversion: number | null
          tir_estimada: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          fecha_publicacion?: string | null
          gastos_fiscales?: number | null
          gastos_judiciales?: number | null
          gastos_notariales?: number | null
          gastos_reforma?: number | null
          id?: string
          liquidez_score?: number | null
          notas?: string | null
          npl_asset_id: string
          riesgo_judicial?: number | null
          roi_estimado?: number | null
          score_inversion?: number | null
          tir_estimada?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          fecha_publicacion?: string | null
          gastos_fiscales?: number | null
          gastos_judiciales?: number | null
          gastos_notariales?: number | null
          gastos_reforma?: number | null
          id?: string
          liquidez_score?: number | null
          notas?: string | null
          npl_asset_id?: string
          riesgo_judicial?: number | null
          roi_estimado?: number | null
          score_inversion?: number | null
          tir_estimada?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_extra_npl_asset_id_fkey"
            columns: ["npl_asset_id"]
            isOneToOne: true
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_extra_npl_asset_id_fkey"
            columns: ["npl_asset_id"]
            isOneToOne: true
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          acepta_marketing: boolean | null
          avatar_url: string | null
          cif_nif: string | null
          ciudad: string | null
          comunidad_autonoma: string | null
          created_at: string
          display_name: string | null
          empresa: string | null
          id: string
          intereses: string[] | null
          investor_level: Database["public"]["Enums"]["investor_level"] | null
          lead_score: number | null
          nda_signed: boolean
          nda_signed_at: string | null
          notas_admin: string | null
          num_favoritos: number | null
          num_ofertas: number | null
          origen: string | null
          persona_tipo: Database["public"]["Enums"]["persona_tipo"] | null
          phone: string | null
          presupuesto_max: number | null
          presupuesto_min: number | null
          provincias_interes: string[] | null
          search_preferences: Json | null
          tipos_activo_preferidos: string[] | null
          ultima_actividad: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acepta_marketing?: boolean | null
          avatar_url?: string | null
          cif_nif?: string | null
          ciudad?: string | null
          comunidad_autonoma?: string | null
          created_at?: string
          display_name?: string | null
          empresa?: string | null
          id?: string
          intereses?: string[] | null
          investor_level?: Database["public"]["Enums"]["investor_level"] | null
          lead_score?: number | null
          nda_signed?: boolean
          nda_signed_at?: string | null
          notas_admin?: string | null
          num_favoritos?: number | null
          num_ofertas?: number | null
          origen?: string | null
          persona_tipo?: Database["public"]["Enums"]["persona_tipo"] | null
          phone?: string | null
          presupuesto_max?: number | null
          presupuesto_min?: number | null
          provincias_interes?: string[] | null
          search_preferences?: Json | null
          tipos_activo_preferidos?: string[] | null
          ultima_actividad?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acepta_marketing?: boolean | null
          avatar_url?: string | null
          cif_nif?: string | null
          ciudad?: string | null
          comunidad_autonoma?: string | null
          created_at?: string
          display_name?: string | null
          empresa?: string | null
          id?: string
          intereses?: string[] | null
          investor_level?: Database["public"]["Enums"]["investor_level"] | null
          lead_score?: number | null
          nda_signed?: boolean
          nda_signed_at?: string | null
          notas_admin?: string | null
          num_favoritos?: number | null
          num_ofertas?: number | null
          origen?: string | null
          persona_tipo?: Database["public"]["Enums"]["persona_tipo"] | null
          phone?: string | null
          presupuesto_max?: number | null
          presupuesto_min?: number | null
          provincias_interes?: string[] | null
          search_preferences?: Json | null
          tipos_activo_preferidos?: string[] | null
          ultima_actividad?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roles_ikesa: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre_rol: string
          puede_administrar_usuarios: boolean
          puede_escribir: boolean
          puede_exportar: boolean
          puede_generar_pdf: boolean
          puede_importar_excel: boolean
          puede_leer: boolean
          puede_ver_financiero: boolean
          puede_ver_legal: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre_rol: string
          puede_administrar_usuarios?: boolean
          puede_escribir?: boolean
          puede_exportar?: boolean
          puede_generar_pdf?: boolean
          puede_importar_excel?: boolean
          puede_leer?: boolean
          puede_ver_financiero?: boolean
          puede_ver_legal?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre_rol?: string
          puede_administrar_usuarios?: boolean
          puede_escribir?: boolean
          puede_exportar?: boolean
          puede_generar_pdf?: boolean
          puede_importar_excel?: boolean
          puede_leer?: boolean
          puede_ver_financiero?: boolean
          puede_ver_legal?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          ai_generated: boolean | null
          asset_id: string | null
          channel: string
          content: string
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          media_url: string | null
          metrics: Json | null
          published_at: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          asset_id?: string | null
          channel: string
          content: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          media_url?: string | null
          metrics?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          asset_id?: string | null
          channel?: string
          content?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          media_url?: string | null
          metrics?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valuation_leads: {
        Row: {
          anio_construccion: number | null
          banos: number | null
          codigo_postal: string | null
          created_at: string
          direccion: string
          email: string
          estado: string | null
          habitaciones: number | null
          id: string
          municipio: string | null
          nombre: string
          planta: number | null
          provincia: string | null
          superficie_m2: number
          telefono: string | null
          tiene_ascensor: boolean | null
          tiene_garaje: boolean | null
          tiene_trastero: boolean | null
          tipo_inmueble: string
          valor_estimado_max: number | null
          valor_estimado_medio: number | null
          valor_estimado_min: number | null
        }
        Insert: {
          anio_construccion?: number | null
          banos?: number | null
          codigo_postal?: string | null
          created_at?: string
          direccion: string
          email: string
          estado?: string | null
          habitaciones?: number | null
          id?: string
          municipio?: string | null
          nombre: string
          planta?: number | null
          provincia?: string | null
          superficie_m2: number
          telefono?: string | null
          tiene_ascensor?: boolean | null
          tiene_garaje?: boolean | null
          tiene_trastero?: boolean | null
          tipo_inmueble: string
          valor_estimado_max?: number | null
          valor_estimado_medio?: number | null
          valor_estimado_min?: number | null
        }
        Update: {
          anio_construccion?: number | null
          banos?: number | null
          codigo_postal?: string | null
          created_at?: string
          direccion?: string
          email?: string
          estado?: string | null
          habitaciones?: number | null
          id?: string
          municipio?: string | null
          nombre?: string
          planta?: number | null
          provincia?: string | null
          superficie_m2?: number
          telefono?: string | null
          tiene_ascensor?: boolean | null
          tiene_garaje?: boolean | null
          tiene_trastero?: boolean | null
          tipo_inmueble?: string
          valor_estimado_max?: number | null
          valor_estimado_medio?: number | null
          valor_estimado_min?: number | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          asset_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          notified_at: string | null
          phone: string | null
          position: number
          status: string
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          notified_at?: string | null
          phone?: string | null
          position?: number
          status?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notified_at?: string | null
          phone?: string | null
          position?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "npl_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      oportunidades: {
        Row: {
          cartera: string | null
          cesion_credito: boolean | null
          cesion_remate: boolean | null
          codigo_postal: string | null
          comunidad_autonoma: string | null
          created_at: string | null
          descripcion: string | null
          deuda_pendiente: number | null
          direccion: string | null
          estado: string | null
          estado_judicial: string | null
          estado_ocupacional: string | null
          fase_judicial: string | null
          fecha_publicacion: string | null
          gastos_fiscales: number | null
          gastos_judiciales: number | null
          gastos_notariales: number | null
          gastos_reforma: number | null
          id: string | null
          judicializado: boolean | null
          liquidez_score: number | null
          margen_bruto_pct: number | null
          margen_neto: number | null
          municipio: string | null
          notas: string | null
          precio_compra: number | null
          provincia: string | null
          publicado: boolean | null
          ref_catastral: string | null
          referencia: string | null
          riesgo_judicial: number | null
          roi_estimado: number | null
          score_inversion: number | null
          servicer: string | null
          superficie_m2: number | null
          tipo_activo: string | null
          tipo_procedimiento: string | null
          tir_estimada: number | null
          valor_activo: number | null
          valor_mercado: number | null
          vpo: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_lead_score: { Args: { p_user_id: string }; Returns: number }
      get_user_permissions: { Args: { _user_id: string }; Returns: Json }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_investors_to_asset: {
        Args: { p_asset_id: string }
        Returns: number
      }
      refresh_profile_stats: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "comercial"
        | "analista"
        | "legal"
        | "finanzas"
        | "marketing"
      channel_type:
        | "whatsapp"
        | "telegram"
        | "whatsapp_channel"
        | "telegram_channel"
      investor_level: "principiante" | "intermedio" | "avanzado" | "profesional"
      persona_tipo: "fisica" | "juridica"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "comercial",
        "analista",
        "legal",
        "finanzas",
        "marketing",
      ],
      channel_type: [
        "whatsapp",
        "telegram",
        "whatsapp_channel",
        "telegram_channel",
      ],
      investor_level: ["principiante", "intermedio", "avanzado", "profesional"],
      persona_tipo: ["fisica", "juridica"],
    },
  },
} as const
