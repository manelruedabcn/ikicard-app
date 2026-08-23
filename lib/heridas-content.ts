// ============================================================
// LA HERIDA QUE MÁS PESA ("3 pains") — Contenido de la herramienta.
// Digitaliza el test de la herida dominante de la Guía del sistema
// (sección V). Los textos son de Manel.
//
// Bilingüe: contenido en español (voz del manuscrito) e inglés,
// elegido por locale con contentLang(). La lógica (ids, bandas,
// suma por bloque, empate) NO depende del idioma. La traducción al
// inglés todavía no está hecha: hasta que exista, el getter EN cae
// al dataset ES para no dejar huecos (contentLang ya cae a 'es' en
// cualquier locale que no sea 'en').
// ============================================================

import { contentLang } from './content-locale'
import type { MaskCode } from './masks-content'

export type WoundCode = 'profesional' | 'relacional' | 'vital'

export interface WoundStatement {
  // Id estable (no depende del orden ni del idioma), para guardar la
  // puntuación cruda. prof_1..prof_5 · rel_1..rel_5 · vit_1..vit_5.
  id: string
  block: WoundCode
  // La frase que se puntúa del 1 al 5.
  text: string
}

// Las 15 frases, en 3 bloques de 5. Texto exacto de la Guía (sección V),
// no reescribir. Escala: 1 = casi nunca, 5 = casi siempre.
const STATEMENTS_ES: WoundStatement[] = [
  // --- Bloque profesional ---
  {
    id: 'prof_1',
    block: 'profesional',
    text: 'Cuando pienso en lo que me queda de vida profesional, siento más inquietud que ilusión.',
  },
  {
    id: 'prof_2',
    block: 'profesional',
    text: 'Noto que mi entorno de trabajo cambia más rápido de lo que puedo seguir.',
  },
  {
    id: 'prof_3',
    block: 'profesional',
    text: 'Si dejara de producir o de trabajar mañana, no sabría qué parte de mí queda en pie.',
  },
  {
    id: 'prof_4',
    block: 'profesional',
    text: 'Siento que alguien con mucha menos experiencia que yo puede conseguir resultados parecidos a los míos.',
  },
  {
    id: 'prof_5',
    block: 'profesional',
    text: 'Echo de menos sentirme necesario en lo profesional, de un modo que antes daba por hecho.',
  },
  // --- Bloque relacional ---
  {
    id: 'rel_1',
    block: 'relacional',
    text: 'Las personas con las que antes hablaba de verdad han ido desapareciendo de mi vida, sin ruptura, solo por desgaste.',
  },
  {
    id: 'rel_2',
    block: 'relacional',
    text: 'Desde que la gente cercana hace cada vez más su vida propia, noto un vacío que antes no estaba.',
  },
  {
    id: 'rel_3',
    block: 'relacional',
    text: 'Podría contar con una mano a quién llamaría en mitad de la noche, y antes no era así.',
  },
  {
    id: 'rel_4',
    block: 'relacional',
    text: 'Echo de menos que alguien dependa de mí del modo en que antes dependía.',
  },
  {
    id: 'rel_5',
    block: 'relacional',
    text: 'Mantengo relaciones por costumbre más que por una conexión que sienta viva.',
  },
  // --- Bloque vital ---
  {
    id: 'vit_1',
    block: 'vital',
    text: 'He conseguido buena parte de lo que me propuse, y aun así siento un vacío que no sé explicar del todo.',
  },
  {
    id: 'vit_2',
    block: 'vital',
    text: 'La pérdida, el deterioro o la ausencia de alguien de la generación anterior a la mía me ha hecho sentir que la fila avanza y que el siguiente soy yo.',
  },
  {
    id: 'vit_3',
    block: 'vital',
    text: 'Pienso en cuánto tiempo me queda más de lo que pensaba antes, no de forma dramática, pero sí presente.',
  },
  {
    id: 'vit_4',
    block: 'vital',
    text: 'Me pregunto si todo lo que he construido tiene sentido más allá de lo que se ve desde fuera.',
  },
  {
    id: 'vit_5',
    block: 'vital',
    text: 'Cuando algo me hace pensar en el tiempo que me queda, cambio de tema o me distraigo enseguida.',
  },
]

// Traducción al inglés pendiente: mismo array, mismos ids/bloques.
// Mientras no exista, se reutiliza el ES (ver getters).
const STATEMENTS_EN: WoundStatement[] = STATEMENTS_ES

// Nombres de cada herida para la lectura del resultado.
//   name  = etiqueta corta ("Profesional") para el mapa de las tres.
//   label = sintagma para encadenar en frases ("la profesional") en el
//           copy de empate.
interface WoundMeta {
  code: WoundCode
  name: string
  label: string
}

const WOUNDS_ES: WoundMeta[] = [
  { code: 'profesional', name: 'Profesional', label: 'la profesional' },
  { code: 'relacional', name: 'Relacional', label: 'la relacional' },
  { code: 'vital', name: 'Vital', label: 'la vital' },
]

const WOUNDS_EN: WoundMeta[] = WOUNDS_ES

// Gancho de entrada. La Guía no da título/gancho de cara al público:
// estos textos son el envoltorio mínimo, en registro sobrio, para
// presentar el test sin prometer ni dramatizar.
const INTRO_ES = {
  title: 'La herida que más pesa',
  hook: 'De qué te proteges, antes de saber cómo. Quince frases, tres terrenos: el trabajo, los vínculos, el tiempo.',
  instructions:
    'Responde quién eres hoy, en la mayoría de tus días, no quién te gustaría ser. Puntúa cada frase del 1 al 5: 1 = casi nunca, 5 = casi siempre. Léelas sin pensar demasiado.',
}

const INTRO_EN = INTRO_ES

// Lectura del resultado por banda (umbrales de la Guía). Independiente
// del idioma. Suma por bloque, rango 5-25:
//   5-11  no pesa ahora · 12-18 activa · 19-25 dominante.
export const HERIDAS_THRESHOLDS = {
  // A partir de esta suma la herida está "activa".
  active: 12,
  // A partir de esta suma la herida es "dominante".
  dominant: 19,
  // Distancia máxima entre las dos primeras para considerarlo empate.
  tieGap: 3,
}

export type Band = 'baja' | 'activa' | 'dominante'

export function bandFor(sum: number): Band {
  if (sum >= HERIDAS_THRESHOLDS.dominant) return 'dominante'
  if (sum >= HERIDAS_THRESHOLDS.active) return 'activa'
  return 'baja'
}

// Copy por banda para el mapa de las tres heridas (texto de la Guía).
const BANDS_ES: Record<Band, string> = {
  baja: 'ahora mismo no parece estar pesando mucho',
  activa: 'está activa, aunque quizás no le habías puesto nombre todavía',
  dominante: 'es la que más está gobernando la insatisfacción de fondo ahora mismo',
}

const BANDS_EN: Record<Band, string> = BANDS_ES

// Copys de resultado (texto validado de la Guía, sección 3 del spec).
// Los tres dominantes + los tres casos especiales.
interface ResultCopy {
  profesional: string
  relacional: string
  vital: string
  // Empate: recibe las etiquetas de los dos bloques que empatan.
  tie: (a: string, b: string) => string
  allLow: string
  allHigh: string
}

const RESULT_ES: ResultCopy = {
  profesional:
    'Ahora mismo, lo que más pesa parece estar en tu vida profesional. No es solo cansancio de trabajar: es la sensación de que lo que haces ya no te devuelve lo que antes te daba. Merece una mirada, no una respuesta rápida.',
  relacional:
    'Ahora mismo, lo que más pesa parece estar en tus vínculos. No hace falta que haya pasado nada dramático: a veces es solo el desgaste silencioso de dejar de estar presente en las conversaciones que importaban. Merece una mirada, no una respuesta rápida.',
  vital:
    'Ahora mismo, lo que más pesa parece ser algo más difícil de nombrar: el tiempo, lo que ya no se puede cambiar, la sensación de haber conseguido cosas y seguir con un vacío que no cuadra. Es la más incómoda de las tres, y también la que menos se suele mirar de frente. Merece una mirada, no una respuesta rápida.',
  tie: (a, b) =>
    `Hoy no hay una sola herida hablando más fuerte: hay dos pidiendo atención a la vez, ${a} y ${b}. No hace falta elegir cuál es «la de verdad». Empieza por la que te haya incomodado más al leer sus frases.`,
  allLow:
    'Ninguna de las tres parece estar pesando mucho ahora mismo, o quizás es la primera vez que te paras a mirar alguna de ellas con esta claridad. Vale la pena repetir este test dentro de unos meses.',
  allHigh:
    'Las tres heridas están pesando a la vez ahora mismo, y es más habitual de lo que parece: cuando la herida vital está activa, suele arrastrar también a la profesional y la relacional. Aun así, hay una que puntúa más alta que las otras dos — empieza por ahí.',
}

const RESULT_EN: ResultCopy = RESULT_ES

// Cierre sin juicio / aviso de lectura (sección 6 del spec). Debe quedar
// visible en el flujo, no como letra pequeña escondida.
const DISCLAIMER_ES =
  'Es un cuestionario de autoinforme, no un diagnóstico clínico cerrado. Las tres heridas casi nunca aparecen del todo aisladas. Alguna frase puede no aplicar igual a todo el mundo (quien no tiene hijos o pareja puede puntuar bajo en relacional sin que ese terreno esté resuelto): lee el resultado junto con lo que ya sabes de ti, no solo el número.'

const DISCLAIMER_EN = DISCLAIMER_ES

// Cruce con máscaras (sección 5 del spec). No repite preguntas: enlaza.
//   invite     = si el usuario aún no tiene resultado de máscaras.
//   connection = solo si ya lo tiene Y su máscara dominante coincide con
//                la hipótesis del bloque dominante. Nunca como afirmación
//                cerrada (la hipótesis sigue sin validar con datos).
const CROSS_INVITE_ES =
  'Saber qué herida pesa es la mitad del diagnóstico. La otra mitad es saber cómo te proteges de sentirla. Eso lo responde el test de las máscaras.'

const CROSS_INVITE_EN = CROSS_INVITE_ES

const crossConnectionEs = (maskName: string) =>
  `Tiene sentido que ${maskName} aparezca con fuerza — suele ser una de las formas de protegerse de esto.`

// Hipótesis de cruce herida → máscaras (razonada, no dato). Manipuladora
// es transversal: no se liga a ninguna herida, así que no dispara conexión.
export const CROSS_HYPOTHESIS: Record<WoundCode, MaskCode[]> = {
  profesional: ['exigente', 'impostora'],
  relacional: ['complaciente', 'jueza'],
  vital: ['controladora', 'victima'],
}

// Ejercicio de cierre en pantalla (mismo patrón que "Mi máscara
// dominante"). Tres campos libres, sin respuesta correcta. La Guía no
// da pistas para estos campos: se dejan sin hint.
export interface WoundReflection {
  id: string
  prompt: string
  hint: string
}

const REFLECTION_ES: WoundReflection[] = [
  { id: 'herida_cual', prompt: 'Mi herida dominante ahora es la…', hint: '' },
  { id: 'herida_recordo', prompt: 'Lo último que me la recordó con fuerza fue…', hint: '' },
  {
    id: 'herida_gesto',
    prompt: 'Un gesto pequeño para empezar a atenderla esta semana:',
    hint: '',
  },
]

const REFLECTION_EN: WoundReflection[] = REFLECTION_ES

// ------------------------------------------------------------
// Getters por idioma del contenido.
// ------------------------------------------------------------
export function getStatements(locale: string): WoundStatement[] {
  return contentLang(locale) === 'en' ? STATEMENTS_EN : STATEMENTS_ES
}
export function getWounds(locale: string): WoundMeta[] {
  return contentLang(locale) === 'en' ? WOUNDS_EN : WOUNDS_ES
}
export function getHeridasIntro(locale: string) {
  return contentLang(locale) === 'en' ? INTRO_EN : INTRO_ES
}
export function getBandCopy(locale: string): Record<Band, string> {
  return contentLang(locale) === 'en' ? BANDS_EN : BANDS_ES
}
export function getResultCopy(locale: string): ResultCopy {
  return contentLang(locale) === 'en' ? RESULT_EN : RESULT_ES
}
export function getDisclaimer(locale: string): string {
  return contentLang(locale) === 'en' ? DISCLAIMER_EN : DISCLAIMER_ES
}
export function getCrossInvite(locale: string): string {
  return contentLang(locale) === 'en' ? CROSS_INVITE_EN : CROSS_INVITE_ES
}
export function crossConnection(maskName: string, locale: string): string {
  // Solo hay una redacción por idioma; hoy ambas caen al ES.
  void locale
  return crossConnectionEs(maskName)
}
export function getReflection(locale: string): WoundReflection[] {
  return contentLang(locale) === 'en' ? REFLECTION_EN : REFLECTION_ES
}

// ------------------------------------------------------------
// LÓGICA DE PUNTUACIÓN (determinista, cero IA). Toda sobre códigos.
// ------------------------------------------------------------

// Suma cada bloque a partir de las puntuaciones crudas por id de frase.
export function computeSums(scores: Record<string, number>): Record<WoundCode, number> {
  const sums: Record<WoundCode, number> = { profesional: 0, relacional: 0, vital: 0 }
  for (const s of STATEMENTS_ES) {
    sums[s.block] += scores[s.id] ?? 0
  }
  return sums
}

export type Scenario = 'single' | 'tie' | 'allLow' | 'allHigh'

export interface HeridaResult {
  // Bloques ordenados de mayor a menor suma (el dominante primero).
  ordered: WoundCode[]
  // El de mayor suma (siempre existe; el copy decide cómo se anuncia).
  dominant: WoundCode
  scenario: Scenario
  // En empate, los dos bloques que empatan (dominant + segundo).
  tied: WoundCode[]
  sums: Record<WoundCode, number>
}

// Decide el escenario a partir de las sumas. Precedencia:
//   allLow → allHigh → tie → single.
// (allHigh gana al empate: su copy ya resuelve "empieza por la más alta".)
export function computeResult(scores: Record<string, number>): HeridaResult {
  const sums = computeSums(scores)
  const ordered = (['profesional', 'relacional', 'vital'] as WoundCode[]).sort(
    (a, b) => sums[b] - sums[a]
  )
  const dominant = ordered[0]
  const values = ordered.map(c => sums[c])

  const allLow = values.every(v => bandFor(v) === 'baja')
  const allHigh = values.every(v => v >= HERIDAS_THRESHOLDS.dominant)
  const isTie = values[0] - values[1] <= HERIDAS_THRESHOLDS.tieGap

  let scenario: Scenario = 'single'
  let tied: WoundCode[] = []
  if (allLow) scenario = 'allLow'
  else if (allHigh) scenario = 'allHigh'
  else if (isTie) {
    scenario = 'tie'
    tied = [ordered[0], ordered[1]]
  }

  return { ordered, dominant, scenario, tied, sums }
}
