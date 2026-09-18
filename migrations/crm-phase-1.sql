-- IKIGAIER CRM · fase 1
-- Contacto único, orígenes, etiquetas, notas y próxima acción.

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'cliente', 'inactivo')),
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  next_action TEXT,
  next_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL OR user_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS crm_contacts_name_idx ON public.crm_contacts (lower(first_name));
CREATE INDEX IF NOT EXISTS crm_contacts_next_action_idx ON public.crm_contacts (next_action_at);

CREATE TABLE IF NOT EXISTS public.crm_contact_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL DEFAULT '',
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, source_type, source_id)
);

CREATE TABLE IF NOT EXISTS public.crm_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#c2866b',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS crm_tags_name_unique ON public.crm_tags (lower(name));

CREATE TABLE IF NOT EXISTS public.crm_contact_tags (
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.crm_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_notes_contact_idx ON public.crm_notes (contact_id, created_at DESC);

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

-- Sin políticas para navegador: el CRM se consulta exclusivamente desde el
-- servidor con service_role, después de comprobar is_admin.

-- Usuarios existentes.
INSERT INTO public.crm_contacts (user_id, first_name, email, created_at, updated_at)
SELECT u.id, COALESCE(p.display_name, split_part(u.email, '@', 1), ''), lower(u.email), u.created_at, now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  user_id = COALESCE(public.crm_contacts.user_id, EXCLUDED.user_id),
  first_name = CASE WHEN public.crm_contacts.first_name = '' THEN EXCLUDED.first_name ELSE public.crm_contacts.first_name END,
  updated_at = now();

INSERT INTO public.crm_contact_sources (contact_id, source_type, source_id, created_at)
SELECT c.id, 'registro', u.id::text, u.created_at
FROM auth.users u JOIN public.crm_contacts c ON c.email = lower(u.email)
ON CONFLICT DO NOTHING;

-- Leads PASO existentes; solo consent=true habilita marketing.
INSERT INTO public.crm_contacts (user_id, first_name, email, marketing_consent, marketing_consent_at, unsubscribed_at, created_at, updated_at)
SELECT pl.user_id, split_part(pl.email, '@', 1), lower(pl.email), pl.consent,
       CASE WHEN pl.consent THEN pl.created_at ELSE NULL END, pl.unsubscribed_at, pl.created_at, now()
FROM public.paso_leads pl
ON CONFLICT (email) DO UPDATE SET
  user_id = COALESCE(public.crm_contacts.user_id, EXCLUDED.user_id),
  marketing_consent = public.crm_contacts.marketing_consent OR EXCLUDED.marketing_consent,
  marketing_consent_at = COALESCE(public.crm_contacts.marketing_consent_at, EXCLUDED.marketing_consent_at),
  unsubscribed_at = COALESCE(EXCLUDED.unsubscribed_at, public.crm_contacts.unsubscribed_at),
  updated_at = now();

INSERT INTO public.crm_contact_sources (contact_id, source_type, source_id, detail, created_at)
SELECT c.id, 'paso', pl.id::text, jsonb_build_object('codigo', pl.codigo_patron, 'locale', pl.locale), pl.created_at
FROM public.paso_leads pl JOIN public.crm_contacts c ON c.email = lower(pl.email)
ON CONFLICT DO NOTHING;

-- Inscripciones existentes. Haber aceptado la privacidad del formulario no
-- equivale a consentimiento para campañas: marketing_consent permanece false.
INSERT INTO public.crm_contacts (first_name, email, created_at, updated_at)
SELECT tr.nombre, lower(tr.contacto), tr.created_at, now()
FROM public.taller_registros tr
WHERE tr.tipo_contacto = 'email'
ON CONFLICT (email) DO UPDATE SET
  first_name = CASE WHEN public.crm_contacts.first_name = '' THEN EXCLUDED.first_name ELSE public.crm_contacts.first_name END,
  updated_at = now();

INSERT INTO public.crm_contacts (first_name, phone, created_at, updated_at)
SELECT tr.nombre, tr.contacto_normalizado, tr.created_at, now()
FROM public.taller_registros tr
WHERE tr.tipo_contacto = 'telefono'
ON CONFLICT (phone) DO UPDATE SET
  first_name = CASE WHEN public.crm_contacts.first_name = '' THEN EXCLUDED.first_name ELSE public.crm_contacts.first_name END,
  updated_at = now();

INSERT INTO public.crm_contact_sources (contact_id, source_type, source_id, detail, created_at)
SELECT c.id, 'taller', tr.id::text,
       jsonb_build_object('event_code', tr.event_code, 'estado', tr.estado), tr.created_at
FROM public.taller_registros tr
JOIN public.crm_contacts c ON
  (tr.tipo_contacto = 'email' AND c.email = lower(tr.contacto)) OR
  (tr.tipo_contacto = 'telefono' AND c.phone = tr.contacto_normalizado)
ON CONFLICT DO NOTHING;

INSERT INTO public.crm_tags (name, color) VALUES
  ('Taller 29/9', '#c2866b'),
  ('PASO', '#7a8b6f'),
  ('Usuario plataforma', '#b89555')
ON CONFLICT DO NOTHING;

INSERT INTO public.crm_contact_tags (contact_id, tag_id)
SELECT DISTINCT s.contact_id, t.id
FROM public.crm_contact_sources s
JOIN public.crm_tags t ON t.name = CASE s.source_type
  WHEN 'taller' THEN 'Taller 29/9'
  WHEN 'paso' THEN 'PASO'
  WHEN 'registro' THEN 'Usuario plataforma'
END
WHERE s.source_type IN ('taller', 'paso', 'registro')
ON CONFLICT DO NOTHING;
