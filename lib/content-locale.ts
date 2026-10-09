// ============================================================
// Idioma del CONTENIDO (voz de Manel). El copy estructurado de las
// herramientas (perfiles, frases, matriz, recorrido de IKIBOARD) vive
// en TypeScript, no en messages/*.json, porque son arrays y objetos
// anidados. Este helper elige la variante según el locale de la URL.
//
// Idiomas con contenido: español (por defecto, la voz original del
// manuscrito), catalán e inglés. Cada herramienta traduce por fases;
// las que aún no tienen catalán caen en español, para no dejar huecos.
// ============================================================

export type ContentLang = 'es' | 'ca' | 'en'

export function contentLang(locale: string): ContentLang {
  if (locale === 'en') return 'en'
  if (locale === 'ca') return 'ca'
  return 'es'
}
