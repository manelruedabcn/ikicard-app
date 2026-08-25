// ============================================================
// ASISTENTE DE ICONO — propone un icono ya puesto por ámbito.
// Cero IA, determinista, mismo espíritu que ikiboard-borrador.ts:
// no inventa; lee lo que la persona ya respondió y acota la
// biblioteca de 17 iconos a 3-4 candidatos por ámbito.
//
//   Cuerpo y vida / Vínculos / Lo material  → máscara dominante
//   Vocación                                → celda Estrella×CAMINO
//
// Si tras acotar queda un solo candidato razonable, ese es el
// icono. Si quedan varios, el asistente devuelve UNA pregunta
// corta propia de icono (no las de los tests principales) para
// desempatar entre esos candidatos. La salida se pinta ya puesta
// en la tarjeta, con una línea de rationale, y el usuario puede
// cambiarla o quitarla siempre (sin confirmación).
//
// Puro y determinista: mismas entradas → misma sugerencia.
// Bilingüe: la lógica va sobre códigos; solo el texto cambia por
// locale (contentLang), igual que el resto del contenido.
//
// NOTA (scaffolding): las tablas CANDIDATOS_* y PREGUNTAS_* están
// vacías a propósito. La maquinaria ya está completa; cerrar los
// candidatos y las preguntas de desempate en los próximos días es
// un cambio SOLO de datos, sin tocar esta lógica (crece por
// módulos, no por ifs). Fuente: docs/fuentes.md · docs/ikiboard.md.
// ============================================================

import type { IkiAmbitoId } from './ikiboard-content'
import type { MaskCode } from './masks-content'
import type { EstrellaCode } from './estrellas-content'
import type { CaminoCode } from './camino-content'
import { ALL_ICONS } from './ikiboard-icons'
import { contentLang } from './content-locale'

// Lo que el asistente necesita de los tests. Todo puede venir null:
// si falta el dato de un ámbito, no se sugiere nada (se cae al modo
// manual de siempre) y el tablero sigue funcionando.
export interface IconoAsistenteInput {
  // Cuerpo y vida / Vínculos / Lo material salen de la máscara.
  maskDominant: MaskCode | string | null
  // Vocación sale del cruce Estrella (fila) × CAMINO (columna).
  estrella: EstrellaCode | string | null
  camino: CaminoCode | string | null
  // Respuestas ya dadas a preguntas de desempate propias de icono,
  // por id de pregunta → id de opción elegida. Vacío la primera vez.
  desempate?: Record<string, string>
}

// Una pregunta corta de desempate, propia del icono (no la de un
// test). Cada opción resuelve directamente a un id de icono de la
// biblioteca, para que la respuesta cierre la elección sin más pasos.
export interface PreguntaDesempate {
  id: string
  pregunta: string
  opciones: { id: string; label: string; icono: string }[]
}

// La sugerencia que consume la UI. `icono` viene relleno cuando el
// asistente pudo decidir solo; si hace falta desempatar, `icono` es
// null y llega `preguntaDesempate`. `candidatos` son ids de la
// biblioteca (máx 3-4) por si la UI quiere ofrecerlos como atajo.
export interface IconoSugerido {
  candidatos: string[]
  icono: string | null
  rationale: string
  preguntaDesempate?: PreguntaDesempate
}

// -------------------- Tablas de datos (a cerrar) --------------------
// Candidatos por ámbito, indexados por el código del test que manda
// en ese ámbito. Ids deben existir en IKIBOARD_ICONS. Máx 3-4.

// Cuerpo y vida / Vínculos / Lo material: máscara dominante → candidatos.
// TODO(candidatos): cerrar en los próximos días (3-4 ids por máscara).
const CANDIDATOS_POR_MASCARA: Partial<Record<IkiAmbitoId, Partial<Record<MaskCode, string[]>>>> = {
  cuerpo: {},
  vinculos: {},
  material: {},
}

// Vocación: celda Estrella×CAMINO → candidatos. Clave `${estrella}:${camino}`.
// TODO(candidatos): cerrar en los próximos días (3-4 ids por celda relevante).
const CANDIDATOS_VOCACION: Record<string, string[]> = {}

// Preguntas de desempate por ámbito. Se usa la primera cuyas opciones
// caigan dentro de los candidatos vivos. TODO(preguntas): cerrar luego.
const PREGUNTAS_DESEMPATE: Partial<Record<IkiAmbitoId, PreguntaDesempate[]>> = {
  cuerpo: [],
  vinculos: [],
  material: [],
  vocacion: [],
}

// -------------------- Lógica (cerrada) --------------------

// Devuelve el icono sugerido para un ámbito a partir de los tests.
// Puro y determinista. Si no hay material, candidatos vacíos e
// `icono` null: la UI cae al selector manual de siempre.
export function generarIconoSugerido(
  ambito: IkiAmbitoId,
  datosTests: IconoAsistenteInput,
  locale = 'es'
): IconoSugerido {
  const en = contentLang(locale) === 'en'

  // 1) Acotar la biblioteca a los candidatos del ámbito, según el test
  //    que manda en él, y quedarnos solo con ids que existan de verdad.
  const brutos = ambito === 'vocacion'
    ? candidatosVocacion(datosTests)
    : candidatosPorMascara(ambito, datosTests.maskDominant)
  const candidatos = brutos.filter(existeIcono).slice(0, 4)

  const rationale = textoRationale(ambito, en)

  // 2) Sin candidatos → nada que proponer (modo manual).
  if (candidatos.length === 0) {
    return { candidatos, icono: null, rationale }
  }

  // 3) Un solo candidato → ese es el icono, sin preguntar.
  if (candidatos.length === 1) {
    return { candidatos, icono: candidatos[0], rationale }
  }

  // 4) Varios candidatos: ¿ya hay respuesta de desempate que resuelva?
  const pregunta = elegirPregunta(ambito, candidatos)
  if (pregunta) {
    const elegido = datosTests.desempate?.[pregunta.id]
    const opcion = elegido
      ? pregunta.opciones.find(o => o.id === elegido && candidatos.includes(o.icono))
      : undefined
    if (opcion) {
      return { candidatos, icono: opcion.icono, rationale }
    }
    // Aún sin respuesta: pedir el desempate.
    return { candidatos, icono: null, rationale, preguntaDesempate: pregunta }
  }

  // 5) Varios candidatos y sin pregunta que los separe: proponemos el
  //    primero (determinista) y dejamos el resto como atajo en la UI.
  return { candidatos, icono: candidatos[0], rationale }
}

// -------------------- Auxiliares --------------------

function candidatosPorMascara(
  ambito: IkiAmbitoId,
  maskDominant: string | null
): string[] {
  if (!maskDominant) return []
  return CANDIDATOS_POR_MASCARA[ambito]?.[maskDominant as MaskCode] ?? []
}

function candidatosVocacion(input: IconoAsistenteInput): string[] {
  if (!input.estrella || !input.camino) return []
  return CANDIDATOS_VOCACION[`${input.estrella}:${input.camino}`] ?? []
}

// Primera pregunta del ámbito cuyas opciones apunten a candidatos vivos.
function elegirPregunta(
  ambito: IkiAmbitoId,
  candidatos: string[]
): PreguntaDesempate | undefined {
  const preguntas = PREGUNTAS_DESEMPATE[ambito] ?? []
  return preguntas.find(p =>
    p.opciones.some(o => candidatos.includes(o.icono))
  )
}

function existeIcono(id: string): boolean {
  return ALL_ICONS.some(i => i.id === id)
}

// Línea breve de rationale, en la voz del método (sin nombrar el
// framework: solo "tu máscara", "tu estilo y tus capacidades").
function textoRationale(ambito: IkiAmbitoId, en: boolean): string {
  if (ambito === 'vocacion') {
    return en
      ? 'Suggested from where your style and your capabilities meet.'
      : 'Te lo proponemos por dónde se encuentran tu estilo y tus capacidades.'
  }
  return en
    ? 'Suggested from your dominant mask.'
    : 'Te lo proponemos por tu máscara dominante.'
}
