import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncCrmContact } from '@/lib/crm-sync'

// Utilidades compartidas por los endpoints del Inventario honesto.

export function invLocale(value: unknown): 'es' | 'ca' | 'en' {
  return value === 'en' ? 'en' : value === 'ca' ? 'ca' : 'es'
}

// Origen del contacto (?src=blog, libro, taller…). Solo minúsculas, dígitos,
// guiones y guion bajo, para que la columna no acumule basura.
export function invSource(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40)
  return clean || null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function invUuid(value: unknown): string | null {
  return typeof value === 'string' && UUID_RE.test(value) ? value : null
}

// Usuario desde la sesión (cookie), nunca desde el body: null = anónimo.
// El email solo cuenta como verificado si Supabase lo ha confirmado.
export async function sessionUser(): Promise<{ id: string; verifiedEmail: string | null } | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    const u = data.user
    if (!u) return null
    return { id: u.id, verifiedEmail: u.email && u.email_confirmed_at ? u.email.toLowerCase() : null }
  } catch {
    return null
  }
}

export async function sessionUserId(): Promise<string | null> {
  return (await sessionUser())?.id ?? null
}

// Guarda (o actualiza) el contacto que deja su correo, desde el test o desde
// la página del programa, y lo refleja en el CRM. El consentimiento de
// marketing no se pierde si vuelve sin marcarlo; tampoco se da por supuesto.
export async function guardarLead(input: {
  email: string
  userId: string | null
  locale: string
  source: string | null
  consent: boolean
}): Promise<{ id: string; unsubscribed_at: string | null; consent: boolean }> {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const { data: existing } = await admin
    .from('inventario_leads')
    .select('id, consent, consent_at, source')
    .eq('email', input.email)
    .maybeSingle()
  const consent = Boolean(existing?.consent || input.consent)

  const { data: lead, error } = await admin
    .from('inventario_leads')
    .upsert(
      {
        email: input.email,
        user_id: input.userId,
        locale: input.locale,
        source: existing?.source || input.source,
        consent,
        consent_at: existing?.consent_at || (input.consent ? now : null),
        updated_at: now,
      },
      { onConflict: 'email' },
    )
    .select('id, unsubscribed_at')
    .single()
  if (error || !lead) throw new Error(error?.message || 'lead no guardado')

  await syncCrmContact({
    userId: input.userId,
    email: input.email,
    sourceType: 'inventario',
    sourceId: lead.id,
    sourceDetail: { locale: input.locale, source: input.source },
    marketingConsent: input.consent,
    unsubscribedAt: lead.unsubscribed_at,
  }).catch(err => console.error('[inventario lead] crm sync error:', err))

  return { id: lead.id, unsubscribed_at: lead.unsubscribed_at, consent }
}
