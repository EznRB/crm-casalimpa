ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS series_id uuid;
CREATE INDEX IF NOT EXISTS idx_appointments_series ON public.appointments (series_id);

