import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { unsubUrl } from '@/lib/notify'
import { sendProgramaEmail } from '@/lib/email'
import { syncCrmContact } from '@/lib/crm-sync'
import { getInvExercise } from '@/lib/inventario-content'
import { buildLectura, type ExerciseKey, type InvAnswers } from '@/lib/inventario'
import { encuentroEnVentana, madridParts, nextMonday, PROGRAMA_CHECKINS, semanaDeJueves, type ProgramaCheckin } from '@/lib/programa'
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

// PASO con cuenta solo cuando la verificación de cuentas de Supabase funcione
// (correo propio configurado). Mientras tanto, PASO sin registro.
const PASO_CON_CUENTA = process.env.PROGRAMA_PASO_CON_CUENTA === '1'

function links(insc: Inscripcion) {
  const l = lang(insc.locale)
  const libro = { es: '/es/libros/el-ikigai-que-no-te-contaron/', ca: '/ca/llibres/el-ikigai-que-no-te-contaron/', en: '/en/books/el-ikigai-que-no-te-contaron/' }[l]
  const librosPage = { es: '/es/libros/', ca: '/ca/llibres/', en: '/en/books/' }[l]
  const taller = { es: '/es/taller/', ca: '/ca/taller/', en: '/en/workshop/' }[l]
  return {
    // Con cuenta: el registro vuelve a /paso. Sin cuenta: directo a /paso.
    paso: PASO_CON_CUENTA ? `${APP_URL}/${l}/login?next=${encodeURIComponent(`/${l}/paso`)}` : `${APP_URL}/${l}/paso`,
    // El mismo enlace personal sirve para el primer test (entrada por la
    // página del programa) y para repetirlo en la semana 4.
    repetir: `${APP_URL}/${l}/inventario?prog=${insc.token}`,
    // Sin página propia del curso, no se ofrece (null).
    curso: process.env.PROGRAMA_CURSO_URL || null,
    libro: `${WEB_URL}${libro}`,
    libros: `${WEB_URL}${librosPage}`,
    // Taller presencial «Yo soy IKIGAIER» (cierre del programa).
    taller: `${WEB_URL}${taller}`,
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

function checkinLinks(insc: Inscripcion, semana: number): Record<ProgramaCheckin, string> {
  const l = lang(insc.locale)
  const url = (r: ProgramaCheckin) => `${APP_URL}/api/programa/checkin?t=${insc.token}&s=${semana}&r=${r}&l=${l}`
  return Object.fromEntries(PROGRAMA_CHECKINS.map(r => [r, url(r)])) as Record<ProgramaCheckin, string>
}

// Semana 3 (Atravesar): el hilo en el tiempo y cinco minutos de presencia al
// día. Si alguno coincide con el ejercicio que ya le dio su test, su relevo.
export function ejerciciosSemana3(first: string | null): { activo: ExerciseKey; consciente: ExerciseKey } {
  return {
    activo: first === 'tiempo' ? 'dejaste' : 'tiempo',
    consciente: first === 'cotidiano' ? 'pilares' : 'cotidiano',
  }
}

async function contexto(insc: Inscripcion, semanaCheckin: number | null = null): Promise<ProgramaContext> {
  const exercise = insc.first_exercise ? getInvExercise(insc.locale, insc.first_exercise as ExerciseKey) : null
  const s3 = ejerciciosSemana3(insc.first_exercise)
  return {
    startDate: insc.start_date,
    exercise,
    semana3: { activo: getInvExercise(insc.locale, s3.activo), consciente: getInvExercise(insc.locale, s3.consciente) },
    links: links(insc),
    encuentros: await encuentrosPara(insc),
    pasoConCuenta: PASO_CON_CUENTA,
    tieneTest: Boolean(insc.first_answers),
    checkin: semanaCheckin ? checkinLinks(insc, semanaCheckin) : null,
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
  const mail = t.semanal[key](await contexto(insc, semanaDeJueves(key)))

  // Lunes de las semanas 2-4: si el jueves anterior respondió «no» o «a
  // medias», el correo empieza reconociéndolo. Nunca bloquea nada.
  const m = /^semana(\d)$/.exec(key)
  if (m && Number(m[1]) > 1) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('programa_checkins')
      .select('respuesta')
      .eq('inscripcion_id', insc.id)
      .eq('semana', Number(m[1]) - 1)
      .maybeSingle()
    const linea = data?.respuesta ? t.retomar[data.respuesta as ProgramaCheckin] : undefined
    if (linea) mail.blocks.unshift({ kind: 'p', text: linea, muted: true })
  }
  return enviarUnaVez(insc, key, mail)
}

export async function enviarAvisoEncuentro(insc: Inscripcion, encuentro: { id: string; starts_at: string; url: string }) {
  const t = getProgramaTexts(insc.locale)
  const mail = t.encuentro(formatProgramaDateTime(insc.locale, encuentro.starts_at), encuentro.url)
  return enviarUnaVez(insc, `encuentro:${encuentro.id}`, mail)
}

// Doble confirmación. Pedir el programa crea (o reutiliza) una inscripción
// «pendiente»; la persona entra al pulsar «Confirmar mi plaza» en el correo
// de su devolución. Así nadie apunta un correo ajeno ni uno con errata.
export type PreparadaEstado = 'pendiente' | 'ya'

export async function prepararInscripcion(input: {
  email: string
  locale: string
  leadId: string | null
  userId: string | null
  attemptId: string | null
  // null: entra por la página del programa y aún no ha hecho el test.
  answers: InvAnswers | null
  origen: 'test' | 'programa'
}): Promise<{ inscripcion: Inscripcion; estado: PreparadaEstado }> {
  const admin = createAdminClient()
  const { data: activa } = await admin
    .from('programa_inscripciones')
    .select(INSCRIPCION_COLS)
    .eq('email', input.email)
    .eq('status', 'activa')
    .maybeSingle()
  if (activa) return { inscripcion: activa as Inscripcion, estado: 'ya' }

  // Los datos con los que entra son los de su último test: si repite el
  // Inventario antes de confirmar, la pendiente se actualiza (mismo enlace).
  // Sin test (página del programa) no se pisan unas respuestas anteriores.
  const datos: Record<string, unknown> = { locale: lang(input.locale) }
  if (input.leadId) datos.lead_id = input.leadId
  if (input.userId) datos.user_id = input.userId
  if (input.answers) {
    datos.first_attempt_id = input.attemptId
    datos.first_answers = input.answers
    datos.first_exercise = buildLectura(input.answers).exercise
  }
  const { data: pendiente } = await admin
    .from('programa_inscripciones')
    .select('id')
    .eq('email', input.email)
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const res = pendiente
    ? await admin.from('programa_inscripciones').update(datos).eq('id', pendiente.id).select(INSCRIPCION_COLS).single()
    : await admin
        .from('programa_inscripciones')
        // start_date provisional: el definitivo se fija al confirmar.
        .insert({ ...datos, email: input.email, origen: input.origen, status: 'pendiente', start_date: nextMonday(madridParts().date) })
        .select(INSCRIPCION_COLS)
        .single()
  if (res.error || !res.data) throw new Error(res.error?.message || 'inscripción no creada')
  return { inscripcion: res.data as Inscripcion, estado: 'pendiente' }
}

export async function enviarBienvenida(insc: Inscripcion): Promise<boolean> {
  const t = getProgramaTexts(insc.locale)
  const mail = t.bienvenida(await contexto(insc), formatProgramaDate(insc.locale, insc.start_date))
  return enviarUnaVez(insc, 'bienvenida', mail)
}

export function confirmarUrl(insc: Inscripcion): string {
  return `${APP_URL}/api/programa/confirmar?t=${insc.token}&l=${lang(insc.locale)}`
}

// Correo «Confirma tu plaza» para quien se apunta en la página del programa
// (quien viene del test lo recibe dentro de su devolución). Si lo vuelve a
// pedir, se reenvía, pero no más de una vez cada 10 minutos: nadie puede
// usar el formulario para llenar de correos el buzón de otra persona.
const REENVIO_MIN = 10

export async function enviarConfirmacion(insc: Inscripcion): Promise<boolean> {
  const admin = createAdminClient()
  const { data: previo } = await admin
    .from('programa_envios')
    .select('sent_at')
    .eq('inscripcion_id', insc.id)
    .eq('mensaje', 'confirmacion')
    .maybeSingle()
  if (previo?.sent_at && Date.now() - Date.parse(previo.sent_at) < REENVIO_MIN * 60_000) return false

  const t = getProgramaTexts(insc.locale)
  await sendProgramaEmail(insc.email, insc.locale, {
    subject: t.confirmar.subject,
    blocks: [
      { kind: 'p', text: t.confirmar.text },
      { kind: 'cta', href: confirmarUrl(insc), label: t.confirmar.button },
      { kind: 'p', text: t.confirmar.note, muted: true },
      { kind: 'sign', text: 'Manel' },
    ],
  }, null)
  await admin
    .from('programa_envios')
    .upsert({ inscripcion_id: insc.id, mensaje: 'confirmacion', sent_at: new Date().toISOString() }, { onConflict: 'inscripcion_id,mensaje' })
  return true
}

export type ConfirmarEstado = 'confirmada' | 'ya' | 'invalid'

// Pasa una inscripción pendiente a activa: empieza el lunes siguiente a hoy
// y recibe la bienvenida. Repetir el clic no hace nada (ya está activa).
export async function confirmarInscripcion(token: string): Promise<{ estado: ConfirmarEstado; inscripcion?: Inscripcion }> {
  const admin = createAdminClient()
  const insc = await inscripcionPorToken(token)
  if (!insc) return { estado: 'invalid' }
  if (insc.status === 'activa' || insc.status === 'completada') return { estado: 'ya', inscripcion: insc }
  if (insc.status !== 'pendiente') return { estado: 'invalid' }

  const { data, error } = await admin
    .from('programa_inscripciones')
    .update({ status: 'activa', start_date: nextMonday(madridParts().date), confirmed_at: new Date().toISOString() })
    .eq('id', insc.id)
    .eq('status', 'pendiente')
    .select(INSCRIPCION_COLS)
    .maybeSingle()
  // 23505: ya tiene otra inscripción activa con este correo (índice único).
  if (error?.code === '23505') return { estado: 'ya', inscripcion: insc }
  if (error) throw new Error(error.message)
  // Otra petición la confirmó a la vez: ya está dentro.
  if (!data) return { estado: 'ya', inscripcion: insc }
  const inscripcion = data as Inscripcion

  // Si la bienvenida falla, la persona ya está dentro: la tarea programada
  // la reintenta cada hora hasta su primer lunes.
  await enviarBienvenida(inscripcion).catch(err => console.error('[programa] bienvenida error:', err))

  // El consentimiento de marketing es el que dio (o no) al dejar su correo.
  let marketingConsent = false
  if (inscripcion.lead_id) {
    const { data: lead } = await admin.from('inventario_leads').select('consent').eq('id', inscripcion.lead_id).maybeSingle()
    marketingConsent = Boolean(lead?.consent)
  }
  await syncCrmContact({
    userId: insc.user_id,
    email: inscripcion.email,
    marketingConsent,
    sourceType: 'programa',
    sourceId: inscripcion.id,
    sourceDetail: { start_date: inscripcion.start_date, locale: inscripcion.locale },
  }).catch(err => console.error('[programa] crm sync error:', err))

  return { estado: 'confirmada', inscripcion }
}

type InscripcionToken = Inscripcion & { final_attempt_id: string | null; user_id: string | null }

export async function inscripcionPorToken(token: string): Promise<InscripcionToken | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('programa_inscripciones')
    .select(`${INSCRIPCION_COLS}, final_attempt_id, user_id`)
    .eq('token', token)
    .maybeSingle()
  return (data as InscripcionToken | null) ?? null
}

export { INSCRIPCION_COLS }
