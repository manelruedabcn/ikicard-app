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
// Bilingüe: cada cadena lleva { es, en } co-locado y el getter la
// resuelve por locale (contentLang). Se usan las etiquetas EN reales
// de la app para máscaras (The Demanding One…) y estrellas (Explorer…).
// El copy EN son traducciones de trabajo; sustituir por el §4 validado.
// ============================================================

import type { IkiAmbitoId } from './ikiboard-content'
import type { EstrellaCode } from './estrellas-content'
import { computeDominant } from './estrellas-content'
import { contentLang } from './content-locale'

// Una cadena en los dos idiomas del contenido.
type Loc = { es: string; en: string }
const L = (s: Loc, en: boolean): string => (en ? s.en : s.es)

// -------- Tipos de salida (lo que consume la UI, ya localizado) --------

export interface Candidato {
  icono: string
  rationale: string
}

// Pregunta corta de desempate, propia del icono (no la de un test).
// Cada opción resuelve directamente a un id de icono.
export interface PreguntaDesempate {
  texto: string
  opciones: { etiqueta: string; icono: string }[]
}

export interface IconoSugerido {
  candidatos: Candidato[]
  icono: string | null
  rationale: string | null
  preguntaDesempate?: PreguntaDesempate
}

// Lo que el asistente necesita de los tests. Todo puede venir vacío.
export interface IconoAsistenteInput {
  // Cuerpo y vida / Vínculos / Lo material salen de aquí.
  maskDominant: string | null
  // Vocación: las puntuaciones por frase del test de estrellas
  // (estrella_results.scores, forma {"1":4,...}). Elige dominante y
  // detecta empates. Si no hay, Vocación no sugiere.
  estrellaScores?: Record<string, number> | null
  // Id de icono elegido en la pregunta de desempate, si ya se respondió.
  respuestaDesempate?: string | null
}

// -------------------- Tablas de datos (criterio cerrado) --------------------

type CandidatoBi = { icono: string; rationale: Loc }
type ReglaIconoMascara = {
  ambito: IkiAmbitoId
  principal: CandidatoBi
  alternativo: CandidatoBi
  pregunta: { texto: Loc; opcionPrincipal: Loc; opcionAlternativo: Loc }
}

// Clave = máscara dominante, en minúsculas (mask.dominant). Las máscaras
// que no aparecen no generan sugerencia en ningún ámbito.
const REGLAS_ICONO_MASCARA: Record<string, ReglaIconoMascara> = {
  exigente: {
    ambito: 'cuerpo',
    principal: { icono: 'luna', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Exigente: rara vez te das permiso para parar sin haberlo merecido antes.',
      en: 'We suggest it because of your dominant mask, The Demanding One: you rarely let yourself stop without having earned it first.' } },
    alternativo: { icono: 'sol', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Exigente: a veces lo que hace falta no es parar, sino empezar algo sin exigirte que salga perfecto.',
      en: 'We suggest it because of your dominant mask, The Demanding One: sometimes what you need isn’t to stop, but to begin something without demanding it turn out perfect.' } },
    pregunta: {
      texto: { es: '¿Lo que más te cuesta darte hoy es parar, o es empezar sin la presión de hacerlo bien?', en: 'What’s hardest to give yourself today — stopping, or beginning without the pressure to do it well?' },
      opcionPrincipal: { es: 'Parar', en: 'Stop' },
      opcionAlternativo: { es: 'Empezar', en: 'Begin' } },
  },
  victima: {
    ambito: 'cuerpo',
    principal: { icono: 'hoja', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Víctima: una hoja pequeña, prueba de que algo sigue creciendo aunque no lo controles todo.',
      en: 'We suggest it because of your dominant mask, The Victim: a small leaf, proof that something keeps growing even when you don’t control everything.' } },
    alternativo: { icono: 'corazon', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Víctima: tu cuerpo sigue ahí, acompañándote, aunque hoy sientas que nada depende de ti.',
      en: 'We suggest it because of your dominant mask, The Victim: your body is still here, with you, even if today it feels like nothing depends on you.' } },
    pregunta: {
      texto: { es: '¿Necesitas hoy una señal de que algo crece, o de que tu cuerpo todavía te sostiene?', en: 'Do you need a sign today that something is growing, or that your body still holds you up?' },
      opcionPrincipal: { es: 'Crece', en: 'Growing' },
      opcionAlternativo: { es: 'Sostiene', en: 'Holds me' } },
  },
  manipuladora: {
    ambito: 'vinculos',
    principal: { icono: 'chat', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Manipuladora: dices lo que piensas, no lo que crees que el otro quiere oír.',
      en: 'We suggest it because of your dominant mask, The Manipulator: you say what you think, not what you believe the other wants to hear.' } },
    alternativo: { icono: 'personas', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Manipuladora: te dejas ver tal cual eres, no solo la versión calculada.',
      en: 'We suggest it because of your dominant mask, The Manipulator: you let yourself be seen as you are, not just the calculated version.' } },
    pregunta: {
      texto: { es: '¿Lo que te falta es decir una verdad concreta a alguien, o dejarte ver así delante de más de una persona?', en: 'Is what you’re missing to tell one person a concrete truth, or to let yourself be seen like that in front of several?' },
      opcionPrincipal: { es: 'Verdad concreta', en: 'A concrete truth' },
      opcionAlternativo: { es: 'Delante de varios', en: 'In front of several' } },
  },
  jueza: {
    ambito: 'vinculos',
    principal: { icono: 'manos', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Jueza: te acercas sin medir antes si el otro se lo merece.',
      en: 'We suggest it because of your dominant mask, The Judge: you get close without first measuring whether the other deserves it.' } },
    alternativo: { icono: 'personas', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Jueza: sueltas la distancia de seguridad con la gente, no solo con una persona.',
      en: 'We suggest it because of your dominant mask, The Judge: you drop the safe distance with people, not just with one person.' } },
    pregunta: {
      texto: { es: '¿Lo que buscas es acercarte a alguien en concreto, o soltar la guardia con la gente en general?', en: 'Are you looking to get close to one particular person, or to lower your guard with people in general?' },
      opcionPrincipal: { es: 'Alguien', en: 'Someone' },
      opcionAlternativo: { es: 'En general', en: 'In general' } },
  },
  complaciente: {
    ambito: 'vinculos',
    principal: { icono: 'regalo', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Complaciente: puedes dar sin que eso signifique desaparecer un poco cada vez.',
      en: 'We suggest it because of your dominant mask, The People-Pleaser: you can give without it meaning you disappear a little each time.' } },
    alternativo: { icono: 'personas', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Complaciente: puedes formar parte sin borrarte para encajar.',
      en: 'We suggest it because of your dominant mask, The People-Pleaser: you can be part of things without erasing yourself to fit in.' } },
    pregunta: {
      texto: { es: '¿Lo que quieres marcar es que puedes dar sin perderte, o que puedes estar sin desaparecer?', en: 'What do you want to mark — that you can give without losing yourself, or that you can be there without disappearing?' },
      opcionPrincipal: { es: 'Dar', en: 'Give' },
      opcionAlternativo: { es: 'Estar', en: 'Be there' } },
  },
  controladora: {
    ambito: 'material',
    principal: { icono: 'llave', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Controladora: tienes lo que necesitas, sin tener que vigilarlo todo el tiempo.',
      en: 'We suggest it because of your dominant mask, The Controller: you have what you need, without having to watch over it all the time.' } },
    alternativo: { icono: 'casa', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Controladora: puedes soltar el control de una cosa y comprobar que sigue en pie.',
      en: 'We suggest it because of your dominant mask, The Controller: you can let go of controlling one thing and see that it stays standing.' } },
    pregunta: {
      texto: { es: '¿Lo que necesitas soltar es la vigilancia sobre algo concreto, o la sensación de que todo depende de ti en casa?', en: 'What do you need to let go of — keeping watch over one particular thing, or the sense that everything at home depends on you?' },
      opcionPrincipal: { es: 'Algo concreto', en: 'One thing' },
      opcionAlternativo: { es: 'En casa', en: 'At home' } },
  },
  impostora: {
    ambito: 'material',
    principal: { icono: 'coche', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Impostora: lo que tienes es tuyo, no un préstamo que te puedan quitar.',
      en: 'We suggest it because of your dominant mask, The Impostor: what you have is yours, not a loan someone can take back.' } },
    alternativo: { icono: 'montana', rationale: {
      es: 'Te lo proponemos por tu máscara dominante, la Impostora: ya llegaste hasta aquí, y eso no te lo puede descontar nadie.',
      en: 'We suggest it because of your dominant mask, The Impostor: you already made it this far, and no one can subtract that from you.' } },
    pregunta: {
      texto: { es: '¿Lo que quieres afirmar es que lo tuyo es tuyo sin condiciones, o que ya llegaste hasta aquí por ti mismo?', en: 'What do you want to affirm — that what’s yours is yours without conditions, or that you got here on your own?' },
      opcionPrincipal: { es: 'Tuyo', en: 'It’s yours' },
      opcionAlternativo: { es: 'Llegaste', en: 'You made it' } },
  },
}

// Vocación: mapeo directo estrella dominante → icono.
const ICONO_POR_ESTRELLA: Record<EstrellaCode, CandidatoBi> = {
  explorador: { icono: 'idea', rationale: {
    es: 'Te lo proponemos por tu perfil Explorador: te mueve la curiosidad de descubrir, no la ruta ya trazada.',
    en: 'We suggest it because of your Explorer profile: you’re driven by the curiosity to discover, not by the route already drawn.' } },
  comunicador: { icono: 'pluma', rationale: {
    es: 'Te lo proponemos por tu perfil Comunicador: lo tuyo se dice, se comparte, se pone en palabras.',
    en: 'We suggest it because of your Communicator profile: what’s yours gets said, shared, put into words.' } },
  protector: { icono: 'maletin', rationale: {
    es: 'Te lo proponemos por tu perfil Protector: tu trabajo tiene sentido cuando cuida de alguien más.',
    en: 'We suggest it because of your Protector profile: your work makes sense when it takes care of someone else.' } },
  visionario: { icono: 'diana', rationale: {
    es: 'Te lo proponemos por tu perfil Visionario: apuntas lejos, con una idea clara de adónde quieres llegar.',
    en: 'We suggest it because of your Visionary profile: you aim far, with a clear idea of where you want to get to.' } },
}

// Orden del propio test (no de "mejor a peor"): rompe el empate cuando la
// persona no responde la pregunta de desempate de Vocación.
const PRIORIDAD_ESTRELLA: EstrellaCode[] = ['explorador', 'comunicador', 'protector', 'visionario']

const DESEMPATE_VOCACION: Array<{
  par: [EstrellaCode, EstrellaCode]
  texto: Loc
  opcionA: { etiqueta: Loc; estrella: EstrellaCode }
  opcionB: { etiqueta: Loc; estrella: EstrellaCode }
}> = [
  { par: ['explorador', 'comunicador'], texto: { es: '¿lo tuyo es descubrir algo nuevo, o contarlo?', en: 'is yours to discover something new, or to tell it?' },
    opcionA: { etiqueta: { es: 'Descubrir', en: 'Discover' }, estrella: 'explorador' }, opcionB: { etiqueta: { es: 'Contarlo', en: 'Tell it' }, estrella: 'comunicador' } },
  { par: ['explorador', 'protector'], texto: { es: '¿lo tuyo es explorar terreno nuevo, o cuidar de quien tienes cerca?', en: 'is yours to explore new ground, or to care for those close to you?' },
    opcionA: { etiqueta: { es: 'Explorar', en: 'Explore' }, estrella: 'explorador' }, opcionB: { etiqueta: { es: 'Cuidar', en: 'Care' }, estrella: 'protector' } },
  { par: ['explorador', 'visionario'], texto: { es: '¿te mueve la curiosidad del camino, o la claridad de adónde quieres llegar?', en: 'are you driven by the curiosity of the path, or the clarity of where you want to arrive?' },
    opcionA: { etiqueta: { es: 'El camino', en: 'The path' }, estrella: 'explorador' }, opcionB: { etiqueta: { es: 'Adónde llegar', en: 'Where to arrive' }, estrella: 'visionario' } },
  { par: ['comunicador', 'protector'], texto: { es: '¿lo tuyo es compartir lo que piensas, o sostener a quien lo necesita?', en: 'is yours to share what you think, or to hold up those who need it?' },
    opcionA: { etiqueta: { es: 'Compartir', en: 'Share' }, estrella: 'comunicador' }, opcionB: { etiqueta: { es: 'Sostener', en: 'Hold up' }, estrella: 'protector' } },
  { par: ['comunicador', 'visionario'], texto: { es: '¿lo tuyo es la palabra, o el objetivo al que apunta esa palabra?', en: 'is yours the word, or the goal that word points to?' },
    opcionA: { etiqueta: { es: 'La palabra', en: 'The word' }, estrella: 'comunicador' }, opcionB: { etiqueta: { es: 'El objetivo', en: 'The goal' }, estrella: 'visionario' } },
  { par: ['protector', 'visionario'], texto: { es: '¿lo tuyo es cuidar de cerca, o apuntar lejos?', en: 'is yours to care up close, or to aim far?' },
    opcionA: { etiqueta: { es: 'Cerca', en: 'Up close' }, estrella: 'protector' }, opcionB: { etiqueta: { es: 'Lejos', en: 'Far' }, estrella: 'visionario' } },
]

// -------------------- Lógica (determinista) --------------------

// Devuelve el icono sugerido para un ámbito a partir de los tests.
// Puro: mismas entradas → misma sugerencia.
export function generarIconoSugerido(
  ambito: IkiAmbitoId,
  datosTests: IconoAsistenteInput,
  locale = 'es'
): IconoSugerido {
  const en = contentLang(locale) === 'en'
  return ambito === 'vocacion'
    ? resolverVocacion(datosTests, en)
    : resolverMascara(ambito, datosTests, en)
}

const VACIO: IconoSugerido = { candidatos: [], icono: null, rationale: null }

const localizar = (c: CandidatoBi, en: boolean): Candidato => ({ icono: c.icono, rationale: L(c.rationale, en) })

// Cuerpo/Vínculos/Material: la máscara dominante manda, si está mapeada
// y su ámbito coincide con el pedido.
function resolverMascara(ambito: IkiAmbitoId, datos: IconoAsistenteInput, en: boolean): IconoSugerido {
  const regla = datos.maskDominant ? REGLAS_ICONO_MASCARA[datos.maskDominant] : undefined
  if (!regla || regla.ambito !== ambito) return VACIO

  const candidatos = [localizar(regla.principal, en), localizar(regla.alternativo, en)]
  const pregunta: PreguntaDesempate = {
    texto: L(regla.pregunta.texto, en),
    opciones: [
      { etiqueta: L(regla.pregunta.opcionPrincipal, en), icono: regla.principal.icono },
      { etiqueta: L(regla.pregunta.opcionAlternativo, en), icono: regla.alternativo.icono },
    ],
  }
  return resolverConRespuesta(candidatos, pregunta, datos.respuestaDesempate)
}

// Vocación: la estrella con más puntuación. Si las dos más altas empatan,
// pregunta de desempate con la de mayor prioridad como salida por defecto.
function resolverVocacion(datos: IconoAsistenteInput, en: boolean): IconoSugerido {
  if (!datos.estrellaScores) return VACIO
  const { totals } = computeDominant(datos.estrellaScores)
  const top1 = totals[0]
  const top2 = totals[1]
  if (!top1 || top1.total <= 0) return VACIO

  const a = top1.code as EstrellaCode
  const hayEmpate = top2 && top2.total === top1.total
  if (!hayEmpate) {
    const cand = localizar(ICONO_POR_ESTRELLA[a], en)
    return { candidatos: [cand], icono: cand.icono, rationale: cand.rationale }
  }

  const b = top2.code as EstrellaCode
  const [porDefecto, otra] = ordenarPorPrioridad(a, b)
  const candidatos = [localizar(ICONO_POR_ESTRELLA[porDefecto], en), localizar(ICONO_POR_ESTRELLA[otra], en)]
  const entry = DESEMPATE_VOCACION.find(e => contienePar(e.par, a, b))
  const pregunta: PreguntaDesempate | undefined = entry && {
    texto: L(entry.texto, en),
    opciones: [
      { etiqueta: L(entry.opcionA.etiqueta, en), icono: ICONO_POR_ESTRELLA[entry.opcionA.estrella].icono },
      { etiqueta: L(entry.opcionB.etiqueta, en), icono: ICONO_POR_ESTRELLA[entry.opcionB.estrella].icono },
    ],
  }
  if (!pregunta) {
    const def = candidatos[0]
    return { candidatos, icono: def.icono, rationale: def.rationale }
  }
  return resolverConRespuesta(candidatos, pregunta, datos.respuestaDesempate)
}

// Común: si hay respuesta y cae en un candidato, ese es el icono (sin
// pregunta). Si no, el primer candidato es la salida por defecto y la
// pregunta acompaña.
function resolverConRespuesta(
  candidatos: Candidato[],
  pregunta: PreguntaDesempate,
  respuesta: string | null | undefined
): IconoSugerido {
  if (respuesta) {
    const elegido = candidatos.find(c => c.icono === respuesta)
    if (elegido) return { candidatos, icono: elegido.icono, rationale: elegido.rationale }
  }
  const def = candidatos[0]
  return { candidatos, icono: def.icono, rationale: def.rationale, preguntaDesempate: pregunta }
}

function ordenarPorPrioridad(a: EstrellaCode, b: EstrellaCode): [EstrellaCode, EstrellaCode] {
  return PRIORIDAD_ESTRELLA.indexOf(a) <= PRIORIDAD_ESTRELLA.indexOf(b) ? [a, b] : [b, a]
}

function contienePar(par: [EstrellaCode, EstrellaCode], a: EstrellaCode, b: EstrellaCode): boolean {
  return (par[0] === a && par[1] === b) || (par[0] === b && par[1] === a)
}
