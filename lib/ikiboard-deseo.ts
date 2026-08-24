// ============================================================
// HIPÓTESIS DE DESEO — siembra sugerencias de arranque (editables)
// en las tarjetas de ámbito del álbum de IKIBOARD.
//
// No es una funcionalidad completa para las 4 tarjetas: es un primer
// empujón donde ya hay dato suficiente, cero IA, determinista:
//
//   · Vocación  → SIEMPRE, reutilizando el cruce Estrella×CAMINO que ya
//                 calcula generarBorrador() (celda de la matriz). No hay
//                 regla nueva: solo se lee ese dato.
//   · UNA de {Cuerpo y vida · Vínculos · Lo material} → solo la tarjeta
//                 que mapea la máscara dominante, según tabla fija (cada
//                 máscara → exactamente una tarjeta). Las otras dos se
//                 quedan como están ("Sin fotos aún"): fuera de este módulo.
//
// La sugerencia es SIEMPRE editable en la UI y no se guarda hasta que la
// persona la confirma. Mismo patrón que mask.fear en "Lo que hoy te frena".
//
// Nota: las 6 frases de máscara están PENDIENTES del pase de voz final
// de Manel. No desplegar a producción hasta su confirmación.
//
// Bilingüe: la vocación viene ya localizada (seedTmpl del copy). Las
// frases de máscara solo existen en ES por ahora; el getter cae a ES
// mientras no haya EN (contentLang cae a 'es' fuera de 'en').
// ============================================================

import { contentLang } from './content-locale'
import { getIkiboardCopy, type IkiAmbitoId } from './ikiboard-content'
import type { Borrador } from './ikiboard-borrador'
import type { MaskCode } from './masks-content'

// Una sugerencia para una tarjeta de ámbito: la frase en presente + qué
// das con eso. null = sin sugerencia (la tarjeta se queda como está).
export type SugerenciaAmbito = { frase: string; queDoy: string } | null

// El paquete de sugerencias por ámbito del álbum.
export interface DeseoIkiboard {
  vocacion: SugerenciaAmbito // siempre relleno si hay cruce Estrella×CAMINO
  cuerpoYVida: SugerenciaAmbito // solo si mask.dominant es exigente|victima
  vinculos: SugerenciaAmbito // solo si es manipuladora|jueza|complaciente
  loMaterial: SugerenciaAmbito // solo si es controladora|impostora
}

// Tabla fija máscara → tarjeta + copy de arranque. Cada máscara mapea a
// EXACTAMENTE una tarjeta (no las 7 a las 3). Textos de Manel (pendientes
// de su pase de voz final).
const SUGERENCIA_MASCARA_ES: Record<MaskCode, { ambito: IkiAmbitoId } & NonNullable<SugerenciaAmbito>> = {
  exigente: {
    ambito: 'cuerpo',
    frase: 'Descanso sin necesitar habérmelo ganado antes.',
    queDoy: 'Menos ruido de fondo — para mí y para quien esté cerca cuando por fin paro.',
  },
  victima: {
    ambito: 'cuerpo',
    frase: 'Elijo algo pequeño para mi cuerpo, aunque no arregle todo lo demás.',
    queDoy: 'La prueba de que algo sí depende de mí, aunque sea solo esto.',
  },
  manipuladora: {
    ambito: 'vinculos',
    frase: 'Digo lo que pienso, no lo que creo que el otro quiere oír.',
    queDoy: 'Una relación que no tengo que calcular.',
  },
  jueza: {
    ambito: 'vinculos',
    frase: 'Me acerco sin medir antes si el otro se lo merece.',
    queDoy: 'Menos distancia de seguridad, más presencia real.',
  },
  complaciente: {
    ambito: 'vinculos',
    frase: 'Digo que no cuando es que no, y la relación sigue en pie.',
    queDoy: 'Vínculos que no dependen de que yo desaparezca un poco cada vez.',
  },
  controladora: {
    ambito: 'material',
    frase: 'Tengo lo que necesito, sin tener que vigilarlo todo el tiempo.',
    queDoy: 'Puedo soltar el control de una cosa a la vez, y comprobar que sigue en pie.',
  },
  impostora: {
    ambito: 'material',
    frase: 'Lo que tengo es mío, no un préstamo que me puedan quitar.',
    queDoy: 'Dejo de descontarme antes de que nadie me lo pida.',
  },
}

// Traducción al inglés pendiente: mismo mapeo, cae al ES por ahora.
const SUGERENCIA_MASCARA_EN = SUGERENCIA_MASCARA_ES

// Construye las sugerencias a partir de la máscara dominante y del borrador
// ya calculado (para leer la vocación). Puro y determinista: mismas
// entradas → mismas sugerencias. Ningún dato nuevo de Supabase.
export function generarDeseo(
  maskDominant: string | null,
  borrador: Borrador,
  locale = 'es'
): DeseoIkiboard {
  // Vocación: reutiliza la celda del cruce que ya trae el borrador. La
  // frase en presente se arma con el mismo seedTmpl que usa el botón de
  // sembrar vocación (coherencia con lo que ya existe). Sin cruce → null.
  const vocacion: SugerenciaAmbito = borrador.vocacion
    ? {
        frase: getIkiboardCopy(locale).ui.seedTmpl(borrador.vocacion.orientacion.toLowerCase()),
        queDoy: '',
      }
    : null

  const deseo: DeseoIkiboard = {
    vocacion,
    cuerpoYVida: null,
    vinculos: null,
    loMaterial: null,
  }

  // La tarjeta que corresponde a la máscara dominante (solo esa).
  const tabla = contentLang(locale) === 'en' ? SUGERENCIA_MASCARA_EN : SUGERENCIA_MASCARA_ES
  const m = maskDominant ? tabla[maskDominant as MaskCode] : undefined
  if (m) {
    const sugerencia: SugerenciaAmbito = { frase: m.frase, queDoy: m.queDoy }
    if (m.ambito === 'cuerpo') deseo.cuerpoYVida = sugerencia
    else if (m.ambito === 'vinculos') deseo.vinculos = sugerencia
    else if (m.ambito === 'material') deseo.loMaterial = sugerencia
  }

  return deseo
}

// Selecciona la sugerencia de un ámbito concreto del paquete. Helper para
// la UI, que itera las tarjetas por su IkiAmbitoId.
export function sugerenciaDeAmbito(deseo: DeseoIkiboard, ambito: IkiAmbitoId): SugerenciaAmbito {
  switch (ambito) {
    case 'vocacion':
      return deseo.vocacion
    case 'cuerpo':
      return deseo.cuerpoYVida
    case 'vinculos':
      return deseo.vinculos
    case 'material':
      return deseo.loMaterial
    default:
      return null
  }
}
