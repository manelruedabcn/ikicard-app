// ============================================================
// INVENTARIO HONESTO — contenido (voz de Manel).
// Fuente: «El Ikigai que no te contaron». Las citas y los ejercicios
// son literales del libro; las frases de unión son nuevas y están
// marcadas como tales en docs/inventario.md para revisión.
//
// Idiomas: por ahora solo español. Los getters devuelven ES para
// ca/en (como hizo «heridas» en su primera versión), para que la ruta
// /ca y /en funcione sin huecos hasta que exista la traducción.
// ============================================================

import { contentLang } from './content-locale'
import { getCaminos, type CaminoCode } from './camino-content'
import {
  buildLectura,
  type AttentionKey,
  type ExerciseKey,
  type InvAnswers,
  type InvFlags,
  type InvLectura,
  type InvQuestionId,
  type PairKey,
  type SupportKey,
} from './inventario'

export interface InvQuestion {
  id: InvQuestionId
  block: string
  src: string
  text: string
  opts: [string, string][]
}

export interface InvQuote {
  quote: string
  cite: string
}

export interface InvExercise {
  title: string
  cap: number
  steps: string[]
}

// ---------- Preguntas ----------

function questionsEs(): InvQuestion[] {
  const caminos = getCaminos('es')
  return [
    { id: 'ocup', block: 'Para empezar', src: 'Adaptado', text: '¿Cuál es tu ocupación principal ahora mismo?',
      opts: [['empleo', 'Trabajo por cuenta ajena'], ['propia', 'Trabajo por mi cuenta'], ['cuidados', 'Cuidar de otras personas'], ['estudios', 'Estudiar'], ['busqueda', 'Buscar trabajo'], ['jubilacion', 'Estoy en la jubilación'], ['otra', 'Otra']] },
    { id: 'piloto', block: 'Para empezar', src: 'Capítulo 1 · El inventario honesto', text: '¿Qué parte de tu vida sientes que lleva más tiempo en piloto automático?',
      opts: [['ocupacion', 'Mi ocupación principal'], ['relaciones', 'Mis relaciones'], ['cuerpo', 'El cuerpo y el descanso'], ['tiempo', 'El tiempo para mí'], ['varias', 'Varias a la vez'], ['ninguna', 'Ninguna en especial']] },
    { id: 'pasion', block: 'Ikigai Activo', src: 'Capítulo 4 · Tu mapa del Ikigai Activo', text: '¿Qué te apasiona hacer, aunque no te paguen por ello? Si te lo preguntaran hoy, ¿podrías nombrar algo concreto?',
      opts: [['claro', 'Sí, sin dudar'], ['parcial', 'Algo, pero no lo tengo claro'], ['abierto', 'Ahora mismo, no']] },
    { id: 'bueno', block: 'Ikigai Activo', src: 'Capítulo 4 · «que los demás también reconocen»', text: 'Si alguien que te conoce bien dijera qué se te da bien, ¿coincidiría con lo que piensas tú?',
      opts: [['claro', 'Sí'], ['parcial', 'En parte'], ['nolose', 'No lo sé']] },
    { id: 'aporte', block: 'Ikigai Activo', src: 'Capítulo 4 · Tu mapa del Ikigai Activo', text: '¿Podrías decir qué aportas a otros con lo que haces, aunque sea en pequeño?',
      opts: [['claro', 'Sí, lo veo claro'], ['parcial', 'Algo, sin acabar de verlo'], ['abierto', 'Ahora mismo, no']] },
    { id: 'vivir', block: 'Ikigai Activo', src: 'Capítulo 4 · Tu mapa del Ikigai Activo', text: '¿De qué podrías vivir haciendo algo que tiene sentido para ti?',
      opts: [['claro', 'Ya vivo de algo así'], ['parcial', 'Tengo alguna idea'], ['nolose', 'Ahora mismo, no lo sé'], ['nomia', 'No es mi pregunta en este momento']] },
    { id: 'camino', block: 'Ikigai Activo', src: 'Herramientas del libro · Test CAMINO', text: '¿Cuál de estas frases se parece más a lo que otros te reconocen?',
      opts: [...caminos.map(c => [c.code, c.caracteristicas] as [string, string]), ['ninguna', 'Ninguna me encaja']] },
    { id: 'presencia', block: 'Ikigai Consciente', src: 'Capítulos 1 y 4', text: 'Piensa en ayer. ¿Recuerdas algún momento en que estuvieras del todo ahí, en lo que hacías?',
      opts: [['si', 'Sí, lo recuerdo'], ['cuesta', 'Me cuesta recordarlo'], ['no', 'No']] },
    { id: 'cotidiano', block: 'Ikigai Consciente', src: 'Capítulo 4 · Encuentra tu cotidiano', text: 'Esta última semana, ¿algún gesto pequeño y cotidiano te ha dado la sensación de que las cosas estaban bien?',
      opts: [['si', 'Sí, alguno'], ['nofijado', 'No me he fijado'], ['no', 'No']] },
    { id: 'paz', block: 'Ikigai Consciente', src: 'Capítulo 1', text: 'Más allá de lo que logras, ¿te sientes en paz con quien eres?',
      opts: [['si', 'En general, sí'], ['depende', 'Depende del día'], ['pocas', 'Pocas veces']] },
    { id: 'valor', block: 'Ikigai Consciente', src: 'Capítulo 7 · La auditoría', text: '¿Hay algún valor tuyo que estés negociando de forma continua?',
      opts: [['no', 'No'], ['aveces', 'A veces'], ['si', 'Sí, de forma continua']] },
    { id: 'apagarte', block: 'Ikigai Consciente', src: 'Capítulo 7 · La auditoría', text: 'Donde pasas la mayor parte del día, ¿puedes ser quien eres o tienes que apagarte?',
      opts: [['puedo', 'Puedo ser quien soy'], ['depende', 'Depende'], ['apagar', 'Tengo que apagarme']] },
    { id: 'vinculo', block: 'Ikigai Consciente', src: 'Capítulo 8 · Relaciones que elevan', text: '¿Tienes cerca a alguien con quien piensas mejor y recuerdas quién eres cuando te has dispersado?',
      opts: [['si', 'Sí'], ['noseguro', 'No lo tengo claro'], ['no', 'Ahora mismo, no']] },
    { id: 'ritmo', block: 'Entre las dos', src: 'Capítulo 7 · La auditoría', text: 'El ritmo que te exige tu ocupación principal, ¿te estimula o te desgasta?',
      opts: [['estimula', 'Me estimula'], ['epoca', 'Según la época'], ['desgasta', 'Me desgasta']] },
    { id: 'energia', block: 'Entre las dos', src: 'Capítulo 7 · La auditoría', text: '¿Tienes energía al terminar el día para las cosas que también importan?',
      opts: [['siempre', 'Casi siempre'], ['aveces', 'A veces'], ['nunca', 'Casi nunca']] },
  ]
}

const OPEN_ES = {
  block: 'Para terminar',
  src: 'Capítulo 1 · El inventario honesto',
  text: '¿Hay algo que llevas tiempo aplazando que, en el fondo, sientes que tiene que ver contigo de verdad?',
  hint: 'Opcional. Se te devolverá tal como lo escribas.',
}

// ---------- Columnas: la respuesta dicha en segunda persona ----------

const MIRROR_ES: Record<Exclude<InvQuestionId, 'ocup' | 'piloto' | 'camino'>, Record<string, string>> = {
  pasion: { claro: 'Puedes nombrar algo concreto que te apasiona.', parcial: 'Tienes alguna idea de lo que te apasiona, sin tenerlo claro.', abierto: 'Ahora mismo no podrías nombrar algo que te apasione.' },
  bueno: { claro: 'Lo que crees que se te da bien coincide con lo que ven quienes te conocen.', parcial: 'Lo que crees que se te da bien coincide solo en parte con lo que ven otros.', nolose: 'No sabes si lo que crees que se te da bien coincide con lo que ven otros.' },
  aporte: { claro: 'Ves con claridad qué aportas a otros.', parcial: 'Ves algo de lo que aportas, sin acabar de verlo.', abierto: 'Ahora mismo no ves qué aportas a otros.' },
  vivir: { claro: 'Ya vives de algo que tiene sentido para ti.', parcial: 'Tienes alguna idea de qué podrías vivir con sentido.', nolose: 'Ahora mismo no sabes de qué podrías vivir con sentido.', nomia: 'De qué vivir no es tu pregunta en este momento.' },
  presencia: { si: 'Ayer recuerdas al menos un momento en que estabas del todo ahí.', cuesta: 'Te cuesta recordar un momento de ayer en que estuvieras del todo ahí.', no: 'Ayer no recuerdas ningún momento en que estuvieras del todo ahí.' },
  cotidiano: { si: 'Esta semana, algún gesto cotidiano te dio la sensación de que las cosas estaban bien.', nofijado: 'Esta semana no te has fijado en si algún gesto cotidiano te daba esa sensación.', no: 'Esta semana ningún gesto cotidiano te dio esa sensación.' },
  paz: { si: 'En general te sientes en paz con quien eres, más allá de lo que logras.', depende: 'Sentirte en paz con quien eres depende del día.', pocas: 'Pocas veces te sientes en paz con quien eres, más allá de lo que logras.' },
  valor: { no: 'No estás negociando ningún valor tuyo de forma continua.', aveces: 'A veces negocias algún valor tuyo.', si: 'Estás negociando un valor tuyo de forma continua.' },
  apagarte: { puedo: 'Donde pasas el día puedes ser quien eres.', depende: 'Poder ser quien eres donde pasas el día depende.', apagar: 'Donde pasas el día sientes que tienes que apagarte.' },
  vinculo: { si: 'Tienes cerca a alguien con quien recuerdas quién eres.', noseguro: 'No tienes claro si hay alguien cerca con quien recuerdes quién eres.', no: 'Ahora mismo no tienes cerca a alguien con quien recordar quién eres.' },
  ritmo: { estimula: 'El ritmo de tu ocupación principal te estimula.', epoca: 'El ritmo de tu ocupación principal depende de la época.', desgasta: 'El ritmo de tu ocupación principal te desgasta.' },
  energia: { siempre: 'Casi siempre te queda energía al terminar el día.', aveces: 'A veces te queda energía al terminar el día.', nunca: 'Casi nunca te queda energía al terminar el día.' },
}

// ---------- Lo que sostiene ----------

const SUPPORTS_ES: Record<SupportKey, { dim: 'Activo' | 'Consciente'; text: string } & Partial<InvQuote>> = {
  activoClaro: { dim: 'Activo', text: 'Respondes con claridad a casi todas las preguntas del Ikigai Activo. Sabes bastante de hacia dónde vas y de qué se te da bien.', quote: 'El ikigai no va de velocidad. Va de dirección.', cite: 'Capítulo 9' },
  aporte: { dim: 'Activo', text: 'Tienes claro qué aportas a otros, aunque otras preguntas sigan abiertas.' },
  presencia: { dim: 'Consciente', text: 'Ayer recuerdas un momento en que estabas del todo ahí, y esta semana algo cotidiano te hizo sentir que las cosas estaban bien.', quote: 'Eso es Ikigai Consciente: presencia sin espectáculo.', cite: 'Capítulo 4' },
  coherencia: { dim: 'Consciente', text: 'Puedes ser quien eres donde pasas el día, y no estás negociando tus valores.', quote: 'No hace falta que todo sea perfecto. Hace falta que no te obligue a apagarte para encajar.', cite: 'Capítulo 7' },
  vinculo: { dim: 'Consciente', text: 'Tienes cerca a alguien con quien recuerdas quién eres.', quote: 'Con esas personas piensas mejor, sientes mejor, recuerdas quién eres cuando te habías dispersado.', cite: 'Capítulo 8' },
}

const NO_SUPPORT_ES = 'En tus respuestas de hoy no aparece un apoyo claro que podamos señalar. No significa que no lo haya; puede que ahora no se vea.'

// ---------- Lo que merece atención ----------

export interface InvAttentionText extends InvQuote {
  lead: string
  intro: string
  note: string
  // Versión corta para la línea «También marcaste…».
  short: string
}

function attentionEs(key: AttentionKey, a: InvAnswers, f: InvFlags): InvAttentionText {
  switch (key) {
    case 'desgaste':
      return {
        lead: 'Marcas que el ritmo de tu ocupación principal te desgasta y que casi nunca te queda energía al terminar el día.',
        intro: 'En el libro uso un criterio para esto:',
        quote: 'Lo que te queda al terminar la jornada, no solo en horas sino en energía real para el resto de tu vida.',
        cite: 'Capítulo 7',
        note: 'Tus respuestas no dicen de dónde viene el desgaste. Puede ser el puesto, la etapa o condiciones que no eliges; esta lectura no saca conclusiones de eso.'
          + (f.activoClaro ? ' Lo que sí muestran es que, ahora mismo, tener dirección y sentirte bien sosteniéndola van por separado.' : ''),
        short: 'que el ritmo te desgasta y casi nunca te queda energía al terminar el día',
      }
    case 'coherencia': {
      const parts: string[] = []
      if (a.valor === 'si') parts.push('estás negociando un valor tuyo de forma continua')
      if (a.apagarte === 'apagar') parts.push('donde pasas el día sientes que tienes que apagarte')
      return {
        lead: 'Marcas que ' + parts.join(' y que ') + '.',
        intro: 'Es uno de los criterios del libro para elegir sin traicionarte:',
        quote: 'Hace falta que no te obligue a apagarte para encajar.',
        cite: 'Capítulo 7',
        note: 'No sabemos qué está en juego ni por qué lo sostienes; a veces hay razones de peso. Esto solo señala dónde mirar.',
        short: parts.join(' y que '),
      }
    }
    case 'presencia':
      return {
        lead: 'Te cuesta recordar un momento de ayer en que estuvieras del todo ahí, y esta semana no has notado un gesto cotidiano que te hiciera sentir bien.',
        intro: 'Lo escribí así en el primer capítulo:',
        quote: 'El modo zombi no aparece de repente. Se instala despacio, con la mejor de las intenciones.',
        cite: 'Capítulo 1',
        note: 'No dice nada de quién eres. Es una forma de vivir que se instala sin que nadie la elija, y por eso se puede observar.',
        short: 'que te cuesta recordar momentos en que estuvieras del todo ahí',
      }
    case 'activo':
      return {
        lead: 'Varias preguntas del Ikigai Activo siguen abiertas para ti ahora mismo.',
        intro: 'Que sigan abiertas no es un fallo.',
        quote: 'Esa es la función real del Ikigai Activo: ayudarte a ver lo que ya estaba ahí, más que darte las respuestas.',
        cite: 'Capítulo 4',
        note: f.sinEmpleo ? 'Tu ocupación principal ahora no es un empleo. «¿De qué podría vivir?» no tiene por qué responderse hoy con uno; puede quedarse abierta.' : '',
        short: 'que varias preguntas del Ikigai Activo siguen abiertas',
      }
    case 'vinculo':
      return {
        lead: 'Marcas que ahora mismo no tienes cerca a alguien con quien recordar quién eres.',
        intro: 'Sobre las relaciones que sostienen, en el libro:',
        quote: 'No hace falta que compartan tu camino. Basta con que te permitan ser quien eres sin miedo ni ironía.',
        cite: 'Capítulo 8',
        note: 'A veces esas personas existen y están lejos, o hace tiempo que no se las busca. Tus respuestas no dicen cuál es tu caso.',
        short: 'que ahora mismo no tienes cerca a alguien con quien recordar quién eres',
      }
    case 'paz':
      return {
        lead: 'Marcas que pocas veces te sientes en paz con quien eres, más allá de lo que logras.',
        intro: 'Es uno de los siete pilares de Kamiya que recojo en el libro:',
        quote: 'Sentir que tu vida tiene valor por sí misma, no solo por lo que produces.',
        cite: 'Capítulo 10',
        note: 'Es una respuesta de hoy, no un retrato. Merece atención sin prisa.',
        short: 'que pocas veces te sientes en paz con quien eres',
      }
  }
}

const ROUTE_ES = {
  incierto: {
    text: 'Muchas de tus respuestas son «no lo sé» o «depende». Es una respuesta válida, y es un buen punto de partida.',
    quote: 'Por eso este capítulo no te pide que definas tu propósito. Solo te pide que te observes.',
    cite: 'Capítulo 1',
  },
  nada: {
    text: 'En tus respuestas no aparece nada que pida atención especial. No vamos a buscarlo.',
    quote: 'El ikigai, entendido de verdad, no funciona así: no se alcanza, se habita.',
    cite: 'Epílogo',
  },
}

const PAIRS_ES: Record<PairKey, string> = {
  direccionPiloto: 'Dos respuestas juntas: tienes clara tu dirección y, a la vez, señalas tu ocupación principal como lo que más tiempo lleva en piloto automático. Las dos cosas pueden ser ciertas a la vez.',
  ningunaPresencia: 'Dos respuestas juntas: dices que ninguna parte de tu vida va especialmente en piloto automático y, a la vez, te cuesta recordar momentos en que estuvieras del todo ahí. Las dos cosas pueden ser ciertas a la vez.',
}

// ---------- Ejercicios (literales del libro) ----------

const EXERCISES_ES: Record<ExerciseKey, InvExercise> = {
  ecologia: { title: 'La ecología de tu semana', cap: 7, steps: [
    'Durante una semana, al final de cada día anota en tu libreta: ¿Qué me ha dado energía hoy? ¿Qué me la ha quitado?',
    'Al cabo de siete días, lee las anotaciones seguidas. Lo que aparece en la primera columna de forma repetida es lo que sostiene tu vida. Lo que aparece en la segunda, de forma consistente, es lo que la desgasta.',
  ] },
  voz: { title: 'Escucha tu voz interna', cap: 11, steps: [
    'Durante tres días, cada vez que tomes una decisión, grande o pequeña, antes de ejecutarla haz una pausa de diez segundos y pregúntate: ¿Desde dónde estoy hablando ahora mismo? ¿Desde el miedo, desde la exigencia, o desde un lugar más tranquilo?',
    'No tienes que cambiar nada. Solo observar. Al final de cada día escribe en tu libreta una frase sobre lo que has notado.',
  ] },
  cotidiano: { title: 'Encuentra tu cotidiano', cap: 4, steps: [
    'Durante los próximos siete días, elige una actividad cotidiana que normalmente haces en automático y hazla con plena atención durante cinco minutos.',
    'Al terminar, escribe una frase en tu libreta sobre cómo te sentiste. No busques revelaciones. Solo observa si hubo algún momento en que estuvieras completamente ahí.',
  ] },
  dejaste: { title: 'Lo que dejaste atrás', cap: 4, steps: [
    'Escribe una lista de actividades que solías disfrutar pero que has dejado de hacer. Para cada una, anota brevemente por qué crees que la dejaste.',
    'Elige una de la lista, la que más curiosidad te despierte ahora mismo, y comprométete a dedicarle treinta minutos esta semana. No para convertirla en un proyecto. Solo para ver cómo te sientes al volver a ella.',
  ] },
  contraste: { title: 'El contraste interno', cap: 8, steps: [
    'Elige tres personas de tu vida actual. Para cada una, responde: ¿Qué hago yo cuando estoy con esta persona que no hago cuando estoy bien conmigo? Una frase por persona, sin pensarlo demasiado.',
    'Después responde la pregunta espejo: ¿Qué necesitaría hacer para ser yo mismo cuando estoy con esta persona?',
    'Y cierra con una declaración: «Cuando estoy con ___, mi reto es ___».',
  ] },
  pilares: { title: 'Los siete pilares hoy', cap: 10, steps: [
    'Toma una página de tu libreta y escribe los siete pilares en columna: Satisfacción con el presente / Sentimiento de futuro / Valoración de la existencia / Autonomía / Propósito / Autoaceptación / Conexión social.',
    'Junto a cada uno, escribe una sola palabra que describa cómo te relacionas con él ahora mismo. No lo que debería ser. Lo que es.',
    'Mira cuáles están más débiles: eso te dice dónde poner atención, no quién eres.',
  ] },
  tiempo: { title: 'Tu ikigai en el tiempo', cap: 9, steps: [
    'En una página nueva de tu libreta, divide el espacio en cuatro columnas: Adolescencia, Juventud, Adultez, Ahora. En cada columna anota una sola cosa: qué te movía en esa etapa.',
    'Cuando tengas las cuatro, mira si hay algo que se repite aunque sea de forma diferente. Un valor, una emoción, un tipo de impacto. Ese hilo que atraviesa las etapas suele ser la parte más estable de tu ikigai.',
    'Escribe una frase que lo nombre. No tiene que ser perfecta. Solo tiene que ser tuya.',
  ] },
  inventario: { title: 'El inventario honesto', cap: 1, steps: [
    'Abre tu libreta en una página nueva y responde estas tres preguntas sin pensarlas demasiado. Lo primero que venga, sin correcciones.',
    '¿Qué parte de tu vida sientes que lleva más tiempo en piloto automático? ¿Cuándo fue la última vez que hiciste algo y sentiste que estabas exactamente donde tenías que estar? ¿Hay algo que llevas tiempo aplazando que, en el fondo, sientes que tiene que ver contigo de verdad?',
    'No hace falta que las respuestas sean bonitas ni coherentes entre sí. Escríbelas y déjalas estar. Ya volverás a ellas.',
  ] },
}

// ---------- Chrome de la herramienta ----------

const COPY_ES = {
  eyebrow: 'Test de ikigai · IKIGAIER',
  title: 'Inventario honesto',
  lead: 'No te dice a qué dedicarte. Te dice desde dónde empiezas.',
  body: [
    'Quince preguntas cerradas y una abierta, opcional. Sobre las dos caras del ikigai: lo que haces y construyes, y cómo lo vives.',
    'Responde lo primero que venga. No hay respuestas buenas ni malas, y «no lo sé» también cuenta.',
  ],
  start: 'Empezar',
  back: 'Anterior',
  of: 'de',
  finish: 'Ver mi devolución',
  resultEyebrow: 'Inventario honesto',
  resultTitle: 'Desde dónde empiezas',
  resultIntro: 'Esto es lo que dicen tus respuestas, ordenado. Una foto de hoy, no un perfil.',
  activoTitle: 'Ikigai Activo',
  activoSub: 'Lo que haces y construyes',
  conscTitle: 'Ikigai Consciente',
  conscSub: 'Cómo lo vives',
  between: 'Entre las dos.',
  supportsTitle: 'Lo que te sostiene',
  attentionTitle: 'Lo que merece atención',
  alsoPrefix: 'También marcaste',
  writtenTitle: 'Lo que escribiste',
  writtenNote: 'Lo dejamos aquí, tal como lo escribiste.',
  exerciseEyebrow: 'Para esta semana · Capítulo',
  book: 'El Ikigai que no te contaron',
  basis: 'En qué se basa esta lectura',
  restart: 'Volver a empezar',
  caminoChosen: (car: string, name: string, fort: string) =>
    `Como lo que otros te reconocen elegiste: «${car}» Su fortaleza, según el test CAMINO del libro (${name}): «${fort}»`,
  close: (cap: number) =>
    `Esto es una foto de hoy hecha con tus respuestas, no un perfil. El capítulo ${cap} de «El Ikigai que no te contaron» trabaja esto con más calma. Si quieres ver cómo te mueves en lo que haces, PASO es gratuito. Y si quieres llevar lo que aparece aquí a decisiones concretas, para eso está el acompañamiento.`,
  mail: {
    title: '¿Te envío esta devolución?',
    body: 'Te servirá de guía mientras haces el ejercicio.',
    placeholder: 'tu@correo.com',
    consent: 'Quiero recibir también las cartas de Manel y propuestas para seguir trabajando esto. Es aparte de esta devolución, y puedo darme de baja cuando quiera.',
    button: 'Enviármela',
    sending: 'Enviando…',
    done: 'Hecho. Revisa tu correo: te he enviado tu devolución.',
    error: 'No se pudo enviar. Inténtalo de nuevo.',
  },
}

// ---------- Getters por idioma (por ahora ES para todos) ----------

export function getInvQuestions(locale: string): InvQuestion[] {
  void contentLang(locale)
  return questionsEs()
}
export function getInvOpen(locale: string) {
  void contentLang(locale)
  return OPEN_ES
}
export function getInvCopy(locale: string) {
  void contentLang(locale)
  return COPY_ES
}

// ---------- La devolución completa, ya en texto ----------
// La usan la página, el email y el texto para copiar: una sola fuente.

export interface InvDevolucion {
  lectura: InvLectura
  activo: string[]
  consciente: string[]
  between: string
  supports: ({ dim: string; text: string } & Partial<InvQuote>)[]
  noSupport: string
  attention:
    | { kind: 'route'; text: string; quote: string; cite: string }
    | { kind: 'obs'; main: InvAttentionText; also: string | null }
  pair: string | null
  texto: string
  exercise: InvExercise
  close: string
  basis: { q: string; a: string }[]
}

export function buildDevolucion(a: InvAnswers, texto: string, locale: string): InvDevolucion {
  const lectura = buildLectura(a)
  const copy = getInvCopy(locale)
  // Contenido solo en ES por ahora: CAMINO también en ES para no mezclar idiomas.
  const camino = getCaminos('es').find(c => c.code === (a.camino as CaminoCode))

  const activo = (['pasion', 'bueno', 'aporte', 'vivir'] as const).map(k => MIRROR_ES[k][a[k]])
  if (camino) activo.push(copy.caminoChosen(camino.caracteristicas, camino.name, camino.fortalezas))
  const consciente = (['presencia', 'cotidiano', 'paz', 'valor', 'apagarte', 'vinculo'] as const).map(k => MIRROR_ES[k][a[k]])

  const attention: InvDevolucion['attention'] =
    lectura.route === 'atencion' && lectura.principal
      ? {
          kind: 'obs',
          main: attentionEs(lectura.principal, a, lectura.flags),
          also: lectura.secundaria ? `${copy.alsoPrefix} ${attentionEs(lectura.secundaria, a, lectura.flags).short}.` : null,
        }
      : { kind: 'route', ...ROUTE_ES[lectura.route === 'incierto' ? 'incierto' : 'nada'] }

  const exercise = EXERCISES_ES[lectura.exercise]
  const questions = getInvQuestions(locale)

  return {
    lectura,
    activo,
    consciente,
    between: `${MIRROR_ES.ritmo[a.ritmo]} ${MIRROR_ES.energia[a.energia]}`,
    supports: lectura.supports.map(k => SUPPORTS_ES[k]),
    noSupport: NO_SUPPORT_ES,
    attention,
    pair: lectura.pair ? PAIRS_ES[lectura.pair] : null,
    texto,
    exercise,
    close: copy.close(exercise.cap),
    basis: questions.map(q => ({ q: q.text, a: q.opts.find(o => o[0] === a[q.id])?.[1] ?? '—' })),
  }
}

// Versión en texto plano (para copiar o como alternativa del email).
export function devolucionToText(d: InvDevolucion, locale: string, fecha: string): string {
  const copy = getInvCopy(locale)
  const L: string[] = []
  L.push(`${copy.resultEyebrow.toUpperCase()} · ${fecha}`, '')
  L.push(copy.activoTitle.toUpperCase(), ...d.activo.map(t => `- ${t}`), '')
  L.push(copy.conscTitle.toUpperCase(), ...d.consciente.map(t => `- ${t}`), '')
  L.push(`${copy.between} ${d.between}`, '')
  L.push(copy.supportsTitle.toUpperCase())
  if (d.supports.length) d.supports.forEach(s => L.push(s.text + (s.quote ? ` «${s.quote}» (${s.cite})` : '')))
  else L.push(d.noSupport)
  L.push('', copy.attentionTitle.toUpperCase())
  if (d.attention.kind === 'route') L.push(`${d.attention.text} «${d.attention.quote}» (${d.attention.cite})`)
  else {
    const m = d.attention.main
    L.push(m.lead, `${m.intro} «${m.quote}» (${m.cite})`)
    if (m.note) L.push(m.note)
    if (d.attention.also) L.push(d.attention.also)
  }
  if (d.pair) L.push(d.pair)
  if (d.texto) L.push('', copy.writtenTitle.toUpperCase(), `«${d.texto}»`)
  L.push('', `${copy.exerciseEyebrow} ${d.exercise.cap}: ${d.exercise.title.toUpperCase()}`, ...d.exercise.steps)
  L.push('', d.close)
  return L.join('\n')
}
