// ============================================================
// TEST FOCO — reglas (sin texto). Del especialista al multipotencial.
//
// 25 frases, escala 1-5. Cada frase pertenece a una dimensión (k) y
// empuja hacia el polo B (d = +1: muchas cosas / integración alta) o
// hacia el polo A (d = -1). Cálculo determinista, cero IA: el mismo
// en cliente y en lo que se guarda en foco_results.
//
// Los textos visibles viven en lib/foco-content.ts (ES/CA/EN). Aquí
// solo hay códigos, independientes del idioma.
// ============================================================

export type FocoDim = 'int' | 'ene' | 'rit' | 'ide'
export type FocoKey = FocoDim | 'gin'
export type FocoZone = 'A' | 'M' | 'B'
export type FocoInteg = 'L' | 'M' | 'H'

// Orden canónico de las preguntas. El texto de cada una está en el
// mismo índice de getFocoQuestions(locale).
export const FOCO_ITEMS: { k: FocoKey; d: 1 | -1 }[] = [
  { k: 'int', d: 1 }, { k: 'ene', d: 1 }, { k: 'rit', d: 1 }, { k: 'ide', d: 1 }, { k: 'gin', d: 1 },
  { k: 'int', d: -1 }, { k: 'ene', d: -1 }, { k: 'rit', d: -1 }, { k: 'ide', d: -1 }, { k: 'gin', d: -1 },
  { k: 'int', d: 1 }, { k: 'ene', d: 1 }, { k: 'rit', d: 1 }, { k: 'ide', d: 1 }, { k: 'gin', d: 1 },
  { k: 'int', d: -1 }, { k: 'ene', d: -1 }, { k: 'rit', d: -1 }, { k: 'ide', d: -1 }, { k: 'gin', d: -1 },
  { k: 'int', d: 1 }, { k: 'ene', d: 1 }, { k: 'rit', d: 1 }, { k: 'ide', d: 1 }, { k: 'gin', d: 1 },
]

export const FOCO_DIMS: FocoDim[] = ['int', 'ene', 'rit', 'ide']
export const FOCO_TOTAL = FOCO_ITEMS.length

export type FocoAnswers = (number | null)[]

export interface FocoResult {
  scores: Record<FocoKey, number>
  profile: FocoZone
  integ: FocoInteg
}

// 0-100 por dimensión. Sin respuestas, 50 (en medio).
export function focoScore(answers: FocoAnswers, k: FocoKey): number {
  let s = 0
  let n = 0
  FOCO_ITEMS.forEach((q, i) => {
    const v = answers[i]
    if (q.k === k && typeof v === 'number' && v >= 1 && v <= 5) {
      s += q.d > 0 ? v : 6 - v
      n++
    }
  })
  return n ? Math.round(((s / n - 1) / 4) * 100) : 50
}

export const focoZone = (v: number): FocoZone => (v < 38 ? 'A' : v > 62 ? 'B' : 'M')
export const focoIntegZone = (v: number): FocoInteg => (v < 38 ? 'L' : v > 62 ? 'H' : 'M')

export function computeFoco(answers: FocoAnswers): FocoResult {
  const scores = {
    int: focoScore(answers, 'int'),
    ene: focoScore(answers, 'ene'),
    rit: focoScore(answers, 'rit'),
    ide: focoScore(answers, 'ide'),
    gin: focoScore(answers, 'gin'),
  }
  const avg = FOCO_DIMS.reduce((a, k) => a + scores[k], 0) / FOCO_DIMS.length
  return { scores, profile: focoZone(avg), integ: focoIntegZone(scores.gin) }
}

export function isCompleteFoco(answers: unknown): answers is number[] {
  return (
    Array.isArray(answers) &&
    answers.length === FOCO_TOTAL &&
    answers.every(v => typeof v === 'number' && v >= 1 && v <= 5)
  )
}
