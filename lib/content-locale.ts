// ============================================================
// Idioma del CONTENIDO (voz de Manel). El copy estructurado de las
// herramientas (perfiles, frases, matriz, recorrido de IKIBOARD) vive
// en TypeScript, no en messages/*.json, porque son arrays y objetos
// anidados. Este helper elige la variante según el locale de la URL.
//
// Hoy hay dos variantes de contenido: español (por defecto, la voz
// original del manuscrito) e inglés. Cualquier locale que no sea 'en'
// cae en español, para no dejar huecos vacíos si se añaden idiomas de
// interfaz antes de traducir su contenido.
// ============================================================

export type ContentLang = 'es' | 'en'

export function contentLang(locale: string): ContentLang {
  return locale === 'en' ? 'en' : 'es'
}
