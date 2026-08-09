// Motor de SEGMENTOS y FIRMA de PASO.
// Adapta la mecánica clásica del DISC (dominio público) al universo Ikigaier:
// - Norming por dimensión: el score neto (MÁS − MENOS) se convierte en una
//   ZONA del 1 al 7, con umbrales propios de cada eje (así una "zona 6" en P
//   y una "zona 6" en O significan lo mismo respecto a la población).
// - FIRMA: la combinación de las 4 zonas (una de 7^4 = 2.401 posibles).
// - Regla de asignación: la firma se clasifica en uno de los 15 Caminantes.
//
// IMPORTANTE (frontera legal): tomamos SOLO la mecánica (norming, firma,
// clasificación por forma), que es DISC de manual = libre. Los nombres, la
// tabla de clasificación y los textos son 100% propios (los 15 Caminantes).
//
// Los umbrales vienen del norming clásico DISC mapeado P→D, A→I, S→S, O→C.
// Son PROVISIONALES hasta tener respuestas reales de PASO para recalibrar.

import { DIMS, getPatron, type Dim, type Patron } from './paso-content'

export const NUM_ZONAS = 7
export const ZONA_EQUILIBRIO = 4

// Clave de localStorage donde se guarda el resultado de quien hace el test SIN
// sesión, para insertarlo en cuanto se registre y entre (lo recoge el dashboard).
export const PASO_PENDING_KEY = 'paso_pending_result'

// Umbral MÍNIMO de score neto para alcanzar cada zona (2..7). Por debajo del
// primero, zona 1. Un umbral por dimensión = el norming.
const UMBRALES_ZONA: Record<Dim, number[]> = {
  // zona:      2    3    4   5   6   7
  P: [-7, -3, 0, 2, 5, 9],
  A: [-7, -3, -1, 2, 4, 7],
  S: [-10, -6, -3, 0, 3, 8],
  O: [-5, -2, 0, 3, 5, 9],
}

// Score neto de una dimensión → zona 1..7 según su norming.
export function zonaDe(dim: Dim, neto: number): number {
  let zona = 1
  UMBRALES_ZONA[dim].forEach((umbral, i) => {
    if (neto >= umbral) zona = i + 2
  })
  return zona
}

// Todos los ejes a la vez.
export function calcularSegmentos(scores: Record<Dim, number>): Record<Dim, number> {
  const seg = {} as Record<Dim, number>
  for (const d of DIMS) seg[d] = zonaDe(d, scores[d])
  return seg
}

// Firma legible: "P3·A7·S4·O1".
export function firmaTexto(seg: Record<Dim, number>): string {
  return DIMS.map(d => `${d}${seg[d]}`).join('·')
}

// Firma → código de Caminante. Un eje está "activo" si su zona ≥ 5 (por encima
// del equilibrio). Si ninguno destaca, se toman los de zona máxima. El formato
// del código replica el de los 15 patrones: 1 activo → letra ×4; 4 → "PASO".
export function resolverCodigoPorSegmentos(seg: Record<Dim, number>): string {
  let activos = DIMS.filter(d => seg[d] >= 5)
  if (activos.length === 0) {
    const max = Math.max(...DIMS.map(d => seg[d]))
    activos = DIMS.filter(d => seg[d] === max)
  }
  if (activos.length === 1) return activos[0].repeat(4)
  if (activos.length === 4) return 'PASO'
  return DIMS.filter(d => activos.includes(d)).join('')
}

// Atajo: de los scores netos directamente al Caminante.
export function caminanteDeSegmentos(scores: Record<Dim, number>): {
  segmentos: Record<Dim, number>
  firma: string
  codigo: string
  patron: Patron | undefined
} {
  const segmentos = calcularSegmentos(scores)
  const codigo = resolverCodigoPorSegmentos(segmentos)
  return {
    segmentos,
    firma: firmaTexto(segmentos),
    codigo,
    patron: getPatron(codigo),
  }
}
