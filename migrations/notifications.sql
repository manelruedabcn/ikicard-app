-- ============================================================
-- IKIGAIER — Recordatorios por email del Viaje (tz-aware)
-- Ejecutar en el editor SQL de Supabase.
-- Idempotente: se puede volver a ejecutar sin romper nada.
-- ============================================================

-- Zona horaria del dispositivo del usuario (IANA, p.ej. "Europe/Madrid",
-- "America/Bogota") y baja voluntaria de los recordatorios.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_opt_out BOOLEAN DEFAULT false;

-- Marca del último día (fecha local del usuario) en que se envió recordatorio,
-- para no mandar más de uno por día.
ALTER TABLE journey_sessions ADD COLUMN IF NOT EXISTS last_reminder_on DATE;
