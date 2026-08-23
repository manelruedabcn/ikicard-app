// ============================================================
// EL CRUCE — Matriz ESTRELLA × CAMINO (borrador determinista).
// Digitaliza la "Matriz ESTRELLA / CAMINO (I y II)" del libro
// "El Ikigai que no te contaron". Los textos son de Manel.
//
// La matriz cruza tu Estrella dominante (fila: lo que amas, tu
// estilo) con tu tipo CAMINO dominante (columna: lo que se te da
// bien, tus capacidades). La celda es la orientación más específica
// de tu ikigai activo → siembra la zona Vocación del tablero.
//
// Todo determinista: se busca en la tabla, sin IA. Si falta uno de
// los dos tests, no hay celda y el tablero funciona igual (la zona
// Vocación queda por sembrar a mano).
// ============================================================

import type { EstrellaCode } from './estrellas-content'
import type { CaminoCode } from './camino-content'
import { contentLang } from './content-locale'

// Una celda del cruce: la orientación concreta + un referente real.
export interface MatrizCelda {
  // La orientación de la celda ("proyectos al aire libre", etc.).
  orientacion: string
  // El ejemplo/referente que el libro asocia a la celda.
  ejemplo: string
}

type Matriz = Record<EstrellaCode, Record<CaminoCode, MatrizCelda>>

// 24 celdas: 4 estrellas (filas) × 6 caminos (columnas). Verbatim
// del libro (Matriz I: Constructor·Analista·Maestro; II:
// Innovador·Negociador·Organizador).
const MATRIZ_ES: Matriz = {
  explorador: {
    constructor: { orientacion: 'Proyectos al aire libre', ejemplo: 'Thomas Andrews, diseñador del Titanic' },
    analista: { orientacion: 'Investigadores de campo', ejemplo: 'Alexander von Humboldt, explorador' },
    maestro: { orientacion: 'Guías que enseñan explorando', ejemplo: 'Freya Stark, escritora' },
    innovador: { orientacion: 'Artistas inspirados en la naturaleza', ejemplo: 'Mary Anning, pintora botánica' },
    negociador: { orientacion: 'Emprendedores de experiencias únicas', ejemplo: 'Jacques Cousteau' },
    organizador: { orientacion: 'Planificadores científicos', ejemplo: 'Isabella Bird, exploradora' },
  },
  comunicador: {
    constructor: { orientacion: 'Líderes que inspiran equipos técnicos', ejemplo: 'Louise B. Bethune, arquitecta' },
    analista: { orientacion: 'Divulgadores científicos', ejemplo: 'Mae Jemison, astronauta' },
    maestro: { orientacion: 'Profesores motivadores', ejemplo: 'Jaime Escalante, educador' },
    innovador: { orientacion: 'Directores creativos', ejemplo: 'Paul Rand, diseñador gráfico' },
    negociador: { orientacion: 'Líderes de ventas', ejemplo: 'Estée Lauder, empresaria' },
    organizador: { orientacion: 'Gestores administrativos', ejemplo: 'Grace Hopper, informática' },
  },
  protector: {
    constructor: { orientacion: 'Infraestructuras seguras', ejemplo: 'Gustave Eiffel, ingeniero' },
    analista: { orientacion: 'Investigadores en salud pública', ejemplo: 'Ellen Swallow Richards' },
    maestro: { orientacion: 'Educadores sociales', ejemplo: 'Clara Barton, Cruz Roja' },
    innovador: { orientacion: 'Terapeutas artísticos', ejemplo: 'Mary Cassatt, pintora' },
    negociador: { orientacion: 'Líderes de ONG', ejemplo: 'Wangari Maathai, activista' },
    organizador: { orientacion: 'Reformadores sociales', ejemplo: 'Dorothea Dix' },
  },
  visionario: {
    constructor: { orientacion: 'Urbanistas con impacto social', ejemplo: 'Zaha Hadid, arquitecta' },
    analista: { orientacion: 'Científicos visionarios', ejemplo: 'Carl Sagan, astrofísico' },
    maestro: { orientacion: 'Mentores estratégicos', ejemplo: 'Oprah Winfrey' },
    innovador: { orientacion: 'Diseñadores de tecnología', ejemplo: 'Steve Jobs, Apple' },
    negociador: { orientacion: 'CEOs transformadores', ejemplo: 'Sheryl Sandberg' },
    organizador: { orientacion: 'Planificadores estratégicos', ejemplo: 'Katherine Johnson, NASA' },
  },
}

const MATRIZ_EN: Matriz = {
  explorador: {
    constructor: { orientacion: 'Outdoor, hands-on projects', ejemplo: 'Thomas Andrews, designer of the Titanic' },
    analista: { orientacion: 'Field researchers', ejemplo: 'Alexander von Humboldt, explorer' },
    maestro: { orientacion: 'Guides who teach by exploring', ejemplo: 'Freya Stark, writer' },
    innovador: { orientacion: 'Artists inspired by nature', ejemplo: 'Mary Anning, botanical painter' },
    negociador: { orientacion: 'Founders of one-of-a-kind experiences', ejemplo: 'Jacques Cousteau' },
    organizador: { orientacion: 'Scientific planners', ejemplo: 'Isabella Bird, explorer' },
  },
  comunicador: {
    constructor: { orientacion: 'Leaders who inspire technical teams', ejemplo: 'Louise B. Bethune, architect' },
    analista: { orientacion: 'Science communicators', ejemplo: 'Mae Jemison, astronaut' },
    maestro: { orientacion: 'Teachers who motivate', ejemplo: 'Jaime Escalante, educator' },
    innovador: { orientacion: 'Creative directors', ejemplo: 'Paul Rand, graphic designer' },
    negociador: { orientacion: 'Sales leaders', ejemplo: 'Estée Lauder, entrepreneur' },
    organizador: { orientacion: 'Administrative managers', ejemplo: 'Grace Hopper, computer scientist' },
  },
  protector: {
    constructor: { orientacion: 'Safe infrastructure', ejemplo: 'Gustave Eiffel, engineer' },
    analista: { orientacion: 'Public-health researchers', ejemplo: 'Ellen Swallow Richards' },
    maestro: { orientacion: 'Social educators', ejemplo: 'Clara Barton, Red Cross' },
    innovador: { orientacion: 'Art therapists', ejemplo: 'Mary Cassatt, painter' },
    negociador: { orientacion: 'NGO leaders', ejemplo: 'Wangari Maathai, activist' },
    organizador: { orientacion: 'Social reformers', ejemplo: 'Dorothea Dix' },
  },
  visionario: {
    constructor: { orientacion: 'Urban planners with social impact', ejemplo: 'Zaha Hadid, architect' },
    analista: { orientacion: 'Visionary scientists', ejemplo: 'Carl Sagan, astrophysicist' },
    maestro: { orientacion: 'Strategic mentors', ejemplo: 'Oprah Winfrey' },
    innovador: { orientacion: 'Technology designers', ejemplo: 'Steve Jobs, Apple' },
    negociador: { orientacion: 'Transformative CEOs', ejemplo: 'Sheryl Sandberg' },
    organizador: { orientacion: 'Strategic planners', ejemplo: 'Katherine Johnson, NASA' },
  },
}

// Busca la celda del cruce en el idioma del contenido. Devuelve null
// si falta algún test.
export function cruzar(
  estrella: EstrellaCode | string | null,
  camino: CaminoCode | string | null,
  locale = 'es'
): MatrizCelda | null {
  if (!estrella || !camino) return null
  const matriz = contentLang(locale) === 'en' ? MATRIZ_EN : MATRIZ_ES
  const fila = matriz[estrella as EstrellaCode]
  if (!fila) return null
  return fila[camino as CaminoCode] ?? null
}
