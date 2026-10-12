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

export type ProgramaSemanal = 'semana1' | 'semana2' | 'semana3' | 'semana4' | 'cierre'

export const PROGRAMA_CALENDARIO: { key: ProgramaSemanal; day: number }[] = [
  { key: 'semana1', day: 0 },
  { key: 'semana2', day: 7 },
  { key: 'semana3', day: 14 },
  { key: 'semana4', day: 21 },
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

// Correos semanales que ya tocan y aún no se han enviado, en orden.
export function semanalesPendientes(start: string, today: string, enviados: Set<string>): ProgramaSemanal[] {
  return PROGRAMA_CALENDARIO
    .filter(c => addDays(start, c.day) <= today && !enviados.has(c.key))
    .map(c => c.key)
}

// ¿Cae un encuentro (fecha de Madrid) dentro del mes de esta persona?
export function encuentroEnVentana(start: string, encuentroDate: string): boolean {
  const d = daysBetween(start, encuentroDate)
  return d >= 0 && d <= PROGRAMA_VENTANA_DIAS
}
