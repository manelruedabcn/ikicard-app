// ============================================================
// INVENTARIO HONESTO — contenido (voz de Manel), en castellano,
// catalán e inglés.
// Fuente: «El Ikigai que no te contaron» (publicado en castellano). Las
// citas y los ejercicios son literales del libro en castellano; en
// catalán e inglés son traducción propia, pendiente de revisión de Manel
// (ver docs/inventario.md). Las frases de unión son nuevas.
//
// La lógica (lib/inventario.ts) va sobre códigos: aquí solo cambia el
// texto visible. Cada idioma es un dataset completo del mismo tipo.
// ============================================================

import { contentLang, type ContentLang } from './content-locale'
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

export interface InvAttentionText extends InvQuote {
  lead: string
  intro: string
  note: string
  // Versión corta para la línea «También marcaste…».
  short: string
}

type MirrorId = Exclude<InvQuestionId, 'ocup' | 'piloto' | 'camino'>
type Support = { dim: string; text: string } & Partial<InvQuote>

interface InvTexts {
  // Preguntas sin la de CAMINO, que se construye con las frases del módulo CAMINO.
  questions: InvQuestion[]
  caminoQuestion: Omit<InvQuestion, 'id' | 'opts'> & { none: string }
  open: { block: string; src: string; text: string; hint: string }
  mirror: Record<MirrorId, Record<string, string>>
  supports: Record<SupportKey, Support>
  noSupport: string
  attention: (key: AttentionKey, a: InvAnswers, f: InvFlags) => InvAttentionText
  routes: { incierto: { text: string } & InvQuote; nada: { text: string } & InvQuote }
  pairs: Record<PairKey, string>
  exercises: Record<ExerciseKey, InvExercise>
  copy: InvCopy
}

export interface InvCopy {
  eyebrow: string
  title: string
  lead: string
  body: string[]
  start: string
  back: string
  of: string
  finish: string
  resultEyebrow: string
  resultTitle: string
  resultIntro: string
  activoTitle: string
  activoSub: string
  conscTitle: string
  conscSub: string
  between: string
  supportsTitle: string
  attentionTitle: string
  alsoPrefix: string
  writtenTitle: string
  writtenNote: string
  exerciseEyebrow: string
  book: string
  basis: string
  restart: string
  copyButton: string
  copied: string
  // Comillas de cita según el idioma.
  q: [string, string]
  dateLocale: string
  caminoChosen: (car: string, name: string, fort: string) => string
  close: (cap: number) => string
  mail: {
    title: string
    body: string
    placeholder: string
    consent: string
    button: string
    sending: string
    done: string
    error: string
    subject: string
    unsubscribe: (link: string) => string
  }
}

// ============================================================
// CASTELLANO
// ============================================================

const ES: InvTexts = {
  questions: [
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
  ],
  caminoQuestion: { block: 'Ikigai Activo', src: 'Herramientas del libro · Test CAMINO', text: '¿Cuál de estas frases se parece más a lo que otros te reconocen?', none: 'Ninguna me encaja' },
  open: {
    block: 'Para terminar',
    src: 'Capítulo 1 · El inventario honesto',
    text: '¿Hay algo que llevas tiempo aplazando que, en el fondo, sientes que tiene que ver contigo de verdad?',
    hint: 'Opcional. Se te devolverá tal como lo escribas.',
  },
  mirror: {
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
  },
  supports: {
    activoClaro: { dim: 'Activo', text: 'Respondes con claridad a casi todas las preguntas del Ikigai Activo. Sabes bastante de hacia dónde vas y de qué se te da bien.', quote: 'El ikigai no va de velocidad. Va de dirección.', cite: 'Capítulo 9' },
    aporte: { dim: 'Activo', text: 'Tienes claro qué aportas a otros, aunque otras preguntas sigan abiertas.' },
    presencia: { dim: 'Consciente', text: 'Ayer recuerdas un momento en que estabas del todo ahí, y esta semana algo cotidiano te hizo sentir que las cosas estaban bien.', quote: 'Eso es Ikigai Consciente: presencia sin espectáculo.', cite: 'Capítulo 4' },
    coherencia: { dim: 'Consciente', text: 'Puedes ser quien eres donde pasas el día, y no estás negociando tus valores.', quote: 'No hace falta que todo sea perfecto. Hace falta que no te obligue a apagarte para encajar.', cite: 'Capítulo 7' },
    vinculo: { dim: 'Consciente', text: 'Tienes cerca a alguien con quien recuerdas quién eres.', quote: 'Con esas personas piensas mejor, sientes mejor, recuerdas quién eres cuando te habías dispersado.', cite: 'Capítulo 8' },
  },
  noSupport: 'En tus respuestas de hoy no aparece un apoyo claro que podamos señalar. No significa que no lo haya; puede que ahora no se vea.',
  attention: (key, a, f) => {
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
          short: 'que ' + parts.join(' y que '),
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
  },
  routes: {
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
  },
  pairs: {
    direccionPiloto: 'Dos respuestas juntas: tienes clara tu dirección y, a la vez, señalas tu ocupación principal como lo que más tiempo lleva en piloto automático. Las dos cosas pueden ser ciertas a la vez.',
    ningunaPresencia: 'Dos respuestas juntas: dices que ninguna parte de tu vida va especialmente en piloto automático y, a la vez, te cuesta recordar momentos en que estuvieras del todo ahí. Las dos cosas pueden ser ciertas a la vez.',
  },
  exercises: {
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
  },
  copy: {
    eyebrow: 'Test de ikigai · IKIGAIER',
    title: 'Inventario honesto de tu ikigai',
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
    copyButton: 'Copiar devolución',
    copied: 'Copiada',
    q: ['«', '»'],
    dateLocale: 'es-ES',
    caminoChosen: (car, name, fort) =>
      `Como lo que otros te reconocen elegiste: «${car}» Su fortaleza, según el test CAMINO del libro (${name}): «${fort}»`,
    close: cap =>
      `Esto es una foto de hoy hecha con tus respuestas, no un perfil. El capítulo ${cap} de «El Ikigai que no te contaron» trabaja esto con más calma. Y si quieres llevar lo que aparece aquí a decisiones concretas, para eso está el acompañamiento.`,
    mail: {
      title: '¿Te envío esta devolución?',
      body: 'Te servirá de guía mientras haces el ejercicio.',
      placeholder: 'tu@correo.com',
      consent: 'Quiero recibir también las cartas de Manel y propuestas para seguir trabajando esto. Es aparte de esta devolución, y puedo darme de baja cuando quiera.',
      button: 'Enviármela',
      sending: 'Enviando…',
      done: 'Hecho. Revisa tu correo: te he enviado tu devolución.',
      error: 'No se pudo enviar. Inténtalo de nuevo.',
      subject: 'Tu inventario honesto de ikigai: desde dónde empiezas',
      unsubscribe: link => `Si prefieres no recibir nada más, <a href="${link}" style="color:rgba(39,39,39,0.5);">date de baja aquí</a>.`,
    },
  },
}

// ============================================================
// CATALÀ
// ============================================================

const CA: InvTexts = {
  questions: [
    { id: 'ocup', block: 'Per començar', src: 'Adaptat', text: 'Quina és ara mateix la teva ocupació principal?',
      opts: [['empleo', 'Treballo per compte d’altri'], ['propia', 'Treballo pel meu compte'], ['cuidados', 'Cuidar d’altres persones'], ['estudios', 'Estudiar'], ['busqueda', 'Buscar feina'], ['jubilacion', 'La jubilació'], ['otra', 'Una altra']] },
    { id: 'piloto', block: 'Per començar', src: 'Capítol 1 · L’inventari honest', text: 'Quina part de la teva vida sents que fa més temps que va amb pilot automàtic?',
      opts: [['ocupacion', 'La meva ocupació principal'], ['relaciones', 'Les meves relacions'], ['cuerpo', 'El cos i el descans'], ['tiempo', 'El temps per a mi'], ['varias', 'Diverses alhora'], ['ninguna', 'Cap en especial']] },
    { id: 'pasion', block: 'Ikigai Actiu', src: 'Capítol 4 · El teu mapa de l’Ikigai Actiu', text: 'Què t’apassiona fer, encara que no et paguin per fer-ho? Si t’ho preguntessin avui, podries anomenar alguna cosa concreta?',
      opts: [['claro', 'Sí, sense dubtar'], ['parcial', 'Alguna cosa, però no ho tinc clar'], ['abierto', 'Ara mateix, no']] },
    { id: 'bueno', block: 'Ikigai Actiu', src: 'Capítol 4 · «que els altres també reconeixen»', text: 'Si algú que et coneix bé digués què se’t dona bé, coincidiria amb el que penses tu?',
      opts: [['claro', 'Sí'], ['parcial', 'En part'], ['nolose', 'No ho sé']] },
    { id: 'aporte', block: 'Ikigai Actiu', src: 'Capítol 4 · El teu mapa de l’Ikigai Actiu', text: 'Podries dir què aportes als altres amb el que fas, encara que sigui en petit?',
      opts: [['claro', 'Sí, ho veig clar'], ['parcial', 'Alguna cosa, sense acabar de veure-ho'], ['abierto', 'Ara mateix, no']] },
    { id: 'vivir', block: 'Ikigai Actiu', src: 'Capítol 4 · El teu mapa de l’Ikigai Actiu', text: 'De què podries viure fent alguna cosa que tingui sentit per a tu?',
      opts: [['claro', 'Ja visc d’alguna cosa així'], ['parcial', 'Tinc alguna idea'], ['nolose', 'Ara mateix, no ho sé'], ['nomia', 'No és la meva pregunta en aquest moment']] },
    { id: 'presencia', block: 'Ikigai Conscient', src: 'Capítols 1 i 4', text: 'Pensa en ahir. Recordes algun moment en què fossis del tot allà, en el que feies?',
      opts: [['si', 'Sí, el recordo'], ['cuesta', 'Em costa recordar-ho'], ['no', 'No']] },
    { id: 'cotidiano', block: 'Ikigai Conscient', src: 'Capítol 4 · Troba el teu quotidià', text: 'Aquesta última setmana, algun gest petit i quotidià t’ha donat la sensació que les coses anaven bé?',
      opts: [['si', 'Sí, algun'], ['nofijado', 'No m’hi he fixat'], ['no', 'No']] },
    { id: 'paz', block: 'Ikigai Conscient', src: 'Capítol 1', text: 'Més enllà del que aconsegueixes, et sents en pau amb qui ets?',
      opts: [['si', 'En general, sí'], ['depende', 'Depèn del dia'], ['pocas', 'Poques vegades']] },
    { id: 'valor', block: 'Ikigai Conscient', src: 'Capítol 7 · L’auditoria', text: 'Hi ha algun valor teu que estiguis negociant de manera contínua?',
      opts: [['no', 'No'], ['aveces', 'De vegades'], ['si', 'Sí, de manera contínua']] },
    { id: 'apagarte', block: 'Ikigai Conscient', src: 'Capítol 7 · L’auditoria', text: 'On passes la major part del dia, pots ser qui ets o t’has d’apagar?',
      opts: [['puedo', 'Puc ser qui soc'], ['depende', 'Depèn'], ['apagar', 'M’he d’apagar']] },
    { id: 'vinculo', block: 'Ikigai Conscient', src: 'Capítol 8 · Relacions que eleven', text: 'Tens a prop algú amb qui penses millor i recordes qui ets quan t’has dispersat?',
      opts: [['si', 'Sí'], ['noseguro', 'No ho tinc clar'], ['no', 'Ara mateix, no']] },
    { id: 'ritmo', block: 'Entre les dues', src: 'Capítol 7 · L’auditoria', text: 'El ritme que t’exigeix la teva ocupació principal, t’estimula o et desgasta?',
      opts: [['estimula', 'M’estimula'], ['epoca', 'Segons l’època'], ['desgasta', 'Em desgasta']] },
    { id: 'energia', block: 'Entre les dues', src: 'Capítol 7 · L’auditoria', text: 'Tens energia en acabar el dia per a les coses que també importen?',
      opts: [['siempre', 'Gairebé sempre'], ['aveces', 'De vegades'], ['nunca', 'Gairebé mai']] },
  ],
  caminoQuestion: { block: 'Ikigai Actiu', src: 'Eines del llibre · Test CAMINO', text: 'Quina d’aquestes frases s’assembla més al que els altres et reconeixen?', none: 'Cap no m’encaixa' },
  open: {
    block: 'Per acabar',
    src: 'Capítol 1 · L’inventari honest',
    text: 'Hi ha alguna cosa que fa temps que ajornes i que, en el fons, sents que té a veure amb tu de veritat?',
    hint: 'Opcional. Et tornarem el text tal com l’escriguis.',
  },
  mirror: {
    pasion: { claro: 'Pots anomenar alguna cosa concreta que t’apassiona.', parcial: 'Tens alguna idea del que t’apassiona, sense tenir-ho clar.', abierto: 'Ara mateix no podries anomenar res que t’apassioni.' },
    bueno: { claro: 'El que creus que se’t dona bé coincideix amb el que veuen els qui et coneixen.', parcial: 'El que creus que se’t dona bé coincideix només en part amb el que veuen els altres.', nolose: 'No saps si el que creus que se’t dona bé coincideix amb el que veuen els altres.' },
    aporte: { claro: 'Veus amb claredat què aportes als altres.', parcial: 'Veus una part del que aportes, sense acabar de veure-ho.', abierto: 'Ara mateix no veus què aportes als altres.' },
    vivir: { claro: 'Ja vius d’alguna cosa que té sentit per a tu.', parcial: 'Tens alguna idea de què podries viure amb sentit.', nolose: 'Ara mateix no saps de què podries viure amb sentit.', nomia: 'De què viure no és la teva pregunta en aquest moment.' },
    presencia: { si: 'Ahir recordes almenys un moment en què eres del tot allà.', cuesta: 'Et costa recordar un moment d’ahir en què fossis del tot allà.', no: 'Ahir no recordes cap moment en què fossis del tot allà.' },
    cotidiano: { si: 'Aquesta setmana, algun gest quotidià t’ha donat la sensació que les coses anaven bé.', nofijado: 'Aquesta setmana no t’has fixat si algun gest quotidià et donava aquesta sensació.', no: 'Aquesta setmana cap gest quotidià no t’ha donat aquesta sensació.' },
    paz: { si: 'En general et sents en pau amb qui ets, més enllà del que aconsegueixes.', depende: 'Sentir-te en pau amb qui ets depèn del dia.', pocas: 'Poques vegades et sents en pau amb qui ets, més enllà del que aconsegueixes.' },
    valor: { no: 'No estàs negociant cap valor teu de manera contínua.', aveces: 'De vegades negocies algun valor teu.', si: 'Estàs negociant un valor teu de manera contínua.' },
    apagarte: { puedo: 'On passes el dia pots ser qui ets.', depende: 'Poder ser qui ets on passes el dia depèn.', apagar: 'On passes el dia sents que t’has d’apagar.' },
    vinculo: { si: 'Tens a prop algú amb qui recordes qui ets.', noseguro: 'No tens clar si hi ha algú a prop amb qui recordis qui ets.', no: 'Ara mateix no tens a prop ningú amb qui recordar qui ets.' },
    ritmo: { estimula: 'El ritme de la teva ocupació principal t’estimula.', epoca: 'El ritme de la teva ocupació principal depèn de l’època.', desgasta: 'El ritme de la teva ocupació principal et desgasta.' },
    energia: { siempre: 'Gairebé sempre et queda energia en acabar el dia.', aveces: 'De vegades et queda energia en acabar el dia.', nunca: 'Gairebé mai no et queda energia en acabar el dia.' },
  },
  supports: {
    activoClaro: { dim: 'Actiu', text: 'Respons amb claredat a gairebé totes les preguntes de l’Ikigai Actiu. Saps força cap on vas i què se’t dona bé.', quote: 'L’ikigai no va de velocitat. Va de direcció.', cite: 'Capítol 9' },
    aporte: { dim: 'Actiu', text: 'Tens clar què aportes als altres, encara que altres preguntes continuïn obertes.' },
    presencia: { dim: 'Conscient', text: 'Ahir recordes un moment en què eres del tot allà, i aquesta setmana alguna cosa quotidiana t’ha fet sentir que les coses anaven bé.', quote: 'Això és Ikigai Conscient: presència sense espectacle.', cite: 'Capítol 4' },
    coherencia: { dim: 'Conscient', text: 'Pots ser qui ets on passes el dia, i no estàs negociant els teus valors.', quote: 'No cal que tot sigui perfecte. Cal que no t’obligui a apagar-te per encaixar.', cite: 'Capítol 7' },
    vinculo: { dim: 'Conscient', text: 'Tens a prop algú amb qui recordes qui ets.', quote: 'Amb aquestes persones penses millor, sents millor, recordes qui ets quan t’havies dispersat.', cite: 'Capítol 8' },
  },
  noSupport: 'En les teves respostes d’avui no apareix un suport clar que puguem assenyalar. No vol dir que no n’hi hagi; potser ara no es veu.',
  attention: (key, a, f) => {
    switch (key) {
      case 'desgaste':
        return {
          lead: 'Marques que el ritme de la teva ocupació principal et desgasta i que gairebé mai no et queda energia en acabar el dia.',
          intro: 'Al llibre faig servir un criteri per a això:',
          quote: 'El que et queda en acabar la jornada, no només en hores sinó en energia real per a la resta de la teva vida.',
          cite: 'Capítol 7',
          note: 'Les teves respostes no diuen d’on ve el desgast. Pot ser la feina, l’etapa o condicions que no tries; aquesta lectura no en treu conclusions.'
            + (f.activoClaro ? ' El que sí que mostren és que, ara mateix, tenir direcció i sentir-te bé sostenint-la van per separat.' : ''),
          short: 'que el ritme et desgasta i gairebé mai no et queda energia en acabar el dia',
        }
      case 'coherencia': {
        const parts: string[] = []
        if (a.valor === 'si') parts.push('estàs negociant un valor teu de manera contínua')
        if (a.apagarte === 'apagar') parts.push('on passes el dia sents que t’has d’apagar')
        return {
          lead: 'Marques que ' + parts.join(' i que ') + '.',
          intro: 'És un dels criteris del llibre per triar sense trair-te:',
          quote: 'Cal que no t’obligui a apagar-te per encaixar.',
          cite: 'Capítol 7',
          note: 'No sabem què hi ha en joc ni per què ho sostens; de vegades hi ha raons de pes. Això només assenyala on mirar.',
          short: 'que ' + parts.join(' i que '),
        }
      }
      case 'presencia':
        return {
          lead: 'Et costa recordar un moment d’ahir en què fossis del tot allà, i aquesta setmana no has notat cap gest quotidià que et fes sentir bé.',
          intro: 'Ho vaig escriure així al primer capítol:',
          quote: 'El mode zombi no apareix de cop. S’instal·la a poc a poc, amb la millor de les intencions.',
          cite: 'Capítol 1',
          note: 'No diu res de qui ets. És una manera de viure que s’instal·la sense que ningú la triï, i per això es pot observar.',
          short: 'que et costa recordar moments en què fossis del tot allà',
        }
      case 'activo':
        return {
          lead: 'Diverses preguntes de l’Ikigai Actiu continuen obertes per a tu ara mateix.',
          intro: 'Que continuïn obertes no és un error.',
          quote: 'Aquesta és la funció real de l’Ikigai Actiu: ajudar-te a veure el que ja hi era, més que donar-te les respostes.',
          cite: 'Capítol 4',
          note: f.sinEmpleo ? 'La teva ocupació principal ara no és una feina remunerada. «De què podria viure?» no s’ha de respondre avui amb una; pot quedar oberta.' : '',
          short: 'que diverses preguntes de l’Ikigai Actiu continuen obertes',
        }
      case 'vinculo':
        return {
          lead: 'Marques que ara mateix no tens a prop ningú amb qui recordar qui ets.',
          intro: 'Sobre les relacions que sostenen, al llibre:',
          quote: 'No cal que comparteixin el teu camí. N’hi ha prou que et permetin ser qui ets sense por ni ironia.',
          cite: 'Capítol 8',
          note: 'De vegades aquestes persones existeixen i són lluny, o fa temps que no se les busca. Les teves respostes no diuen quin és el teu cas.',
          short: 'que ara mateix no tens a prop ningú amb qui recordar qui ets',
        }
      case 'paz':
        return {
          lead: 'Marques que poques vegades et sents en pau amb qui ets, més enllà del que aconsegueixes.',
          intro: 'És un dels set pilars de Kamiya que recullo al llibre:',
          quote: 'Sentir que la teva vida té valor per si mateixa, no només pel que produeixes.',
          cite: 'Capítol 10',
          note: 'És una resposta d’avui, no un retrat. Mereix atenció sense pressa.',
          short: 'que poques vegades et sents en pau amb qui ets',
        }
    }
  },
  routes: {
    incierto: {
      text: 'Moltes de les teves respostes són «no ho sé» o «depèn». És una resposta vàlida, i és un bon punt de partida.',
      quote: 'Per això aquest capítol no et demana que defineixis el teu propòsit. Només et demana que t’observis.',
      cite: 'Capítol 1',
    },
    nada: {
      text: 'En les teves respostes no apareix res que demani una atenció especial. No ho anirem a buscar.',
      quote: 'L’ikigai, entès de veritat, no funciona així: no s’assoleix, s’habita.',
      cite: 'Epíleg',
    },
  },
  pairs: {
    direccionPiloto: 'Dues respostes juntes: tens clara la teva direcció i, alhora, assenyales la teva ocupació principal com el que fa més temps que va amb pilot automàtic. Totes dues coses poden ser certes alhora.',
    ningunaPresencia: 'Dues respostes juntes: dius que cap part de la teva vida no va especialment amb pilot automàtic i, alhora, et costa recordar moments en què fossis del tot allà. Totes dues coses poden ser certes alhora.',
  },
  exercises: {
    ecologia: { title: 'L’ecologia de la teva setmana', cap: 7, steps: [
      'Durant una setmana, al final de cada dia anota a la teva llibreta: Què m’ha donat energia avui? Què me n’ha tret?',
      'Al cap de set dies, llegeix les anotacions seguides. El que apareix a la primera columna de manera repetida és el que sosté la teva vida. El que apareix a la segona, de manera consistent, és el que la desgasta.',
    ] },
    voz: { title: 'Escolta la teva veu interior', cap: 11, steps: [
      'Durant tres dies, cada vegada que prenguis una decisió, gran o petita, abans d’executar-la fes una pausa de deu segons i pregunta’t: Des d’on estic parlant ara mateix? Des de la por, des de l’exigència o des d’un lloc més tranquil?',
      'No has de canviar res. Només observar. Al final de cada dia escriu a la llibreta una frase sobre el que has notat.',
    ] },
    cotidiano: { title: 'Troba el teu quotidià', cap: 4, steps: [
      'Durant els propers set dies, tria una activitat quotidiana que normalment fas en automàtic i fes-la amb plena atenció durant cinc minuts.',
      'En acabar, escriu una frase a la llibreta sobre com t’has sentit. No busquis revelacions. Només observa si hi ha hagut algun moment en què fossis completament allà.',
    ] },
    dejaste: { title: 'El que vas deixar enrere', cap: 4, steps: [
      'Escriu una llista d’activitats que solies gaudir però que has deixat de fer. Per a cadascuna, anota breument per què creus que la vas deixar.',
      'Tria’n una de la llista, la que més curiositat et desperti ara mateix, i comprometa’t a dedicar-hi trenta minuts aquesta setmana. No per convertir-la en un projecte. Només per veure com et sents en tornar-hi.',
    ] },
    contraste: { title: 'El contrast intern', cap: 8, steps: [
      'Tria tres persones de la teva vida actual. Per a cadascuna, respon: Què faig jo quan estic amb aquesta persona que no faig quan estic bé amb mi? Una frase per persona, sense pensar-hi gaire.',
      'Després respon la pregunta mirall: Què necessitaria fer per ser jo mateix quan estic amb aquesta persona?',
      'I tanca amb una declaració: «Quan estic amb ___, el meu repte és ___».',
    ] },
    pilares: { title: 'Els set pilars avui', cap: 10, steps: [
      'Agafa una pàgina de la llibreta i escriu els set pilars en columna: Satisfacció amb el present / Sentiment de futur / Valoració de l’existència / Autonomia / Propòsit / Autoacceptació / Connexió social.',
      'Al costat de cadascun, escriu una sola paraula que descrigui com t’hi relaciones ara mateix. No el que hauria de ser. El que és.',
      'Mira quins són més febles: això et diu on posar atenció, no qui ets.',
    ] },
    tiempo: { title: 'El teu ikigai en el temps', cap: 9, steps: [
      'En una pàgina nova de la llibreta, divideix l’espai en quatre columnes: Adolescència, Joventut, Edat adulta, Ara. A cada columna anota una sola cosa: què et movia en aquella etapa.',
      'Quan tinguis les quatre, mira si hi ha alguna cosa que es repeteix encara que sigui de manera diferent. Un valor, una emoció, un tipus d’impacte. Aquest fil que travessa les etapes sol ser la part més estable del teu ikigai.',
      'Escriu una frase que l’anomeni. No cal que sigui perfecta. Només cal que sigui teva.',
    ] },
    inventario: { title: 'L’inventari honest', cap: 1, steps: [
      'Obre la llibreta en una pàgina nova i respon aquestes tres preguntes sense pensar-hi gaire. El primer que vingui, sense correccions.',
      'Quina part de la teva vida sents que fa més temps que va amb pilot automàtic? Quan va ser l’última vegada que vas fer alguna cosa i vas sentir que eres exactament on havies de ser? Hi ha alguna cosa que fa temps que ajornes i que, en el fons, sents que té a veure amb tu de veritat?',
      'No cal que les respostes siguin boniques ni coherents entre si. Escriu-les i deixa-les estar. Ja hi tornaràs.',
    ] },
  },
  copy: {
    eyebrow: 'Test d’ikigai · IKIGAIER',
    title: 'Inventari honest del teu ikigai',
    lead: 'No et diu a què dedicar-te. Et diu des d’on comences.',
    body: [
      'Quinze preguntes tancades i una d’oberta, opcional. Sobre les dues cares de l’ikigai: el que fas i construeixes, i com ho vius.',
      'Respon el primer que et vingui. No hi ha respostes bones ni dolentes, i «no ho sé» també compta.',
    ],
    start: 'Començar',
    back: 'Anterior',
    of: 'de',
    finish: 'Veure el meu retorn',
    resultEyebrow: 'Inventari honest',
    resultTitle: 'Des d’on comences',
    resultIntro: 'Això és el que diuen les teves respostes, ordenat. Una foto d’avui, no un perfil.',
    activoTitle: 'Ikigai Actiu',
    activoSub: 'El que fas i construeixes',
    conscTitle: 'Ikigai Conscient',
    conscSub: 'Com ho vius',
    between: 'Entre les dues.',
    supportsTitle: 'El que et sosté',
    attentionTitle: 'El que mereix atenció',
    alsoPrefix: 'També has marcat',
    writtenTitle: 'El que has escrit',
    writtenNote: 'Ho deixem aquí, tal com ho has escrit.',
    exerciseEyebrow: 'Per a aquesta setmana · Capítol',
    book: 'El Ikigai que no te contaron',
    basis: 'En què es basa aquesta lectura',
    restart: 'Tornar a començar',
    copyButton: 'Copiar el retorn',
    copied: 'Copiat',
    q: ['«', '»'],
    dateLocale: 'ca-ES',
    caminoChosen: (car, name, fort) =>
      `Com el que els altres et reconeixen has triat: «${car}» La seva fortalesa, segons el test CAMINO del llibre (${name}): «${fort}»`,
    close: cap =>
      `Això és una foto d’avui feta amb les teves respostes, no un perfil. El capítol ${cap} de «El Ikigai que no te contaron» ho treballa amb més calma. I si vols portar el que apareix aquí a decisions concretes, per a això hi ha l’acompanyament.`,
    mail: {
      title: 'T’envio aquest retorn?',
      body: 'Et servirà de guia mentre fas l’exercici.',
      placeholder: 'tu@correu.cat',
      consent: 'Vull rebre també les cartes de Manel i propostes per continuar treballant això. És a part d’aquest retorn, i em puc donar de baixa quan vulgui.',
      button: 'Envia-me’l',
      sending: 'Enviant…',
      done: 'Fet. Revisa el correu: t’he enviat el teu retorn.',
      error: 'No s’ha pogut enviar. Torna-ho a provar.',
      subject: 'El teu inventari honest d’ikigai: des d’on comences',
      unsubscribe: link => `Si prefereixes no rebre res més, <a href="${link}" style="color:rgba(39,39,39,0.5);">dona’t de baixa aquí</a>.`,
    },
  },
}

// ============================================================
// ENGLISH
// ============================================================

const EN: InvTexts = {
  questions: [
    { id: 'ocup', block: 'To begin', src: 'Adapted', text: 'What is your main occupation right now?',
      opts: [['empleo', 'Employed'], ['propia', 'Self-employed'], ['cuidados', 'Caring for others'], ['estudios', 'Studying'], ['busqueda', 'Looking for work'], ['jubilacion', 'Retired'], ['otra', 'Other']] },
    { id: 'piloto', block: 'To begin', src: 'Chapter 1 · The honest inventory', text: 'Which part of your life do you feel has been on autopilot the longest?',
      opts: [['ocupacion', 'My main occupation'], ['relaciones', 'My relationships'], ['cuerpo', 'My body and rest'], ['tiempo', 'Time for myself'], ['varias', 'Several at once'], ['ninguna', 'None in particular']] },
    { id: 'pasion', block: 'Active Ikigai', src: 'Chapter 4 · Your Active Ikigai map', text: 'What do you love doing, even if nobody pays you for it? If someone asked you today, could you name something concrete?',
      opts: [['claro', 'Yes, without hesitation'], ['parcial', 'Something, but I’m not sure'], ['abierto', 'Not right now']] },
    { id: 'bueno', block: 'Active Ikigai', src: 'Chapter 4 · “that others also recognise”', text: 'If someone who knows you well said what you are good at, would it match what you think?',
      opts: [['claro', 'Yes'], ['parcial', 'Partly'], ['nolose', 'I don’t know']] },
    { id: 'aporte', block: 'Active Ikigai', src: 'Chapter 4 · Your Active Ikigai map', text: 'Could you say what you give to others through what you do, even in a small way?',
      opts: [['claro', 'Yes, I see it clearly'], ['parcial', 'Something, without quite seeing it'], ['abierto', 'Not right now']] },
    { id: 'vivir', block: 'Active Ikigai', src: 'Chapter 4 · Your Active Ikigai map', text: 'What could you live on, doing something that makes sense to you?',
      opts: [['claro', 'I already live on something like that'], ['parcial', 'I have some idea'], ['nolose', 'Right now, I don’t know'], ['nomia', 'That’s not my question right now']] },
    { id: 'presencia', block: 'Conscious Ikigai', src: 'Chapters 1 and 4', text: 'Think about yesterday. Do you remember a moment when you were fully there, in what you were doing?',
      opts: [['si', 'Yes, I remember one'], ['cuesta', 'It’s hard to remember'], ['no', 'No']] },
    { id: 'cotidiano', block: 'Conscious Ikigai', src: 'Chapter 4 · Find your everyday', text: 'This past week, has any small everyday gesture given you the feeling that things were fine?',
      opts: [['si', 'Yes, one or two'], ['nofijado', 'I haven’t noticed'], ['no', 'No']] },
    { id: 'paz', block: 'Conscious Ikigai', src: 'Chapter 1', text: 'Beyond what you achieve, do you feel at peace with who you are?',
      opts: [['si', 'Generally, yes'], ['depende', 'It depends on the day'], ['pocas', 'Rarely']] },
    { id: 'valor', block: 'Conscious Ikigai', src: 'Chapter 7 · The audit', text: 'Is there a value of yours that you are constantly negotiating?',
      opts: [['no', 'No'], ['aveces', 'Sometimes'], ['si', 'Yes, constantly']] },
    { id: 'apagarte', block: 'Conscious Ikigai', src: 'Chapter 7 · The audit', text: 'Where you spend most of your day, can you be who you are, or do you have to dim yourself?',
      opts: [['puedo', 'I can be who I am'], ['depende', 'It depends'], ['apagar', 'I have to dim myself']] },
    { id: 'vinculo', block: 'Conscious Ikigai', src: 'Chapter 8 · Relationships that lift you', text: 'Do you have someone close with whom you think more clearly and remember who you are when you have lost your way?',
      opts: [['si', 'Yes'], ['noseguro', 'I’m not sure'], ['no', 'Not right now']] },
    { id: 'ritmo', block: 'Between the two', src: 'Chapter 7 · The audit', text: 'Does the pace your main occupation demands energise you or wear you down?',
      opts: [['estimula', 'It energises me'], ['epoca', 'It depends on the season'], ['desgasta', 'It wears me down']] },
    { id: 'energia', block: 'Between the two', src: 'Chapter 7 · The audit', text: 'Do you have energy at the end of the day for the things that also matter?',
      opts: [['siempre', 'Almost always'], ['aveces', 'Sometimes'], ['nunca', 'Almost never']] },
  ],
  caminoQuestion: { block: 'Active Ikigai', src: 'The book’s tools · CAMINO test', text: 'Which of these sentences is closest to what others recognise in you?', none: 'None of them fits' },
  open: {
    block: 'To finish',
    src: 'Chapter 1 · The honest inventory',
    text: 'Is there something you have been putting off for a while that, deep down, you feel truly has to do with you?',
    hint: 'Optional. It will be given back to you exactly as you write it.',
  },
  mirror: {
    pasion: { claro: 'You can name something concrete that you love doing.', parcial: 'You have some idea of what you love doing, without being sure.', abierto: 'Right now you couldn’t name something you love doing.' },
    bueno: { claro: 'What you think you are good at matches what the people who know you see.', parcial: 'What you think you are good at only partly matches what others see.', nolose: 'You don’t know whether what you think you are good at matches what others see.' },
    aporte: { claro: 'You see clearly what you give to others.', parcial: 'You see some of what you give, without quite seeing it.', abierto: 'Right now you don’t see what you give to others.' },
    vivir: { claro: 'You already live on something that makes sense to you.', parcial: 'You have some idea of what you could live on with meaning.', nolose: 'Right now you don’t know what you could live on with meaning.', nomia: 'What to live on isn’t your question right now.' },
    presencia: { si: 'Yesterday you remember at least one moment when you were fully there.', cuesta: 'It’s hard to remember a moment yesterday when you were fully there.', no: 'You don’t remember any moment yesterday when you were fully there.' },
    cotidiano: { si: 'This week, an everyday gesture gave you the feeling that things were fine.', nofijado: 'This week you haven’t noticed whether any everyday gesture gave you that feeling.', no: 'This week no everyday gesture gave you that feeling.' },
    paz: { si: 'Generally you feel at peace with who you are, beyond what you achieve.', depende: 'Feeling at peace with who you are depends on the day.', pocas: 'You rarely feel at peace with who you are, beyond what you achieve.' },
    valor: { no: 'You aren’t constantly negotiating any of your values.', aveces: 'Sometimes you negotiate one of your values.', si: 'You are constantly negotiating one of your values.' },
    apagarte: { puedo: 'Where you spend your day, you can be who you are.', depende: 'Being who you are where you spend your day depends.', apagar: 'Where you spend your day, you feel you have to dim yourself.' },
    vinculo: { si: 'You have someone close with whom you remember who you are.', noseguro: 'You’re not sure whether there is someone close with whom you remember who you are.', no: 'Right now you don’t have someone close with whom to remember who you are.' },
    ritmo: { estimula: 'The pace of your main occupation energises you.', epoca: 'The pace of your main occupation depends on the season.', desgasta: 'The pace of your main occupation wears you down.' },
    energia: { siempre: 'You almost always have energy left at the end of the day.', aveces: 'Sometimes you have energy left at the end of the day.', nunca: 'You almost never have energy left at the end of the day.' },
  },
  supports: {
    activoClaro: { dim: 'Active', text: 'You answer almost every Active Ikigai question with clarity. You know a fair amount about where you are going and what you are good at.', quote: 'Ikigai is not about speed. It is about direction.', cite: 'Chapter 9' },
    aporte: { dim: 'Active', text: 'You are clear about what you give to others, even if other questions remain open.' },
    presencia: { dim: 'Conscious', text: 'Yesterday you remember a moment when you were fully there, and this week something ordinary made you feel that things were fine.', quote: 'That is Conscious Ikigai: presence without spectacle.', cite: 'Chapter 4' },
    coherencia: { dim: 'Conscious', text: 'You can be who you are where you spend your day, and you are not negotiating your values.', quote: 'It doesn’t need to be perfect. It needs not to force you to dim yourself to fit in.', cite: 'Chapter 7' },
    vinculo: { dim: 'Conscious', text: 'You have someone close with whom you remember who you are.', quote: 'With these people you think better, feel better, remember who you are when you had lost your way.', cite: 'Chapter 8' },
  },
  noSupport: 'Today’s answers don’t show a clear support we can point to. That doesn’t mean there isn’t one; it may just not be visible right now.',
  attention: (key, a, f) => {
    switch (key) {
      case 'desgaste':
        return {
          lead: 'You mark that the pace of your main occupation wears you down and that you almost never have energy left at the end of the day.',
          intro: 'In the book I use a criterion for this:',
          quote: 'What you have left at the end of the working day, not only in hours but in real energy for the rest of your life.',
          cite: 'Chapter 7',
          note: 'Your answers don’t say where the wear comes from. It could be the job, the stage of life or conditions you don’t choose; this reading draws no conclusions from that.'
            + (f.activoClaro ? ' What they do show is that, right now, having direction and feeling well while sustaining it are two separate things.' : ''),
          short: 'that the pace wears you down and you almost never have energy left at the end of the day',
        }
      case 'coherencia': {
        const parts: string[] = []
        if (a.valor === 'si') parts.push('you are constantly negotiating one of your values')
        if (a.apagarte === 'apagar') parts.push('where you spend your day you feel you have to dim yourself')
        return {
          lead: 'You mark that ' + parts.join(' and that ') + '.',
          intro: 'It is one of the book’s criteria for choosing without betraying yourself:',
          quote: 'It needs not to force you to dim yourself to fit in.',
          cite: 'Chapter 7',
          note: 'We don’t know what is at stake or why you hold on to it; sometimes there are good reasons. This only points to where to look.',
          short: 'that ' + parts.join(' and that '),
        }
      }
      case 'presencia':
        return {
          lead: 'It’s hard for you to remember a moment yesterday when you were fully there, and this week you haven’t noticed an everyday gesture that made you feel good.',
          intro: 'I put it this way in the first chapter:',
          quote: 'Zombie mode does not appear suddenly. It settles in slowly, with the best of intentions.',
          cite: 'Chapter 1',
          note: 'It says nothing about who you are. It is a way of living that settles in without anyone choosing it, and that is why it can be observed.',
          short: 'that it’s hard to remember moments when you were fully there',
        }
      case 'activo':
        return {
          lead: 'Several Active Ikigai questions are still open for you right now.',
          intro: 'Their being open is not a failure.',
          quote: 'That is the real function of Active Ikigai: to help you see what was already there, rather than to give you the answers.',
          cite: 'Chapter 4',
          note: f.sinEmpleo ? 'Your main occupation right now is not paid work. “What could I live on?” doesn’t have to be answered with a job today; it can stay open.' : '',
          short: 'that several Active Ikigai questions are still open',
        }
      case 'vinculo':
        return {
          lead: 'You mark that right now you don’t have someone close with whom to remember who you are.',
          intro: 'On the relationships that hold you, in the book:',
          quote: 'They don’t need to share your path. It is enough that they let you be who you are, without fear or irony.',
          cite: 'Chapter 8',
          note: 'Sometimes those people exist and are far away, or it has been a while since you looked for them. Your answers don’t say which is your case.',
          short: 'that right now you don’t have someone close with whom to remember who you are',
        }
      case 'paz':
        return {
          lead: 'You mark that you rarely feel at peace with who you are, beyond what you achieve.',
          intro: 'It is one of Kamiya’s seven pillars that I gather in the book:',
          quote: 'Feeling that your life has value in itself, not only for what you produce.',
          cite: 'Chapter 10',
          note: 'It is today’s answer, not a portrait. It deserves attention, without hurry.',
          short: 'that you rarely feel at peace with who you are',
        }
    }
  },
  routes: {
    incierto: {
      text: 'Many of your answers are “I don’t know” or “it depends”. That is a valid answer, and a good place to start.',
      quote: 'That is why this chapter does not ask you to define your purpose. It only asks you to observe yourself.',
      cite: 'Chapter 1',
    },
    nada: {
      text: 'Nothing in your answers calls for special attention. We won’t go looking for it.',
      quote: 'Ikigai, truly understood, does not work like that: it is not reached, it is inhabited.',
      cite: 'Epilogue',
    },
  },
  pairs: {
    direccionPiloto: 'Two answers side by side: you are clear about your direction and, at the same time, you name your main occupation as what has been on autopilot the longest. Both can be true at once.',
    ningunaPresencia: 'Two answers side by side: you say no part of your life is especially on autopilot and, at the same time, it is hard to remember moments when you were fully there. Both can be true at once.',
  },
  exercises: {
    ecologia: { title: 'The ecology of your week', cap: 7, steps: [
      'For one week, at the end of each day write in your notebook: What gave me energy today? What took it away?',
      'After seven days, read your notes one after another. What appears repeatedly in the first column is what sustains your life. What appears consistently in the second is what wears it down.',
    ] },
    voz: { title: 'Listen to your inner voice', cap: 11, steps: [
      'For three days, every time you make a decision, big or small, pause for ten seconds before acting on it and ask yourself: Where am I speaking from right now? From fear, from demand, or from a calmer place?',
      'You don’t have to change anything. Just observe. At the end of each day write one sentence in your notebook about what you noticed.',
    ] },
    cotidiano: { title: 'Find your everyday', cap: 4, steps: [
      'For the next seven days, choose an everyday activity you usually do on autopilot and do it with full attention for five minutes.',
      'When you finish, write one sentence in your notebook about how you felt. Don’t look for revelations. Just notice whether there was a moment when you were completely there.',
    ] },
    dejaste: { title: 'What you left behind', cap: 4, steps: [
      'Write a list of activities you used to enjoy but have stopped doing. For each one, note briefly why you think you dropped it.',
      'Choose one from the list, the one that sparks the most curiosity right now, and commit to giving it thirty minutes this week. Not to turn it into a project. Just to see how you feel coming back to it.',
    ] },
    contraste: { title: 'The inner contrast', cap: 8, steps: [
      'Choose three people in your life right now. For each one, answer: What do I do when I am with this person that I don’t do when I am well with myself? One sentence per person, without overthinking it.',
      'Then answer the mirror question: What would I need to do to be myself when I am with this person?',
      'And close with a statement: “When I am with ___, my challenge is ___.”',
    ] },
    pilares: { title: 'The seven pillars today', cap: 10, steps: [
      'Take a page of your notebook and write the seven pillars in a column: Satisfaction with the present / Sense of future / Valuing of existence / Autonomy / Purpose / Self-acceptance / Social connection.',
      'Next to each one, write a single word that describes how you relate to it right now. Not what it should be. What it is.',
      'See which ones are weakest: that tells you where to put your attention, not who you are.',
    ] },
    tiempo: { title: 'Your ikigai over time', cap: 9, steps: [
      'On a new page of your notebook, divide the space into four columns: Adolescence, Youth, Adulthood, Now. In each column note one thing only: what moved you at that stage.',
      'When you have all four, see whether something repeats, even in a different form. A value, an emotion, a kind of impact. That thread running through the stages is usually the most stable part of your ikigai.',
      'Write one sentence that names it. It doesn’t have to be perfect. It only has to be yours.',
    ] },
    inventario: { title: 'The honest inventory', cap: 1, steps: [
      'Open your notebook to a new page and answer these three questions without overthinking them. Whatever comes first, no corrections.',
      'Which part of your life do you feel has been on autopilot the longest? When was the last time you did something and felt you were exactly where you needed to be? Is there something you have been putting off that, deep down, you feel truly has to do with you?',
      'Your answers don’t need to be pretty or consistent with each other. Write them down and let them be. You will come back to them.',
    ] },
  },
  copy: {
    eyebrow: 'Ikigai test · IKIGAIER',
    title: 'An honest inventory of your ikigai',
    lead: 'It doesn’t tell you what to do with your life. It tells you where you are starting from.',
    body: [
      'Fifteen closed questions and one optional open one. About the two sides of ikigai: what you do and build, and how you live it.',
      'Answer whatever comes first. There are no right or wrong answers, and “I don’t know” counts too.',
    ],
    start: 'Begin',
    back: 'Back',
    of: 'of',
    finish: 'See my reading',
    resultEyebrow: 'Honest inventory',
    resultTitle: 'Where you are starting from',
    resultIntro: 'This is what your answers say, put in order. A snapshot of today, not a profile.',
    activoTitle: 'Active Ikigai',
    activoSub: 'What you do and build',
    conscTitle: 'Conscious Ikigai',
    conscSub: 'How you live it',
    between: 'Between the two.',
    supportsTitle: 'What holds you',
    attentionTitle: 'What deserves attention',
    alsoPrefix: 'You also marked',
    writtenTitle: 'What you wrote',
    writtenNote: 'We leave it here, just as you wrote it.',
    exerciseEyebrow: 'For this week · Chapter',
    book: 'El Ikigai que no te contaron',
    basis: 'What this reading is based on',
    restart: 'Start again',
    copyButton: 'Copy reading',
    copied: 'Copied',
    q: ['“', '”'],
    dateLocale: 'en-GB',
    caminoChosen: (car, name, fort) =>
      `As what others recognise in you, you chose: “${car}” Its strength, according to the book’s CAMINO test (${name}): “${fort}”`,
    close: cap =>
      `This is a snapshot of today made from your answers, not a profile. Chapter ${cap} of “El Ikigai que no te contaron” works on this more slowly. And if you want to take what appears here into concrete decisions, that is what the one-to-one work is for.`,
    mail: {
      title: 'Shall I email you this reading?',
      body: 'It will guide you while you do the exercise.',
      placeholder: 'you@email.com',
      consent: 'I would also like to receive Manel’s letters and proposals to keep working on this. Separate from this reading, and I can unsubscribe at any time.',
      button: 'Send it to me',
      sending: 'Sending…',
      done: 'Done. Check your inbox: your reading is on its way.',
      error: 'Could not send. Please try again.',
      subject: 'Your honest ikigai inventory: where you are starting from',
      unsubscribe: link => `If you would rather not receive anything else, <a href="${link}" style="color:rgba(39,39,39,0.5);">unsubscribe here</a>.`,
    },
  },
}

const TEXTS: Record<ContentLang, InvTexts> = { es: ES, ca: CA, en: EN }

function texts(locale: string): InvTexts {
  return TEXTS[contentLang(locale)]
}

// ---------- Getters por idioma ----------

export function getInvQuestions(locale: string): InvQuestion[] {
  const t = texts(locale)
  const caminos = getCaminos(locale)
  const camino: InvQuestion = {
    id: 'camino',
    ...t.caminoQuestion,
    opts: [...caminos.map(c => [c.code, c.caracteristicas] as [string, string]), ['ninguna', t.caminoQuestion.none]],
  }
  // CAMINO va justo después de las cuatro preguntas del Ikigai Activo.
  const list = [...t.questions]
  list.splice(list.findIndex(q => q.id === 'vivir') + 1, 0, camino)
  return list
}
export function getInvOpen(locale: string) {
  return texts(locale).open
}
export function getInvCopy(locale: string): InvCopy {
  return texts(locale).copy
}

// ---------- La devolución completa, ya en texto ----------
// La usan la página, el email y el texto para copiar: una sola fuente.

export interface InvDevolucion {
  lectura: InvLectura
  activo: string[]
  consciente: string[]
  between: string
  supports: Support[]
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
  const t = texts(locale)
  const lectura = buildLectura(a)
  const camino = getCaminos(locale).find(c => c.code === (a.camino as CaminoCode))

  const activo = (['pasion', 'bueno', 'aporte', 'vivir'] as const).map(k => t.mirror[k][a[k]])
  if (camino) activo.push(t.copy.caminoChosen(camino.caracteristicas, camino.name, camino.fortalezas))
  const consciente = (['presencia', 'cotidiano', 'paz', 'valor', 'apagarte', 'vinculo'] as const).map(k => t.mirror[k][a[k]])

  const attention: InvDevolucion['attention'] =
    lectura.route === 'atencion' && lectura.principal
      ? {
          kind: 'obs',
          main: t.attention(lectura.principal, a, lectura.flags),
          also: lectura.secundaria ? `${t.copy.alsoPrefix} ${t.attention(lectura.secundaria, a, lectura.flags).short}.` : null,
        }
      : { kind: 'route', ...t.routes[lectura.route === 'incierto' ? 'incierto' : 'nada'] }

  const exercise = t.exercises[lectura.exercise]

  return {
    lectura,
    activo,
    consciente,
    between: `${t.mirror.ritmo[a.ritmo]} ${t.mirror.energia[a.energia]}`,
    supports: lectura.supports.map(k => t.supports[k]),
    noSupport: t.noSupport,
    attention,
    pair: lectura.pair ? t.pairs[lectura.pair] : null,
    texto,
    exercise,
    close: t.copy.close(exercise.cap),
    basis: getInvQuestions(locale).map(q => ({ q: q.text, a: q.opts.find(o => o[0] === a[q.id])?.[1] ?? '—' })),
  }
}

// Versión en texto plano (para copiar).
export function devolucionToText(d: InvDevolucion, locale: string, fecha: string): string {
  const c = getInvCopy(locale)
  const [qo, qc] = c.q
  const L: string[] = []
  L.push(`${c.resultEyebrow.toUpperCase()} · ${fecha}`, '')
  L.push(c.activoTitle.toUpperCase(), ...d.activo.map(t => `- ${t}`), '')
  L.push(c.conscTitle.toUpperCase(), ...d.consciente.map(t => `- ${t}`), '')
  L.push(`${c.between} ${d.between}`, '')
  L.push(c.supportsTitle.toUpperCase())
  if (d.supports.length) d.supports.forEach(s => L.push(s.text + (s.quote ? ` ${qo}${s.quote}${qc} (${s.cite})` : '')))
  else L.push(d.noSupport)
  L.push('', c.attentionTitle.toUpperCase())
  if (d.attention.kind === 'route') L.push(`${d.attention.text} ${qo}${d.attention.quote}${qc} (${d.attention.cite})`)
  else {
    const m = d.attention.main
    L.push(m.lead, `${m.intro} ${qo}${m.quote}${qc} (${m.cite})`)
    if (m.note) L.push(m.note)
    if (d.attention.also) L.push(d.attention.also)
  }
  if (d.pair) L.push(d.pair)
  if (d.texto) L.push('', c.writtenTitle.toUpperCase(), `${qo}${d.texto}${qc}`)
  L.push('', `${c.exerciseEyebrow} ${d.exercise.cap}: ${d.exercise.title.toUpperCase()}`, ...d.exercise.steps)
  L.push('', d.close)
  return L.join('\n')
}
