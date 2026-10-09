// ============================================================
// Taller (el cuaderno) — selección de idioma del contenido.
//
// El contenido vive en `taller-content.ts` (castellano, autogenerado desde el
// manuscrito) y en `taller-content-ca.ts` (catalán, autogenerado desde el
// manuscrito catalán con scripts/gen-taller-ca.py). Los ids de pregunta son
// idénticos en ambos, así que las respuestas guardadas no dependen del idioma.
//
// No hay inglés: el cuaderno no se ha traducido al inglés.
// ============================================================

import { TALLER_CONTENT, type Section } from './taller-content'
import { TALLER_CONTENT_CA } from './taller-content-ca'

export function getTallerContent(locale: string): Section[] {
  return locale === 'ca' ? TALLER_CONTENT_CA : TALLER_CONTENT
}
