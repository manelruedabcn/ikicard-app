// ============================================================
// LA HERIDA DOMINANTE — Contenido de la herramienta.
// Test de autoinforme (15 frases, 3 bloques de 5) que detecta qué
// herida —profesional, relacional o vital— pesa más ahora mismo.
// Precede a la sesión 1:1 (filtro previo). Textos de Manel; ver
// docs/proyecto-ikigaier.md → Test_Herida_Dominante_Version_Final.md.
//
// Bilingüe: contenido en español (voz original) e inglés, elegido
// por locale con contentLang(). La lógica (códigos, umbrales, orden)
// no depende del idioma — vive en PainsClient.tsx.
// ============================================================

import { contentLang } from './content-locale'

export type PainCode = 'profesional' | 'relacional' | 'vital'
export type PainCase = 'single' | 'tie' | 'low' | 'high'

export interface PainBlock {
  code: PainCode
  // Nombre del bloque, para el eyebrow durante el test y las barras del
  // resultado.
  label: string
  // Las 5 frases que se puntúan del 1 al 5, en orden fijo.
  items: string[]
}

const BLOCKS_ES: PainBlock[] = [
  {
    code: 'profesional',
    label: 'Profesional',
    items: [
      'Cuando pienso en lo que me queda de vida profesional, siento más inquietud que ilusión.',
      'Noto que mi entorno de trabajo cambia más rápido de lo que puedo seguir.',
      'Si dejara de producir o de trabajar mañana, no sabría qué parte de mí queda en pie.',
      'Siento que alguien con mucha menos experiencia que yo puede conseguir resultados parecidos a los míos.',
      'Echo de menos sentirme necesario en lo profesional, de un modo que antes daba por hecho.',
    ],
  },
  {
    code: 'relacional',
    label: 'Relacional',
    items: [
      'Las personas con las que antes hablaba de verdad han ido desapareciendo de mi vida, sin ruptura, solo por desgaste.',
      'Desde que la gente cercana hace cada vez más su vida propia, noto un vacío que antes no estaba.',
      'Podría contar con una mano a quién llamaría en mitad de la noche, y antes no era así.',
      'Echo de menos que alguien dependa de mí del modo en que antes dependía.',
      'Mantengo relaciones por costumbre más que por una conexión que sienta viva.',
    ],
  },
  {
    code: 'vital',
    label: 'Vital',
    items: [
      'He conseguido buena parte de lo que me propuse, y aun así siento un vacío que no sé explicar del todo.',
      'La pérdida, el deterioro o la ausencia de alguien de la generación anterior a la mía me ha hecho sentir que la fila avanza y que el siguiente soy yo.',
      'Pienso en cuánto tiempo me queda más de lo que pensaba antes, no de forma dramática, pero sí presente.',
      'Me pregunto si todo lo que he construido tiene sentido más allá de lo que se ve desde fuera.',
      'Cuando algo me hace pensar en el tiempo que me queda, cambio de tema o me distraigo enseguida.',
    ],
  },
]

const BLOCKS_EN: PainBlock[] = [
  {
    code: 'profesional',
    label: 'Professional',
    items: [
      "When I think about what's left of my working life, I feel more unease than excitement.",
      'I notice my work environment is changing faster than I can keep up with.',
      "If I stopped producing or working tomorrow, I wouldn't know what part of me would still be standing.",
      'I feel that someone with far less experience than me could get results similar to mine.',
      'I miss feeling professionally needed, in a way I used to take for granted.',
    ],
  },
  {
    code: 'relacional',
    label: 'Relational',
    items: [
      "The people I used to really talk to have been drifting out of my life, not through any falling-out, just through wear.",
      "As the people close to me build more of their own separate lives, I notice an emptiness that wasn't there before.",
      "I could count on one hand who I'd call in the middle of the night, and it didn't used to be that way.",
      'I miss being depended on the way I used to be.',
      'I keep up relationships out of habit more than out of a connection that feels alive.',
    ],
  },
  {
    code: 'vital',
    label: 'Vital',
    items: [
      "I've achieved a good part of what I set out to, and I still feel an emptiness I can't fully explain.",
      "Losing, watching decline, or missing someone from the generation before mine has made me feel the line is moving forward, and I'm next.",
      "I think about how much time I have left more than I used to — not dramatically, but it's there.",
      "I wonder whether everything I've built means anything beyond what's visible from the outside.",
      'When something makes me think about the time I have left, I change the subject or get distracted right away.',
    ],
  },
]

const PAINS_INTRO_ES = {
  title: '¿Qué herida está hablando ahora?',
  hook: 'Tres heridas suelen repartirse la insatisfacción de fondo —la profesional, la relacional y la vital— y casi nunca se anuncian por su nombre.',
  instructions:
    '15 frases, tres bloques de cinco. Puntúa del 1 al 5 —uno es casi nunca, cinco es casi siempre—. Responde quién eres hoy, en la mayoría de tus días, no quién te gustaría ser.',
}

const PAINS_INTRO_EN = {
  title: 'Which wound is speaking now?',
  hook: "Three wounds usually share the weight of everyday dissatisfaction — the professional, the relational and the vital. They almost never announce themselves by name.",
  instructions:
    '15 statements, three blocks of five. Rate each from 1 to 5 — one is almost never, five is almost always. Answer as who you are today, in most of your days, not who you would like to be.',
}

// Lectura por banda (umbrales del test). Independiente del idioma.
//   5-11 no pesa · 12-18 activa · 19-25 dominante.
export const PAINS_THRESHOLDS = {
  active: 12,
  dominant: 19,
}

function bandLabelEs(score: number): string {
  if (score < PAINS_THRESHOLDS.active) return 'ahora mismo no parece estar pesando mucho'
  if (score < PAINS_THRESHOLDS.dominant)
    return 'está activa, aunque quizás no le habías puesto nombre todavía'
  return 'es la que más está gobernando la insatisfacción de fondo ahora mismo'
}

function bandLabelEn(score: number): string {
  if (score < PAINS_THRESHOLDS.active) return "doesn't seem to weigh much right now"
  if (score < PAINS_THRESHOLDS.dominant)
    return "is active, even if you hadn't quite put a name to it yet"
  return 'is the one most governing the underlying dissatisfaction right now'
}

export function getPainBandLabel(locale: string, score: number): string {
  return contentLang(locale) === 'en' ? bandLabelEn(score) : bandLabelEs(score)
}

// Copys de resultado por rama. single necesita el código dominante; tie
// necesita el dominante y el segundo. low y high no llevan variables.
const PAIN_ADJ_ES: Record<PainCode, string> = {
  profesional: 'profesional',
  relacional: 'relacional',
  vital: 'vital',
}
const PAIN_ADJ_EN: Record<PainCode, string> = {
  profesional: 'professional',
  relacional: 'relational',
  vital: 'vital',
}

const SINGLE_COPY_ES: Record<PainCode, string> = {
  profesional:
    'Ahora mismo, lo que más pesa parece estar en tu vida profesional. No es solo cansancio de trabajar: es la sensación de que lo que haces ya no te devuelve lo que antes te daba. Merece una mirada, no una respuesta rápida.',
  relacional:
    'Ahora mismo, lo que más pesa parece estar en tus vínculos. No hace falta que haya pasado nada dramático: a veces es solo el desgaste silencioso de dejar de estar presente en las conversaciones que importaban. Merece una mirada, no una respuesta rápida.',
  vital:
    'Ahora mismo, lo que más pesa parece ser algo más difícil de nombrar: el tiempo, lo que ya no se puede cambiar, la sensación de haber conseguido cosas y seguir con un vacío que no cuadra. Es la más incómoda de las tres, y también la que menos se suele mirar de frente. Merece una mirada, no una respuesta rápida.',
}

const SINGLE_COPY_EN: Record<PainCode, string> = {
  profesional:
    "Right now, what weighs most seems to be your working life. It isn't just tiredness from work: it's the sense that what you do no longer gives you back what it used to. It deserves a real look, not a quick answer.",
  relacional:
    "Right now, what weighs most seems to be your relationships. Nothing dramatic has to have happened: sometimes it's just the quiet wear of no longer being present in the conversations that mattered. It deserves a real look, not a quick answer.",
  vital:
    "Right now, what weighs most is something harder to name: time, what can no longer be changed, the sense of having achieved things and still carrying an emptiness that doesn't add up. It's the most uncomfortable of the three, and the one least often faced head-on. It deserves a real look, not a quick answer.",
}

const LOW_COPY_ES =
  'Ninguna de las tres parece estar pesando mucho ahora mismo, o quizás es la primera vez que te paras a mirar alguna de ellas con esta claridad. Vale la pena repetir este test dentro de unos meses.'
const LOW_COPY_EN =
  "None of the three seems to weigh much right now, or maybe this is the first time you've looked at any of them this clearly. It's worth taking this again in a few months."

const HIGH_COPY_ES =
  'Las tres heridas están pesando a la vez ahora mismo, y es más habitual de lo que parece: cuando la herida vital está activa, suele arrastrar también a la profesional y la relacional. Aun así, hay una que puntúa más alta que las otras dos.'
const HIGH_COPY_EN =
  'All three wounds are weighing on you at once right now, and that is more common than it seems: when the vital wound is active, it tends to pull the professional and relational ones along with it. Even so, one of them scores higher than the other two.'

export interface PainResultCopy {
  headline: string
  body: string
}

// Arma el copy de resultado según la rama. dominant/second en 'tie' son
// obligatorios; en 'single'/'high' solo dominant; en 'low' ninguno.
export function getPainResultCopy(
  locale: string,
  caseKind: PainCase,
  dominant: PainCode | null,
  second: PainCode | null
): PainResultCopy {
  const en = contentLang(locale) === 'en'
  const adj = en ? PAIN_ADJ_EN : PAIN_ADJ_ES

  if (caseKind === 'low') {
    return {
      headline: en ? 'None of them weighs too much, for now' : 'Ninguna pesa demasiado, por ahora',
      body: en ? LOW_COPY_EN : LOW_COPY_ES,
    }
  }
  if (caseKind === 'high') {
    return {
      headline: en ? 'All three are speaking at once' : 'Las tres hablan a la vez',
      body: en ? HIGH_COPY_EN : HIGH_COPY_ES,
    }
  }
  if (caseKind === 'tie' && dominant && second) {
    const body = en
      ? `Today there isn't one wound speaking louder than the rest: two are asking for attention at once — the ${adj[dominant]} wound and the ${adj[second]} wound. You don't have to decide which one is "the real one". Start with whichever unsettled you more as you read its statements.`
      : `Hoy no hay una sola herida hablando más fuerte: hay dos pidiendo atención a la vez, la herida ${adj[dominant]} y la herida ${adj[second]}. No hace falta elegir cuál es "la de verdad". Empieza por la que te haya incomodado más al leer sus frases.`
    return {
      headline: en ? 'Two wounds are asking for attention' : 'Dos heridas piden atención',
      body,
    }
  }
  // single (o fallback si faltara dominant)
  const code = dominant ?? 'vital'
  return {
    headline: en ? `The ${adj[code]} wound` : `La herida ${adj[code]}`,
    body: (en ? SINGLE_COPY_EN : SINGLE_COPY_ES)[code],
  }
}

// Ejercicio de cierre (3 partes, sin respuesta correcta). Se ofrece tras
// conocer el resultado, igual que "Mi máscara dominante" en /mascaras.
export interface PainReflection {
  id: string
  prompt: string
  hint: string
}

const PAIN_REFLECTION_ES: PainReflection[] = [
  {
    id: 'pain_dominant',
    prompt: 'Mi herida dominante ahora es la…',
    hint: 'Profesional, relacional o vital. La que sientas más cierta, no la que "debería" ser.',
  },
  {
    id: 'pain_reminder',
    prompt: 'Lo último que me la recordó con fuerza fue…',
    hint: 'Un momento concreto, con fecha si puedes, no una idea general.',
  },
  {
    id: 'pain_gesture',
    prompt: 'Un gesto pequeño para empezar a atenderla esta semana…',
    hint: 'Pequeño de verdad. Algo que puedas hacer, no solo pensar.',
  },
]

const PAIN_REFLECTION_EN: PainReflection[] = [
  {
    id: 'pain_dominant',
    prompt: 'My dominant wound right now is the…',
    hint: 'Professional, relational or vital. Whichever feels truest, not whichever "should" be.',
  },
  {
    id: 'pain_reminder',
    prompt: 'The last time it reminded me of itself was…',
    hint: 'A specific moment, with a date if you can, not a general idea.',
  },
  {
    id: 'pain_gesture',
    prompt: 'One small gesture to start tending to it this week…',
    hint: 'Small for real. Something you can do, not just think about.',
  },
]

// Cierre / puente hacia /mascaras (enlace real, no repite preguntas).
const PAINS_CLOSING_ES = {
  crossover:
    'Saber qué herida pesa es la mitad del diagnóstico. La otra mitad es saber cómo te proteges de sentirla — de eso habla el test de las máscaras, si todavía no lo has hecho.',
  crossoverLink: 'Hacer el test de las máscaras',
  caveat:
    'Es un cuestionario de autoinforme, no un diagnóstico clínico cerrado. Las tres heridas casi nunca aparecen del todo aisladas, y alguna frase puede no aplicarte igual que a otra persona. Lee el resultado junto con lo que ya sabes de ti, no solo el número.',
}

const PAINS_CLOSING_EN = {
  crossover:
    "Knowing which wound weighs on you is half the diagnosis. The other half is knowing how you protect yourself from feeling it — that's what the masks test is about, if you haven't done it yet.",
  crossoverLink: 'Take the masks test',
  caveat:
    "This is a self-report questionnaire, not a closed clinical diagnosis. The three wounds almost never show up fully on their own, and a given statement may not apply to you the way it does to someone else. Read the result alongside what you already know about yourself, not just the number.",
}

export function getPainsIntro(locale: string) {
  return contentLang(locale) === 'en' ? PAINS_INTRO_EN : PAINS_INTRO_ES
}
export function getPainsClosing(locale: string) {
  return contentLang(locale) === 'en' ? PAINS_CLOSING_EN : PAINS_CLOSING_ES
}
export function getPainReflection(locale: string): PainReflection[] {
  return contentLang(locale) === 'en' ? PAIN_REFLECTION_EN : PAIN_REFLECTION_ES
}
export function getPainBlocks(locale: string): PainBlock[] {
  return contentLang(locale) === 'en' ? BLOCKS_EN : BLOCKS_ES
}
