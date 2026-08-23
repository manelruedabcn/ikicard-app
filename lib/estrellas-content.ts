// ============================================================
// LAS CUATRO ESTRELLAS — Contenido de la herramienta.
// Digitaliza el "Test de las cuatro estrellas" del libro
// "El Ikigai que no te contaron". Los textos son de Manel.
//
// Mecánica del libro: 20 frases, puntúas 1-5. Se suman por
// bloques de 5 → la estrella con más puntos es tu estilo
// dominante. Determinista: sumar y comparar, sin IA.
//
//   explorador  frases 1-5
//   comunicador frases 6-10
//   protector   frases 11-15
//   visionario  frases 16-20
//
// Bilingüe: el contenido vive en español (voz original del
// manuscrito) e inglés. Se elige por locale con contentLang().
// La lógica (códigos, bloques, suma) es independiente del idioma.
// ============================================================

import { contentLang } from './content-locale'

export type EstrellaCode = 'explorador' | 'comunicador' | 'protector' | 'visionario'

// Una de las 20 frases del test. `n` es el número de frase del
// libro (1-20); `estrella`, el bloque al que suma.
export interface EstrellaStatement {
  n: number
  estrella: EstrellaCode
  text: string
}

// El perfil de cada estrella (verbatim del libro).
export interface Estrella {
  code: EstrellaCode
  // Nombre del estilo, tal cual en el libro.
  name: string
  // Qué es, en una línea (el subtítulo del estilo).
  description: string
  caracteristicas: string
  fortalezas: string
  desafios: string
  profesiones: string
  // El referente que el libro asocia a cada estilo, con su frase.
  referente: string
}

// Las 20 frases, en el orden del libro. El bloque de cada una
// es su fuente de puntuación.
const ESTRELLAS_STATEMENTS_ES: EstrellaStatement[] = [
  { n: 1, estrella: 'explorador', text: 'Me gusta explorar lugares nuevos y enfrentar desafíos desconocidos.' },
  { n: 2, estrella: 'explorador', text: 'Prefiero aprender haciendo cosas prácticas o descubriendo por mi cuenta.' },
  { n: 3, estrella: 'explorador', text: 'Disfruto la aventura y me siento cómodo fuera de mi zona de confort.' },
  { n: 4, estrella: 'explorador', text: 'Me atraen actividades físicas o que involucren acción.' },
  { n: 5, estrella: 'explorador', text: 'Me considero alguien curioso, siempre buscando algo nuevo.' },
  { n: 6, estrella: 'comunicador', text: 'Me encanta compartir ideas y comunicarme con claridad.' },
  { n: 7, estrella: 'comunicador', text: 'Prefiero entornos donde pueda interactuar y conectar con otras personas.' },
  { n: 8, estrella: 'comunicador', text: 'Me siento cómodo expresándome frente a grupos o liderando conversaciones.' },
  { n: 9, estrella: 'comunicador', text: 'Disfruto enseñar, explicar o persuadir a otros sobre mis puntos de vista.' },
  { n: 10, estrella: 'comunicador', text: 'Valoro la interacción humana como parte fundamental de mi vida diaria.' },
  { n: 11, estrella: 'protector', text: 'Me gusta proteger y cuidar a las personas cercanas a mí.' },
  { n: 12, estrella: 'protector', text: 'Prefiero ambientes donde pueda contribuir al bienestar de otros.' },
  { n: 13, estrella: 'protector', text: 'Me siento realizado cuando ayudo a resolver los problemas de alguien.' },
  { n: 14, estrella: 'protector', text: 'Me motiva defender causas que beneficien a las personas más vulnerables.' },
  { n: 15, estrella: 'protector', text: 'Siento satisfacción al ser visto como alguien confiable y solidario.' },
  { n: 16, estrella: 'visionario', text: 'Tengo una visión clara de lo que quiero lograr a largo plazo.' },
  { n: 17, estrella: 'visionario', text: 'Prefiero proyectos que me permitan innovar y pensar a gran escala.' },
  { n: 18, estrella: 'visionario', text: 'Disfruto encontrar soluciones creativas que puedan tener impacto futuro.' },
  { n: 19, estrella: 'visionario', text: 'Me motiva inspirar a otros con mis ideas y mi perspectiva.' },
  { n: 20, estrella: 'visionario', text: 'Valoro la planificación estratégica y la posibilidad de liderar con propósito.' },
]

const ESTRELLAS_STATEMENTS_EN: EstrellaStatement[] = [
  { n: 1, estrella: 'explorador', text: 'I like exploring new places and taking on unfamiliar challenges.' },
  { n: 2, estrella: 'explorador', text: 'I prefer to learn by doing practical things or figuring them out on my own.' },
  { n: 3, estrella: 'explorador', text: 'I enjoy adventure and feel comfortable outside my comfort zone.' },
  { n: 4, estrella: 'explorador', text: 'I am drawn to physical activities or ones that involve action.' },
  { n: 5, estrella: 'explorador', text: 'I see myself as a curious person, always looking for something new.' },
  { n: 6, estrella: 'comunicador', text: 'I love sharing ideas and communicating clearly.' },
  { n: 7, estrella: 'comunicador', text: 'I prefer settings where I can interact and connect with other people.' },
  { n: 8, estrella: 'comunicador', text: 'I feel comfortable expressing myself in front of groups or leading conversations.' },
  { n: 9, estrella: 'comunicador', text: 'I enjoy teaching, explaining or persuading others about my point of view.' },
  { n: 10, estrella: 'comunicador', text: 'I value human interaction as a core part of my daily life.' },
  { n: 11, estrella: 'protector', text: 'I like protecting and caring for the people close to me.' },
  { n: 12, estrella: 'protector', text: 'I prefer environments where I can contribute to others’ wellbeing.' },
  { n: 13, estrella: 'protector', text: 'I feel fulfilled when I help solve someone’s problems.' },
  { n: 14, estrella: 'protector', text: 'I am motivated to defend causes that benefit the most vulnerable.' },
  { n: 15, estrella: 'protector', text: 'I feel satisfaction in being seen as reliable and supportive.' },
  { n: 16, estrella: 'visionario', text: 'I have a clear vision of what I want to achieve in the long term.' },
  { n: 17, estrella: 'visionario', text: 'I prefer projects that let me innovate and think big.' },
  { n: 18, estrella: 'visionario', text: 'I enjoy finding creative solutions that could shape the future.' },
  { n: 19, estrella: 'visionario', text: 'I am motivated to inspire others with my ideas and perspective.' },
  { n: 20, estrella: 'visionario', text: 'I value strategic planning and the chance to lead with purpose.' },
]

// Los 4 estilos, en el orden del libro.
const ESTRELLAS_ES: Estrella[] = [
  {
    code: 'explorador',
    name: 'Explorador',
    description: 'Curioso, aventurero, amante de lo desconocido.',
    caracteristicas: 'Curioso, aventurero, amante de los desafíos prácticos.',
    fortalezas: 'Adaptación al cambio, aprender sobre la marcha, enfoque en experiencias.',
    desafios: 'Puede perder interés en tareas rutinarias o estructuras rígidas.',
    profesiones: 'Investigador, emprendedor, consultor, guía, explorador creativo.',
    referente: 'Ada Lovelace: aprendió lo que nadie le enseñó para hacer lo que nadie había hecho.',
  },
  {
    code: 'comunicador',
    name: 'Comunicador',
    description: 'Extrovertido, carismático, conector de personas.',
    caracteristicas: 'Extrovertido, carismático, hábil compartiendo ideas y conectando con personas.',
    fortalezas: 'Claridad en la expresión, persuasión, liderazgo colaborativo.',
    desafios: 'Puede centrarse demasiado en la interacción, descuidando el trabajo independiente.',
    profesiones: 'Docente, facilitador, comunicador, líder de equipos, divulgador.',
    referente: 'Maria Montessori: construyó un método educativo entero desde la empatía y la escucha.',
  },
  {
    code: 'protector',
    name: 'Protector',
    description: 'Solidario, confiable, orientado al bienestar de los demás.',
    caracteristicas: 'Solidario, confiable, orientado al cuidado y bienestar de los demás.',
    fortalezas: 'Empatía profunda, resolución de conflictos, orientación social.',
    desafios: 'Puede descuidar su propio bienestar mientras cuida el de los demás.',
    profesiones: 'Terapeuta, trabajador social, educador, enfermero, mediador.',
    referente: 'Mieko Kamiya: dedicó su vida profesional a quienes nadie quería cuidar.',
  },
  {
    code: 'visionario',
    name: 'Visionario',
    description: 'Innovador, estratégico, pensador a largo plazo.',
    caracteristicas: 'Innovador, estratégico, centrado en objetivos y posibilidades futuras.',
    fortalezas: 'Creatividad, liderazgo con propósito, pensamiento a gran escala.',
    desafios: 'Puede perderse en ideas abstractas sin concretarlas.',
    profesiones: 'Emprendedor, director creativo, estratega, fundador de proyectos.',
    referente: 'Frida Kahlo: transformó su realidad más difícil en visión y legado.',
  },
]

const ESTRELLAS_EN: Estrella[] = [
  {
    code: 'explorador',
    name: 'Explorer',
    description: 'Curious, adventurous, a lover of the unknown.',
    caracteristicas: 'Curious, adventurous, a lover of practical challenges.',
    fortalezas: 'Adapting to change, learning on the go, a focus on experiences.',
    desafios: 'May lose interest in routine tasks or rigid structures.',
    profesiones: 'Researcher, entrepreneur, consultant, guide, creative explorer.',
    referente: 'Ada Lovelace: she learned what no one taught her to do what no one had done.',
  },
  {
    code: 'comunicador',
    name: 'Communicator',
    description: 'Outgoing, charismatic, a connector of people.',
    caracteristicas: 'Outgoing, charismatic, skilled at sharing ideas and connecting with people.',
    fortalezas: 'Clarity of expression, persuasion, collaborative leadership.',
    desafios: 'May focus too much on interaction and neglect independent work.',
    profesiones: 'Teacher, facilitator, communicator, team leader, science communicator.',
    referente: 'Maria Montessori: she built an entire educational method out of empathy and listening.',
  },
  {
    code: 'protector',
    name: 'Protector',
    description: 'Supportive, reliable, oriented toward others’ wellbeing.',
    caracteristicas: 'Supportive, reliable, focused on caring for others and their wellbeing.',
    fortalezas: 'Deep empathy, conflict resolution, a social orientation.',
    desafios: 'May neglect their own wellbeing while caring for others.',
    profesiones: 'Therapist, social worker, educator, nurse, mediator.',
    referente: 'Mieko Kamiya: she devoted her professional life to those no one wanted to care for.',
  },
  {
    code: 'visionario',
    name: 'Visionary',
    description: 'Innovative, strategic, a long-term thinker.',
    caracteristicas: 'Innovative, strategic, focused on goals and future possibilities.',
    fortalezas: 'Creativity, purpose-driven leadership, big-picture thinking.',
    desafios: 'May get lost in abstract ideas without making them concrete.',
    profesiones: 'Entrepreneur, creative director, strategist, project founder.',
    referente: 'Frida Kahlo: she turned her hardest reality into vision and legacy.',
  },
]

// Gancho de entrada (voz de Manel, muestreada del libro).
const ESTRELLAS_INTRO_ES = {
  title: 'Las cuatro estrellas',
  hook: 'Un espejo, no un diagnóstico definitivo. Cuál de los cuatro estilos domina hoy tu forma de estar y de relacionarte.',
  instructions:
    'Lee cada frase y puntúa del 1 al 5 cuánto te representa. 1 = nada. 5 = completamente. Responde sin pensarlo demasiado.',
}

const ESTRELLAS_INTRO_EN = {
  title: 'The four stars',
  hook: 'A mirror, not a final diagnosis. Which of the four styles leads the way you show up and relate today.',
  instructions:
    'Read each statement and rate from 1 to 5 how much it fits you. 1 = not at all. 5 = completely. Answer without overthinking.',
}

// Cierre, tras ver el resultado (frase núcleo del libro).
const ESTRELLAS_CLOSING_ES = {
  reframe:
    'La estrella con más puntos es tu estilo dominante. Si estás entre dos, no te preocupes: muchas personas son una combinación.',
}

const ESTRELLAS_CLOSING_EN = {
  reframe:
    'The star with the most points is your leading style. If you’re between two, don’t worry: many people are a blend.',
}

// Getters por idioma del contenido.
export function getEstrellas(locale: string): Estrella[] {
  return contentLang(locale) === 'en' ? ESTRELLAS_EN : ESTRELLAS_ES
}
export function getEstrellasStatements(locale: string): EstrellaStatement[] {
  return contentLang(locale) === 'en' ? ESTRELLAS_STATEMENTS_EN : ESTRELLAS_STATEMENTS_ES
}
export function getEstrellasIntro(locale: string) {
  return contentLang(locale) === 'en' ? ESTRELLAS_INTRO_EN : ESTRELLAS_INTRO_ES
}
export function getEstrellasClosing(locale: string) {
  return contentLang(locale) === 'en' ? ESTRELLAS_CLOSING_EN : ESTRELLAS_CLOSING_ES
}

// Suma por bloques → estilo dominante. Determinista e independiente del
// idioma (usa los códigos y el número de frase). `scores` guarda la
// respuesta por número de frase: {"1":4,...,"20":5}.
export function computeDominant(scores: Record<string, number>) {
  const totals = ESTRELLAS_ES.map(e => ({
    code: e.code,
    total: ESTRELLAS_STATEMENTS_ES.filter(s => s.estrella === e.code).reduce(
      (sum, s) => sum + (scores[String(s.n)] ?? 0),
      0
    ),
  })).sort((a, b) => b.total - a.total)
  return { dominant: totals[0]?.code ?? null, totals }
}
