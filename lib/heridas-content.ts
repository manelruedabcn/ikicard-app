// ============================================================
// LA HERIDA QUE MÁS PESA ("3 pains") — Contenido de la herramienta.
// Digitaliza el test de la herida dominante de la Guía del sistema
// (sección V). Los textos son de Manel.
//
// Bilingüe: contenido en español (voz del manuscrito) e inglés,
// elegido por locale con contentLang(). La lógica (ids, bandas,
// suma por bloque, empate) NO depende del idioma.
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

const STATEMENTS_EN: WoundStatement[] = [
  {
    id: 'prof_1',
    block: 'profesional',
    text: 'When I think about the rest of my working life, I feel more uneasy than excited.',
  },
  {
    id: 'prof_2',
    block: 'profesional',
    text: 'I feel that my work environment is changing faster than I can keep up with.',
  },
  {
    id: 'prof_3',
    block: 'profesional',
    text: 'If I stopped producing or working tomorrow, I would not know which part of me would still remain.',
  },
  {
    id: 'prof_4',
    block: 'profesional',
    text: 'I feel that someone with far less experience than me could achieve results similar to mine.',
  },
  {
    id: 'prof_5',
    block: 'profesional',
    text: 'I miss feeling needed professionally in the way I once took for granted.',
  },
  {
    id: 'rel_1',
    block: 'relacional',
    text: 'The people I once truly talked to have gradually disappeared from my life—not through a falling-out, but through distance over time.',
  },
  {
    id: 'rel_2',
    block: 'relacional',
    text: 'As the people close to me increasingly live lives of their own, I notice an emptiness that was not there before.',
  },
  {
    id: 'rel_3',
    block: 'relacional',
    text: 'I could count on one hand the people I would call in the middle of the night, and it was not always like this.',
  },
  {
    id: 'rel_4',
    block: 'relacional',
    text: 'I miss having someone depend on me in the way they once did.',
  },
  {
    id: 'rel_5',
    block: 'relacional',
    text: 'I maintain relationships more out of habit than from a connection that still feels alive.',
  },
  {
    id: 'vit_1',
    block: 'vital',
    text: 'I have achieved much of what I set out to do, yet I still feel an emptiness I cannot fully explain.',
  },
  {
    id: 'vit_2',
    block: 'vital',
    text: 'The loss, decline or absence of someone from the generation before mine has made me feel that the line is moving forward and I am next.',
  },
  {
    id: 'vit_3',
    block: 'vital',
    text: 'I think about how much time I have left more than I used to—not dramatically, but it is present.',
  },
  {
    id: 'vit_4',
    block: 'vital',
    text: 'I wonder whether everything I have built has meaning beyond how it looks from the outside.',
  },
  {
    id: 'vit_5',
    block: 'vital',
    text: 'When something makes me think about the time I have left, I quickly change the subject or distract myself.',
  },
]

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

const WOUNDS_EN: WoundMeta[] = [
  { code: 'profesional', name: 'Professional', label: 'the professional wound' },
  { code: 'relacional', name: 'Relational', label: 'the relational wound' },
  { code: 'vital', name: 'Existential', label: 'the existential wound' },
]

// Gancho de entrada. La Guía no da título/gancho de cara al público:
// estos textos son el envoltorio mínimo, en registro sobrio, para
// presentar el test sin prometer ni dramatizar.
const INTRO_ES = {
  title: 'La herida que más pesa',
  hook: 'De qué te proteges, antes de saber cómo. Quince frases, tres terrenos: el trabajo, los vínculos, el tiempo.',
  instructions:
    'Responde quién eres hoy, en la mayoría de tus días, no quién te gustaría ser. Puntúa cada frase del 1 al 5: 1 = casi nunca, 5 = casi siempre. Léelas sin pensar demasiado.',
}

const INTRO_EN = {
  title: 'The wound that weighs most',
  hook: 'What are you protecting yourself from, before you even know how? Fifteen statements, three areas: work, relationships and time.',
  instructions:
    'Answer as the person you are today, on most days—not as the person you would like to be. Rate each statement from 1 to 5: 1 = almost never, 5 = almost always. Read them without overthinking.',
}

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

const BANDS_EN: Record<Band, string> = {
  baja: 'does not seem to be weighing heavily right now',
  activa: 'is active, although you may not have named it yet',
  dominante: 'is shaping the underlying dissatisfaction most strongly right now',
}

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

const RESULT_EN: ResultCopy = {
  profesional:
    'Right now, what weighs most seems to lie in your professional life. It is not simply tiredness from work: it is the feeling that what you do no longer gives back what it once did. It deserves attention, not a quick answer.',
  relacional:
    'Right now, what weighs most seems to lie in your relationships. Nothing dramatic needs to have happened: sometimes it is simply the quiet erosion of no longer being present in the conversations that mattered. It deserves attention, not a quick answer.',
  vital:
    'Right now, what weighs most seems harder to name: time, what can no longer be changed, the feeling of having achieved things and still carrying an emptiness that does not add up. It is the most uncomfortable of the three, and the one we are least likely to face directly. It deserves attention, not a quick answer.',
  tie: (a, b) =>
    `Today, no single wound is speaking loudest: two are asking for attention at the same time—${a} and ${b}. You do not need to decide which one is “the real one”. Start with the one whose statements made you most uncomfortable.`,
  allLow:
    'None of the three seems to be weighing heavily right now, or perhaps this is the first time you have paused to look at them this clearly. It may be worth taking this test again in a few months.',
  allHigh:
    'All three wounds are weighing on you at once right now, and that is more common than it may seem: when the existential wound is active, it often pulls the professional and relational wounds with it. Even so, one scores higher than the other two—start there.',
}

// Cierre sin juicio / aviso de lectura (sección 6 del spec). Debe quedar
// visible en el flujo, no como letra pequeña escondida.
const DISCLAIMER_ES =
  'Es un cuestionario de autoinforme, no un diagnóstico clínico cerrado. Las tres heridas casi nunca aparecen del todo aisladas. Alguna frase puede no aplicar igual a todo el mundo (quien no tiene hijos o pareja puede puntuar bajo en relacional sin que ese terreno esté resuelto): lee el resultado junto con lo que ya sabes de ti, no solo el número.'

const DISCLAIMER_EN =
  'This is a self-report questionnaire, not a definitive clinical diagnosis. The three wounds rarely appear in complete isolation. Some statements may not apply equally to everyone (someone without children or a partner may score low on the relational wound without that area being resolved): read the result alongside what you already know about yourself, not just the number.'

// Cruce con máscaras (sección 5 del spec). No repite preguntas: enlaza.
//   invite     = si el usuario aún no tiene resultado de máscaras.
//   connection = solo si ya lo tiene Y su máscara dominante coincide con
//                la hipótesis del bloque dominante. Nunca como afirmación
//                cerrada (la hipótesis sigue sin validar con datos).
const CROSS_INVITE_ES =
  'Saber qué herida pesa es la mitad del diagnóstico. La otra mitad es saber cómo te proteges de sentirla. Eso lo responde el test de las máscaras.'

const CROSS_INVITE_EN =
  'Knowing which wound weighs most is half the picture. The other half is understanding how you protect yourself from feeling it. The masks test explores that.'

const crossConnectionEs = (maskName: string) =>
  `Tiene sentido que ${maskName} aparezca con fuerza — suele ser una de las formas de protegerse de esto.`

const crossConnectionEn = (maskName: string) =>
  `It makes sense that ${maskName} appears strongly—it is often one of the ways we protect ourselves from this.`

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

const REFLECTION_EN: WoundReflection[] = [
  { id: 'herida_cual', prompt: 'My dominant wound right now is…', hint: '' },
  { id: 'herida_recordo', prompt: 'The last thing that brought it sharply to mind was…', hint: '' },
  {
    id: 'herida_gesto',
    prompt: 'One small gesture I can make to begin tending to it this week:',
    hint: '',
  },
]

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
  return contentLang(locale) === 'en'
    ? crossConnectionEn(maskName)
    : crossConnectionEs(maskName)
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
