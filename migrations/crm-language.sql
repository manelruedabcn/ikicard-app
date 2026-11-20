-- IKIGAIER CRM · idioma del contacto
-- En qué idioma se nos ha dirigido la persona (es = castellano, ca, en).
-- Se rellena solo con el idioma de la página por la que entró (detail.locale
-- o detail.lang del origen) y se puede corregir a mano desde la ficha. Un
-- valor puesto a mano no se pisa en sincronizaciones posteriores.

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS language TEXT CHECK (language IN ('es', 'ca', 'en'));

-- Contactos existentes: el idioma del primer origen que lo traiga.
UPDATE public.crm_contacts c
SET language = s.lang
FROM (
  SELECT DISTINCT ON (contact_id)
         contact_id,
         lower(left(COALESCE(detail->>'locale', detail->>'lang'), 2)) AS lang
  FROM public.crm_contact_sources
  WHERE lower(left(COALESCE(detail->>'locale', detail->>'lang'), 2)) IN ('es', 'ca', 'en')
  ORDER BY contact_id, created_at ASC
) s
WHERE s.contact_id = c.id AND c.language IS NULL;
