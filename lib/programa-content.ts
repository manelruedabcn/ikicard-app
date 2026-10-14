// ============================================================
// «UN MES CONOCIENDO TU IKIGAI» — textos (voz de Manel), en castellano,
// catalán e inglés.
// Los ejercicios y las citas salen de «El Ikigai que no te contaron»
// (literales en castellano; traducción propia en CA/EN, pendiente de
// revisión). Las frases de unión son nuevas: ver docs/programa.md.
// El calendario está en lib/programa.ts.
// ============================================================

import { contentLang, type ContentLang } from './content-locale'
import type { InvExercise } from './inventario-content'
import type { ProgramaCheckin, ProgramaSemanal } from './programa'

export type ProgramaBlock =
  | { kind: 'p'; text: string; muted?: boolean }
  | { kind: 'quote'; text: string; cite: string }
  | { kind: 'exercise'; title: string; eyebrow: string; steps: string[] }
  | { kind: 'cta'; href: string; label: string }
  | { kind: 'encuentros'; title: string; items: { when: string; url: string }[]; joinLabel: string }
  | { kind: 'sign'; text: string }
  | { kind: 'checkin'; question: string; note: string; options: { href: string; label: string }[] }

export interface ProgramaMail {
  subject: string
  blocks: ProgramaBlock[]
}

export interface ProgramaContext {
  startDate: string
  // Ejercicio de la devolución del Inventario (semana 1).
  exercise: InvExercise | null
  links: { paso: string; repetir: string; curso: string; libro: string; taller: string }
  // Encuentros próximos dentro del mes de la persona (ya formateados).
  encuentros: { when: string; url: string }[]
  // Semana 3: PASO con cuenta (solo cuando la verificación de cuentas funcione).
  pasoConCuenta: boolean
  // ¿Ha hecho ya el test? Quien entra por la página del programa empieza sin él.
  tieneTest: boolean
  // Enlaces de un clic «¿lo has hecho?» de esta semana (correos del jueves).
  checkin: Record<ProgramaCheckin, string> | null
}

interface ProgramaTexts {
  name: string
  optIn: string
  // Tras pedir el programa: falta confirmar con el botón del correo.
  optInPending: string
  optInDone: string
  // Ya tenía una inscripción activa con este correo.
  optInYa: string
  // Bloque «Confirma tu plaza» dentro del correo de la devolución.
  confirmar: { subject: string; title: string; text: string; button: string; note: string }
  // Quien aún no ha hecho el test: bienvenida y semana 1 se lo piden primero.
  sinTest: { bienvenida: string; semana1: string; button: string }
  // Las cuatro semanas en una línea cada una (página del programa y recuadro
  // del final del test). La primera, «antes de empezar», solo en la página.
  semanas: { antes: string; lista: [string, string, string, string] }
  // Recuadro del final del test: el programa como siguiente paso.
  captura: { title: string; body: string; button: string; solo: string; sending: string; doneSolo: string }
  // Primer test hecho con el enlace personal (entró por la página del programa).
  inicio: { title: string; body: string; sent: string }
  // Una línea en la portada del test.
  testNote: string
  // Página del programa.
  landing: {
    metaTitle: string; metaDescription: string
    eyebrow: string; title: string; lead: string
    howTitle: string
    needTitle: string; need: string[]
    whoTitle: string; who: string
    formTitle: string; placeholder: string; button: string; sending: string; consent: string; error: string
    sent: string; ya: string
    testFirst: string; testLink: string
  }
  // Página que se abre al pulsar «Confirmar mi plaza».
  confirmarPage: { checking: string; confirmada: (start: string) => string; ya: string; invalid: string; error: string }
  dateLocale: string
  q: [string, string]
  book: string
  chapter: string
  thisWeek: string
  encuentrosTitle: string
  join: string
  unsubscribe: (link: string) => string
  compare: { title: string; intro: string; before: string; now: string; none: string; same: (n: number) => string }
  bienvenida: (c: ProgramaContext, start: string) => ProgramaMail
  semanal: Record<ProgramaSemanal, (c: ProgramaContext) => ProgramaMail>
  encuentro: (when: string, url: string) => ProgramaMail
  // Primera línea del lunes según lo que respondió el jueves anterior.
  retomar: Partial<Record<ProgramaCheckin, string>>
  checkinPage: Record<ProgramaCheckin | 'invalid', string>
}

// Quien aún no ha hecho el test: una línea y el botón a su enlace personal.
const sinTestBlocks = (t: ProgramaTexts, c: ProgramaContext, text: string): ProgramaBlock[] =>
  c.tieneTest ? [] : [{ kind: 'p', text }, { kind: 'cta', href: c.links.repetir, label: t.sinTest.button }]

const exerciseBlock = (t: ProgramaTexts, e: InvExercise): ProgramaBlock => ({
  kind: 'exercise',
  title: e.title,
  eyebrow: `${t.thisWeek} · ${t.chapter} ${e.cap}`,
  steps: e.steps,
})

const checkinBlock = (c: ProgramaContext, question: string, note: string, labels: Record<ProgramaCheckin, string>): ProgramaBlock[] =>
  c.checkin
    ? [{ kind: 'checkin', question, note, options: (['si', 'medias', 'no'] as const).map(k => ({ href: c.checkin![k], label: labels[k] })) }]
    : []

const encuentrosBlock = (t: ProgramaTexts, c: ProgramaContext): ProgramaBlock[] =>
  c.encuentros.length ? [{ kind: 'encuentros', title: t.encuentrosTitle, items: c.encuentros, joinLabel: t.join }] : []

// ============================================================
// CASTELLANO
// ============================================================

const ES: ProgramaTexts = {
  name: 'Un mes conociendo tu ikigai',
  optIn: 'Quiero hacer gratis «Un mes conociendo tu ikigai»: un correo cada lunes durante cuatro semanas, con un ejercicio del libro, encuentros en grupo opcionales y, al final, una propuesta para seguir. Puedo darme de baja cuando quiera.',
  optInDone: 'Te has apuntado a «Un mes conociendo tu ikigai». Te he escrito con la fecha de inicio.',
  optInPending: 'Falta un paso: en el correo que te acabo de enviar, arriba del todo, pulsa «Confirmar mi plaza». Sin eso no empieza el programa.',
  optInYa: 'Ya estás dentro de «Un mes conociendo tu ikigai» con este correo.',
  sinTest: {
    bienvenida: 'Antes del lunes, una cosa: haz el test de ikigai. Son diez minutos. Es tu punto de partida: el ejercicio de la primera semana sale de ahí, y en la última lo repetirás para ver qué ha cambiado.',
    semana1: 'Primera semana. Todavía no has hecho el test de ikigai, y todo el mes parte de ahí. Empieza por él: diez minutos. Al terminar verás el ejercicio de esta semana.',
    button: 'HACER EL TEST',
  },
  semanas: {
    antes: 'Antes de empezar · El test de ikigai: una foto de hoy de lo que haces y desde dónde lo haces.',
    lista: [
      'Semana 1 · El ejercicio que te propone tu test, hecho de verdad.',
      'Semana 2 · Tu mapa del Ikigai Activo: lo que haces, lo que se te da bien, lo que aportas.',
      'Semana 3 · Desde dónde lo haces: PASO y una pregunta para cada noche.',
      'Semana 4 · Repites el test y lo comparas con el primero.',
    ],
  },
  captura: {
    title: 'Esto es una foto de hoy. ¿Lo trabajamos durante un mes?',
    body: '«Un mes conociendo tu ikigai» es gratis. Un correo cada lunes durante cuatro semanas, con una sola cosa que hacer. Sin cuenta. Lo dejas cuando quieras.',
    button: 'Empezar el mes gratis',
    solo: 'Solo envíame esta devolución',
    sending: 'Enviando…',
    doneSolo: 'Te la he enviado. Revisa tu correo (y la carpeta de spam, por si acaso).',
  },
  inicio: {
    title: 'Tu punto de partida',
    body: 'Esta es tu foto de hoy. El ejercicio de la primera semana es el que ves arriba; el lunes te llega el correo para hacerlo con calma. En la última semana repetirás el test y lo compararás con este.',
    sent: 'Te he enviado esta devolución a tu correo.',
  },
  testNote: 'Al final, si quieres, puedes seguir con un mes de ejercicios gratis.',
  landing: {
    metaTitle: 'Un mes conociendo tu ikigai · programa gratuito de 4 semanas',
    metaDescription: 'Programa gratuito de cuatro semanas: un correo cada lunes con un ejercicio de «El Ikigai que no te contaron». Empieza con un test de ikigai y acaba repitiéndolo para ver qué ha cambiado.',
    eyebrow: 'Programa gratuito · 4 semanas',
    title: 'Un mes conociendo tu ikigai',
    lead: 'Un correo cada lunes durante cuatro semanas, con una sola cosa que hacer. Empieza con un test de diez minutos y acaba repitiéndolo, para ver qué se ha movido.',
    howTitle: 'Cómo es',
    needTitle: 'Qué necesitas',
    need: [
      'Una libreta y un rato cada semana.',
      'No hace falta crear una cuenta ni tener el libro.',
      'Encuentros en grupo online, opcionales.',
      'Si una semana no puedes, no pasa nada: el lunes siguiente llega el correo siguiente. Te das de baja con un clic.',
    ],
    whoTitle: 'Quién lo escribe',
    who: 'Manel Rueda, autor de «El Ikigai que no te contaron». Todo lo que vas a hacer sale de ese libro.',
    formTitle: 'Empieza el lunes',
    placeholder: 'tu@correo.com',
    button: 'Empezar el mes gratis',
    sending: 'Enviando…',
    consent: 'Quiero recibir también las cartas de Manel y propuestas para seguir trabajando esto. Es aparte del programa, y puedo darme de baja cuando quiera.',
    error: 'No se ha podido enviar. Revisa el correo y vuelve a intentarlo.',
    sent: 'Te he enviado un correo. Pulsa «Confirmar mi plaza» para empezar. Si no lo ves, mira en la carpeta de spam.',
    ya: 'Ya estás dentro del programa con este correo. El correo de cada lunes te llega a esta dirección.',
    testFirst: '¿Prefieres empezar por el test?',
    testLink: 'Hacer el test de ikigai',
  },
  confirmar: {
    subject: 'Confirma tu plaza: un mes conociendo tu ikigai',
    title: 'Confirma tu plaza',
    text: 'Has pedido hacer «Un mes conociendo tu ikigai». Para empezar, confirma que este correo es tuyo. El programa arranca el lunes siguiente a confirmar.',
    button: 'CONFIRMAR MI PLAZA',
    note: 'Si no lo has pedido tú, ignóralo: sin confirmar no recibirás nada más.',
  },
  confirmarPage: {
    checking: 'Confirmando…',
    confirmada: start => `Hecho. Empiezas el lunes ${start}. Te acabo de escribir con lo que viene.`,
    ya: 'Ya estabas dentro del programa. El correo de cada lunes te llega a esta misma dirección.',
    invalid: 'Este enlace no es válido o ya no está activo.',
    error: 'No se ha podido confirmar ahora. Vuelve a pulsar el botón del correo en unos minutos.',
  },
  dateLocale: 'es-ES',
  q: ['«', '»'],
  book: 'El Ikigai que no te contaron',
  chapter: 'Capítulo',
  thisWeek: 'Esta semana',
  encuentrosTitle: 'Encuentro en grupo (opcional, online)',
  join: 'Entrar al encuentro',
  unsubscribe: link => `Si quieres dejar el programa, <a href="${link}" style="color:rgba(39,39,39,0.5);">date de baja aquí</a>.`,
  compare: {
    title: 'Hace un mes y hoy',
    intro: 'Tus respuestas de hace un mes al lado de las de hoy. Solo las que han cambiado.',
    before: 'Antes',
    now: 'Ahora',
    none: 'Ninguna respuesta ha cambiado. También es información.',
    same: n => (n === 1 ? 'Una respuesta sigue igual.' : `${n} respuestas siguen igual.`),
  },
  bienvenida: (c, start) => ({
    subject: `Empiezas el lunes ${start}: un mes conociendo tu ikigai`,
    blocks: [
      { kind: 'p', text: `Te has apuntado a «Un mes conociendo tu ikigai». Empiezas el lunes ${start}.` },
      { kind: 'p', text: 'Durante cuatro semanas te llegará un correo cada lunes por la mañana, con una sola cosa que hacer esa semana. Todo sale de «El Ikigai que no te contaron». No hace falta que tengas el libro.' },
      { kind: 'p', text: 'Habrá encuentros en grupo, online, para quien quiera venir. Te avisaré la víspera.' },
      ...encuentrosBlock(ES, c),
      { kind: 'p', text: 'Si una semana no puedes, no pasa nada. El lunes siguiente llega el correo siguiente.' },
      { kind: 'quote', text: 'Si un día fallas, al siguiente vuelves. Sin drama.', cite: 'Capítulo 6' },
      ...sinTestBlocks(ES, c, ES.sinTest.bienvenida),
      { kind: 'p', text: 'Mientras tanto, solo una cosa: busca una libreta que te dé gusto abrir. La vas a usar.' },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
  semanal: {
    jueves1: c => ({
      subject: 'A mitad de semana',
      blocks: [
        { kind: 'p', text: 'A mitad de la primera semana. Si todavía no has empezado el ejercicio, hoy vale igual.' },
        { kind: 'p', text: 'Una pregunta para esta noche: ¿qué has notado que no esperabas?' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    jueves2: c => ({
      subject: 'A mitad de semana: tu mapa',
      blocks: [
        { kind: 'p', text: '¿Hay algo que aparezca en más de una sección de tu mapa? Si aún no lo has hecho, diez minutos esta noche bastan.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    jueves3: c => ({
      subject: 'A mitad de semana: lo que se repite',
      blocks: [
        { kind: 'p', text: 'Mira lo que has anotado estas noches. ¿Se repite algo: una persona, un gesto, un momento del día?' },
        { kind: 'p', text: 'Si aún no has hecho PASO, el enlace sigue en el correo del lunes.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    jueves4: c => ({
      subject: 'A mitad de semana: un mes después',
      blocks: [
        { kind: 'p', text: '¿Has repetido tu inventario? Antes de hacerlo, relee la frase que escribiste el primer día.' },
        { kind: 'cta', href: c.links.repetir, label: 'REPETIR MI INVENTARIO' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    semana1: c => ({
      subject: c.exercise ? `Semana 1: ${c.exercise.title.toLowerCase()}` : 'Semana 1: el inventario honesto',
      blocks: [
        ...(c.tieneTest ? [
          { kind: 'p', text: 'Primera semana. Empezamos por lo que salió en tu inventario.' },
          { kind: 'p', text: 'Cuando hiciste el test, la devolución te propuso un ejercicio. Esta semana es para hacerlo de verdad, no para leerlo.' },
        ] as ProgramaBlock[] : sinTestBlocks(ES, c, ES.sinTest.semana1)),
        ...(c.exercise ? [exerciseBlock(ES, c.exercise)] : []),
        { kind: 'p', text: 'Antes de empezar, en la primera página de tu libreta escribe la fecha de hoy y una sola frase: lo que esperas de este mes. No lo que crees que deberías esperar. Lo que realmente esperas, aunque suene pequeño.' },
        { kind: 'p', text: 'Esa frase es un ancla. Cuando llegues al final del mes y la releas, te dirá más sobre el camino recorrido que cualquier ejercicio.' },
        { kind: 'p', text: 'El lunes que viene, la segunda semana.', muted: true },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana2: c => ({
      subject: 'Semana 2: tu mapa del Ikigai Activo',
      blocks: [
        { kind: 'p', text: 'Segunda semana. Miramos el Ikigai Activo: lo que haces, lo que se te da bien, lo que aportas.' },
        exerciseBlock(ES, { title: 'Tu mapa del Ikigai Activo', cap: 4, steps: [
          'En una página nueva de tu libreta, divide el espacio en cuatro secciones y responde una pregunta en cada una:',
          '¿Qué me apasiona hacer? (aunque no me paguen por ello) · ¿En qué soy bueno? (que los demás también reconocen) · ¿Qué podría aportar al mundo? (aunque sea en pequeño) · ¿De qué podría vivir haciendo algo que tiene sentido para mí?',
          'Mira si hay algo que aparezca en más de una sección. Eso suele ser la pista más útil.',
        ] }),
        { kind: 'quote', text: 'El diagrama no da una respuesta definitiva: abre un espacio de reflexión.', cite: 'Herramientas' },
        { kind: 'p', text: 'Si quieres ir más allá, al final del libro están el test de las cuatro estrellas y el test CAMINO.', muted: true },
        ...encuentrosBlock(ES, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana3: c => ({
      subject: 'Semana 3: cómo caminas',
      blocks: [
        { kind: 'p', text: 'Tercera semana. Ahora la otra cara: no qué haces, sino desde dónde lo haces.' },
        { kind: 'p', text: c.pasoConCuenta
          ? 'Te propongo PASO, un test breve que compara cómo te muestras para adaptarte con cómo eres cuando no tienes que representar ningún papel. Para hacerlo, crea tu cuenta en la app: así tu resultado queda guardado junto a tu recorrido.'
          : 'Te propongo PASO, un test breve que compara cómo te muestras para adaptarte con cómo eres cuando no tienes que representar ningún papel. No hace falta registrarte. Si creas una cuenta en la app, tu resultado queda guardado junto a tu recorrido.' },
        { kind: 'cta', href: c.links.paso, label: 'HACER PASO' },
        { kind: 'p', text: 'PASO habla de tu «máscara» en ese sentido: tu forma adaptada de actuar. Las siete máscaras del libro, las que aprendimos para protegernos, son otra cosa. De ellas hablamos en el curso.', muted: true },
        { kind: 'p', text: 'Y una pregunta para la semana, del capítulo 8. Elige a alguien con quien convivas a diario y obsérvate. Una frase en tu libreta cada noche:' },
        { kind: 'quote', text: '¿Qué hago yo cuando estoy con esta persona que no hago cuando estoy bien conmigo?', cite: 'Capítulo 8' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana4: c => ({
      subject: 'Semana 4: un mes después',
      blocks: [
        { kind: 'p', text: 'Última semana. Toca volver al principio.' },
        { kind: 'p', text: 'Haz otra vez el Inventario honesto. Al terminar verás tus respuestas de hace un mes al lado de las de hoy. No esperes un cambio grande: un mes es poco. Mira qué se ha movido y qué no.' },
        { kind: 'cta', href: c.links.repetir, label: 'REPETIR MI INVENTARIO' },
        exerciseBlock(ES, { title: 'Revisión mensual', cap: 6, steps: [
          'Al final de este mes, hazte tres preguntas en tu libreta:',
          '¿Qué me ha aportado equilibrio este mes? · ¿Qué me ha costado más de lo que valía? · ¿Qué quiero ajustar el mes que viene?',
          'Y relee la frase que escribiste el primer día.',
        ] }),
        ...encuentrosBlock(ES, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    cierre: c => ({
      subject: 'Después de este mes',
      blocks: [
        { kind: 'p', text: 'Has terminado «Un mes conociendo tu ikigai». Si has hecho aunque sea una parte, has hecho algo que poca gente hace: mirarte con calma.' },
        { kind: 'p', text: 'Lo que has trabajado este mes son las dos caras del ikigai. Debajo están el miedo, las máscaras y la forma en que te hablas por dentro. Eso es lo que recorre el curso online: los tres actos del libro, conmigo.' },
        { kind: 'cta', href: c.links.curso, label: 'VER EL CURSO' },
        { kind: 'p', text: 'Si prefieres seguir por tu cuenta, el libro está aquí:', muted: true },
        { kind: 'cta', href: c.links.libro, label: 'EL IKIGAI QUE NO TE CONTARON' },
        { kind: 'p', text: 'Y si prefieres vivirlo en persona, junto a otras personas que se hacen tus mismas preguntas, está el taller presencial «Yo soy IKIGAIER»: cuatro horas para escucharte.', muted: true },
        { kind: 'cta', href: c.links.taller, label: 'VER EL TALLER' },
        { kind: 'p', text: 'Y si quieres llevar esto a decisiones concretas, puedes responder a este correo.', muted: true },
        { kind: 'quote', text: 'Sigue caminando. Pero hazlo sin alejarte de ti.', cite: 'Epílogo' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
  },
  retomar: { no: 'No pasa nada si la semana pasada no pudo ser. Aquí va la siguiente; si quieres, retoma también la anterior.', medias: 'A medias también cuenta. Seguimos.' },
  checkinPage: { si: 'Anotado. Gracias.', medias: 'Anotado. A medias también cuenta.', no: 'Anotado. Si esta semana no ha podido ser, no pasa nada: el lunes llega la siguiente.', invalid: 'Enlace no válido.' },
  encuentro: (when, url) => ({
    subject: 'Mañana: encuentro en grupo',
    blocks: [
      { kind: 'p', text: `Mañana, ${when} (hora de Madrid), nos vemos online. Es opcional y no hace falta preparar nada. Trae tu libreta.` },
      { kind: 'cta', href: url, label: 'ENTRAR AL ENCUENTRO' },
      { kind: 'p', text: 'Si no puedes, no pasa nada.', muted: true },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
}

// ============================================================
// CATALÀ
// ============================================================

const CA: ProgramaTexts = {
  name: 'Un mes coneixent el teu ikigai',
  optIn: 'Vull fer gratis «Un mes coneixent el teu ikigai»: un correu cada dilluns durant quatre setmanes, amb un exercici del llibre, trobades en grup opcionals i, al final, una proposta per continuar. Em puc donar de baixa quan vulgui.',
  optInDone: 'T’has apuntat a «Un mes coneixent el teu ikigai». T’he escrit amb la data d’inici.',
  optInPending: 'Falta un pas: al correu que t’acabo d’enviar, a dalt de tot, prem «Confirmar la meva plaça». Sense això el programa no comença.',
  optInYa: 'Ja ets dins de «Un mes coneixent el teu ikigai» amb aquest correu.',
  sinTest: {
    bienvenida: 'Abans de dilluns, una cosa: fes el test d’ikigai. Són deu minuts. És el teu punt de partida: l’exercici de la primera setmana surt d’aquí, i a l’última el repetiràs per veure què ha canviat.',
    semana1: 'Primera setmana. Encara no has fet el test d’ikigai, i tot el mes parteix d’aquí. Comença per ell: deu minuts. En acabar veuràs l’exercici d’aquesta setmana.',
    button: 'FER EL TEST',
  },
  semanas: {
    antes: 'Abans de començar · El test d’ikigai: una foto d’avui del que fas i des d’on ho fas.',
    lista: [
      'Setmana 1 · L’exercici que et proposa el teu test, fet de veritat.',
      'Setmana 2 · El teu mapa de l’Ikigai Actiu: el que fas, el que se’t dona bé, el que aportes.',
      'Setmana 3 · Des d’on ho fas: PASO i una pregunta per a cada nit.',
      'Setmana 4 · Repeteixes el test i el compares amb el primer.',
    ],
  },
  captura: {
    title: 'Això és una foto d’avui. Ho treballem durant un mes?',
    body: '«Un mes coneixent el teu ikigai» és gratuït. Un correu cada dilluns durant quatre setmanes, amb una sola cosa per fer. Sense compte. Ho deixes quan vulguis.',
    button: 'Començar el mes gratis',
    solo: 'Només envia’m aquest retorn',
    sending: 'Enviant…',
    doneSolo: 'Te l’he enviat. Revisa el correu (i la carpeta de correu brossa, per si de cas).',
  },
  inicio: {
    title: 'El teu punt de partida',
    body: 'Aquesta és la teva foto d’avui. L’exercici de la primera setmana és el que veus a dalt; dilluns et arriba el correu per fer-lo amb calma. A l’última setmana repetiràs el test i el compararàs amb aquest.',
    sent: 'T’he enviat aquest retorn al correu.',
  },
  testNote: 'Al final, si vols, pots continuar amb un mes d’exercicis gratuït.',
  landing: {
    metaTitle: 'Un mes coneixent el teu ikigai · programa gratuït de 4 setmanes',
    metaDescription: 'Programa gratuït de quatre setmanes: un correu cada dilluns amb un exercici de «El Ikigai que no te contaron». Comença amb un test d’ikigai i acaba repetint-lo per veure què ha canviat.',
    eyebrow: 'Programa gratuït · 4 setmanes',
    title: 'Un mes coneixent el teu ikigai',
    lead: 'Un correu cada dilluns durant quatre setmanes, amb una sola cosa per fer. Comença amb un test de deu minuts i acaba repetint-lo, per veure què s’ha mogut.',
    howTitle: 'Com és',
    needTitle: 'Què necessites',
    need: [
      'Una llibreta i una estona cada setmana.',
      'No cal crear un compte ni tenir el llibre.',
      'Trobades en grup en línia, opcionals.',
      'Si una setmana no pots, no passa res: el dilluns següent arriba el correu següent. Et dones de baixa amb un clic.',
    ],
    whoTitle: 'Qui l’escriu',
    who: 'Manel Rueda, autor de «El Ikigai que no te contaron». Tot el que faràs surt d’aquest llibre.',
    formTitle: 'Comença dilluns',
    placeholder: 'el.teu@correu.com',
    button: 'Començar el mes gratis',
    sending: 'Enviant…',
    consent: 'Vull rebre també les cartes d’en Manel i propostes per continuar treballant això. És a part del programa, i em puc donar de baixa quan vulgui.',
    error: 'No s’ha pogut enviar. Revisa el correu i torna-ho a provar.',
    sent: 'T’he enviat un correu. Prem «Confirmar la meva plaça» per començar. Si no el veus, mira a la carpeta de correu brossa.',
    ya: 'Ja ets dins del programa amb aquest correu. El correu de cada dilluns t’arriba a aquesta adreça.',
    testFirst: 'Prefereixes començar pel test?',
    testLink: 'Fer el test d’ikigai',
  },
  confirmar: {
    subject: 'Confirma la teva plaça: un mes coneixent el teu ikigai',
    title: 'Confirma la teva plaça',
    text: 'Has demanat fer «Un mes coneixent el teu ikigai». Per començar, confirma que aquest correu és teu. El programa arrenca el dilluns següent a confirmar.',
    button: 'CONFIRMAR LA MEVA PLAÇA',
    note: 'Si no ho has demanat tu, ignora-ho: sense confirmar no rebràs res més.',
  },
  confirmarPage: {
    checking: 'Confirmant…',
    confirmada: start => `Fet. Comences el dilluns ${start}. T’acabo d’escriure amb el que ve.`,
    ya: 'Ja eres dins del programa. El correu de cada dilluns t’arriba a aquesta mateixa adreça.',
    invalid: 'Aquest enllaç no és vàlid o ja no està actiu.',
    error: 'No s’ha pogut confirmar ara. Torna a prémer el botó del correu d’aquí a uns minuts.',
  },
  dateLocale: 'ca-ES',
  q: ['«', '»'],
  book: 'El Ikigai que no te contaron',
  chapter: 'Capítol',
  thisWeek: 'Aquesta setmana',
  encuentrosTitle: 'Trobada en grup (opcional, en línia)',
  join: 'Entrar a la trobada',
  unsubscribe: link => `Si vols deixar el programa, <a href="${link}" style="color:rgba(39,39,39,0.5);">dona’t de baixa aquí</a>.`,
  compare: {
    title: 'Fa un mes i avui',
    intro: 'Les teves respostes de fa un mes al costat de les d’avui. Només les que han canviat.',
    before: 'Abans',
    now: 'Ara',
    none: 'Cap resposta no ha canviat. També és informació.',
    same: n => (n === 1 ? 'Una resposta continua igual.' : `${n} respostes continuen igual.`),
  },
  bienvenida: (c, start) => ({
    subject: `Comences el dilluns ${start}: un mes coneixent el teu ikigai`,
    blocks: [
      { kind: 'p', text: `T’has apuntat a «Un mes coneixent el teu ikigai». Comences el dilluns ${start}.` },
      { kind: 'p', text: 'Durant quatre setmanes et arribarà un correu cada dilluns al matí, amb una sola cosa per fer aquella setmana. Tot surt d’«El Ikigai que no te contaron». No cal que tinguis el llibre.' },
      { kind: 'p', text: 'Hi haurà trobades en grup, en línia, per a qui hi vulgui venir. T’avisaré la vigília.' },
      ...encuentrosBlock(CA, c),
      { kind: 'p', text: 'Si una setmana no pots, no passa res. El dilluns següent arriba el correu següent.' },
      { kind: 'quote', text: 'Si un dia falles, l’endemà tornes. Sense drama.', cite: 'Capítol 6' },
      ...sinTestBlocks(CA, c, CA.sinTest.bienvenida),
      { kind: 'p', text: 'Mentrestant, només una cosa: busca una llibreta que et faci gust obrir. La faràs servir.' },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
  semanal: {
    jueves1: c => ({
      subject: 'A mitja setmana',
      blocks: [
        { kind: 'p', text: 'A mitja primera setmana. Si encara no has començat l’exercici, avui també val.' },
        { kind: 'p', text: 'Una pregunta per a aquesta nit: què has notat que no esperaves?' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    jueves2: c => ({
      subject: 'A mitja setmana: el teu mapa',
      blocks: [
        { kind: 'p', text: 'Hi ha alguna cosa que aparegui en més d’una secció del teu mapa? Si encara no ho has fet, deu minuts aquesta nit n’hi ha prou.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    jueves3: c => ({
      subject: 'A mitja setmana: el que es repeteix',
      blocks: [
        { kind: 'p', text: 'Mira el que has anotat aquestes nits. Es repeteix alguna cosa: una persona, un gest, un moment del dia?' },
        { kind: 'p', text: 'Si encara no has fet PASO, l’enllaç continua al correu del dilluns.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    jueves4: c => ({
      subject: 'A mitja setmana: un mes després',
      blocks: [
        { kind: 'p', text: 'Has repetit el teu inventari? Abans de fer-ho, rellegeix la frase que vas escriure el primer dia.' },
        { kind: 'cta', href: c.links.repetir, label: 'REPETIR EL MEU INVENTARI' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    semana1: c => ({
      subject: c.exercise ? `Setmana 1: ${c.exercise.title.toLowerCase()}` : 'Setmana 1: l’inventari honest',
      blocks: [
        ...(c.tieneTest ? [
          { kind: 'p', text: 'Primera setmana. Comencem pel que va sortir al teu inventari.' },
          { kind: 'p', text: 'Quan vas fer el test, el retorn et va proposar un exercici. Aquesta setmana és per fer-lo de veritat, no per llegir-lo.' },
        ] as ProgramaBlock[] : sinTestBlocks(CA, c, CA.sinTest.semana1)),
        ...(c.exercise ? [exerciseBlock(CA, c.exercise)] : []),
        { kind: 'p', text: 'Abans de començar, a la primera pàgina de la llibreta escriu la data d’avui i una sola frase: el que esperes d’aquest mes. No el que creus que hauries d’esperar. El que realment esperes, encara que soni petit.' },
        { kind: 'p', text: 'Aquesta frase és una àncora. Quan arribis al final del mes i la rellegeixis, et dirà més sobre el camí fet que qualsevol exercici.' },
        { kind: 'p', text: 'El dilluns que ve, la segona setmana.', muted: true },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana2: c => ({
      subject: 'Setmana 2: el teu mapa de l’Ikigai Actiu',
      blocks: [
        { kind: 'p', text: 'Segona setmana. Mirem l’Ikigai Actiu: el que fas, el que se’t dona bé, el que aportes.' },
        exerciseBlock(CA, { title: 'El teu mapa de l’Ikigai Actiu', cap: 4, steps: [
          'En una pàgina nova de la llibreta, divideix l’espai en quatre seccions i respon una pregunta a cadascuna:',
          'Què m’apassiona fer? (encara que no em paguin per fer-ho) · En què soc bo? (que els altres també reconeixen) · Què podria aportar al món? (encara que sigui en petit) · De què podria viure fent alguna cosa que tingui sentit per a mi?',
          'Mira si hi ha alguna cosa que aparegui en més d’una secció. Sol ser la pista més útil.',
        ] }),
        { kind: 'quote', text: 'El diagrama no dona una resposta definitiva: obre un espai de reflexió.', cite: 'Eines' },
        { kind: 'p', text: 'Si vols anar més enllà, al final del llibre hi ha el test de les quatre estrelles i el test CAMINO.', muted: true },
        ...encuentrosBlock(CA, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana3: c => ({
      subject: 'Setmana 3: com camines',
      blocks: [
        { kind: 'p', text: 'Tercera setmana. Ara l’altra cara: no què fas, sinó des d’on ho fas.' },
        { kind: 'p', text: c.pasoConCuenta
          ? 'Et proposo PASO, un test breu que compara com et mostres per adaptar-te amb com ets quan no has de representar cap paper. Per fer-lo, crea el teu compte a l’app: així el resultat queda desat al costat del teu recorregut.'
          : 'Et proposo PASO, un test breu que compara com et mostres per adaptar-te amb com ets quan no has de representar cap paper. No cal registrar-te. Si crees un compte a l’app, el resultat queda desat al costat del teu recorregut.' },
        { kind: 'cta', href: c.links.paso, label: 'FER PASO' },
        { kind: 'p', text: 'PASO parla de la teva «màscara» en aquest sentit: la teva manera adaptada d’actuar. Les set màscares del llibre, les que vam aprendre per protegir-nos, són una altra cosa. En parlem al curs.', muted: true },
        { kind: 'p', text: 'I una pregunta per a la setmana, del capítol 8. Tria algú amb qui convisquis cada dia i observa’t. Una frase a la llibreta cada nit:' },
        { kind: 'quote', text: 'Què faig jo quan estic amb aquesta persona que no faig quan estic bé amb mi?', cite: 'Capítol 8' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana4: c => ({
      subject: 'Setmana 4: un mes després',
      blocks: [
        { kind: 'p', text: 'Última setmana. Toca tornar al principi.' },
        { kind: 'p', text: 'Torna a fer l’Inventari honest. En acabar veuràs les teves respostes de fa un mes al costat de les d’avui. No esperis un gran canvi: un mes és poc. Mira què s’ha mogut i què no.' },
        { kind: 'cta', href: c.links.repetir, label: 'REPETIR EL MEU INVENTARI' },
        exerciseBlock(CA, { title: 'Revisió mensual', cap: 6, steps: [
          'Al final d’aquest mes, fes-te tres preguntes a la llibreta:',
          'Què m’ha aportat equilibri aquest mes? · Què m’ha costat més del que valia? · Què vull ajustar el mes que ve?',
          'I rellegeix la frase que vas escriure el primer dia.',
        ] }),
        ...encuentrosBlock(CA, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    cierre: c => ({
      subject: 'Després d’aquest mes',
      blocks: [
        { kind: 'p', text: 'Has acabat «Un mes coneixent el teu ikigai». Si n’has fet encara que sigui una part, has fet una cosa que poca gent fa: mirar-te amb calma.' },
        { kind: 'p', text: 'El que has treballat aquest mes són les dues cares de l’ikigai. A sota hi ha la por, les màscares i la manera com et parles per dins. Això és el que recorre el curs en línia: els tres actes del llibre, amb mi.' },
        { kind: 'cta', href: c.links.curso, label: 'VEURE EL CURS' },
        { kind: 'p', text: 'Si prefereixes continuar pel teu compte, el llibre és aquí:', muted: true },
        { kind: 'cta', href: c.links.libro, label: 'EL IKIGAI QUE NO TE CONTARON' },
        { kind: 'p', text: 'I si prefereixes viure-ho en persona, amb altres persones que es fan les teves mateixes preguntes, hi ha el taller presencial «Jo soc IKIGAIER»: quatre hores per escoltar-te.', muted: true },
        { kind: 'cta', href: c.links.taller, label: 'VEURE EL TALLER' },
        { kind: 'p', text: 'I si vols portar tot això a decisions concretes, pots respondre aquest correu.', muted: true },
        { kind: 'quote', text: 'Continua caminant. Però fes-ho sense allunyar-te de tu.', cite: 'Epíleg' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
  },
  retomar: { no: 'No passa res si la setmana passada no va poder ser. Aquí tens la següent; si vols, reprèn també l’anterior.', medias: 'A mitges també compta. Continuem.' },
  checkinPage: { si: 'Anotat. Gràcies.', medias: 'Anotat. A mitges també compta.', no: 'Anotat. Si aquesta setmana no ha pogut ser, no passa res: dilluns arriba la següent.', invalid: 'Enllaç no vàlid.' },
  encuentro: (when, url) => ({
    subject: 'Demà: trobada en grup',
    blocks: [
      { kind: 'p', text: `Demà, ${when} (hora de Madrid), ens veiem en línia. És opcional i no cal preparar res. Porta la llibreta.` },
      { kind: 'cta', href: url, label: 'ENTRAR A LA TROBADA' },
      { kind: 'p', text: 'Si no pots, no passa res.', muted: true },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
}

// ============================================================
// ENGLISH
// ============================================================

const EN: ProgramaTexts = {
  name: 'A month getting to know your ikigai',
  optIn: 'I want to do “A month getting to know your ikigai” for free: an email every Monday for four weeks, with an exercise from the book, optional group meetings and, at the end, a proposal to keep going. I can unsubscribe at any time.',
  optInDone: 'You have signed up for “A month getting to know your ikigai”. I have emailed you the start date.',
  optInPending: 'One more step: in the email I have just sent you, at the very top, press “Confirm my place”. The programme doesn’t start without it.',
  optInYa: 'You are already in “A month getting to know your ikigai” with this email.',
  sinTest: {
    bienvenida: 'Before Monday, one thing: take the ikigai test. It takes ten minutes. It is your starting point: the first week’s exercise comes from it, and in the last week you will repeat it to see what has changed.',
    semana1: 'First week. You haven’t taken the ikigai test yet, and the whole month starts from there. Begin with it: ten minutes. When you finish, you will see this week’s exercise.',
    button: 'TAKE THE TEST',
  },
  semanas: {
    antes: 'Before you start · The ikigai test: a snapshot of what you do and where you do it from.',
    lista: [
      'Week 1 · The exercise your test suggests, actually done.',
      'Week 2 · Your map of the Active Ikigai: what you do, what you are good at, what you contribute.',
      'Week 3 · Where you do it from: PASO and one question for each evening.',
      'Week 4 · You repeat the test and compare it with the first one.',
    ],
  },
  captura: {
    title: 'This is a snapshot of today. Shall we work on it for a month?',
    body: '“A month getting to know your ikigai” is free. One email every Monday for four weeks, with one thing to do. No account. You can leave whenever you want.',
    button: 'Start the free month',
    solo: 'Just send me this reading',
    sending: 'Sending…',
    doneSolo: 'I have sent it. Check your inbox (and your spam folder, just in case).',
  },
  inicio: {
    title: 'Your starting point',
    body: 'This is your snapshot of today. The first week’s exercise is the one above; on Monday you will get the email to do it calmly. In the last week you will repeat the test and compare it with this one.',
    sent: 'I have sent this reading to your email.',
  },
  testNote: 'At the end, if you like, you can continue with a free month of exercises.',
  landing: {
    metaTitle: 'A month getting to know your ikigai · free 4-week programme',
    metaDescription: 'Free four-week programme: one email every Monday with an exercise from “El Ikigai que no te contaron”. It starts with an ikigai test and ends by repeating it to see what has changed.',
    eyebrow: 'Free programme · 4 weeks',
    title: 'A month getting to know your ikigai',
    lead: 'One email every Monday for four weeks, with one thing to do. It starts with a ten-minute test and ends by repeating it, to see what has moved.',
    howTitle: 'How it works',
    needTitle: 'What you need',
    need: [
      'A notebook and a little time each week.',
      'No account needed, and you don’t need the book.',
      'Optional online group meetings.',
      'If you can’t do a week, that’s fine: the next email arrives the following Monday. You can unsubscribe with one click.',
    ],
    whoTitle: 'Who writes it',
    who: 'Manel Rueda, author of “El Ikigai que no te contaron”. Everything you will do comes from that book.',
    formTitle: 'Start on Monday',
    placeholder: 'you@email.com',
    button: 'Start the free month',
    sending: 'Sending…',
    consent: 'I would also like to receive Manel’s letters and ideas to keep working on this. It is separate from the programme, and I can unsubscribe at any time.',
    error: 'It couldn’t be sent. Check the email address and try again.',
    sent: 'I have sent you an email. Press “Confirm my place” to start. If you can’t see it, check your spam folder.',
    ya: 'You are already in the programme with this email. The Monday email reaches you at this address.',
    testFirst: 'Would you rather start with the test?',
    testLink: 'Take the ikigai test',
  },
  confirmar: {
    subject: 'Confirm your place: a month getting to know your ikigai',
    title: 'Confirm your place',
    text: 'You asked to do “A month getting to know your ikigai”. To start, confirm that this email is yours. The programme begins on the Monday after you confirm.',
    button: 'CONFIRM MY PLACE',
    note: 'If this wasn’t you, ignore it: without confirming you won’t receive anything else.',
  },
  confirmarPage: {
    checking: 'Confirming…',
    confirmada: start => `Done. You start on Monday ${start}. I have just emailed you what comes next.`,
    ya: 'You were already in the programme. The Monday email reaches you at this same address.',
    invalid: 'This link isn’t valid or is no longer active.',
    error: 'It couldn’t be confirmed right now. Press the button in the email again in a few minutes.',
  },
  dateLocale: 'en-GB',
  q: ['“', '”'],
  book: 'El Ikigai que no te contaron',
  chapter: 'Chapter',
  thisWeek: 'This week',
  encuentrosTitle: 'Group meeting (optional, online)',
  join: 'Join the meeting',
  unsubscribe: link => `If you want to leave the programme, <a href="${link}" style="color:rgba(39,39,39,0.5);">unsubscribe here</a>.`,
  compare: {
    title: 'A month ago and today',
    intro: 'Your answers from a month ago next to today’s. Only the ones that changed.',
    before: 'Before',
    now: 'Now',
    none: 'None of your answers changed. That is information too.',
    same: n => (n === 1 ? 'One answer stays the same.' : `${n} answers stay the same.`),
  },
  bienvenida: (c, start) => ({
    subject: `You start on Monday ${start}: a month getting to know your ikigai`,
    blocks: [
      { kind: 'p', text: `You have signed up for “A month getting to know your ikigai”. You start on Monday ${start}.` },
      { kind: 'p', text: 'For four weeks you will get an email every Monday morning, with just one thing to do that week. Everything comes from “El Ikigai que no te contaron”. You don’t need to have the book.' },
      { kind: 'p', text: 'There will be online group meetings for anyone who wants to come. I will let you know the day before.' },
      ...encuentrosBlock(EN, c),
      { kind: 'p', text: 'If you can’t make it one week, that’s fine. The next Monday brings the next email.' },
      { kind: 'quote', text: 'If you miss a day, you come back the next. No drama.', cite: 'Chapter 6' },
      ...sinTestBlocks(EN, c, EN.sinTest.bienvenida),
      { kind: 'p', text: 'In the meantime, just one thing: find a notebook you enjoy opening. You will use it.' },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
  semanal: {
    jueves1: c => ({
      subject: 'Midweek',
      blocks: [
        { kind: 'p', text: 'Halfway through the first week. If you haven’t started the exercise yet, today works just as well.' },
        { kind: 'p', text: 'A question for tonight: what have you noticed that you didn’t expect?' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    jueves2: c => ({
      subject: 'Midweek: your map',
      blocks: [
        { kind: 'p', text: 'Is there something that appears in more than one section of your map? If you haven’t done it yet, ten minutes tonight is enough.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    jueves3: c => ({
      subject: 'Midweek: what repeats',
      blocks: [
        { kind: 'p', text: 'Look at what you have written these nights. Does anything repeat: a person, a gesture, a moment of the day?' },
        { kind: 'p', text: 'If you haven’t taken PASO yet, the link is still in Monday’s email.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    jueves4: c => ({
      subject: 'Midweek: a month later',
      blocks: [
        { kind: 'p', text: 'Have you retaken your inventory? Before you do, reread the sentence you wrote on the first day.' },
        { kind: 'cta', href: c.links.repetir, label: 'RETAKE MY INVENTORY' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    semana1: c => ({
      subject: c.exercise ? `Week 1: ${c.exercise.title.toLowerCase()}` : 'Week 1: the honest inventory',
      blocks: [
        ...(c.tieneTest ? [
          { kind: 'p', text: 'First week. We start with what came up in your inventory.' },
          { kind: 'p', text: 'When you took the test, your reading suggested an exercise. This week is for actually doing it, not just reading it.' },
        ] as ProgramaBlock[] : sinTestBlocks(EN, c, EN.sinTest.semana1)),
        ...(c.exercise ? [exerciseBlock(EN, c.exercise)] : []),
        { kind: 'p', text: 'Before you start, on the first page of your notebook write today’s date and a single sentence: what you expect from this month. Not what you think you should expect. What you really expect, even if it sounds small.' },
        { kind: 'p', text: 'That sentence is an anchor. When you reach the end of the month and reread it, it will tell you more about the road travelled than any exercise.' },
        { kind: 'p', text: 'Next Monday, the second week.', muted: true },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana2: c => ({
      subject: 'Week 2: your Active Ikigai map',
      blocks: [
        { kind: 'p', text: 'Second week. We look at Active Ikigai: what you do, what you are good at, what you contribute.' },
        exerciseBlock(EN, { title: 'Your Active Ikigai map', cap: 4, steps: [
          'On a new page of your notebook, divide the space into four sections and answer one question in each:',
          'What do I love doing? (even if nobody pays me for it) · What am I good at? (that others also recognise) · What could I give to the world? (even in a small way) · What could I live on, doing something that makes sense to me?',
          'See whether something appears in more than one section. That is usually the most useful clue.',
        ] }),
        { kind: 'quote', text: 'The diagram doesn’t give a final answer: it opens a space for reflection.', cite: 'Tools' },
        { kind: 'p', text: 'If you want to go further, the four stars test and the CAMINO test are at the end of the book.', muted: true },
        ...encuentrosBlock(EN, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana3: c => ({
      subject: 'Week 3: how you walk',
      blocks: [
        { kind: 'p', text: 'Third week. Now the other side: not what you do, but where you do it from.' },
        { kind: 'p', text: c.pasoConCuenta
          ? 'I suggest PASO, a short test that compares how you show up in order to adapt with who you are when you don’t have to play a role. To take it, create your account in the app: that way your result is saved alongside your journey.'
          : 'I suggest PASO, a short test that compares how you show up in order to adapt with who you are when you don’t have to play a role. You don’t need to sign up. If you create an account in the app, your result is saved alongside your journey.' },
        { kind: 'cta', href: c.links.paso, label: 'TAKE PASO' },
        { kind: 'p', text: 'PASO talks about your “mask” in that sense: your adapted way of acting. The seven masks in the book, the ones we learned to protect ourselves, are something else. We look at them in the course.', muted: true },
        { kind: 'p', text: 'And a question for the week, from chapter 8. Choose someone you live alongside every day and observe yourself. One sentence in your notebook each night:' },
        { kind: 'quote', text: 'What do I do when I am with this person that I don’t do when I am well with myself?', cite: 'Chapter 8' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    semana4: c => ({
      subject: 'Week 4: a month later',
      blocks: [
        { kind: 'p', text: 'Last week. Time to go back to the beginning.' },
        { kind: 'p', text: 'Take the honest inventory again. When you finish, you will see your answers from a month ago next to today’s. Don’t expect a big change: a month is short. Look at what has moved and what hasn’t.' },
        { kind: 'cta', href: c.links.repetir, label: 'RETAKE MY INVENTORY' },
        exerciseBlock(EN, { title: 'Monthly review', cap: 6, steps: [
          'At the end of this month, ask yourself three questions in your notebook:',
          'What brought me balance this month? · What cost me more than it was worth? · What do I want to adjust next month?',
          'And reread the sentence you wrote on the first day.',
        ] }),
        ...encuentrosBlock(EN, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    cierre: c => ({
      subject: 'After this month',
      blocks: [
        { kind: 'p', text: 'You have finished “A month getting to know your ikigai”. If you did even part of it, you did something few people do: look at yourself calmly.' },
        { kind: 'p', text: 'What you worked on this month are the two sides of ikigai. Underneath are fear, masks and the way you talk to yourself. That is what the online course goes through: the book’s three acts, with me.' },
        { kind: 'cta', href: c.links.curso, label: 'SEE THE COURSE' },
        { kind: 'p', text: 'If you would rather continue on your own, the book is here:', muted: true },
        { kind: 'cta', href: c.links.libro, label: 'EL IKIGAI QUE NO TE CONTARON' },
        { kind: 'p', text: 'And if you would rather live it in person, with other people asking themselves the same questions, there is the in-person workshop “I am IKIGAIER”: four hours to listen to yourself.', muted: true },
        { kind: 'cta', href: c.links.taller, label: 'SEE THE WORKSHOP' },
        { kind: 'p', text: 'And if you want to take this into concrete decisions, you can reply to this email.', muted: true },
        { kind: 'quote', text: 'Keep walking. But do it without moving away from yourself.', cite: 'Epilogue' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
  },
  retomar: { no: 'It’s fine if last week didn’t happen. Here is the next one; if you like, pick up the previous one too.', medias: 'Partly counts too. We carry on.' },
  checkinPage: { si: 'Noted. Thank you.', medias: 'Noted. Partly counts too.', no: 'Noted. If this week didn’t happen, that’s fine: the next one arrives on Monday.', invalid: 'Invalid link.' },
  encuentro: (when, url) => ({
    subject: 'Tomorrow: group meeting',
    blocks: [
      { kind: 'p', text: `Tomorrow, ${when} (Madrid time), we meet online. It is optional and there is nothing to prepare. Bring your notebook.` },
      { kind: 'cta', href: url, label: 'JOIN THE MEETING' },
      { kind: 'p', text: 'If you can’t make it, that’s fine.', muted: true },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
}

const TEXTS: Record<ContentLang, ProgramaTexts> = { es: ES, ca: CA, en: EN }

export function getProgramaTexts(locale: string): ProgramaTexts {
  return TEXTS[contentLang(locale)]
}

// Fecha legible en la lengua de la persona, en hora de Madrid.
export function formatProgramaDate(locale: string, date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(getProgramaTexts(locale).dateLocale, {
    day: 'numeric', month: 'long', timeZone: 'Europe/Madrid',
  })
}
export function formatProgramaDateTime(locale: string, at: string | Date): string {
  return new Date(at).toLocaleString(getProgramaTexts(locale).dateLocale, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  })
}
