CREATE TABLE IF NOT EXISTS public.appointment_series (
  id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  service_id uuid NOT NULL REFERENCES public.services(id),
  start_date date NOT NULL,
  estimated_end_date date,
  status appointment_status NOT NULL DEFAULT 'in_progress',
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_series_customer ON public.appointment_series (customer_id);
CREATE INDEX IF NOT EXISTS idx_series_status ON public.appointment_series (status);

CREATE OR REPLACE FUNCTION public.series_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'appointment_series_set_updated_at') THEN
    DROP TRIGGER appointment_series_set_updated_at ON public.appointment_series;
  END IF;
END$$;

CREATE TRIGGER appointment_series_set_updated_at
BEFORE UPDATE ON public.appointment_series
FOR EACH ROW
EXECUTE FUNCTION public.series_set_updated_at();

