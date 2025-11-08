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
      alerts: {
        Row: {
          alert_time: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string | null
          description: string | null
          device_id: string
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["alert_severity"] | null
          speed: number | null
          title: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          alert_time: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          description?: string | null
          device_id: string
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          speed?: number | null
          title: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          alert_time?: string
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          description?: string | null
          device_id?: string
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          speed?: number | null
          title?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_credentials: {
        Row: {
          api_account: string
          api_base_url: string | null
          api_password_encrypted: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          session_expires_at: string | null
          session_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_account: string
          api_base_url?: string | null
          api_password_encrypted: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          session_expires_at?: string | null
          session_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_account?: string
          api_base_url?: string | null
          api_password_encrypted?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          session_expires_at?: string | null
          session_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_commands: {
        Row: {
          command_type: string
          created_at: string | null
          device_id: string
          error_message: string | null
          id: string
          mdvr_message: string
          mqtt_topic: string
          responded_at: string | null
          response_message: string | null
          sent_at: string | null
          sent_by: string | null
          session_id: string | null
          status: string | null
        }
        Insert: {
          command_type: string
          created_at?: string | null
          device_id: string
          error_message?: string | null
          id?: string
          mdvr_message: string
          mqtt_topic: string
          responded_at?: string | null
          response_message?: string | null
          sent_at?: string | null
          sent_by?: string | null
          session_id?: string | null
          status?: string | null
        }
        Update: {
          command_type?: string
          created_at?: string | null
          device_id?: string
          error_message?: string | null
          id?: string
          mdvr_message?: string
          mqtt_topic?: string
          responded_at?: string | null
          response_message?: string | null
          sent_at?: string | null
          sent_by?: string | null
          session_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_commands_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string | null
          firmware_version: string | null
          id: string
          imei: string
          last_seen: string | null
          model: string | null
          name: string
          owner_id: string | null
          sim_iccid: string
          status: Database["public"]["Enums"]["device_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          firmware_version?: string | null
          id?: string
          imei: string
          last_seen?: string | null
          model?: string | null
          name: string
          owner_id?: string | null
          sim_iccid: string
          status?: Database["public"]["Enums"]["device_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          firmware_version?: string | null
          id?: string
          imei?: string
          last_seen?: string | null
          model?: string | null
          name?: string
          owner_id?: string | null
          sim_iccid?: string
          status?: Database["public"]["Enums"]["device_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          driver_name: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          hire_date: string | null
          id: string
          license_expiry: string | null
          license_number: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          qualification_certificate: string | null
          status: Database["public"]["Enums"]["driver_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          driver_name: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          hire_date?: string | null
          id?: string
          license_expiry?: string | null
          license_number: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          qualification_certificate?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          driver_name?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          hire_date?: string | null
          id?: string
          license_expiry?: string | null
          license_number?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          qualification_certificate?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_tracking: {
        Row: {
          accuracy: number | null
          address: string | null
          altitude: number | null
          battery_level: number | null
          created_at: string | null
          device_id: string
          engine_status: boolean | null
          fuel_level: number | null
          gps_time: string
          heading: number | null
          id: string
          is_online: boolean | null
          latitude: number
          longitude: number
          odometer: number | null
          server_time: string | null
          speed: number | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          accuracy?: number | null
          address?: string | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id: string
          engine_status?: boolean | null
          fuel_level?: number | null
          gps_time: string
          heading?: number | null
          id?: string
          is_online?: boolean | null
          latitude: number
          longitude: number
          odometer?: number | null
          server_time?: string | null
          speed?: number | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          accuracy?: number | null
          address?: string | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id?: string
          engine_status?: boolean | null
          fuel_level?: number | null
          gps_time?: string
          heading?: number | null
          id?: string
          is_online?: boolean | null
          latitude?: number
          longitude?: number
          odometer?: number | null
          server_time?: string | null
          speed?: number | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gps_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_tracking_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          device_type: string
          id: string
          is_active: boolean | null
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          device_type: string
          id?: string
          is_active?: boolean | null
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          device_type?: string
          id?: string
          is_active?: boolean | null
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          last_active: string | null
          stream_type: string | null
          stream_url: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          last_active?: string | null
          stream_type?: string | null
          stream_url?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          last_active?: string | null
          stream_type?: string | null
          stream_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          device_id: string
          end_at: string | null
          id: string
          plan_id: string | null
          sim_iccid: string
          start_at: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          end_at?: string | null
          id?: string
          plan_id?: string | null
          sim_iccid: string
          start_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          end_at?: string | null
          id?: string
          plan_id?: string | null
          sim_iccid?: string
          start_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry: {
        Row: {
          battery_level: number | null
          created_at: string | null
          data_usage_mb: number | null
          device_id: string
          gps_lat: number | null
          gps_lon: number | null
          id: string
          signal_strength: number | null
          storage_free_mb: number | null
          timestamp: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string | null
          data_usage_mb?: number | null
          device_id: string
          gps_lat?: number | null
          gps_lon?: number | null
          id?: string
          signal_strength?: number | null
          storage_free_mb?: number | null
          timestamp?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string | null
          data_usage_mb?: number | null
          device_id?: string
          gps_lat?: number | null
          gps_lon?: number | null
          id?: string
          signal_strength?: number | null
          storage_free_mb?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          avg_speed: number | null
          created_at: string | null
          device_id: string
          distance: number | null
          driver_id: string | null
          duration: number | null
          end_address: string | null
          end_location_lat: number | null
          end_location_lng: number | null
          end_time: string | null
          fuel_consumed: number | null
          id: string
          idle_time: number | null
          max_speed: number | null
          route_data: Json | null
          start_address: string | null
          start_location_lat: number | null
          start_location_lng: number | null
          start_time: string
          status: Database["public"]["Enums"]["trip_status"] | null
          trip_name: string | null
          updated_at: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          avg_speed?: number | null
          created_at?: string | null
          device_id: string
          distance?: number | null
          driver_id?: string | null
          duration?: number | null
          end_address?: string | null
          end_location_lat?: number | null
          end_location_lng?: number | null
          end_time?: string | null
          fuel_consumed?: number | null
          id?: string
          idle_time?: number | null
          max_speed?: number | null
          route_data?: Json | null
          start_address?: string | null
          start_location_lat?: number | null
          start_location_lng?: number | null
          start_time: string
          status?: Database["public"]["Enums"]["trip_status"] | null
          trip_name?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          avg_speed?: number | null
          created_at?: string | null
          device_id?: string
          distance?: number | null
          driver_id?: string | null
          duration?: number | null
          end_address?: string | null
          end_location_lat?: number | null
          end_location_lng?: number | null
          end_time?: string | null
          fuel_consumed?: number | null
          id?: string
          idle_time?: number | null
          max_speed?: number | null
          route_data?: Json | null
          start_address?: string | null
          start_location_lat?: number | null
          start_location_lng?: number | null
          start_time?: string
          status?: Database["public"]["Enums"]["trip_status"] | null
          trip_name?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_assignments: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          driver_id: string
          id: string
          is_current: boolean | null
          notes: string | null
          unassigned_at: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          driver_id: string
          id?: string
          is_current?: boolean | null
          notes?: string | null
          unassigned_at?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          driver_id?: string
          id?: string
          is_current?: boolean | null
          notes?: string | null
          unassigned_at?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string | null
          color: string | null
          created_at: string | null
          device_id: string
          fuel_capacity: number | null
          icon_type: number | null
          id: string
          insurance_expiry: string | null
          last_maintenance_date: string | null
          model: string | null
          next_maintenance_date: string | null
          notes: string | null
          odometer_reading: number | null
          plate_number: string
          registration_expiry: string | null
          sim_card: string | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at: string | null
          user_id: string
          vehicle_type: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          color?: string | null
          created_at?: string | null
          device_id: string
          fuel_capacity?: number | null
          icon_type?: number | null
          id?: string
          insurance_expiry?: string | null
          last_maintenance_date?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          odometer_reading?: number | null
          plate_number: string
          registration_expiry?: string | null
          sim_card?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string | null
          user_id: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          color?: string | null
          created_at?: string | null
          device_id?: string
          fuel_capacity?: number | null
          icon_type?: number | null
          id?: string
          insurance_expiry?: string | null
          last_maintenance_date?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          odometer_reading?: number | null
          plate_number?: string
          registration_expiry?: string | null
          sim_card?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string | null
          user_id?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      timeout_old_commands: { Args: never; Returns: undefined }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      alert_type:
        | "speeding"
        | "harsh_braking"
        | "harsh_acceleration"
        | "harsh_cornering"
        | "geofence_entry"
        | "geofence_exit"
        | "low_fuel"
        | "maintenance_due"
        | "offline"
        | "sos"
        | "unauthorized_movement"
      app_role: "admin" | "customer"
      device_status: "online" | "offline" | "maintenance"
      driver_status: "active" | "inactive" | "on_leave" | "suspended"
      subscription_status: "active" | "suspended" | "cancelled"
      trip_status: "ongoing" | "completed" | "paused"
      vehicle_status: "active" | "inactive" | "maintenance" | "offline"
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
      alert_severity: ["info", "warning", "critical"],
      alert_type: [
        "speeding",
        "harsh_braking",
        "harsh_acceleration",
        "harsh_cornering",
        "geofence_entry",
        "geofence_exit",
        "low_fuel",
        "maintenance_due",
        "offline",
        "sos",
        "unauthorized_movement",
      ],
      app_role: ["admin", "customer"],
      device_status: ["online", "offline", "maintenance"],
      driver_status: ["active", "inactive", "on_leave", "suspended"],
      subscription_status: ["active", "suspended", "cancelled"],
      trip_status: ["ongoing", "completed", "paused"],
      vehicle_status: ["active", "inactive", "maintenance", "offline"],
    },
  },
} as const
