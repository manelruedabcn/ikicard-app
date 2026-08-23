// ============================================================
// TEST CAMINO — Contenido de la herramienta.
// Digitaliza el "Test CAMINO" del libro "El Ikigai que no te
// contaron". Los textos son de Manel.
//
// Mecánica del libro: 30 frases, puntúas 1-5. Se suman por
// bloques de 5 → la orientación con más puntos es tu tipo
// dominante. Determinista: sumar y comparar, sin IA.
//
//   constructor  frases 1-5
//   analista     frases 6-10
//   maestro      frases 11-15
//   innovador    frases 16-20
//   negociador   frases 21-25
//   organizador  frases 26-30
//
// Bilingüe: contenido en español (voz del manuscrito) e inglés,
// elegido por locale con contentLang(). La lógica no depende del idioma.
// ============================================================

import { contentLang } from './content-locale'

export type CaminoCode =
  | 'constructor'
  | 'analista'
  | 'maestro'
  | 'innovador'
  | 'negociador'
  | 'organizador'

// Una de las 30 frases del test. `n` es el número de frase del
// libro (1-30); `camino`, el bloque al que suma.
export interface CaminoStatement {
  n: number
  camino: CaminoCode
  text: string
}

// El perfil de cada orientación (verbatim del libro).
export interface Camino {
  code: CaminoCode
  // Nombre de la orientación, tal cual en el libro.
  name: string
  // Qué es, en una línea (el subtítulo del tipo).
  description: string
  caracteristicas: string
  fortalezas: string
  desafios: string
  profesiones: string
  // El referente que el libro asocia a cada tipo, con su frase.
  referente: string
}

// Las 30 frases, en el orden del libro. El bloque de cada una
// es su fuente de puntuación.
const CAMINO_STATEMENTS_ES: CaminoStatement[] = [
  { n: 1, camino: 'constructor', text: '¿Disfrutas trabajar al aire libre y resolver problemas prácticos?' },
  { n: 2, camino: 'constructor', text: '¿Te sientes satisfecho al construir o reparar algo tangible?' },
  { n: 3, camino: 'constructor', text: '¿Prefieres tareas que involucren el uso de herramientas o maquinaria?' },
  { n: 4, camino: 'constructor', text: '¿Te gusta tomar acción inmediata para resolver problemas físicos?' },
  { n: 5, camino: 'constructor', text: '¿Te motiva transformar ideas en algo tangible y funcional?' },
  { n: 6, camino: 'analista', text: '¿Te interesa investigar causas y efectos de problemas complejos?' },
  { n: 7, camino: 'analista', text: '¿Te gusta analizar datos y sacar conclusiones?' },
  { n: 8, camino: 'analista', text: '¿Prefieres actividades que requieran precisión y enfoque detallado?' },
  { n: 9, camino: 'analista', text: '¿Te entusiasma encontrar soluciones científicas a problemas globales?' },
  { n: 10, camino: 'analista', text: '¿Te motiva explorar temas relacionados con la ciencia o la tecnología?' },
  { n: 11, camino: 'maestro', text: '¿Te interesa ayudar a los demás a alcanzar sus objetivos?' },
  { n: 12, camino: 'maestro', text: '¿Disfrutas enseñar o participar como mentor en áreas específicas?' },
  { n: 13, camino: 'maestro', text: '¿Prefieres trabajar en ambientes colaborativos?' },
  { n: 14, camino: 'maestro', text: '¿Te motiva liderar proyectos que impacten positivamente en las personas?' },
  { n: 15, camino: 'maestro', text: '¿Sientes satisfacción al apoyar a otros emocional y profesionalmente?' },
  { n: 16, camino: 'innovador', text: '¿Te gusta expresarte a través de medios artísticos o creativos?' },
  { n: 17, camino: 'innovador', text: '¿Prefieres trabajos que permitan innovación y libertad creativa?' },
  { n: 18, camino: 'innovador', text: '¿Encuentras satisfacción en crear algo único que inspire a los demás?' },
  { n: 19, camino: 'innovador', text: '¿Te motiva diseñar soluciones creativas para desafíos cotidianos?' },
  { n: 20, camino: 'innovador', text: '¿Te interesa explorar ideas abstractas y no convencionales?' },
  { n: 21, camino: 'negociador', text: '¿Disfrutas liderar equipos hacia metas ambiciosas?' },
  { n: 22, camino: 'negociador', text: '¿Te motiva persuadir a otros para apoyar tus ideas o proyectos?' },
  { n: 23, camino: 'negociador', text: '¿Prefieres entornos dinámicos donde puedas tomar decisiones rápidas?' },
  { n: 24, camino: 'negociador', text: '¿Te sientes cómodo asumiendo riesgos calculados para innovar?' },
  { n: 25, camino: 'negociador', text: '¿Te interesa identificar oportunidades de negocio y actuar sobre ellas?' },
  { n: 26, camino: 'organizador', text: '¿Prefieres trabajos con procesos claros y estructuras establecidas?' },
  { n: 27, camino: 'organizador', text: '¿Te sientes cómodo organizando datos y asegurando la precisión?' },
  { n: 28, camino: 'organizador', text: '¿Te motiva mantener registros detallados y bien organizados?' },
  { n: 29, camino: 'organizador', text: '¿Prefieres entornos donde puedas seguir reglas establecidas?' },
  { n: 30, camino: 'organizador', text: '¿Te interesa optimizar sistemas y procesos para mayor eficiencia?' },
]

const CAMINO_STATEMENTS_EN: CaminoStatement[] = [
  { n: 1, camino: 'constructor', text: 'Do you enjoy working outdoors and solving practical problems?' },
  { n: 2, camino: 'constructor', text: 'Do you feel satisfied building or repairing something tangible?' },
  { n: 3, camino: 'constructor', text: 'Do you prefer tasks that involve using tools or machinery?' },
  { n: 4, camino: 'constructor', text: 'Do you like taking immediate action to solve physical problems?' },
  { n: 5, camino: 'constructor', text: 'Are you motivated by turning ideas into something tangible and functional?' },
  { n: 6, camino: 'analista', text: 'Are you interested in investigating the causes and effects of complex problems?' },
  { n: 7, camino: 'analista', text: 'Do you like analysing data and drawing conclusions?' },
  { n: 8, camino: 'analista', text: 'Do you prefer activities that require precision and detailed focus?' },
  { n: 9, camino: 'analista', text: 'Are you excited by finding scientific solutions to global problems?' },
  { n: 10, camino: 'analista', text: 'Are you motivated to explore topics related to science or technology?' },
  { n: 11, camino: 'maestro', text: 'Are you interested in helping others reach their goals?' },
  { n: 12, camino: 'maestro', text: 'Do you enjoy teaching or mentoring in specific areas?' },
  { n: 13, camino: 'maestro', text: 'Do you prefer working in collaborative environments?' },
  { n: 14, camino: 'maestro', text: 'Are you motivated to lead projects that have a positive impact on people?' },
  { n: 15, camino: 'maestro', text: 'Do you feel satisfaction in supporting others emotionally and professionally?' },
  { n: 16, camino: 'innovador', text: 'Do you like expressing yourself through artistic or creative media?' },
  { n: 17, camino: 'innovador', text: 'Do you prefer work that allows for innovation and creative freedom?' },
  { n: 18, camino: 'innovador', text: 'Do you find satisfaction in creating something unique that inspires others?' },
  { n: 19, camino: 'innovador', text: 'Are you motivated to design creative solutions for everyday challenges?' },
  { n: 20, camino: 'innovador', text: 'Are you interested in exploring abstract and unconventional ideas?' },
  { n: 21, camino: 'negociador', text: 'Do you enjoy leading teams toward ambitious goals?' },
  { n: 22, camino: 'negociador', text: 'Are you motivated to persuade others to support your ideas or projects?' },
  { n: 23, camino: 'negociador', text: 'Do you prefer dynamic settings where you can make quick decisions?' },
  { n: 24, camino: 'negociador', text: 'Do you feel comfortable taking calculated risks to innovate?' },
  { n: 25, camino: 'negociador', text: 'Are you interested in spotting business opportunities and acting on them?' },
  { n: 26, camino: 'organizador', text: 'Do you prefer work with clear processes and established structures?' },
  { n: 27, camino: 'organizador', text: 'Do you feel comfortable organising data and ensuring accuracy?' },
  { n: 28, camino: 'organizador', text: 'Are you motivated to keep detailed, well-organised records?' },
  { n: 29, camino: 'organizador', text: 'Do you prefer environments where you can follow established rules?' },
  { n: 30, camino: 'organizador', text: 'Are you interested in optimising systems and processes for greater efficiency?' },
]

// Los 6 tipos, en el orden del libro.
const CAMINOS_ES: Camino[] = [
  {
    code: 'constructor',
    name: 'Constructor',
    description: 'Práctico, orientado a resultados tangibles.',
    caracteristicas: 'Práctico y orientado a la acción. Disfruta trabajar con sus manos y obtener resultados concretos.',
    fortalezas: 'Trabajo práctico, resolución de problemas físicos, transformar ideas en realidades.',
    desafios: 'Puede subestimar el valor del pensamiento estratégico a largo plazo.',
    profesiones: 'Ingeniero, mecánico, arquitecto, técnico, constructor, agricultor.',
    referente: 'Emily Warren Roebling: aprendió ingeniería por su cuenta para terminar el Puente de Brooklyn.',
  },
  {
    code: 'analista',
    name: 'Analista',
    description: 'Curioso, meticuloso, buscador del porqué.',
    caracteristicas: 'Curioso y meticuloso. Siempre en busca de comprender el porqué detrás de las cosas.',
    fortalezas: 'Pensamiento crítico, análisis de datos, resolución de problemas abstractos.',
    desafios: 'Puede tener dificultades para comunicar sus hallazgos de forma accesible.',
    profesiones: 'Científico, analista de datos, programador, investigador, economista.',
    referente: 'Rosalind Franklin: su rigor analítico fue fundamental para descubrir la estructura del ADN.',
  },
  {
    code: 'maestro',
    name: 'Maestro',
    description: 'Empático, guía, orientado al impacto humano.',
    caracteristicas: 'Sobresale en conectar con las personas y guiarlas hacia el crecimiento.',
    fortalezas: 'Comunicación empática, enseñanza, orientación, construcción de relaciones.',
    desafios: 'Puede descuidar sus propias necesidades mientras cuida las de los demás.',
    profesiones: 'Profesor, coach, psicólogo, trabajador social, mentor, terapeuta.',
    referente: 'Maria Montessori: revolucionó la educación poniendo al ser humano en el centro.',
  },
  {
    code: 'innovador',
    name: 'Innovador',
    description: 'Creativo, expresivo, agente de cambio.',
    caracteristicas: 'Creativo por naturaleza, con un fuerte deseo de expresarse y explorar ideas nuevas.',
    fortalezas: 'Creatividad, diseño, autoexpresión, pensar fuera de los límites establecidos.',
    desafios: 'Puede tener dificultades para llevar sus ideas a la práctica de forma sostenible.',
    profesiones: 'Artista, diseñador, escritor, músico, publicista, director creativo.',
    referente: 'Frida Kahlo: convirtió su experiencia más personal en un lenguaje universal.',
  },
  {
    code: 'negociador',
    name: 'Negociador',
    description: 'Líder, persuasivo, orientado al reto.',
    caracteristicas: 'Líder dinámico y persuasivo con energía para asumir riesgos y tomar decisiones.',
    fortalezas: 'Liderazgo, persuasión, toma de decisiones, visión estratégica.',
    desafios: 'Puede sobrecargarse al asumir demasiados frentes a la vez.',
    profesiones: 'Empresario, gerente de ventas, consultor, estratega, fundador.',
    referente: 'Madam C.J. Walker: primera mujer millonaria hecha a sí misma en Estados Unidos.',
  },
  {
    code: 'organizador',
    name: 'Organizador',
    description: 'Metódico, confiable, amante del orden.',
    caracteristicas: 'Metódico y confiable, con habilidad natural para estructurar procesos y mantener el orden.',
    fortalezas: 'Planificación, atención al detalle, gestión de sistemas y procesos.',
    desafios: 'Puede resistirse a los cambios imprevistos o a la ambigüedad.',
    profesiones: 'Gestor de operaciones, contador, administrador, jefe de proyecto.',
    referente: 'Florence Nightingale: salvó vidas implementando sistemas de gestión hospitalaria basados en datos.',
  },
]

const CAMINOS_EN: Camino[] = [
  {
    code: 'constructor',
    name: 'Builder',
    description: 'Practical, oriented toward tangible results.',
    caracteristicas: 'Practical and action-oriented. Enjoys working with their hands and getting concrete results.',
    fortalezas: 'Hands-on work, solving physical problems, turning ideas into realities.',
    desafios: 'May underestimate the value of long-term strategic thinking.',
    profesiones: 'Engineer, mechanic, architect, technician, builder, farmer.',
    referente: 'Emily Warren Roebling: she taught herself engineering to finish the Brooklyn Bridge.',
  },
  {
    code: 'analista',
    name: 'Analyst',
    description: 'Curious, meticulous, a seeker of the why.',
    caracteristicas: 'Curious and meticulous. Always looking to understand the why behind things.',
    fortalezas: 'Critical thinking, data analysis, solving abstract problems.',
    desafios: 'May struggle to communicate their findings in an accessible way.',
    profesiones: 'Scientist, data analyst, programmer, researcher, economist.',
    referente: 'Rosalind Franklin: her analytical rigour was key to discovering the structure of DNA.',
  },
  {
    code: 'maestro',
    name: 'Mentor',
    description: 'Empathetic, a guide, oriented toward human impact.',
    caracteristicas: 'Excels at connecting with people and guiding them toward growth.',
    fortalezas: 'Empathetic communication, teaching, guidance, building relationships.',
    desafios: 'May neglect their own needs while caring for others’.',
    profesiones: 'Teacher, coach, psychologist, social worker, mentor, therapist.',
    referente: 'Maria Montessori: she revolutionised education by putting the human being at the centre.',
  },
  {
    code: 'innovador',
    name: 'Innovator',
    description: 'Creative, expressive, an agent of change.',
    caracteristicas: 'Creative by nature, with a strong drive to express themselves and explore new ideas.',
    fortalezas: 'Creativity, design, self-expression, thinking beyond set limits.',
    desafios: 'May struggle to put their ideas into practice sustainably.',
    profesiones: 'Artist, designer, writer, musician, advertiser, creative director.',
    referente: 'Frida Kahlo: she turned her most personal experience into a universal language.',
  },
  {
    code: 'negociador',
    name: 'Dealmaker',
    description: 'A leader, persuasive, drawn to a challenge.',
    caracteristicas: 'A dynamic, persuasive leader with the energy to take risks and make decisions.',
    fortalezas: 'Leadership, persuasion, decision-making, strategic vision.',
    desafios: 'May overload themselves by taking on too many fronts at once.',
    profesiones: 'Entrepreneur, sales manager, consultant, strategist, founder.',
    referente: 'Madam C.J. Walker: the first self-made female millionaire in the United States.',
  },
  {
    code: 'organizador',
    name: 'Organiser',
    description: 'Methodical, reliable, a lover of order.',
    caracteristicas: 'Methodical and reliable, with a natural ability to structure processes and keep order.',
    fortalezas: 'Planning, attention to detail, managing systems and processes.',
    desafios: 'May resist unexpected changes or ambiguity.',
    profesiones: 'Operations manager, accountant, administrator, project manager.',
    referente: 'Florence Nightingale: she saved lives by building data-driven hospital management systems.',
  },
]

// Gancho de entrada (voz de Manel, muestreada del libro).
const CAMINO_INTRO_ES = {
  title: 'Test CAMINO',
  hook: 'Seis grandes orientaciones que puedes explorar en tu vida profesional. Cuál domina hoy tu forma de trabajar.',
  instructions:
    'Usa una escala del 1 al 5 para evaluar cada afirmación: 1 = nada de acuerdo, 5 = totalmente de acuerdo. No hay respuestas correctas ni incorrectas.',
}

const CAMINO_INTRO_EN = {
  title: 'The CAMINO test',
  hook: 'Six broad directions you can explore in your working life. Which one leads the way you work today.',
  instructions:
    'Use a scale from 1 to 5 to rate each statement: 1 = strongly disagree, 5 = strongly agree. There are no right or wrong answers.',
}

// Cierre, tras ver el resultado (frase núcleo del libro).
const CAMINO_CLOSING_ES = {
  reframe:
    'El tipo con más puntuación es tu orientación dominante. Si dos están muy igualados, probablemente eres una combinación de ambos: algo perfectamente normal y frecuente.',
}

const CAMINO_CLOSING_EN = {
  reframe:
    'The type with the highest score is your leading direction. If two are very close, you’re probably a blend of both: perfectly normal and common.',
}

// Getters por idioma del contenido.
export function getCaminos(locale: string): Camino[] {
  return contentLang(locale) === 'en' ? CAMINOS_EN : CAMINOS_ES
}
export function getCaminoStatements(locale: string): CaminoStatement[] {
  return contentLang(locale) === 'en' ? CAMINO_STATEMENTS_EN : CAMINO_STATEMENTS_ES
}
export function getCaminoIntro(locale: string) {
  return contentLang(locale) === 'en' ? CAMINO_INTRO_EN : CAMINO_INTRO_ES
}
export function getCaminoClosing(locale: string) {
  return contentLang(locale) === 'en' ? CAMINO_CLOSING_EN : CAMINO_CLOSING_ES
}

// Suma por bloques → orientación dominante. Determinista e independiente
// del idioma. `scores` guarda la respuesta por número de frase.
export function computeDominant(scores: Record<string, number>) {
  const totals = CAMINOS_ES.map(c => ({
    code: c.code,
    total: CAMINO_STATEMENTS_ES.filter(s => s.camino === c.code).reduce(
      (sum, s) => sum + (scores[String(s.n)] ?? 0),
      0
    ),
  })).sort((a, b) => b.total - a.total)
  return { dominant: totals[0]?.code ?? null, totals }
}
