import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { unsubUrl } from '@/lib/notify'
import { sendProgramaEmail } from '@/lib/email'
import { getInvExercise } from '@/lib/inventario-content'
import { buildLectura, type ExerciseKey, type InvAnswers } from '@/lib/inventario'
import { encuentroEnVentana, madridParts, nextMonday } from '@/lib/programa'
import {
  formatProgramaDate,
  formatProgramaDateTime,
  getProgramaTexts,
  type ProgramaContext,
  type ProgramaMail,
} from '@/lib/programa-content'
import type { ProgramaSemanal } from '@/lib/programa'

// Servidor del programa «Un mes conociendo tu ikigai»: inscribir, construir
// cada correo con los datos de la persona y enviarlo una sola vez.

const APP_URL = 'https://app.ikigaier.com'
const WEB_URL = 'https://www.ikigaier.com'

export interface Inscripcion {
  id: string
  email: string
  locale: string
  start_date: string
  status: string
  token: string
  lead_id: string | null
  first_attempt_id: string | null
  first_answers: unknown
  first_exercise: string | null
}

const INSCRIPCION_COLS = 'id, email, locale, start_date, status, token, lead_id, first_attempt_id, first_answers, first_exercise'

function lang(locale: string): 'es' | 'ca' | 'en' {
  return locale === 'en' ? 'en' : locale === 'ca' ? 'ca' : 'es'
}

function links(insc: Inscripcion) {
  const l = lang(insc.locale)
  const libro = { es: '/es/libros/el-ikigai-que-no-te-contaron/', ca: '/ca/llibres/el-ikigai-que-no-te-contaron/', en: '/en/books/el-ikigai-que-no-te-contaron/' }[l]
  const talleres = { es: '/es/talleres/', ca: '/ca/tallers/', en: '/en/workshops/' }[l]
  return {
    // PASO se hace con cuenta dentro del programa: el registro vuelve a /paso.
    paso: `${APP_URL}/${l}/login?next=${encodeURIComponent(`/${l}/paso`)}`,
    repetir: `${APP_URL}/${l}/inventario?prog=${insc.token}`,
    // Mientras el curso online no tenga página propia, lleva a talleres.
    curso: process.env.PROGRAMA_CURSO_URL || `${WEB_URL}${talleres}`,
    libro: `${WEB_URL}${libro}`,
  }
}

// Encuentros en grupo que caen dentro del mes de la persona y aún no han pasado.
async function encuentrosPara(insc: Inscripcion) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('programa_encuentros')
    .select('id, starts_at, url, locale')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
  return (data || [])
    .filter(e => !e.locale || e.locale === lang(insc.locale))
    .filter(e => encuentroEnVentana(insc.start_date, madridParts(new Date(e.starts_at)).date))
    .map(e => ({ when: formatProgramaDateTime(insc.locale, e.starts_at), url: e.url as string }))
}

async function contexto(insc: Inscripcion): Promise<ProgramaContext> {
  const exercise = insc.first_exercise ? getInvExercise(insc.locale, insc.first_exercise as ExerciseKey) : null
  return {
    startDate: insc.start_date,
    exercise,
    links: links(insc),
    encuentros: await encuentrosPara(insc),
  }
}

// Envía un correo del programa UNA sola vez: primero reserva la fila en
// programa_envios (clave primaria inscripción + mensaje); si ya existía, no
// envía. Si el envío falla, libera la reserva para reintentar en la siguiente
// ejecución.
export async function enviarUnaVez(insc: Inscripcion, mensaje: string, mail: ProgramaMail): Promise<boolean> {
  const admin = createAdminClient()
  const { data: reservado, error } = await admin
    .from('programa_envios')
    .upsert({ inscripcion_id: insc.id, mensaje }, { onConflict: 'inscripcion_id,mensaje', ignoreDuplicates: true })
    .select('mensaje')
  if (error) throw new Error(error.message)
  if (!reservado || reservado.length === 0) return false

  try {
    await sendProgramaEmail(insc.email, insc.locale, mail, unsubUrl(`prog:${insc.id}`, insc.locale))
    return true
  } catch (err) {
    await admin.from('programa_envios').delete().eq('inscripcion_id', insc.id).eq('mensaje', mensaje)
    throw err
  }
}

export async function enviarSemanal(insc: Inscripcion, key: ProgramaSemanal): Promise<boolean> {
  const t = getProgramaTexts(insc.locale)
  const mail = t.semanal[key](await contexto(insc))
  return enviarUnaVez(insc, key, mail)
}

export async function enviarAvisoEncuentro(insc: Inscripcion, encuentro: { id: string; starts_at: string; url: string }) {
  const t = getProgramaTexts(insc.locale)
  const mail = t.encuentro(formatProgramaDateTime(insc.locale, encuentro.starts_at), encuentro.url)
  return enviarUnaVez(insc, `encuentro:${encuentro.id}`, mail)
}

// Inscribe a una persona (si no tiene ya una inscripción activa) y le envía
// la bienvenida con su fecha de inicio: el lunes siguiente.
export async function inscribirEnPrograma(input: {
  email: string
  locale: string
  leadId: string | null
  userId: string | null
  attemptId: string | null
  answers: InvAnswers
}): Promise<{ inscripcion: Inscripcion; nueva: boolean }> {
  const admin = createAdminClient()
  const { data: activa } = await admin
    .from('programa_inscripciones')
    .select(INSCRIPCION_COLS)
    .eq('email', input.email)
    .eq('status', 'activa')
    .maybeSingle()
  if (activa) return { inscripcion: activa as Inscripcion, nueva: false }

  const { data, error } = await admin
    .from('programa_inscripciones')
    .insert({
      email: input.email,
      locale: lang(input.locale),
      lead_id: input.leadId,
      user_id: input.userId,
      start_date: nextMonday(madridParts().date),
      first_attempt_id: input.attemptId,
      first_answers: input.answers,
      first_exercise: buildLectura(input.answers).exercise,
    })
    .select(INSCRIPCION_COLS)
    .single()
  if (error || !data) throw new Error(error?.message || 'inscripción no creada')
  const inscripcion = data as Inscripcion

  const t = getProgramaTexts(inscripcion.locale)
  const mail = t.bienvenida(await contexto(inscripcion), formatProgramaDate(inscripcion.locale, inscripcion.start_date))
  await enviarUnaVez(inscripcion, 'bienvenida', mail)
  return { inscripcion, nueva: true }
}

export async function inscripcionPorToken(token: string): Promise<(Inscripcion & { final_attempt_id: string | null }) | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('programa_inscripciones')
    .select(`${INSCRIPCION_COLS}, final_attempt_id`)
    .eq('token', token)
    .maybeSingle()
  return (data as (Inscripcion & { final_attempt_id: string | null }) | null) ?? null
}

export { INSCRIPCION_COLS }
