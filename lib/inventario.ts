// ============================================================
// INVENTARIO HONESTO — lógica de la devolución (cero IA).
// Test de entrada gratuito: 15 preguntas cerradas + 1 abierta opcional
// sobre las dos caras del ikigai (Activo y Consciente), todas ancladas
// en «El Ikigai que no te contaron». Definición en docs/inventario.md.
//
// Todo va sobre CÓDIGOS independientes del idioma: las respuestas, las
// observaciones y los ejercicios. El texto visible vive en
// lib/inventario-content.ts. Las mismas reglas sirven a la página, al
// servidor (que revalida) y al email, para que la lectura sea idéntica.
//
// Las reglas son propuesta editorial de Manel, no un instrumento
// validado: no hay puntuación global, ni perfiles, ni porcentajes.
// ============================================================

import type { CaminoCode } from './camino-content'

// Orden del recorrido. `texto` (la abierta) va aparte: es opcional.
export const INV_QUESTION_IDS = [
  'ocup', 'piloto',
  'pasion', 'bueno', 'aporte', 'vivir', 'camino',
  'presencia', 'cotidiano', 'paz', 'valor', 'apagarte', 'vinculo',
  'ritmo', 'energia',
] as const
export type InvQuestionId = (typeof INV_QUESTION_IDS)[number]

const CAMINO_CODES: CaminoCode[] = ['constructor', 'analista', 'maestro', 'innovador', 'negociador', 'organizador']

// Códigos válidos por pregunta. El servidor rechaza cualquier otro valor.
export const INV_OPTIONS: Record<InvQuestionId, readonly string[]> = {
  ocup: ['empleo', 'propia', 'cuidados', 'estudios', 'busqueda', 'jubilacion', 'otra'],
  piloto: ['ocupacion', 'relaciones', 'cuerpo', 'tiempo', 'varias', 'ninguna'],
  pasion: ['claro', 'parcial', 'abierto'],
  bueno: ['claro', 'parcial', 'nolose'],
  aporte: ['claro', 'parcial', 'abierto'],
  vivir: ['claro', 'parcial', 'nolose', 'nomia'],
  camino: [...CAMINO_CODES, 'ninguna'],
  presencia: ['si', 'cuesta', 'no'],
  cotidiano: ['si', 'nofijado', 'no'],
  paz: ['si', 'depende', 'pocas'],
  valor: ['no', 'aveces', 'si'],
  apagarte: ['puedo', 'depende', 'apagar'],
  vinculo: ['si', 'noseguro', 'no'],
  ritmo: ['estimula', 'epoca', 'desgasta'],
  energia: ['siempre', 'aveces', 'nunca'],
}

export type InvAnswers = Record<InvQuestionId, string>

// Límite del texto libre (también en el textarea).
export const INV_TEXTO_MAX = 400

// Valida un objeto de respuestas llegado del cliente. Devuelve null si
// falta alguna o trae un código que no existe.
export function parseInvAnswers(input: unknown): InvAnswers | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Record<string, unknown>
  const out = {} as InvAnswers
  for (const id of INV_QUESTION_IDS) {
    const v = raw[id]
    if (typeof v !== 'string' || !INV_OPTIONS[id].includes(v)) return null
    out[id] = v
  }
  return out
}

export function cleanTexto(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.trim().slice(0, INV_TEXTO_MAX)
}

// ---------- Reglas ----------

export interface InvFlags {
  activoClaro: boolean
  activoAbierto: boolean
  aporteClaro: boolean
  presenciaAlta: boolean
  presenciaBaja: boolean
  coherenciaSostiene: boolean
  coherenciaAtencion: boolean
  vinculoSostiene: boolean
  vinculoAtencion: boolean
  pazBaja: boolean
  desgaste: boolean
  sinEmpleo: boolean
  incierto: boolean
}

export function analyzeInv(a: InvAnswers): InvFlags {
  // «No es mi pregunta en este momento» saca «de qué vivir» del recuento.
  const act = (['pasion', 'bueno', 'aporte', 'vivir'] as const).filter(k => a[k] !== 'nomia')
  const claros = act.filter(k => a[k] === 'claro').length
  const abiertos = act.filter(k => a[k] === 'abierto' || a[k] === 'nolose').length
  // Respuestas de «no lo sé / depende»: muchas juntas = ruta incierta.
  const inciertas = [
    a.bueno === 'nolose',
    a.vivir === 'nolose',
    a.cotidiano === 'nofijado',
    a.vinculo === 'noseguro',
    a.apagarte === 'depende',
    a.paz === 'depende',
  ].filter(Boolean).length

  return {
    activoClaro: claros >= Math.max(2, act.length - 1),
    activoAbierto: abiertos >= 2,
    aporteClaro: a.aporte === 'claro',
    presenciaAlta: a.presencia === 'si' && a.cotidiano === 'si',
    presenciaBaja: a.presencia !== 'si' && a.cotidiano !== 'si',
    coherenciaSostiene: a.apagarte === 'puedo' && a.valor === 'no',
    coherenciaAtencion: a.valor === 'si' || a.apagarte === 'apagar',
    vinculoSostiene: a.vinculo === 'si',
    vinculoAtencion: a.vinculo === 'no',
    pazBaja: a.paz === 'pocas',
    desgaste: a.ritmo === 'desgasta' && a.energia === 'nunca',
    sinEmpleo: ['cuidados', 'estudios', 'busqueda', 'jubilacion'].includes(a.ocup),
    incierto: inciertas >= 4,
  }
}

export type SupportKey = 'activoClaro' | 'aporte' | 'presencia' | 'coherencia' | 'vinculo'
export type AttentionKey = 'desgaste' | 'coherencia' | 'presencia' | 'activo' | 'vinculo' | 'paz'
export type PairKey = 'direccionPiloto' | 'ningunaPresencia'
export type ExerciseKey =
  | 'ecologia' | 'voz' | 'cotidiano' | 'dejaste' | 'contraste' | 'pilares' | 'tiempo' | 'inventario'
export type InvRoute = 'atencion' | 'nada' | 'incierto'

// Orden fijo de prioridad: la primera que se cumple es la principal.
const ATTENTION_ORDER: { key: AttentionKey; when: (f: InvFlags) => boolean; exercise: ExerciseKey }[] = [
  { key: 'desgaste', when: f => f.desgaste, exercise: 'ecologia' },
  { key: 'coherencia', when: f => f.coherenciaAtencion, exercise: 'voz' },
  { key: 'presencia', when: f => f.presenciaBaja, exercise: 'cotidiano' },
  { key: 'activo', when: f => f.activoAbierto, exercise: 'dejaste' },
  { key: 'vinculo', when: f => f.vinculoAtencion, exercise: 'contraste' },
  { key: 'paz', when: f => f.pazBaja, exercise: 'pilares' },
]

export interface InvLectura {
  flags: InvFlags
  route: InvRoute
  // Lo que sostiene: como mucho una pieza de cada dimensión.
  supports: SupportKey[]
  principal: AttentionKey | null
  secundaria: AttentionKey | null
  pair: PairKey | null
  exercise: ExerciseKey
}

export function buildLectura(a: InvAnswers): InvLectura {
  const f = analyzeInv(a)

  const supports: SupportKey[] = []
  if (f.activoClaro) supports.push('activoClaro')
  else if (f.aporteClaro) supports.push('aporte')
  if (f.presenciaAlta) supports.push('presencia')
  else if (f.coherenciaSostiene) supports.push('coherencia')
  else if (f.vinculoSostiene) supports.push('vinculo')

  const active = ATTENTION_ORDER.filter(o => o.when(f))
  const route: InvRoute = f.incierto ? 'incierto' : active.length ? 'atencion' : 'nada'
  const principal = route === 'atencion' ? active[0].key : null
  const secundaria = route === 'atencion' && active[1] ? active[1].key : null
  const exercise: ExerciseKey =
    route === 'incierto' ? 'inventario' : route === 'nada' ? 'tiempo' : active[0].exercise

  // Dos respuestas que conviven: se muestran juntas, sin resolverlas.
  const pair: PairKey | null =
    f.activoClaro && a.piloto === 'ocupacion'
      ? 'direccionPiloto'
      : a.piloto === 'ninguna' && f.presenciaBaja
        ? 'ningunaPresencia'
        : null

  return { flags: f, route, supports, principal, secundaria, pair, exercise }
}
