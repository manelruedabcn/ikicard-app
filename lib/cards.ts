// Cartas jugables del mazo IKICARD (68 total)
const range = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => {
    const n = from + i
    return `${prefix}${n.toString().padStart(2, '0')}`
  })

export const PLAYABLE_CARDS: string[] = [
  ...range('D', 1, 15), // Despertar
  ...range('E', 1, 15), // Descender
  ...range('A', 1, 15), // Atravesar
  ...range('R', 1, 15), // Retornar
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', // Wildcards
]

// Todas las cartas del mazo (incluye separadores e instrucciones)
export const ALL_CARDS: string[] = [
  ...PLAYABLE_CARDS,
  'F1', 'F2', 'F3', 'F4',
  'I1',
]
