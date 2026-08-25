// ============================================================
// ASISTENTE DE ICONO — propone un icono ya puesto por ámbito.
// Cero IA, determinista: no inventa; lee lo que la persona ya
// respondió (máscara dominante · estrella dominante) y devuelve un
// icono de la biblioteca de 17, con su rationale en la voz de Manel.
//
//   Cuerpo y vida / Vínculos / Lo material → máscara dominante
//   Vocación                               → estrella dominante
//
// Si en un ámbito la máscara no está mapeada, esa tarjeta no recibe
// sugerencia (se comporta como hoy). Vocación siempre sugiere: la
// estrella dominante siempre existe si se hizo el test.
//
// Cuando quedan dos candidatos razonables, se ofrece UNA pregunta
// corta propia de icono para desempatar; la respuesta (un id de
// icono) cierra la elección. La salida se pinta ya puesta en la
// tarjeta y el usuario la puede cambiar o quitar siempre.
//
// Criterio cerrado y validado por Manel (2026-08-25). Fuente:
// docs/ikiboard.md §8. El icono `lugar` no se sugiere nunca a
// propósito: queda solo en la rejilla manual de Lo material.
//
// NOTA idioma: los rationale son la voz de Manel en ES (canónica).
// Falta la traducción EN; mientras tanto, en locale 'en' el rationale
// visible cae a una línea neutra. TODO(i18n): getter EN por ámbito.
// ============================================================

import type { IkiAmbitoId } from './ikiboard-content'
import type { EstrellaCode } from './estrellas-content'
import { computeDominant } from './estrellas-content'
import { contentLang } from './content-locale'

// Un icono con la razón por la que se propone.
export interface Candidato {
  icono: string
  rationale: string
}

// Pregunta corta de desempate, propia del icono (no la de un test).
// Cada opción resuelve directamente a un id de icono, para que la
// respuesta cierre la elección sin más pasos.
export interface PreguntaDesempate {
  texto: string
  opciones: { etiqueta: string; icono: string }[]
}

// La sugerencia que consume la UI. `icono` viene relleno con el
// candidato por defecto; si hay desempate y aún no se respondió,
// `preguntaDesempate` acompaña. `candidatos` es la lista corta por si
// la UI quiere ofrecerlos como atajo.
export interface IconoSugerido {
  candidatos: Candidato[]
  icono: string | null
  rationale: string | null
  preguntaDesempate?: PreguntaDesempate
}

// Lo que el asistente necesita de los tests. Todo puede venir vacío:
// si falta el dato de un ámbito, no se sugiere nada.
export interface IconoAsistenteInput {
  // Cuerpo y vida / Vínculos / Lo material salen de aquí.
  maskDominant: string | null
  // Vocación: las puntuaciones por frase del test de estrellas
  // (estrella_results.scores, forma {"1":4,...}). Se usa para elegir
  // dominante y detectar empates. Si no hay, Vocación no sugiere.
  estrellaScores?: Record<string, number> | null
  // Id de icono elegido en la pregunta de desempate, si ya se respondió.
  respuestaDesempate?: string | null
}

// -------------------- Tablas de datos (criterio cerrado) --------------------

type ReglaIconoMascara = {
  ambito: IkiAmbitoId
  principal: Candidato
  alternativo: Candidato
  preguntaDesempate: { texto: string; opcionPrincipal: string; opcionAlternativo: string }
}

// Clave = máscara dominante, en minúsculas (mask.dominant). Las máscaras
// que no aparecen no generan sugerencia en ningún ámbito.
export const REGLAS_ICONO_MASCARA: Record<string, ReglaIconoMascara> = {
  exigente: {
    ambito: 'cuerpo',
    principal: { icono: 'luna', rationale: 'Te lo proponemos por tu máscara dominante, la Exigente: rara vez te das permiso para parar sin haberlo merecido antes.' },
    alternativo: { icono: 'sol', rationale: 'Te lo proponemos por tu máscara dominante, la Exigente: a veces lo que hace falta no es parar, sino empezar algo sin exigirte que salga perfecto.' },
    preguntaDesempate: { texto: '¿Lo que más te cuesta darte hoy es parar, o es empezar sin la presión de hacerlo bien?', opcionPrincipal: 'Parar', opcionAlternativo: 'Empezar' },
  },
  victima: {
    ambito: 'cuerpo',
    principal: { icono: 'hoja', rationale: 'Te lo proponemos por tu máscara dominante, la Víctima: una hoja pequeña, prueba de que algo sigue creciendo aunque no lo controles todo.' },
    alternativo: { icono: 'corazon', rationale: 'Te lo proponemos por tu máscara dominante, la Víctima: tu cuerpo sigue ahí, acompañándote, aunque hoy sientas que nada depende de ti.' },
    preguntaDesempate: { texto: '¿Necesitas hoy una señal de que algo crece, o de que tu cuerpo todavía te sostiene?', opcionPrincipal: 'Crece', opcionAlternativo: 'Sostiene' },
  },
  manipuladora: {
    ambito: 'vinculos',
    principal: { icono: 'chat', rationale: 'Te lo proponemos por tu máscara dominante, la Manipuladora: dices lo que piensas, no lo que crees que el otro quiere oír.' },
    alternativo: { icono: 'personas', rationale: 'Te lo proponemos por tu máscara dominante, la Manipuladora: te dejas ver tal cual eres, no solo la versión calculada.' },
    preguntaDesempate: { texto: '¿Lo que te falta es decir una verdad concreta a alguien, o dejarte ver así delante de más de una persona?', opcionPrincipal: 'Verdad concreta', opcionAlternativo: 'Delante de varios' },
  },
  jueza: {
    ambito: 'vinculos',
    principal: { icono: 'manos', rationale: 'Te lo proponemos por tu máscara dominante, la Jueza: te acercas sin medir antes si el otro se lo merece.' },
    alternativo: { icono: 'personas', rationale: 'Te lo proponemos por tu máscara dominante, la Jueza: sueltas la distancia de seguridad con la gente, no solo con una persona.' },
    preguntaDesempate: { texto: '¿Lo que buscas es acercarte a alguien en concreto, o soltar la guardia con la gente en general?', opcionPrincipal: 'Alguien', opcionAlternativo: 'En general' },
  },
  complaciente: {
    ambito: 'vinculos',
    principal: { icono: 'regalo', rationale: 'Te lo proponemos por tu máscara dominante, la Complaciente: puedes dar sin que eso signifique desaparecer un poco cada vez.' },
    alternativo: { icono: 'personas', rationale: 'Te lo proponemos por tu máscara dominante, la Complaciente: puedes formar parte sin borrarte para encajar.' },
    preguntaDesempate: { texto: '¿Lo que quieres marcar es que puedes dar sin perderte, o que puedes estar sin desaparecer?', opcionPrincipal: 'Dar', opcionAlternativo: 'Estar' },
  },
  controladora: {
    ambito: 'material',
    principal: { icono: 'llave', rationale: 'Te lo proponemos por tu máscara dominante, la Controladora: tienes lo que necesitas, sin tener que vigilarlo todo el tiempo.' },
    alternativo: { icono: 'casa', rationale: 'Te lo proponemos por tu máscara dominante, la Controladora: puedes soltar el control de una cosa y comprobar que sigue en pie.' },
    preguntaDesempate: { texto: '¿Lo que necesitas soltar es la vigilancia sobre algo concreto, o la sensación de que todo depende de ti en casa?', opcionPrincipal: 'Algo concreto', opcionAlternativo: 'En casa' },
  },
  impostora: {
    ambito: 'material',
    principal: { icono: 'coche', rationale: 'Te lo proponemos por tu máscara dominante, la Impostora: lo que tienes es tuyo, no un préstamo que te puedan quitar.' },
    alternativo: { icono: 'montana', rationale: 'Te lo proponemos por tu máscara dominante, la Impostora: ya llegaste hasta aquí, y eso no te lo puede descontar nadie.' },
    preguntaDesempate: { texto: '¿Lo que quieres afirmar es que lo tuyo es tuyo sin condiciones, o que ya llegaste hasta aquí por ti mismo?', opcionPrincipal: 'Tuyo', opcionAlternativo: 'Llegaste' },
  },
}

// Vocación: mapeo directo estrella dominante → icono.
export const ICONO_POR_ESTRELLA: Record<EstrellaCode, Candidato> = {
  explorador: { icono: 'idea', rationale: 'Te lo proponemos por tu perfil Explorador: te mueve la curiosidad de descubrir, no la ruta ya trazada.' },
  comunicador: { icono: 'pluma', rationale: 'Te lo proponemos por tu perfil Comunicador: lo tuyo se dice, se comparte, se pone en palabras.' },
  protector: { icono: 'maletin', rationale: 'Te lo proponemos por tu perfil Protector: tu trabajo tiene sentido cuando cuida de alguien más.' },
  visionario: { icono: 'diana', rationale: 'Te lo proponemos por tu perfil Visionario: apuntas lejos, con una idea clara de adónde quieres llegar.' },
}

// Orden del propio test (no de "mejor a peor"): rompe el empate cuando la
// persona no responde la pregunta de desempate de Vocación.
const PRIORIDAD_ESTRELLA: EstrellaCode[] = ['explorador', 'comunicador', 'protector', 'visionario']

const DESEMPATE_VOCACION: Array<{
  par: [EstrellaCode, EstrellaCode]
  texto: string
  opcionA: { etiqueta: string; estrella: EstrellaCode }
  opcionB: { etiqueta: string; estrella: EstrellaCode }
}> = [
  { par: ['explorador', 'comunicador'], texto: '¿lo tuyo es descubrir algo nuevo, o contarlo?', opcionA: { etiqueta: 'Descubrir', estrella: 'explorador' }, opcionB: { etiqueta: 'Contarlo', estrella: 'comunicador' } },
  { par: ['explorador', 'protector'], texto: '¿lo tuyo es explorar terreno nuevo, o cuidar de quien tienes cerca?', opcionA: { etiqueta: 'Explorar', estrella: 'explorador' }, opcionB: { etiqueta: 'Cuidar', estrella: 'protector' } },
  { par: ['explorador', 'visionario'], texto: '¿te mueve la curiosidad del camino, o la claridad de adónde quieres llegar?', opcionA: { etiqueta: 'El camino', estrella: 'explorador' }, opcionB: { etiqueta: 'Adónde llegar', estrella: 'visionario' } },
  { par: ['comunicador', 'protector'], texto: '¿lo tuyo es compartir lo que piensas, o sostener a quien lo necesita?', opcionA: { etiqueta: 'Compartir', estrella: 'comunicador' }, opcionB: { etiqueta: 'Sostener', estrella: 'protector' } },
  { par: ['comunicador', 'visionario'], texto: '¿lo tuyo es la palabra, o el objetivo al que apunta esa palabra?', opcionA: { etiqueta: 'La palabra', estrella: 'comunicador' }, opcionB: { etiqueta: 'El objetivo', estrella: 'visionario' } },
  { par: ['protector', 'visionario'], texto: '¿lo tuyo es cuidar de cerca, o apuntar lejos?', opcionA: { etiqueta: 'Cerca', estrella: 'protector' }, opcionB: { etiqueta: 'Lejos', estrella: 'visionario' } },
]

// -------------------- Lógica (determinista) --------------------

// Devuelve el icono sugerido para un ámbito a partir de los tests.
// Puro: mismas entradas → misma sugerencia.
export function generarIconoSugerido(
  ambito: IkiAmbitoId,
  datosTests: IconoAsistenteInput,
  locale = 'es'
): IconoSugerido {
  return ambito === 'vocacion'
    ? resolverVocacion(datosTests, locale)
    : resolverMascara(ambito, datosTests, locale)
}

const VACIO: IconoSugerido = { candidatos: [], icono: null, rationale: null }

// Cuerpo/Vínculos/Material: la máscara dominante manda, si está mapeada
// y su ámbito coincide con el pedido.
function resolverMascara(
  ambito: IkiAmbitoId,
  datos: IconoAsistenteInput,
  locale: string
): IconoSugerido {
  const regla = datos.maskDominant ? REGLAS_ICONO_MASCARA[datos.maskDominant] : undefined
  if (!regla || regla.ambito !== ambito) return VACIO

  const candidatos = [regla.principal, regla.alternativo]
  const pregunta: PreguntaDesempate = {
    texto: regla.preguntaDesempate.texto,
    opciones: [
      { etiqueta: regla.preguntaDesempate.opcionPrincipal, icono: regla.principal.icono },
      { etiqueta: regla.preguntaDesempate.opcionAlternativo, icono: regla.alternativo.icono },
    ],
  }
  return resolverConRespuesta(candidatos, pregunta, datos.respuestaDesempate, locale, ambito)
}

// Vocación: la estrella con más puntuación. Si las dos más altas empatan,
// pregunta de desempate con la de mayor prioridad como salida por defecto.
function resolverVocacion(datos: IconoAsistenteInput, locale: string): IconoSugerido {
  if (!datos.estrellaScores) return VACIO
  const { totals } = computeDominant(datos.estrellaScores)
  const top1 = totals[0]
  const top2 = totals[1]
  if (!top1 || top1.total <= 0) return VACIO

  const dom = top1.code as EstrellaCode
  const hayEmpate = top2 && top2.total === top1.total

  if (!hayEmpate) {
    const cand = ICONO_POR_ESTRELLA[dom]
    return { candidatos: [cand], icono: cand.icono, rationale: rationale(cand, locale, 'vocacion') }
  }

  // Empate entre las dos más altas: se busca el par y se ordena por
  // prioridad del test (Explorador > Comunicador > Protector > Visionario).
  const a = dom
  const b = top2.code as EstrellaCode
  const [porDefecto, otra] = ordenarPorPrioridad(a, b)
  const entry = DESEMPATE_VOCACION.find(e => contienePar(e.par, a, b))
  const candDef = ICONO_POR_ESTRELLA[porDefecto]
  const candOtra = ICONO_POR_ESTRELLA[otra]
  const candidatos = [candDef, candOtra]

  const pregunta: PreguntaDesempate | undefined = entry && {
    texto: entry.texto,
    opciones: [
      { etiqueta: entry.opcionA.etiqueta, icono: ICONO_POR_ESTRELLA[entry.opcionA.estrella].icono },
      { etiqueta: entry.opcionB.etiqueta, icono: ICONO_POR_ESTRELLA[entry.opcionB.estrella].icono },
    ],
  }
  if (!pregunta) {
    return { candidatos, icono: candDef.icono, rationale: rationale(candDef, locale, 'vocacion') }
  }
  return resolverConRespuesta(candidatos, pregunta, datos.respuestaDesempate, locale, 'vocacion')
}

// Común: si hay respuesta y cae en un candidato, ese es el icono (sin
// pregunta). Si no, el primer candidato es la salida por defecto y la
// pregunta acompaña.
function resolverConRespuesta(
  candidatos: Candidato[],
  pregunta: PreguntaDesempate,
  respuesta: string | null | undefined,
  locale: string,
  ambito: IkiAmbitoId
): IconoSugerido {
  if (respuesta) {
    const elegido = candidatos.find(c => c.icono === respuesta)
    if (elegido) {
      return { candidatos, icono: elegido.icono, rationale: rationale(elegido, locale, ambito) }
    }
  }
  const def = candidatos[0]
  return { candidatos, icono: def.icono, rationale: rationale(def, locale, ambito), preguntaDesempate: pregunta }
}

// Ordena dos estrellas por el orden fijo del test.
function ordenarPorPrioridad(a: EstrellaCode, b: EstrellaCode): [EstrellaCode, EstrellaCode] {
  return PRIORIDAD_ESTRELLA.indexOf(a) <= PRIORIDAD_ESTRELLA.indexOf(b) ? [a, b] : [b, a]
}

function contienePar(par: [EstrellaCode, EstrellaCode], a: EstrellaCode, b: EstrellaCode): boolean {
  return (par[0] === a && par[1] === b) || (par[0] === b && par[1] === a)
}

// El rationale visible. ES = voz de Manel (canónica). EN aún sin traducir:
// línea neutra por ámbito hasta cerrar el copy EN. TODO(i18n).
function rationale(cand: Candidato, locale: string, ambito: IkiAmbitoId): string {
  if (contentLang(locale) !== 'en') return cand.rationale
  return ambito === 'vocacion'
    ? 'Suggested from your dominant star.'
    : 'Suggested from your dominant mask.'
}
