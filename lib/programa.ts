// ============================================================
// «UN MES CONOCIENDO TU IKIGAI» — calendario del programa (sin texto).
// Cada persona empieza el lunes siguiente a apuntarse. Los correos salen
// a las 8:00 de Madrid el día que toca: semana 1 (día 0), semana 2 (7),
// semana 3 (14), semana 4 (21) y cierre (28). Los encuentros en grupo
// que caen dentro de su mes se avisan la víspera.
// Texto visible en lib/programa-content.ts; definición en docs/programa.md.
// ============================================================

export const PROGRAMA_TZ = 'Europe/Madrid'
export const PROGRAMA_SEND_HOUR = 8
// Ventana en la que una persona recibe avisos de encuentros (días desde su inicio).
export const PROGRAMA_VENTANA_DIAS = 30

export type ProgramaSemanal =
  | 'semana1' | 'jueves1' | 'semana2' | 'jueves2' | 'semana3' | 'jueves3' | 'semana4' | 'jueves4' | 'cierre'
export type ProgramaCheckin = 'si' | 'medias' | 'no'
export const PROGRAMA_CHECKINS: ProgramaCheckin[] = ['si', 'medias', 'no']

// Lunes: el correo de la semana. Jueves: dos líneas, una pregunta y el clic
// de «¿lo has hecho?» (no bloquea nada).
export const PROGRAMA_CALENDARIO: { key: ProgramaSemanal; day: number }[] = [
  { key: 'semana1', day: 0 },
  { key: 'jueves1', day: 3 },
  { key: 'semana2', day: 7 },
  { key: 'jueves2', day: 10 },
  { key: 'semana3', day: 14 },
  { key: 'jueves3', day: 17 },
  { key: 'semana4', day: 21 },
  { key: 'jueves4', day: 24 },
  { key: 'cierre', day: 28 },
]

// Fecha (YYYY-MM-DD) y hora en Madrid para un instante dado.
export function madridParts(at: Date = new Date()): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PROGRAMA_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hour12: false,
  }).formatToParts(at)
  const get = (t: string) => parts.find(p => p.type === t)?.value || ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: parseInt(get('hour'), 10) % 24 }
}

// Suma días a una fecha YYYY-MM-DD (aritmética de calendario, sin horas).
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

// El lunes siguiente (nunca el mismo día: si hoy es lunes, el de la semana que viene).
export function nextMonday(date: string): string {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay() // 0 domingo … 6 sábado
  const diff = (8 - dow) % 7 || 7
  return addDays(date, diff)
}

// Correos que ya tocan y aún no se han enviado. Si se acumulan varios (una
// caída de varios días), solo vale el más reciente de cada tipo: no tiene
// sentido mandar hoy el recordatorio de un jueves pasado.
export function semanalesPendientes(start: string, today: string, enviados: Set<string>): ProgramaSemanal[] {
  const vencidos = PROGRAMA_CALENDARIO.filter(c => addDays(start, c.day) <= today)
  const ultimo = vencidos[vencidos.length - 1]
  return vencidos
    .filter(c => !enviados.has(c.key))
    // Los jueves atrasados se descartan; los lunes y el cierre, no.
    .filter(c => !c.key.startsWith('jueves') || c === ultimo)
    .map(c => c.key)
}

// Número de semana (1-4) de un correo de jueves.
export function semanaDeJueves(key: ProgramaSemanal): number | null {
  const m = /^jueves(\d)$/.exec(key)
  return m ? Number(m[1]) : null
}

// ¿Cae un encuentro (fecha de Madrid) dentro del mes de esta persona?
export function encuentroEnVentana(start: string, encuentroDate: string): boolean {
  const d = daysBetween(start, encuentroDate)
  return d >= 0 && d <= PROGRAMA_VENTANA_DIAS
}

// La libreta del programa en el panel (/mes): qué campos acompañan a cada
// correo. Códigos independientes del idioma; las etiquetas, en
// lib/programa-content.ts (libreta.campos).
export type ProgramaCampo =
  | 'ancla' | 'ejercicio1' | 'notado'
  | 'temo' | 'frase_madre' | 'voz' | 'edad' | 'protegia' | 'cierre_voz'
  | 'activo' | 'consciente' | 'excepcion' | 'conducta' | 'paso_real'
  | 'excusa' | 'ruido' | 'gesto' | 'accion' | 'revision'

export const PROGRAMA_LIBRETA: Record<ProgramaSemanal, ProgramaCampo[]> = {
  semana1: ['ancla', 'ejercicio1'],
  jueves1: ['notado'],
  semana2: ['temo', 'frase_madre', 'voz', 'edad'],
  jueves2: ['protegia', 'cierre_voz'],
  semana3: ['activo', 'consciente'],
  jueves3: ['excepcion', 'conducta', 'paso_real'],
  semana4: ['excusa', 'ruido', 'gesto'],
  jueves4: ['accion', 'revision'],
  cierre: [],
}

export const PROGRAMA_CAMPOS: ProgramaCampo[] = Object.values(PROGRAMA_LIBRETA).flat()
export const PROGRAMA_TEXTO_MAX = 2000
