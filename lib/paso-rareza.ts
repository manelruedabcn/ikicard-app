// Rareza estimada de cada forma de caminar (los 15 códigos de PASO).
// APROXIMACIÓN TEÓRICA a partir de las frecuencias poblacionales del DISC
// (S y C→O son los estilos más comunes; D→P es de lejos el más raro). NO son
// datos reales de usuarios: el orden de magnitud del ranking es razonable, los
// valores exactos no. Recalibrar contra datos reales cuando haya suficientes tests.

export type Rareza = 'frecuente' | 'habitual' | 'poco'

export const RAREZA: Record<string, Rareza> = {
  // Frecuentes: ejes comunes del DISC (S, O→C, A→I)
  SSSS: 'frecuente',
  OOOO: 'frecuente',
  AAAA: 'frecuente',
  // Menos habituales: combinaciones de ejes comunes
  SO: 'habitual',
  AS: 'habitual',
  AO: 'habitual',
  ASO: 'habitual',
  // Poco frecuentes: cualquier forma con Paso firme (P→D, el eje más raro) y el equilibrio
  PPPP: 'poco',
  PO: 'poco',
  PS: 'poco',
  PA: 'poco',
  PSO: 'poco',
  PAS: 'poco',
  PAO: 'poco',
  PASO: 'poco',
}

export function getRareza(codigo: string): Rareza {
  return RAREZA[codigo] ?? 'poco'
}
