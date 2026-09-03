-- =============================================================================
-- KAIROS ADDIS AUTO DEALERSHIP - PRODUCTION SUPABASE SQL MIGRATION
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS (Synced with customer accounts and Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_otp TEXT,
  verification_otp_expires BIGINT,
  password_hash TEXT,
  reset_token TEXT,
  reset_token_expiry BIGINT,
  last_resend_at BIGINT,
  last_reset_requested_at BIGINT,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. PORTAL VEHICLES (Customer Registered / Owned EVs)
CREATE TABLE IF NOT EXISTS public.portal_vehicles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  registration_number TEXT,
  vin TEXT NOT NULL,
  purchase_date TEXT,
  color TEXT,
  mileage_km INTEGER NOT NULL DEFAULT 0,
  battery_health_percent NUMERIC(5,2) NOT NULL DEFAULT 100,
  battery_capacity TEXT,
  estimated_range_km INTEGER,
  charge_status_percent INTEGER NOT NULL DEFAULT 100,
  tire_pressure_psi JSONB DEFAULT '{"frontLeft": 36, "frontRight": 36, "rearLeft": 38, "rearRight": 38}'::jsonb,
  warranty_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (warranty_status IN ('ACTIVE', 'EXPIRED', 'PENDING')),
  software_version TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_vehicles_user_id ON public.portal_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_vehicles_vin ON public.portal_vehicles(vin);

-- 3. WARRANTIES (YouGuard Warranty Contracts)
CREATE TABLE IF NOT EXISTS public.portal_warranties (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT REFERENCES public.portal_vehicles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'PENDING')),
  partner TEXT NOT NULL DEFAULT 'YouGuard Warranty Services (Official Partner)',
  certificate_number TEXT NOT NULL,
  start_date TEXT,
  vehicle_warranty_start_date TEXT,
  vehicle_warranty_years INTEGER NOT NULL DEFAULT 5,
  vehicle_warranty_km INTEGER DEFAULT 100000,
  vehicle_warranty_end_date TEXT,
  battery_warranty_start_date TEXT,
  battery_warranty_years INTEGER NOT NULL DEFAULT 8,
  battery_warranty_km INTEGER DEFAULT 160000,
  battery_warranty_end_date TEXT,
  current_km INTEGER NOT NULL DEFAULT 0,
  covered_components JSONB DEFAULT '[]'::jsonb,
  recent_claims JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_warranties_user_id ON public.portal_warranties(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_warranties_cert ON public.portal_warranties(certificate_number);

-- 4. SERVICE RECORDS (Maintenance History)
CREATE TABLE IF NOT EXISTS public.portal_service_records (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT REFERENCES public.portal_vehicles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  service_type TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'In Progress', 'Scheduled', 'Cancelled')),
  mileage INTEGER NOT NULL DEFAULT 0,
  facility TEXT NOT NULL,
  technician TEXT,
  cost_etb NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  items_serviced JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_service_records_user_id ON public.portal_service_records(user_id);

-- 5. APPOINTMENTS (Service & Maintenance Booking)
CREATE TABLE IF NOT EXISTS public.portal_appointments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT,
  service_type TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Confirmed', 'Pending', 'Completed', 'Cancelled')),
  message TEXT,
  facility TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_appointments_user_id ON public.portal_appointments(user_id);

-- 6. TEST DRIVES (VIP Test Drive Bookings)
CREATE TABLE IF NOT EXISTS public.portal_test_drives (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_name TEXT NOT NULL,
  vehicle_id TEXT,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Confirmed', 'Pending Review', 'Completed', 'Cancelled')),
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_test_drives_user_id ON public.portal_test_drives(user_id);

-- 7. NOTIFICATIONS (Customer Alerts)
CREATE TABLE IF NOT EXISTS public.portal_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('service', 'warranty', 'appointment', 'system', 'update')),
  date TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_notifications_user_id ON public.portal_notifications(user_id);

-- 8. ORDERS (Vehicle Reservation & Import Contracts)
CREATE TABLE IF NOT EXISTS public.portal_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL,
  vehicle_name TEXT NOT NULL,
  vehicle_brand TEXT NOT NULL,
  vehicle_image TEXT NOT NULL,
  price_etb NUMERIC(14,2),
  price_formatted_etb TEXT,
  price_formatted TEXT,
  selected_color TEXT NOT NULL,
  notes TEXT,
  order_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Order Received',
  step_progress INTEGER NOT NULL DEFAULT 1,
  delivery_location TEXT,
  vin TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_orders_user_id ON public.portal_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_orders_number ON public.portal_orders(order_number);

-- 9. USER DOCUMENTS (Fayda ID & Driving Licence Uploads)
CREATE TABLE IF NOT EXISTS public.user_documents (
  user_id TEXT PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  documents JSONB NOT NULL DEFAULT '{"faydaIdFront": null, "faydaIdBack": null, "drivingLicenceFront": null, "drivingLicenceBack": null}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. MESSAGES (Concierge & AI Conversations)
CREATE TABLE IF NOT EXISTS public.portal_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'support', 'admin', 'ai', 'user', 'advisor')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  channel TEXT DEFAULT 'concierge',
  subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_messages_user_id ON public.portal_messages(user_id);

-- 11. TESTIMONIALS (Customer Reviews)
CREATE TABLE IF NOT EXISTS public.portal_testimonials (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  vehicle_owned TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 12. CATALOG VEHICLES (Showroom Inventory)
CREATE TABLE IF NOT EXISTS public.catalog_vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  body_type TEXT NOT NULL,
  tagline TEXT,
  range_nedc TEXT,
  range_km INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  price_etb NUMERIC(14,2),
  price_formatted_etb TEXT,
  price_formatted TEXT,
  year INTEGER NOT NULL,
  acceleration TEXT,
  top_speed TEXT,
  battery_capacity TEXT,
  charging_time TEXT,
  drive_type TEXT,
  price_estimate TEXT,
  thumbnail TEXT,
  side_image TEXT,
  hero_image TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  features JSONB DEFAULT '{"safety": [], "comfort": [], "technology": []}'::jsonb,
  warranty_summary TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current_config',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. STORAGE BUCKETS
-- 'kairos-documents': Private storage for sensitive identity documents (Fayda ID, Driving Licence)
-- 'kairos-media': Public storage for vehicle and showroom media assets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('kairos-documents', 'kairos-documents', false),
  ('kairos-media', 'kairos-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Service role has full access; signed URLs or server proxy provide secure access
CREATE POLICY "Authenticated Upload to kairos-documents" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'kairos-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Public Read for kairos-media" ON storage.objects 
  FOR SELECT USING (bucket_id = 'kairos-media');
