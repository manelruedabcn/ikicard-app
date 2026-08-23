// ============================================================
// ¿QUÉ MÁSCARA GOBIERNA TU VIDA? — Contenido de la herramienta.
// Digitaliza la brújula de las máscaras del libro
// "Camina sin separarte de ti". Los textos son de Manel.
//
// Bilingüe: contenido en español (voz del manuscrito) e inglés,
// elegido por locale con contentLang(). La lógica (códigos, umbrales,
// orden) no depende del idioma.
// ============================================================

import { contentLang } from './content-locale'

export type MaskCode =
  | 'exigente'
  | 'controladora'
  | 'manipuladora'
  | 'jueza'
  | 'complaciente'
  | 'victima'
  | 'impostora'

export interface Mask {
  code: MaskCode
  // Nombre de la máscara (femenino en español, como en el libro).
  name: string
  // Qué es, en una línea (de la sección "Las máscaras que nos protegen").
  description: string
  // La frase que se puntúa del 1 al 5 (brújula de Camina).
  statement: string
  // El miedo que hay debajo: el freno (mapeo canónico de Camina).
  // Es un sintagma nominal que encaja tras artículo ("el miedo…" /
  // "the fear…"), porque se encadena en frases del borrador y del retrato.
  fear: string
  // Cómo actúa cuando se combina con otras. Verbo en 2ª persona, encaja
  // dentro de una frase ("…te exiges de más para merecer tu lugar…").
  weave: string
}

// Las 7 máscaras, en el orden de la brújula del libro.
const MASKS_ES: Mask[] = [
  {
    code: 'exigente',
    name: 'La Exigente',
    description:
      'Nada está suficientemente bien. Se exige a sí misma (y a los demás) un nivel que nunca se alcanza. No celebra los logros porque siempre hay algo que mejorar.',
    statement: 'Siento que nada de lo que hago es suficientemente bueno; siempre se puede mejorar más.',
    fear: 'miedo a no estar a la altura',
    weave: 'te exiges de más para merecer tu lugar',
  },
  {
    code: 'controladora',
    name: 'La Controladora',
    description:
      'Necesita tenerlo todo previsto. Delegar es perder el control. La incertidumbre le pesa, y prefiere hacerlo ella antes que confiar.',
    statement: 'Necesito tenerlo todo bajo control; delegar me genera ansiedad.',
    fear: 'miedo a perder el control',
    weave: 'lo sujetas todo para que nada te sorprenda',
  },
  {
    code: 'manipuladora',
    name: 'La Manipuladora',
    description:
      'Mueve los hilos con sutileza para no mostrarse tal cual es. Consigue que los demás hagan lo que quiere sin pedirlo abiertamente.',
    statement: 'A menudo consigo que los demás hagan lo que yo quiero sin pedirlo directamente.',
    fear: 'miedo a mostrarse tal cual es',
    weave: 'mueves los hilos para no tener que mostrarte',
  },
  {
    code: 'jueza',
    name: 'La Jueza',
    description:
      'Critica para no ser criticada. Señala en los demás lo que no se permite a sí misma. Su dureza por fuera tapa una fragilidad que no se atreve a mostrar.',
    statement: 'Tiendo a señalar los errores ajenos antes de que otros vean los míos.',
    fear: 'miedo a ser criticada',
    weave: 'señalas fuera lo que temes que vean en ti',
  },
  {
    code: 'complaciente',
    name: 'La Complaciente',
    description:
      'Dice sí cuando quiere decir no. Antepone las necesidades ajenas a las propias. Su valor depende de ser aceptada y querida, aunque sea a costa de sí misma.',
    statement: 'Me cuesta decir que no, incluso cuando sé que debería hacerlo.',
    fear: 'miedo al rechazo',
    weave: 'dices que sí para no perder el cariño',
  },
  {
    code: 'victima',
    name: 'La Víctima',
    description:
      'Convierte la vida en algo que te pasa a ti, no en algo que tú protagonizas. Espera que las circunstancias cambien para poder cambiar ella.',
    statement: 'Siento que las cosas me pasan a mí; espero a que cambien las circunstancias.',
    fear: 'miedo a no ser capaz de cambiar',
    weave: 'esperas a que cambie lo de fuera para no exponerte tú',
  },
  {
    code: 'impostora',
    name: 'La Impostora',
    description:
      'Vive con el miedo constante a ser descubierta. Cree que en cualquier momento alguien se dará cuenta de que no sabe, no merece o no está a la altura.',
    statement: 'Vivo con el miedo a que en cualquier momento alguien descubra que no sé lo suficiente.',
    fear: 'miedo a ser descubierta',
    weave: 'minimizas lo que logras por si alguien te descubre',
  },
]

const MASKS_EN: Mask[] = [
  {
    code: 'exigente',
    name: 'The Demanding One',
    description:
      'Nothing is ever good enough. She holds herself (and others) to a bar that can never be reached. She doesn’t celebrate wins because there’s always something to improve.',
    statement: 'I feel that nothing I do is good enough; there’s always more to improve.',
    fear: 'fear of not measuring up',
    weave: 'you push yourself too hard to deserve your place',
  },
  {
    code: 'controladora',
    name: 'The Controller',
    description:
      'She needs everything planned. Delegating means losing control. Uncertainty weighs on her, and she’d rather do it herself than trust.',
    statement: 'I need to have everything under control; delegating makes me anxious.',
    fear: 'fear of losing control',
    weave: 'you hold on to everything so nothing catches you off guard',
  },
  {
    code: 'manipuladora',
    name: 'The Manipulator',
    description:
      'She pulls the strings subtly so she never has to show herself as she is. She gets others to do what she wants without asking openly.',
    statement: 'I often get others to do what I want without asking directly.',
    fear: 'fear of showing herself as she is',
    weave: 'you pull the strings so you don’t have to show yourself',
  },
  {
    code: 'jueza',
    name: 'The Judge',
    description:
      'She criticises so she won’t be criticised. She points out in others what she won’t allow in herself. Her outer hardness hides a fragility she doesn’t dare show.',
    statement: 'I tend to point out others’ mistakes before they can see mine.',
    fear: 'fear of being criticised',
    weave: 'you point out in others what you fear they’ll see in you',
  },
  {
    code: 'complaciente',
    name: 'The People-Pleaser',
    description:
      'She says yes when she means no. She puts others’ needs before her own. Her worth depends on being accepted and loved, even at her own expense.',
    statement: 'I find it hard to say no, even when I know I should.',
    fear: 'fear of rejection',
    weave: 'you say yes so you won’t lose others’ affection',
  },
  {
    code: 'victima',
    name: 'The Victim',
    description:
      'She turns life into something that happens to her, not something she leads. She waits for circumstances to change so that she can change.',
    statement: 'I feel that things happen to me; I wait for the circumstances to change.',
    fear: 'fear of not being able to change',
    weave: 'you wait for the outside to change so you don’t have to expose yourself',
  },
  {
    code: 'impostora',
    name: 'The Impostor',
    description:
      'She lives with the constant fear of being found out. She believes that at any moment someone will realise she doesn’t know, doesn’t deserve it, or isn’t good enough.',
    statement: 'I live with the fear that at any moment someone will discover I don’t know enough.',
    fear: 'fear of being found out',
    weave: 'you play down what you achieve in case someone finds you out',
  },
]

// Gancho de entrada (voz de Manel, corrección "construida, no elegida").
const MASKS_INTRO_ES = {
  title: '¿Qué máscara gobierna tu vida?',
  hook: 'No la elegiste: la construyó lo que viviste. Por eso ya no la ves. Y sin darte cuenta, decide por ti.',
  instructions:
    'Puntúa del 1 al 5 cuánto te identificas con cada frase. 1 = nada identificado/a. 5 = totalmente identificado/a. Léelas rápido, sin pensar demasiado.',
}

const MASKS_INTRO_EN = {
  title: 'Which mask runs your life?',
  hook: 'You didn’t choose it: what you lived built it. That’s why you no longer see it. And without noticing, it decides for you.',
  instructions:
    'Rate from 1 to 5 how much each statement fits you. 1 = not at all. 5 = completely. Read them quickly, without overthinking.',
}

// Lectura del resultado (umbrales del libro). Independiente del idioma.
//   4-5 dominante · 3 secundaria presente · 1-2 no te define ahora.
export const MASKS_THRESHOLDS = {
  dominant: 4,
  secondary: 3,
}

// Cierre, antes o después de ver el resultado (frases núcleo de Manel).
const MASKS_CLOSING_ES = {
  noJudgement:
    'Las máscaras no las elegiste desde la maldad ni desde la mentira. Las elegiste —o te las pusieron— desde la necesidad. Hiciste lo que pudiste con lo que tenías.',
  reframe:
    'No se trata de arrancarte la máscara. Se trata de saber que la llevas y elegir cuándo usarla y cuándo no.',
}

const MASKS_CLOSING_EN = {
  noJudgement:
    'You didn’t choose your masks out of malice or dishonesty. You chose them —or they were put on you— out of need. You did what you could with what you had.',
  reframe:
    'It’s not about tearing off the mask. It’s about knowing you wear it and choosing when to use it and when not to.',
}

// Ejercicio "Mi máscara dominante" (4 partes, de Camina). Se ofrece
// tras conocer la dominante. La parte 4 siembra el "paso concreto".
export interface MaskReflection {
  id: string
  prompt: string
  hint: string
}

const MASK_REFLECTION_ES: MaskReflection[] = [
  {
    id: 'mask_uso',
    prompt: 'La máscara que más uso es…',
    hint: 'Descríbela. Ponle nombre. ¿Cómo se comporta? ¿Qué dice? ¿Qué imagen proyecta?',
  },
  {
    id: 'mask_sirvio',
    prompt: 'Me ha servido para…',
    hint: 'Sé justo. Esta máscara no es una villana. Te ha protegido, te ha permitido conseguir cosas, te ha ayudado a encajar. Reconócelo.',
  },
  {
    id: 'mask_cuesta',
    prompt: 'Pero hoy me cuesta…',
    hint: '¿Qué precio estás pagando por llevarla? ¿Qué te impide? ¿Qué cansancio genera?',
  },
  {
    id: 'mask_paso',
    prompt: 'Si caminara sin separarme de mí, empezaría por…',
    hint: 'No hace falta que sea un plan de vida. Basta un gesto. Algo pequeño. Una verdad que llevas tiempo posponiendo.',
  },
]

const MASK_REFLECTION_EN: MaskReflection[] = [
  {
    id: 'mask_uso',
    prompt: 'The mask I use most is…',
    hint: 'Describe it. Give it a name. How does it behave? What does it say? What image does it project?',
  },
  {
    id: 'mask_sirvio',
    prompt: 'It has helped me to…',
    hint: 'Be fair. This mask is not a villain. It has protected you, let you achieve things, helped you fit in. Acknowledge it.',
  },
  {
    id: 'mask_cuesta',
    prompt: 'But today it costs me…',
    hint: 'What price are you paying for wearing it? What does it hold you back from? What weariness does it create?',
  },
  {
    id: 'mask_paso',
    prompt: 'If I walked without leaving myself behind, I would start with…',
    hint: 'It doesn’t have to be a life plan. A gesture is enough. Something small. A truth you’ve been putting off.',
  },
]

// Getters por idioma del contenido.
export function getMasks(locale: string): Mask[] {
  return contentLang(locale) === 'en' ? MASKS_EN : MASKS_ES
}
export function getMasksIntro(locale: string) {
  return contentLang(locale) === 'en' ? MASKS_INTRO_EN : MASKS_INTRO_ES
}
export function getMasksClosing(locale: string) {
  return contentLang(locale) === 'en' ? MASKS_CLOSING_EN : MASKS_CLOSING_ES
}
export function getMaskReflection(locale: string): MaskReflection[] {
  return contentLang(locale) === 'en' ? MASK_REFLECTION_EN : MASK_REFLECTION_ES
}

// ------------------------------------------------------------
// RETRATO COMBINADO (enriquecimiento sobre "no son compartimentos
// estancos", Camina). No es un perfil nuevo con nombre: teje las
// máscaras que hoy pesan (las que gobiernan/asoman) mostrando cómo
// se turnan para proteger la misma herida. Se lee desde sus miedos,
// que son el motor ("detrás de cada máscara hay un miedo").
//
// Recibe los códigos ya ordenados de mayor a menor (la dominante
// primero) y el locale. Devuelve las frases del retrato en ese idioma;
// si solo hay una máscara activa, no hay combinación que contar y
// devuelve [].
// ------------------------------------------------------------
export function maskCombinationReading(activeCodes: MaskCode[], locale = 'es'): string[] {
  const masks = getMasks(locale)
  const active = activeCodes
    .map(c => masks.find(m => m.code === c))
    .filter((m): m is Mask => Boolean(m))
  if (active.length < 2) return []

  const [dominant, ...rest] = active

  if (contentLang(locale) === 'en') {
    const intro = 'These masks don’t act on their own: they take turns protecting the same thing.'
    const fears =
      `Underneath ${dominant.name} lies the ${dominant.fear}` +
      (rest.length === 1
        ? `; and ${rest[0].name} adds the ${rest[0].fear}.`
        : rest.length === 2
          ? `; ${rest[0].name} adds the ${rest[0].fear}, and ${rest[1].name} the ${rest[1].fear}.`
          : '; ' + rest.map(m => `${m.name} adds the ${m.fear}`).join('; ') + '.')
    const story =
      'Seen together they tell a coherent story: ' + active.map(m => m.weave).join('; ') + '.'
    const close =
      active.length === 2
        ? 'They’re not two problems: they’re two ways of caring for one same wound.'
        : 'They’re not separate problems: they’re different ways of caring for one same wound.'
    return [intro, fears, story, close]
  }

  // Apertura: no actúan por separado.
  const intro =
    'Estas máscaras no actúan por separado: se turnan para proteger lo mismo.'

  // Los miedos en juego, encadenados desde la dominante.
  const fears =
    `Debajo de ${dominant.name} late el ${dominant.fear}` +
    (rest.length === 1
      ? `; y ${rest[0].name} añade el ${rest[0].fear}.`
      : rest.length === 2
        ? `; ${rest[0].name} añade el ${rest[0].fear}, y ${rest[1].name}, el ${rest[1].fear}.`
        : '; ' +
          rest.map(m => `${m.name} añade el ${m.fear}`).join('; ') +
          '.')

  // La historia coherente: cómo se comporta cada una, tejida.
  const story =
    'Vistas juntas cuentan una historia coherente: ' +
    active.map(m => m.weave).join('; ') +
    '.'

  // Cierre: una misma herida, varias defensas.
  const close =
    active.length === 2
      ? 'No son dos problemas: son dos formas de cuidar una misma herida.'
      : 'No son problemas separados: son formas distintas de cuidar una misma herida.'

  return [intro, fears, story, close]
}
