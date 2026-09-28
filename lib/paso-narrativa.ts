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
  es: { P: 'Pisar firme', A: 'Acompañar', S: 'Sostener', O: 'Observar' },
  en: { P: 'Press on', A: 'Accompany', S: 'Sustain', O: 'Observe' },
}

// Frase por (eje, dirección). "exige" = la máscara empuja el rasgo por encima de
// tu instinto. "esconde" = tu instinto sostiene el rasgo más de lo que muestras.
const FRASE: Record<Locale, Record<Dim, { exige: string; esconde: string }>> = {
  es: {
    P: {
      exige:
        'Por fuera te muestras firme y frontal, siempre empujando hacia delante. Pero por dentro no te nace ir con tanta marcha: te exiges avanzar y resolver más de lo que realmente necesitas.',
      esconde:
        'Por fuera apenas empujas, dejas que las cosas lleguen a su ritmo. Pero por dentro llevas más determinación de la que enseñas: guardas una fuerza para decidir que casi no sacas a la luz.',
    },
    A: {
      exige:
        'Por fuera te muestras sociable y afable, muy pendiente de los demás. Pero por dentro no te nace estar tan disponible: te esfuerzas por agradar más de lo que realmente necesitas.',
      esconde:
        'Por fuera pareces ir a lo tuyo, sin depender de nadie. Pero por dentro la gente te importa mucho más de lo que dejas ver: guardas una necesidad de compañía que no muestras.',
    },
    S: {
      exige:
        'Por fuera te muestras constante y en calma, con el ritmo siempre bajo control. Pero por dentro no siempre estás así: te exiges aguantar y sostener más de lo que te nace.',
      esconde:
        'Por fuera muestras poca paciencia y vas cambiando el paso. Pero por dentro sostienes mucho más de lo que enseñas: guardas una constancia que no dejas ver.',
    },
    O: {
      exige:
        'Por fuera te muestras detallista y prudente, mirando bien antes de dar cada paso. Pero por dentro no necesitas tanto control: revisas y calculas más de lo que te nace.',
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
      'Al comparar ambas líneas aparece dónde tu forma visible de actuar coincide con tu tendencia espontánea y dónde necesita adaptación. Esta es la lectura que dibujan tus respuestas.',
    sintesis: dim =>
      `La mayor distancia aparece en «${dim}». No significa que estés fingiendo: ahí puede haber una adaptación que te ayuda, o un esfuerzo que empieza a pesarte.`,
    invitacion: 'La pregunta no es qué parte es la correcta, sino si esa distancia te ayuda o te pesa.',
    alineadoIntro:
      'En tus respuestas, la forma que haces visible y tu tendencia espontánea van bastante de la mano. Te adaptas, como todo el mundo, pero sin alejarte demasiado de lo que te sale de manera natural.',
  },
  en: {
    intro:
      'Comparing the two lines shows where your visible way of acting matches your spontaneous tendency and where it requires adaptation. This is the reading drawn by your answers.',
    sintesis: dim =>
      `The largest distance appears in “${dim}”. It does not mean you are pretending: it may be an adaptation that helps you, or an effort that is beginning to weigh on you.`,
    invitacion: 'The question is not which part is right, but whether that distance helps you or weighs on you.',
    alineadoIntro:
      'In your answers, the style you make visible and your spontaneous tendency largely go hand in hand. You adapt, as everyone does, without moving too far from what comes naturally.',
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
