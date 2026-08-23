// ============================================================
// EL BORRADOR — el director de orquesta de IKIBOARD.
// Cruza en código (cero IA) los tres instrumentos:
//   Estrellas (lo que amas / tu estilo)  → identidad + fila del cruce
//   CAMINO    (lo que se te da bien)      → columna del cruce
//   Máscaras  (lo que te frena)           → el motor + la semilla del paso
//
// De ese cruce sale un BORRADOR determinista: la zona Vocación
// sembrada, la semilla de la identidad, y unas "instrucciones para
// seguir tu camino" (celda de la matriz + freno + paso).
//
// Nada se inventa: cada pieza sale de un test del usuario y de la
// matriz del libro. Si falta un instrumento, ese trozo del borrador
// queda vacío y el tablero sigue funcionando. Fuente: docs/fuentes.md.
//
// Bilingüe: el idioma sale del locale (contentLang). Los perfiles y la
// matriz ya vienen en el idioma correcto; aquí se localizan además las
// frases-puente que tejen las piezas.
// ============================================================

import { getEstrellas, type EstrellaCode } from './estrellas-content'
import { getCaminos, type CaminoCode } from './camino-content'
import { getMasks, type MaskCode } from './masks-content'
import { cruzar, type MatrizCelda } from './ikiboard-matrix'
import { contentLang } from './content-locale'

// Lo que el tablero necesita del cruce. Todo puede venir null: el
// borrador se rellena con lo que haya y deja el resto por sembrar.
export interface BorradorInput {
  estrella: string | null
  camino: string | null
  maskDominant: string | null
  // El "empezaría por…" que la persona escribió en su máscara (paso 4).
  maskPaso: string | null
}

export interface Borrador {
  // Semilla de la identidad ("estoy siendo alguien…"), de la Estrella.
  identidad: string | null
  // La celda del cruce Estrella×CAMINO → siembra la zona Vocación.
  vocacion: MatrizCelda | null
  // Instrucciones para seguir tu camino: pasos concretos y ordenados.
  // Cada una tiene rótulo + cuerpo, para pintarlas como lista.
  instrucciones: { label: string; body: string }[]
  // ¿Hay material suficiente para mostrar el borrador? (al menos el cruce)
  hayCruce: boolean
}

// Construye el borrador a partir de los tres instrumentos, en el idioma
// del contenido. Puro y determinista: mismas entradas → mismo borrador.
export function generarBorrador(input: BorradorInput, locale = 'es'): Borrador {
  const en = contentLang(locale) === 'en'
  const estrella = getEstrellas(locale).find(e => e.code === (input.estrella as EstrellaCode)) ?? null
  const camino = getCaminos(locale).find(c => c.code === (input.camino as CaminoCode)) ?? null
  const mask = getMasks(locale).find(m => m.code === (input.maskDominant as MaskCode)) ?? null
  const celda = cruzar(input.estrella, input.camino, locale)

  // Identidad: la Estrella habla de quién estás siendo. Se ofrece en
  // presente, como semilla que la persona completa.
  const identidad = estrella
    ? en
      ? `I’m becoming someone ${lowerFirst(estrella.description).replace(/\.$/, '')}`
      : `Estoy siendo alguien ${lowerFirst(estrella.description).replace(/\.$/, '')}`
    : null

  // Instrucciones: celda del cruce + freno + paso, tejidas en orden.
  const instrucciones: { label: string; body: string }[] = []

  if (celda) {
    instrucciones.push(
      en
        ? {
            label: 'Your ground',
            body: `Where your style and your capabilities meet: ${lowerFirst(celda.orientacion)}. Someone embodied it before you — ${celda.ejemplo}.`,
          }
        : {
            label: 'Tu terreno',
            body: `Donde tu estilo y tus capacidades se encuentran: ${lowerFirst(celda.orientacion)}. Alguien lo encarnó antes que tú — ${celda.ejemplo}.`,
          }
    )
  }

  if (camino) {
    instrucciones.push(
      en
        ? {
            label: 'Lean on your strengths',
            body: `Your strength is in: ${lowerFirst(camino.fortalezas).replace(/\.$/, '')}. Start there, not with what feels hard.`,
          }
        : {
            label: 'Apóyate en lo que se te da bien',
            body: `Tu fuerza está en: ${lowerFirst(camino.fortalezas).replace(/\.$/, '')}. Empieza por ahí, no por lo que te cuesta.`,
          }
    )
  }

  if (mask) {
    instrucciones.push(
      en
        ? {
            label: 'What holds you back today',
            body: `Underneath is the ${mask.fear}. It doesn’t have to disappear: it’s enough to recognise it when it shows up, so it doesn’t decide for you.`,
          }
        : {
            label: 'Lo que hoy te frena',
            body: `Debajo late el ${mask.fear}. No hace falta que desaparezca: basta con que lo reconozcas cuando aparezca, para que no decida por ti.`,
          }
    )
  }

  if (input.maskPaso && input.maskPaso.trim()) {
    instrucciones.push({
      label: en ? 'Your first step' : 'Tu primer paso',
      body: input.maskPaso.trim(),
    })
  }

  return {
    identidad,
    vocacion: celda,
    instrucciones,
    hayCruce: Boolean(celda),
  }
}

// "Curioso, aventurero…" → "curioso, aventurero…" (para encadenar
// dentro de una frase sin mayúscula intrusa).
function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}
