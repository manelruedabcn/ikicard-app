// Titulares-gancho del informe PASO. Van ARRIBA, junto al gráfico, para dar el
// golpe visual y hacer que la persona quiera seguir leyendo el desarrollo de
// abajo. Se generan DINÁMICAMENTE desde los datos de cada persona (eje dominante
// y brecha máscara↔real), no son fijos por caminante.
//
// Voz: la misma de PASO — calma, honesta, sin eslóganes de anuncio. Un titular
// es un anzuelo hacia una sección de abajo, no una afirmación cerrada.

import { type Dim, type InformePaso } from './paso-content'

type Locale = 'es' | 'en'

const NOMBRE_EJE: Record<Locale, Record<Dim, string>> = {
  es: { P: 'Pisar firme', A: 'Acompañar', S: 'Sostener', O: 'Observar' },
  en: { P: 'Press on', A: 'Accompany', S: 'Sustain', O: 'Observe' },
}

// Titular del eje dominante: "tu fuerza es…". Sale del score más alto.
const DOMINANTE: Record<Locale, Record<Dim, string>> = {
  es: {
    P: 'Tu fuerza es decidir y avanzar.',
    A: 'Tu fuerza es caminar acompañado.',
    S: 'Tu fuerza es sostener el paso.',
    O: 'Tu fuerza es mirar antes de pisar.',
  },
  en: {
    P: 'Your strength is deciding and moving.',
    A: 'Your strength is walking alongside others.',
    S: 'Your strength is holding your pace.',
    O: 'Your strength is looking before you step.',
  },
}

// Titular jugoso de la brecha principal. Versión corta (de titular) de la
// narrativa máscara↔real. "exige" = muestras el rasgo por encima de tu instinto;
// "esconde" = tu instinto lo sostiene más de lo que muestras.
const BRECHA: Record<Locale, Record<Dim, { exige: string; esconde: string }>> = {
  es: {
    P: {
      exige: 'Por fuera empujas más de lo que por dentro pides.',
      esconde: 'Guardas más determinación de la que enseñas.',
    },
    A: {
      exige: 'Agradas más de lo que de verdad necesitas.',
      esconde: 'La gente te importa más de lo que muestras.',
    },
    S: {
      exige: 'Aparentas más calma de la que sientes.',
      esconde: 'Sostienes mucho más de lo que aparentas.',
    },
    O: {
      exige: 'Controlas más de lo que necesitarías.',
      esconde: 'Observas mucho más de lo que dejas ver.',
    },
  },
  en: {
    P: {
      exige: 'You push harder outside than you ask for inside.',
      esconde: 'You hold more resolve than you show.',
    },
    A: {
      exige: 'You please more than you truly need to.',
      esconde: 'People matter more than you let on.',
    },
    S: {
      exige: 'You show more calm than you feel.',
      esconde: 'You sustain far more than you appear to.',
    },
    O: {
      exige: 'You control more than you would need to.',
      esconde: 'You observe far more than you reveal.',
    },
  },
}

const FOCO: Record<Locale, (dim: string) => string> = {
  es: dim => `Y donde más te separas de ti es en «${dim}».`,
  en: dim => `And where you separate from yourself most is “${dim}”.`,
}

const ALINEADO: Record<Locale, string> = {
  es: 'Hoy caminas muy cerca de ti.',
  en: 'Today you walk very close to yourself.',
}

function esLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'es'
}

// Devuelve los titulares en orden de impacto: el primero es el "gancho" grande
// (la brecha jugosa, o el alineado); los siguientes son subtítulos.
//
// `dominante` llega YA resuelto desde fuera (el eje dominante por SEGMENTOS, la
// misma fuente que da el nombre del Caminante y la firma). Así el titular "tu
// fuerza es…" nunca contradice al nombre: el score neto crudo y la zona normada
// pueden señalar ejes distintos, y el nombre manda.
export function generarTitulares(inf: InformePaso, dominante: Dim, locale: string): string[] {
  const L = esLocale(locale)

  const tDominante = DOMINANTE[L][dominante]

  const separaciones = inf.brechas.filter(b => b.direccion !== 'alineado')

  if (separaciones.length === 0) {
    return [ALINEADO[L], tDominante]
  }

  const top = separaciones[0]
  const dir = top.direccion === 'exige_de_mas' ? 'exige' : 'esconde'
  const tBrecha = BRECHA[L][top.dimension][dir]
  const tFoco = FOCO[L](NOMBRE_EJE[L][top.dimension])

  return [tBrecha, tDominante, tFoco]
}

// ── FOMO: bucles de curiosidad para tirar del scroll ────────────────────────
// Nombran algo concreto que está MÁS ABAJO sin desvelarlo. Misma voz calma,
// sin promesas ni tono de anuncio. Cada uno apunta a una sección distinta para
// repartir el enganche a lo largo del informe.

// M1 — bajo el titular. Abre el bucle máscara↔real y remite a la lectura de
// abajo (Narrativa / Dónde te separas). Dinámico según la dirección de la
// brecha principal. Si hoy vas alineado, el anzuelo es más suave.
const TEASER_GANCHO: Record<Locale, { exige: string; esconde: string; alineado: string }> = {
  es: {
    exige: 'Te muestras distinto de como eres por dentro. Abajo verás dónde.',
    esconde: 'Guardas cosas que casi no enseñas. Abajo verás cuáles.',
    alineado: 'Hoy caminas cerca de ti, pero hay matices. Abajo verás cuáles.',
  },
  en: {
    exige: 'You show up different from who you are inside. You’ll see where below.',
    esconde: 'You hold things you barely show. You’ll see which below.',
    alineado: 'Today you walk close to yourself, but there are nuances. See them below.',
  },
}

export function generarTeaserGancho(inf: InformePaso, locale: string): string {
  const L = esLocale(locale)
  const sep = inf.brechas.filter(b => b.direccion !== 'alineado')
  if (sep.length === 0) return TEASER_GANCHO[L].alineado
  const dir = sep[0].direccion === 'exige_de_mas' ? 'exige' : 'esconde'
  return TEASER_GANCHO[L][dir]
}

// M2 — antes de la lectura del patrón (donde está «Lo que temes»). Un solo
// teaser, seco, que anticipa el punto incómodo sin resolverlo.
const TEASER_TEMIDO: Record<Locale, string> = {
  es: 'Hay un punto donde tu forma de caminar se te vuelve en contra.',
  en: 'There’s a point where your way of walking turns against you.',
}

export function teaserTemido(locale: string): string {
  return TEASER_TEMIDO[esLocale(locale)]
}

// M3 — bajo la rareza, en la cabecera. Tira hasta el final: el mapa de las 15
// formas cierra el scroll. Cuanto más rara la forma, más fuerte el anzuelo.
const TEASER_RAREZA: Record<Locale, Record<'frecuente' | 'habitual' | 'poco', string>> = {
  es: {
    frecuente: 'Compartes forma con mucha gente. Al final ves con cuáles.',
    habitual: 'No es la forma más común. Al final ves entre cuáles estás.',
    poco: 'Caminas de una forma que comparte poca gente. Al final, cuál.',
  },
  en: {
    frecuente: 'Many people share your way. You’ll see which at the end.',
    habitual: 'Not the most common way. You’ll see where you land at the end.',
    poco: 'Few people share your way of walking. Which, at the end.',
  },
}

export function teaserRareza(rareza: 'frecuente' | 'habitual' | 'poco', locale: string): string {
  return TEASER_RAREZA[esLocale(locale)][rareza]
}
