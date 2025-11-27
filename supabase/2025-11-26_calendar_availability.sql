DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('scheduled','confirmed','in_progress','completed','cancelled');
  END IF;
END$$;

ALTER TABLE public.appointments
  ALTER COLUMN status TYPE appointment_status
  USING CASE
    WHEN status = 'in-progress' THEN 'in_progress'::appointment_status
    WHEN status = 'scheduled' THEN 'scheduled'::appointment_status
    WHEN status = 'confirmed' THEN 'confirmed'::appointment_status
    WHEN status = 'completed' THEN 'completed'::appointment_status
    WHEN status = 'cancelled' THEN 'cancelled'::appointment_status
    ELSE 'scheduled'::appointment_status
  END;

ALTER TABLE public.appointments ALTER COLUMN status SET DEFAULT 'scheduled';

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 60;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.appointments ALTER COLUMN created_at SET DEFAULT timezone('utc', now());
ALTER TABLE public.appointments ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'appointments_set_updated_at') THEN
    DROP TRIGGER appointments_set_updated_at ON public.appointments;
  END IF;
END$$;

CREATE TRIGGER appointments_set_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments (appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments (customer_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services (active);

