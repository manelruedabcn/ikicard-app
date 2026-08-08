// Generador de la lectura "máscara vs real" del informe PASO.
//
// El corazón de PASO no es la etiqueta ("eres el Caminante X"), sino la BRECHA:
// la distancia entre cómo te MUESTRAS (máscara, de los MÁS) y cómo caminas por
// DENTRO (natural, de los MENOS). Este módulo convierte esos datos en un texto
// que cualquier persona entiende, sin jerga, para CADA caso posible.
//
// Voz: nunca "eres así", siempre "te muestras así… pero por dentro…".
// Es una lectura de lo que dibujan tus respuestas, una dirección para mirar;
// no un diagnóstico ni una medida científica.

import { type Dim, type InformePaso } from './paso-content'

type Locale = 'es' | 'en'
type Direccion = 'exige_de_mas' | 'esconde' | 'alineado'

export interface NarrativaPaso {
  intro: string
  lineas: string[] // frases por eje con brecha, de mayor a menor
  sintesis: string // dónde te separas MÁS (vacío si vas alineado)
  invitacion: string // vacío si vas alineado
}

// Cuántas separaciones se narran, como mucho (las más grandes). El detalle
// numérico completo de los cuatro ejes lo da el bloque de brechas aparte.
const MAX_LINEAS = 3

// Una brecha por debajo de esto es un temblor, no una separación: no merece un
// párrafo propio (narrarla sería sobre-afirmar). Aun así siempre se cuenta la
// mayor, para que el informe nunca se quede mudo cuando hay algo que mirar.
const UMBRAL_NARRAR = 2

const NOMBRE_EJE: Record<Locale, Record<Dim, string>> = {
  es: { P: 'Paso firme', A: 'Acompañado', S: 'Sostenido', O: 'Observador' },
  en: { P: 'Firm step', A: 'Accompanied', S: 'Sustained', O: 'Observer' },
}

// Frase por (eje, dirección). "exige" = la máscara empuja el rasgo por encima de
// tu instinto. "esconde" = tu instinto sostiene el rasgo más de lo que muestras.
const FRASE: Record<Locale, Record<Dim, { exige: string; esconde: string }>> = {
  es: {
    P: {
      exige:
        'Por fuera te muestras decidido y directo, siempre empujando hacia delante. Pero por dentro tu instinto no pide tanta marcha: te exiges avanzar y resolver más de lo que de verdad necesitas.',
      esconde:
        'Por fuera apenas empujas, dejas que las cosas lleguen a su ritmo. Pero por dentro llevas más determinación de la que enseñas: guardas una fuerza para decidir que casi no sacas a la luz.',
    },
    A: {
      exige:
        'Por fuera te muestras sociable y cercano, muy pendiente de los demás. Pero por dentro no lo necesitas tanto: te exiges estar disponible y agradar más de lo que te nace.',
      esconde:
        'Por fuera pareces ir a lo tuyo, sin depender de nadie. Pero por dentro la gente te importa mucho más de lo que dejas ver: guardas una necesidad de compañía que no muestras.',
    },
    S: {
      exige:
        'Por fuera te muestras calmado y constante, con el ritmo siempre bajo control. Pero por dentro no eres tan sereno: te exiges aguantar y sostener más de lo que tu instinto pediría.',
      esconde:
        'Por fuera muestras poca paciencia y vas cambiando el paso. Pero por dentro sostienes mucho más de lo que enseñas: guardas una constancia que no dejas ver.',
    },
    O: {
      exige:
        'Por fuera te muestras analítico y prudente, mirando bien antes de dar cada paso. Pero por dentro no lo necesitas tanto: te exiges controlar y calcular más de lo que te sale natural.',
      esconde:
        'Por fuera pareces lanzarte sin darle muchas vueltas. Pero por dentro observas y calculas mucho más de lo que enseñas: guardas una cautela que no muestras.',
    },
  },
  en: {
    P: {
      exige:
        "On the outside you come across as decisive and direct, always pushing forward. But inside your instinct doesn't ask for so much drive: you push yourself to advance and resolve more than you really need to.",
      esconde:
        'On the outside you barely push; you let things arrive at their own pace. But inside you carry more determination than you show: you hold back a decisiveness you rarely bring out.',
    },
    A: {
      exige:
        "On the outside you come across as sociable and warm, very attentive to others. But inside you don't need it that much: you push yourself to be available and to please more than comes naturally.",
      esconde:
        'On the outside you seem to go your own way, not depending on anyone. But inside people matter to you far more than you let on: you hold back a need for company you don\'t show.',
    },
    S: {
      exige:
        "On the outside you come across as calm and steady, always keeping the pace under control. But inside you're not that serene: you push yourself to endure and sustain more than your instinct would ask.",
      esconde:
        'On the outside you show little patience and keep changing your pace. But inside you sustain far more than you show: you hold back a steadiness you don\'t reveal.',
    },
    O: {
      exige:
        "On the outside you come across as analytical and cautious, looking carefully before each step. But inside you don't need it that much: you push yourself to control and calculate more than comes naturally.",
      esconde:
        'On the outside you seem to jump in without overthinking. But inside you observe and calculate far more than you show: you hold back a caution you don\'t reveal.',
    },
  },
}

const TEXTO: Record<
  Locale,
  { intro: string; sintesis: (dim: string) => string; invitacion: string; alineadoIntro: string }
> = {
  es: {
    intro:
      'Esto no es una etiqueta. Es la distancia entre cómo te muestras por fuera y cómo caminas por dentro.',
    sintesis: dim =>
      `Donde más te separas de ti es en «${dim}». Ahí es donde caminar te cuesta más — no por debilidad, sino porque llevas un traje que no acaba de ser tu piel.`,
    invitacion: 'Caminar sin separarte de ti empieza justo por mirar ahí.',
    alineadoIntro:
      'Hoy caminas bastante cerca de ti mismo: lo que muestras por fuera y lo que llevas por dentro van casi de la mano. No es poca cosa — es un buen lugar desde el que seguir caminando.',
  },
  en: {
    intro:
      "This isn't a label. It's the distance between how you show up on the outside and how you walk on the inside.",
    sintesis: dim =>
      `Where you separate from yourself the most is in “${dim}”. That's where walking costs you more — not out of weakness, but because you're wearing a suit that isn't quite your own skin.`,
    invitacion: 'Walking without separating from yourself starts right there.',
    alineadoIntro:
      'Right now you walk quite close to yourself: what you show on the outside and what you carry inside go almost hand in hand. That\'s no small thing — it\'s a good place to keep walking from.',
  },
}

function esLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'es'
}

export function generarNarrativa(inf: InformePaso, locale: string): NarrativaPaso {
  const L = esLocale(locale)
  const T = TEXTO[L]

  // Separaciones reales (dejamos fuera lo alineado), de mayor a menor.
  const separaciones = inf.brechas.filter(b => b.direccion !== 'alineado')

  // Caso "alineado": nadie se separa de sí mismo de forma marcada.
  if (separaciones.length === 0) {
    return { intro: T.alineadoIntro, lineas: [], sintesis: '', invitacion: '' }
  }

  // Narramos las separaciones que de verdad pesan; pero garantizamos siempre la
  // mayor, aunque sea leve, para no dejar el informe vacío.
  const notables = separaciones.filter(b => Math.abs(b.valor) >= UMBRAL_NARRAR)
  const aNarrar = (notables.length > 0 ? notables : separaciones.slice(0, 1)).slice(0, MAX_LINEAS)

  const lineas = aNarrar.map(b => {
    const dir = b.direccion as Exclude<Direccion, 'alineado'>
    const clave = dir === 'exige_de_mas' ? 'exige' : 'esconde'
    return FRASE[L][b.dimension][clave]
  })

  const focoDim = NOMBRE_EJE[L][separaciones[0].dimension]

  return {
    intro: T.intro,
    lineas,
    sintesis: T.sintesis(focoDim),
    invitacion: T.invitacion,
  }
}
