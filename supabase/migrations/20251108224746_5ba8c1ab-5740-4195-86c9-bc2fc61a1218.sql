-- Create enums for the new schema
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE public.alert_type AS ENUM (
  'speeding',
  'harsh_braking',
  'harsh_acceleration',
  'harsh_cornering',
  'geofence_entry',
  'geofence_exit',
  'low_fuel',
  'maintenance_due',
  'offline',
  'sos',
  'unauthorized_movement'
);
CREATE TYPE public.driver_status AS ENUM ('active', 'inactive', 'on_leave', 'suspended');
CREATE TYPE public.trip_status AS ENUM ('ongoing', 'completed', 'paused');
CREATE TYPE public.vehicle_status AS ENUM ('active', 'inactive', 'maintenance', 'offline');

-- Update profiles table with new fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS role TEXT;

-- Create api_credentials table
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_account TEXT NOT NULL,
  api_password_encrypted TEXT NOT NULL,
  api_base_url TEXT,
  session_token TEXT,
  session_expires_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own api credentials"
  ON public.api_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own api credentials"
  ON public.api_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own api credentials"
  ON public.api_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own api credentials"
  ON public.api_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Create vehicles table (if doesn't exist, or add new columns)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  vin TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  vehicle_type TEXT,
  fuel_capacity NUMERIC,
  icon_type INTEGER,
  sim_card TEXT,
  status public.vehicle_status DEFAULT 'active',
  odometer_reading NUMERIC,
  last_maintenance_date TIMESTAMPTZ,
  next_maintenance_date TIMESTAMPTZ,
  insurance_expiry TIMESTAMPTZ,
  registration_expiry TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to existing vehicles table if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
    ALTER TABLE public.vehicles 
    ADD COLUMN IF NOT EXISTS vin TEXT,
    ADD COLUMN IF NOT EXISTS brand TEXT,
    ADD COLUMN IF NOT EXISTS model TEXT,
    ADD COLUMN IF NOT EXISTS year INTEGER,
    ADD COLUMN IF NOT EXISTS color TEXT,
    ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
    ADD COLUMN IF NOT EXISTS fuel_capacity NUMERIC,
    ADD COLUMN IF NOT EXISTS icon_type INTEGER,
    ADD COLUMN IF NOT EXISTS sim_card TEXT,
    ADD COLUMN IF NOT EXISTS odometer_reading NUMERIC,
    ADD COLUMN IF NOT EXISTS last_maintenance_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_maintenance_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS insurance_expiry TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS registration_expiry TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS notes TEXT;
    
    -- Add status column with type if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'status') THEN
      ALTER TABLE public.vehicles ADD COLUMN status public.vehicle_status DEFAULT 'active';
    END IF;
  END IF;
END $$;

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicles"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON public.vehicles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vehicles"
  ON public.vehicles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all vehicles"
  ON public.vehicles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry TIMESTAMPTZ,
  phone TEXT,
  email TEXT,
  address TEXT,
  date_of_birth TIMESTAMPTZ,
  hire_date TIMESTAMPTZ,
  qualification_certificate TEXT,
  photo_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  status public.driver_status DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drivers"
  ON public.drivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drivers"
  ON public.drivers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drivers"
  ON public.drivers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drivers"
  ON public.drivers FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all drivers"
  ON public.drivers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all drivers"
  ON public.drivers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create vehicle_assignments table
CREATE TABLE IF NOT EXISTS public.vehicle_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  is_current BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicle assignments"
  ON public.vehicle_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicle assignments"
  ON public.vehicle_assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle assignments"
  ON public.vehicle_assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicle assignments"
  ON public.vehicle_assignments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vehicle assignments"
  ON public.vehicle_assignments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all vehicle assignments"
  ON public.vehicle_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create gps_tracking table
CREATE TABLE IF NOT EXISTS public.gps_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude NUMERIC,
  speed NUMERIC,
  heading NUMERIC,
  accuracy NUMERIC,
  gps_time TIMESTAMPTZ NOT NULL,
  server_time TIMESTAMPTZ DEFAULT now(),
  address TEXT,
  battery_level INTEGER,
  fuel_level NUMERIC,
  engine_status BOOLEAN,
  odometer NUMERIC,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_gps_tracking_vehicle_time ON public.gps_tracking(vehicle_id, gps_time DESC);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_user_time ON public.gps_tracking(user_id, gps_time DESC);

ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gps tracking"
  ON public.gps_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gps tracking"
  ON public.gps_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can insert gps tracking"
  ON public.gps_tracking FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all gps tracking"
  ON public.gps_tracking FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL,
  trip_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  start_location_lat NUMERIC,
  start_location_lng NUMERIC,
  start_address TEXT,
  end_location_lat NUMERIC,
  end_location_lng NUMERIC,
  end_address TEXT,
  distance NUMERIC,
  duration INTEGER,
  avg_speed NUMERIC,
  max_speed NUMERIC,
  idle_time INTEGER,
  fuel_consumed NUMERIC,
  route_data JSONB,
  status public.trip_status DEFAULT 'ongoing',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_vehicle_time ON public.trips(vehicle_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_trips_user_time ON public.trips(user_id, start_time DESC);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage trips"
  ON public.trips FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all trips"
  ON public.trips FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all trips"
  ON public.trips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  alert_type public.alert_type NOT NULL,
  severity public.alert_severity DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  alert_time TIMESTAMPTZ NOT NULL,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_address TEXT,
  speed NUMERIC,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_time ON public.alerts(user_id, alert_time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_time ON public.alerts(vehicle_id, alert_time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON public.alerts(user_id, is_read) WHERE is_read = false;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all alerts"
  ON public.alerts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all alerts"
  ON public.alerts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create push_tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(token)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push tokens"
  ON public.push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens"
  ON public.push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens"
  ON public.push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens"
  ON public.push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_credentials_updated_at
  BEFORE UPDATE ON public.api_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();