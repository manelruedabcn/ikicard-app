// ============================================================
// IKICARD — Reglas del modo Viaje (21 días)
// ============================================================

export type Slot = 'morning' | 'midday' | 'night'
export type Phase = 'despertar' | 'descender' | 'atravesar' | 'retornar'

export const SLOTS: Slot[] = ['morning', 'midday', 'night']

// Hora local (0-23) a partir de la cual se desbloquea cada slot
export const SLOT_HOURS: Record<Slot, number> = {
  morning: 6,
  midday: 13,
  night: 20,
}

// Rango de días de cada fase
export const PHASE_DAYS: Record<Phase, [number, number]> = {
  despertar: [1, 5],
  descender: [6, 10],
  atravesar: [11, 15],
  retornar: [16, 21],
}

export const PHASE_ORDER: Phase[] = ['despertar', 'descender', 'atravesar', 'retornar']

// Umbrales: al entrar a estos días, primero se cruza el umbral de la fase previa
export const UMBRAL_ENTRY_DAYS: Record<number, Phase> = {
  6: 'despertar',
  11: 'descender',
  16: 'atravesar',
}

export function phaseForDay(day: number): Phase {
  if (day <= 5) return 'despertar'
  if (day <= 10) return 'descender'
  if (day <= 15) return 'atravesar'
  return 'retornar'
}

const range = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}${(from + i).toString().padStart(2, '0')}`)

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface Assignment {
  day: number
  slot: Slot
  card_code: string
}

// Genera las 63 cartas del viaje (3/día × 21 días), sin repetir dentro de cada fase.
// Días 16-21 (18 slots): 15 cartas R + 3 comodines X no vistos.
export function buildAssignment(): Assignment[] {
  const result: Assignment[] = []

  const fill = (fromDay: number, toDay: number, cards: string[]) => {
    const deck = shuffle(cards)
    let idx = 0
    for (let day = fromDay; day <= toDay; day++) {
      for (const slot of SLOTS) {
        result.push({ day, slot, card_code: deck[idx++] })
      }
    }
  }

  fill(1, 5, range('D', 1, 15))
  fill(6, 10, range('E', 1, 15))
  fill(11, 15, range('A', 1, 15))

  // Retornar: R01-R15 + 3 comodines X
  const retornar = [...range('R', 1, 15), ...shuffle(['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8']).slice(0, 3)]
  fill(16, 21, retornar)

  return result
}

// current_day = días transcurridos desde started_at + 1 (máx 21)
export function computeCurrentDay(startedAt: string): number {
  const start = new Date(startedAt)
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const now = new Date()
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((nowMidnight.getTime() - startMidnight.getTime()) / 86400000)
  return Math.min(21, Math.max(1, diffDays + 1))
}

// ¿Está desbloqueado este slot en el día actual? (por hora local)
export function isSlotUnlocked(slot: Slot, isCurrentDay: boolean): boolean {
  if (!isCurrentDay) return true // días pasados: todo desbloqueado
  return new Date().getHours() >= SLOT_HOURS[slot]
}
