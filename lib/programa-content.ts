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
import type { ProgramaCampo, ProgramaCheckin, ProgramaSemanal } from './programa'

export type ProgramaBlock =
  | { kind: 'p'; text: string; muted?: boolean }
  // book: el libro de la cita; si no se indica, «El Ikigai que no te contaron».
  | { kind: 'quote'; text: string; cite: string; book?: string }
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
  // Semana 3: un ejercicio del Ikigai Activo y otro del Consciente, nunca el
  // mismo que ya le tocó en la semana 1.
  semana3: { activo: InvExercise; consciente: InvExercise }
  // curso: null mientras el curso online no tenga página propia (no se ofrece).
  links: { paso: string; repetir: string; curso: string | null; libro: string; libros: string; taller: string }
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
  // Botón «Abrir tu mes» en los correos de quien tiene cuenta.
  abrirMes: string
  // El cierre le devuelve sus propias frases, si las escribió en el panel.
  cierreEco: { ancla: (x: string) => string; ruido: (x: string) => string }
  // Entrar con cuenta (página del programa y final del test).
  cuenta: { button: string; logged: string; nota: string }
  // El panel del programa (/mes).
  panel: {
    title: string
    weekOf: (n: number) => string
    startsOn: (date: string) => string
    finished: string
    testFirst: string
    testButton: string
    tabs: Record<ProgramaSemanal, string>
    libretaTab: string
    monday: string
    thursday: string
    opensOn: (date: string) => string
    checkinQuestion: string
    checkinLabels: Record<ProgramaCheckin, string>
    checkinSaved: string
    noInscripcion: string
    noInscripcionButton: string
  }
  // Los campos de la libreta y su guardado.
  libreta: {
    intro: string
    campos: Record<ProgramaCampo, string>
    placeholder: string
    saving: string
    saved: string
    error: string
    empty: string
    borrar: string
    borrarConfirm: string
    borrado: string
  }
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
  // Segundo libro del que salen ejercicios y citas.
  book2: string
  chapter: string
  thisWeek: string
  // Pequeño ritual al empezar las semanas 2, 3 y 4.
  umbral: { eyebrow: string; title: string }
  allMonth: string
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

// Ejercicio de cualquiera de los dos libros (book2: «No todo lo que te frena es tuyo»).
const ej = (t: ProgramaTexts, title: string, cap: number | string, steps: string[], book2 = false, eyebrow?: string): ProgramaBlock => ({
  kind: 'exercise',
  title,
  eyebrow: eyebrow ?? `${t.thisWeek} · ${book2 ? `${t.book2} · ` : ''}${t.chapter} ${cap}`,
  steps,
})

const umbral = (t: ProgramaTexts, text: string): ProgramaBlock => ({ kind: 'exercise', title: t.umbral.title, eyebrow: t.umbral.eyebrow, steps: [text] })

const cita = (t: ProgramaTexts, text: string, cite: string, book2 = false): ProgramaBlock => ({ kind: 'quote', text, cite, book: book2 ? t.book2 : undefined })

const cursoBlock = (c: ProgramaContext, label: string): ProgramaBlock[] =>
  c.links.curso ? [{ kind: 'cta', href: c.links.curso, label }] : []

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
  optIn: 'Quiero hacer gratis «Un mes conociendo tu ikigai»: un correo cada semana durante cuatro semanas, con un ejercicio del libro, encuentros en grupo opcionales y, al final, una propuesta para seguir. Puedo darme de baja cuando quiera.',
  optInDone: 'Te has apuntado a «Un mes conociendo tu ikigai». Te he escrito con la fecha de inicio.',
  optInPending: 'Falta un paso: en el correo que te acabo de enviar, arriba del todo, pulsa «Confirmar mi plaza». Sin eso no empieza el programa.',
  optInYa: 'Ya estás dentro de «Un mes conociendo tu ikigai» con este correo.',
  abrirMes: 'ABRIR TU MES',
  cierreEco: {
    ancla: x => `Hace un mes, en la primera página, escribiste: «${x}».`,
    ruido: x => `Y esta semana terminaste así: «Cuando el ruido baja, yo soy ${x}».`,
  },
  cuenta: {
    button: 'Empezar el mes gratis',
    logged: 'Empezar mi mes',
    nota: 'Te pediré que entres o crees tu cuenta gratuita (con Google, un clic). Ahí tendrás tu mes: el calendario, cada semana y lo que escribas.',
  },
  panel: {
    title: 'Un mes conociendo tu ikigai',
    weekOf: n => `Semana ${n} de 4`,
    startsOn: d => `Empiezas el ${d}`,
    finished: 'Has terminado el mes',
    testFirst: 'Antes de empezar, haz el test de ikigai. Diez minutos. Es tu punto de partida: el ejercicio de la primera semana sale de ahí.',
    testButton: 'Hacer el test',
    tabs: { semana1: 'Semana 1', jueves1: 'Semana 1', semana2: 'Semana 2', jueves2: 'Semana 2', semana3: 'Semana 3', jueves3: 'Semana 3', semana4: 'Semana 4', jueves4: 'Semana 4', cierre: 'Cierre' },
    libretaTab: 'Tu libreta',
    monday: 'Inicio de semana',
    thursday: 'A mitad de semana',
    opensOn: d => `Se abre el ${d}`,
    checkinQuestion: '¿Has hecho el ejercicio de esta semana?',
    checkinLabels: { si: 'Sí', medias: 'A medias', no: 'Esta semana no' },
    checkinSaved: 'Anotado.',
    noInscripcion: 'Todavía no estás en «Un mes conociendo tu ikigai».',
    noInscripcionButton: 'Empezar el mes gratis',
  },
  libreta: {
    intro: 'Escribe aquí si quieres; la libreta de papel vale igual. Se guarda solo, y solo lo ves tú.',
    campos: {
      ancla: 'La frase del primer día: lo que esperas de este mes',
      ejercicio1: 'Lo que te deja el ejercicio de esta semana',
      notado: 'Lo que has notado y no esperabas',
      temo: 'Lo que más temo encontrar aquí es…',
      frase_madre: 'Tu frase madre',
      voz: 'De quién es esa voz',
      edad: 'Qué edad tenías cuando empezó a sonar',
      protegia: 'A quién o a qué protegía entonces',
      cierre_voz: 'Tu frase de cierre para esa voz',
      activo: 'Lo que haces: lo que te deja el ejercicio de esta tarde',
      consciente: 'Cómo lo vives: una frase de cada día',
      excepcion: 'La excepción: la última vez que tu frase madre no se cumplió',
      conducta: 'Tu conducta mínima',
      paso_real: 'Qué pasó realmente',
      excusa: 'La excusa de toda la vida',
      ruido: 'Cuando el ruido baja, yo soy…',
      gesto: 'Tu gesto de cada noche',
      accion: 'Tu acción mínima diaria, y a qué hora',
      revision: 'Tu revisión del mes',
    },
    placeholder: 'Escribe aquí…',
    saving: 'Guardando…',
    saved: 'Guardado',
    error: 'No se ha podido guardar. Vuelve a intentarlo.',
    empty: 'Aquí irá apareciendo todo lo que escribas durante el mes, en orden.',
    borrar: 'Borrar todo lo que he escrito',
    borrarConfirm: '¿Seguro? Se borrará todo lo que has escrito en tu libreta del programa. No se puede deshacer.',
    borrado: 'Borrado.',
  },
  sinTest: {
    bienvenida: 'Antes de nada, una cosa: haz el test de ikigai. Son diez minutos. Es tu punto de partida: el ejercicio de la primera semana sale de ahí, y en la última lo repetirás para ver qué ha cambiado.',
    semana1: 'Primera semana. Todavía no has hecho el test de ikigai, y todo el mes parte de ahí. Empieza por él: diez minutos. Al terminar verás el ejercicio de esta semana.',
    button: 'HACER EL TEST',
  },
  semanas: {
    antes: 'Antes de empezar · El test de ikigai: una foto de hoy de lo que haces y desde dónde lo haces.',
    lista: [
      'Semana 1 · Lo que ya hay: el ejercicio que te propone tu test, una frase para todo el mes y veinte segundos de atención, tres veces al día.',
      'Semana 2 · Lo que hay debajo: la frase que te frena, de quién es esa voz y qué protegía.',
      'Semana 3 · Hacer distinto: el hilo que atraviesa tu vida, cinco minutos de presencia al día y un paso pequeño en otra dirección.',
      'Semana 4 · Volver a ti: repites el test, relees tu libreta y te llevas un gesto para cada noche.',
    ],
  },
  captura: {
    title: 'Esto es una foto de hoy. ¿Lo trabajamos durante un mes?',
    body: '«Un mes conociendo tu ikigai» es gratis. Un correo al empezar cada semana, y otro corto a mitad de semana, con ejercicios de mis libros. Empieza el mismo día que entras. En tu cuenta tendrás el calendario y tu libreta. Lo dejas cuando quieras.',
    button: 'Empezar el mes gratis',
    solo: 'Solo envíame esta devolución',
    sending: 'Enviando…',
    doneSolo: 'Te la he enviado. Revisa tu correo (y la carpeta de spam, por si acaso).',
  },
  inicio: {
    title: 'Tu punto de partida',
    body: 'Esta es tu foto de hoy. El ejercicio de la primera semana es el que ves arriba; también te llega por correo, para hacerlo con calma. En la última semana repetirás el test y lo compararás con este.',
    sent: 'Te he enviado esta devolución a tu correo.',
  },
  testNote: 'Al final, si quieres, puedes seguir con un mes de ejercicios gratis.',
  landing: {
    metaTitle: 'Un mes conociendo tu ikigai · programa gratuito de 4 semanas',
    metaDescription: 'Programa gratuito de cuatro semanas: un correo cada semana con un ejercicio de «El Ikigai que no te contaron». Empieza con un test de ikigai y acaba repitiéndolo para ver qué ha cambiado.',
    eyebrow: 'Programa gratuito · 4 semanas',
    title: 'Un mes conociendo tu ikigai',
    lead: 'Cuatro semanas para mirar lo que haces, lo que te frena y cómo vuelves a ti, con ejercicios de mis libros. Empieza con un test de diez minutos y acaba repitiéndolo, para ver qué se ha movido.',
    howTitle: 'Cómo es',
    needTitle: 'Qué necesitas',
    need: [
      'Una libreta y unos minutos al día.',
      'Una cuenta gratuita en IKIGAIER (con Google, un clic). No hace falta tener los libros.',
      'Si durante tu mes hay encuentros en grupo online, te aviso. Son opcionales.',
      'Si una semana no puedes, no pasa nada: la semana siguiente llega el correo siguiente. Te das de baja con un clic.',
    ],
    whoTitle: 'Quién lo escribe',
    who: 'Manel Rueda, autor de «El Ikigai que no te contaron» y «No todo lo que te frena es tuyo». Todo lo que vas a hacer sale de esos libros.',
    formTitle: 'Empieza hoy',
    placeholder: 'tu@correo.com',
    button: 'Empezar el mes gratis',
    sending: 'Enviando…',
    consent: 'Quiero recibir también las cartas de Manel y propuestas para seguir trabajando esto. Es aparte del programa, y puedo darme de baja cuando quiera.',
    error: 'No se ha podido enviar. Revisa el correo y vuelve a intentarlo.',
    sent: 'Te he enviado un correo. Pulsa «Confirmar mi plaza» para empezar. Si no lo ves, mira en la carpeta de spam.',
    ya: 'Ya estás dentro del programa con este correo. El correo de cada semana te llega a esta dirección.',
    testFirst: '¿Prefieres empezar por el test?',
    testLink: 'Hacer el test de ikigai',
  },
  confirmar: {
    subject: 'Confirma tu plaza: un mes conociendo tu ikigai',
    title: 'Confirma tu plaza',
    text: 'Has pedido hacer «Un mes conociendo tu ikigai». Para empezar, confirma que este correo es tuyo. El programa empieza el día que confirmes.',
    button: 'CONFIRMAR MI PLAZA',
    note: 'Si no lo has pedido tú, ignóralo: sin confirmar no recibirás nada más.',
  },
  confirmarPage: {
    checking: 'Confirmando…',
    confirmada: () => 'Hecho. Empiezas hoy. Te acabo de escribir con lo que viene.',
    ya: 'Ya estabas dentro del programa. El correo de cada semana te llega a esta misma dirección.',
    invalid: 'Este enlace no es válido o ya no está activo.',
    error: 'No se ha podido confirmar ahora. Vuelve a pulsar el botón del correo en unos minutos.',
  },
  dateLocale: 'es-ES',
  q: ['«', '»'],
  book: 'El Ikigai que no te contaron',
  book2: 'No todo lo que te frena es tuyo',
  chapter: 'Capítulo',
  thisWeek: 'Esta semana',
  umbral: { eyebrow: 'Antes de empezar la semana', title: 'Un umbral' },
  allMonth: 'Para todo el mes',
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
    subject: 'Empiezas hoy: un mes conociendo tu ikigai',
    blocks: [
      { kind: 'p', text: `Te has apuntado a «Un mes conociendo tu ikigai». Empiezas hoy, ${start}.` },
      { kind: 'p', text: 'Durante cuatro semanas te llegará un correo al empezar cada semana, con lo que toca, y otro más corto a mitad de semana. El primero llega hoy mismo. Todo sale de mis libros, sobre todo de «El Ikigai que no te contaron». No hace falta que los tengas.' },
      { kind: 'p', text: 'Son cuatro semanas, en este orden: lo que ya hay, lo que hay debajo, hacer distinto y volver a ti.' },
      { kind: 'p', text: 'Si durante tu mes hay encuentros en grupo, online, te aviso la víspera. Son opcionales.' },
      ...encuentrosBlock(ES, c),
      { kind: 'p', text: 'Si una semana no puedes, no pasa nada. La semana siguiente llega el correo siguiente.' },
      cita(ES, 'Si un día fallas, al siguiente vuelves. Sin drama.', 'Capítulo 6'),
      ...sinTestBlocks(ES, c, ES.sinTest.bienvenida),
      { kind: 'p', text: 'Mientras tanto, solo una cosa: busca una libreta que te dé gusto abrir. Todo lo que hagas este mes acabará ahí, y el último día la vas a releer entera.' },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
  semanal: {
    semana1: c => ({
      subject: c.exercise ? `Semana 1: ${c.exercise.title.toLowerCase()}` : 'Semana 1: lo que ya hay',
      blocks: [
        ...(c.tieneTest ? [
          { kind: 'p', text: 'Primera semana: lo que ya hay. Empezamos por lo que salió en tu test.' },
          { kind: 'p', text: 'La devolución te propuso un ejercicio. Esta semana es para hacerlo de verdad, no para leerlo.' },
        ] as ProgramaBlock[] : sinTestBlocks(ES, c, ES.sinTest.semana1)),
        { kind: 'p', text: 'Antes de empezar, en la primera página de tu libreta escribe la fecha de hoy y una sola frase: lo que esperas de este mes. No lo que crees que deberías esperar. Lo que realmente esperas, aunque suene pequeño. La releerás el último día.' },
        ...(c.exercise ? [exerciseBlock(ES, c.exercise)] : []),
        { kind: 'p', text: 'Y una práctica para todo el mes, de veinte segundos. Tres veces al día (antes de una reunión, después de comer, antes de dormir), haz el VOLver:' },
        ej(ES, 'El método VOLver', 5, [
          'V. Ver quién está: ¿cómo me siento ahora mismo?',
          'O. Observar lo que haces: ¿qué estoy haciendo en este momento?',
          'L. Localizar el lugar: ¿qué veo, oigo, siento físicamente ahora?',
          'No escribas nada. Solo hazlo. Con el tiempo se vuelve tan automático que lo usarás sin pensarlo, justo cuando más lo necesitas.',
        ], false, `${ES.allMonth} · Capítulo 5`),
        cita(ES, 'El vacío no está en tu vida. Está entre tú y tu vida. Es distancia, no ausencia. Y la distancia no se llena: se recorre.', 'Capítulo 1', true),
        { kind: 'p', text: 'A mitad de semana, un correo corto. Dentro de siete días, la segunda semana.', muted: true },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves1: c => ({
      subject: 'A mitad de semana',
      blocks: [
        { kind: 'p', text: 'A mitad de la primera semana. Si todavía no has empezado el ejercicio, hoy vale igual.' },
        { kind: 'p', text: 'Una pregunta para esta noche, en tu libreta: ¿qué has notado estos días que no esperabas?' },
        { kind: 'p', text: 'Y si te has acordado del VOLver aunque sea una vez, ya está funcionando.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    semana2: c => ({
      subject: 'Semana 2: lo que hay debajo',
      blocks: [
        { kind: 'p', text: 'Segunda semana: lo que hay debajo. Hasta ahora has mirado lo que haces. Esta semana miramos lo que te frena cuando quieres hacerlo. No para arreglarlo. Para verlo.' },
        umbral(ES, 'Abre tu libreta y termina esta frase, sin pensarla demasiado: «Lo que más temo encontrar aquí es…».'),
        ej(ES, 'La autopsia amable', 2, [
          'Anota tus tres últimos intentos de cambio, los que sean: ejercicio, un proyecto, un hábito, dejar algo. Para cada uno: ¿qué fue la chispa? ¿Cuánto duró el subidón? ¿Dónde apareció la fricción?',
          'Ahora la pregunta importante: ¿qué sentencia te dijiste al abandonar cada uno? Escríbela literal, con las palabras exactas que usaste contra ti.',
          'Mira las tres sentencias juntas. ¿Se parecen? ¿Cuál es la frase madre, la que se repite debajo de todas?',
        ], true),
        ej(ES, 'Encontrar la voz', 7, [
          'Si esa frase madre tuviera una voz, ¿de quién sería? No busques culpar; busca solo reconocer. A veces es una persona concreta. A veces es «el ambiente» de una época de tu vida.',
          'Escribe cuántos años tenías, más o menos, cuando esa frase empezó a sonar dentro de ti. Ese número es importante: es la edad de quien sigue tomando, en parte, tus decisiones de hoy.',
        ], true),
        { kind: 'p', text: 'Guarda esa página. A mitad de semana te escribo con lo que se hace con ella.' },
        { kind: 'p', text: 'Esta semana mira hacia dentro. Si en algún momento remueve más de lo que te apetece, para. No hace falta llegar al fondo en siete días.', muted: true },
        cita(ES, 'Ese “yo soy así” que repites no es una descripción. Es una instalación.', 'Prólogo', true),
        ...encuentrosBlock(ES, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves2: c => ({
      subject: 'A mitad de semana: de quién es esa voz',
      blocks: [
        { kind: 'p', text: 'Vuelve a tu frase madre y a la edad que le pusiste. Imagina a alguien de esa edad exacta, delante de ti, contándote por qué cree eso. ¿Le dirías «qué tontería»? Probablemente no. Le dirías algo parecido a: tiene sentido que pensaras eso, con lo que viviste.' },
        { kind: 'p', text: 'Desde ese tono, no desde el reproche, tres preguntas:' },
        ej(ES, 'Las tres preguntas', 10, [
          '¿De quién es esta voz? Descríbela: edad, situación, si puedes hasta el lugar donde estabas.',
          '¿A quién o a qué protegía entonces? Sé concreto: ¿tu seguridad, el cariño de alguien, la paz en casa, tu lugar en el grupo?',
          '¿Protege hoy algo que siga realmente en peligro? Responde con honestidad, no con la respuesta que «queda bien».',
          'Si la respuesta a la tercera es no, escribe una frase de cierre dirigida a esa voz más joven, algo como: «Gracias por protegerme entonces. Ya no hace falta que sigas haciéndolo así». No tiene que sonar perfecta. Tiene que ser sincera.',
        ], true),
        cita(ES, 'No le grites al niño que te protegió. Dale las gracias, y dile que ya puede descansar.', 'Capítulo 10', true),
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    semana3: c => ({
      subject: 'Semana 3: hacer distinto',
      blocks: [
        { kind: 'p', text: 'Tercera semana: hacer distinto. Con lo que viste la semana pasada, vuelves a lo que haces y a cómo lo vives. Las dos cosas a la vez.' },
        umbral(ES, 'Lee en voz alta la frase de cierre que escribiste la semana pasada. Si no llegaste a escribirla, lee la página de la semana pasada que más te removió.'),
        { kind: 'p', text: 'Para una tarde de esta semana, lo que haces:' },
        exerciseBlock(ES, c.semana3.activo),
        { kind: 'p', text: 'Y para cada día, cómo lo vives:' },
        exerciseBlock(ES, c.semana3.consciente),
        cita(ES, 'Un ikigaier no elige entre las dos versiones: las necesita juntas.', 'Capítulo 4'),
        { kind: 'p', text: c.pasoConCuenta
          ? 'Si te apetece una mirada más esta semana: PASO es un test breve sobre cómo te mueves en el mundo. Crea tu cuenta para que el resultado quede guardado junto a tu recorrido.'
          : 'Si te apetece una mirada más esta semana: PASO es un test breve y gratuito sobre cómo te mueves en el mundo.', muted: true },
        { kind: 'cta', href: c.links.paso, label: 'HACER PASO' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves3: c => ({
      subject: 'A mitad de semana: un paso en otra dirección',
      blocks: [
        { kind: 'p', text: 'Vuelve a tu frase madre. Léela despacio y hazle tres preguntas: ¿siempre?, ¿según quién?, ¿cuándo fue la última vez que no se cumplió? Escribe esa excepción. Aunque sea pequeña, existe.' },
        ej(ES, 'La conducta mínima', 11, [
          'Identifica la conducta que tu frase madre te pide siempre: quedarte, callarte, posponer, lo que sea en tu caso.',
          'Ahora diseña la conducta mínima opuesta: la acción real más pequeña que puedas hacer esta semana en la dirección contraria. No la ideal ni la definitiva. La mínima que de verdad vayas a hacer.',
          'Hazla, sintiéndote inseguro si hace falta. Y después anota qué pasó realmente, no lo que temías que pasara.',
        ], true),
        cita(ES, 'La conducta no es la consecuencia del cambio. Es su punto de entrada.', 'Capítulo 11', true),
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    semana4: c => ({
      subject: 'Semana 4: volver a ti',
      blocks: [
        { kind: 'p', text: 'Última semana: volver a ti. Toca volver al principio, con lo que has visto por el camino.' },
        umbral(ES, 'Escribe una excusa que hayas usado toda la vida. Táchala, sin borrarla: que se siga leyendo.'),
        { kind: 'p', text: 'Primero, repite el test. Al terminar verás tus respuestas de hace un mes al lado de las de hoy. No esperes un cambio grande: un mes es poco. Mira qué se ha movido y qué no.' },
        { kind: 'cta', href: c.links.repetir, label: 'REPETIR EL TEST' },
        { kind: 'p', text: 'Después, una tarde tranquila, relee tu libreta entera desde la primera página, seguida y sin corregir. Y escribe esto:' },
        ej(ES, 'Los momentos sin ruido', 3, [
          'Haz una lista de tus momentos sin ruido: esas ocasiones, recientes o antiguas, en que estuviste bien «sin motivo». Sé concreto: dónde, con quién, haciendo qué.',
          'Míralos juntos y busca qué tienen en común. No en lo que había, sino en lo que no había: ¿qué prisa, qué papel, qué exigencia, qué comparación no estaba sonando?',
          'Termina con esta frase, a mano: «Cuando el ruido baja, yo soy…», y complétala con lo primero que venga.',
        ], true),
        { kind: 'p', text: 'Y un gesto para quedarte con eso. Emiko es maestra; al terminar su jornada apaga las luces del aula y dice en voz baja «arigatou». Nadie la escucha. Elige tu gesto, pequeño y siempre igual, y esta semana hazlo cada noche mientras relees tu frase «Cuando el ruido baja, yo soy…».' },
        cita(ES, 'No te falta nada. Te sobra lo que no eres.', 'Capítulo 3', true),
        ...encuentrosBlock(ES, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves4: c => ({
      subject: 'A mitad de semana: lo que te llevas',
      blocks: [
        { kind: 'p', text: 'Queda poco. Dos cosas para llevarte cuando esto termine.' },
        ej(ES, 'Tu acción mínima diaria', 6, [
          'Elige una sola acción pequeña que puedas repetir cada día. Algo real para tu vida actual, no para tu vida ideal.',
          'Decide a qué hora del día la harás y registra cada vez que la cumples. Si un día fallas, al siguiente vuelves. Sin drama.',
        ]),
        ej(ES, 'Revisión mensual', 6, [
          '¿Qué me ha aportado equilibrio este mes?',
          '¿Qué me ha costado más de lo que valía?',
          '¿Qué quiero ajustar el mes que viene?',
        ]),
        { kind: 'p', text: 'Si quieres, responde a este correo con tu frase «Cuando el ruido baja, yo soy…». La leo yo.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, '¿Has hecho el ejercicio de esta semana?', 'Un clic basta. No cambia lo que recibes: solo me dice cómo va.', { si: 'Sí', medias: 'A medias', no: 'Esta semana no' }),
      ],
    }),
    cierre: c => ({
      subject: 'Después de este mes',
      blocks: [
        { kind: 'p', text: 'Has terminado «Un mes conociendo tu ikigai». Si has hecho aunque sea una parte, has hecho algo que poca gente hace: mirarte con calma.' },
        { kind: 'p', text: 'Mira lo que tienes ahora en tu libreta: una frase de hace un mes, una frase madre y de quién era esa voz, una frase de cierre, el hilo que atraviesa tu vida, unos días de presencia, un paso pequeño en otra dirección y una línea que empieza «Cuando el ruido baja, yo soy…». Hace un mes no estaba nada de eso.' },
        { kind: 'p', text: 'Para los días que vienen tienes dos cosas: tu gesto de cada noche y tu acción mínima. Y relee la libreta dentro de un mes. Te dirá más que este correo.' },
        ...(c.links.curso ? [
          { kind: 'p', text: 'Si quieres seguir conmigo: el curso online recorre lo que hay debajo (el miedo, las máscaras, la forma en que te hablas por dentro) en los tres actos del libro.' },
          ...cursoBlock(c, 'VER EL CURSO'),
        ] as ProgramaBlock[] : []),
        { kind: 'p', text: 'Si prefieres seguir por tu cuenta, todo esto está con más calma en los libros.', muted: true },
        { kind: 'cta', href: c.links.libros, label: 'LOS LIBROS' },
        { kind: 'p', text: 'Y si prefieres vivirlo en persona, junto a otras personas que se hacen tus mismas preguntas, está el taller presencial «Yo soy IKIGAIER»: cuatro horas para escucharte.', muted: true },
        { kind: 'cta', href: c.links.taller, label: 'VER EL TALLER' },
        { kind: 'p', text: 'Y si quieres llevar esto a decisiones concretas, puedes responder a este correo.', muted: true },
        cita(ES, 'Sigue caminando. Pero hazlo sin alejarte de ti.', 'Epílogo'),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
  },
  retomar: { no: 'No pasa nada si la semana pasada no pudo ser. Aquí va la siguiente; si quieres, retoma también la anterior.', medias: 'A medias también cuenta. Seguimos.' },
  checkinPage: { si: 'Anotado. Gracias.', medias: 'Anotado. A medias también cuenta.', no: 'Anotado. Si esta semana no ha podido ser, no pasa nada: la semana siguiente llega el correo siguiente.', invalid: 'Enlace no válido.' },
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
  optIn: 'Vull fer gratis «Un mes coneixent el teu ikigai»: un correu cada setmana durant quatre setmanes, amb un exercici del llibre, trobades en grup opcionals i, al final, una proposta per continuar. Em puc donar de baixa quan vulgui.',
  optInDone: 'T’has apuntat a «Un mes coneixent el teu ikigai». T’he escrit amb la data d’inici.',
  optInPending: 'Falta un pas: al correu que t’acabo d’enviar, a dalt de tot, prem «Confirmar la meva plaça». Sense això el programa no comença.',
  optInYa: 'Ja ets dins de «Un mes coneixent el teu ikigai» amb aquest correu.',
  abrirMes: 'OBRIR EL TEU MES',
  cierreEco: {
    ancla: x => `Fa un mes, a la primera pàgina, vas escriure: «${x}».`,
    ruido: x => `I aquesta setmana vas acabar així: «Quan el soroll baixa, jo soc ${x}».`,
  },
  cuenta: {
    button: 'Començar el mes gratis',
    logged: 'Començar el meu mes',
    nota: 'Et demanaré que entris o creïs el teu compte gratuït (amb Google, un clic). Allà tindràs el teu mes: el calendari, cada setmana i el que escriguis.',
  },
  panel: {
    title: 'Un mes coneixent el teu ikigai',
    weekOf: n => `Setmana ${n} de 4`,
    startsOn: d => `Comences el ${d}`,
    finished: 'Has acabat el mes',
    testFirst: 'Abans de començar, fes el test d’ikigai. Deu minuts. És el teu punt de partida: l’exercici de la primera setmana surt d’aquí.',
    testButton: 'Fer el test',
    tabs: { semana1: 'Setmana 1', jueves1: 'Setmana 1', semana2: 'Setmana 2', jueves2: 'Setmana 2', semana3: 'Setmana 3', jueves3: 'Setmana 3', semana4: 'Setmana 4', jueves4: 'Setmana 4', cierre: 'Tancament' },
    libretaTab: 'La teva llibreta',
    monday: 'Inici de setmana',
    thursday: 'A mitja setmana',
    opensOn: d => `S’obre el ${d}`,
    checkinQuestion: 'Has fet l’exercici d’aquesta setmana?',
    checkinLabels: { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' },
    checkinSaved: 'Anotat.',
    noInscripcion: 'Encara no ets a «Un mes coneixent el teu ikigai».',
    noInscripcionButton: 'Començar el mes gratis',
  },
  libreta: {
    intro: 'Escriu aquí si vols; la llibreta de paper també val. Es desa sol, i només ho veus tu.',
    campos: {
      ancla: 'La frase del primer dia: el que esperes d’aquest mes',
      ejercicio1: 'El que et deixa l’exercici d’aquesta setmana',
      notado: 'El que has notat i no esperaves',
      temo: 'El que més temo trobar aquí és…',
      frase_madre: 'La teva frase mare',
      voz: 'De qui és aquesta veu',
      edad: 'Quina edat tenies quan va començar a sonar',
      protegia: 'A qui o a què protegia aleshores',
      cierre_voz: 'La teva frase de tancament per a aquesta veu',
      activo: 'El que fas: el que et deixa l’exercici d’aquesta tarda',
      consciente: 'Com ho vius: una frase de cada dia',
      excepcion: 'L’excepció: l’última vegada que la teva frase mare no es va complir',
      conducta: 'La teva conducta mínima',
      paso_real: 'Què va passar realment',
      excusa: 'L’excusa de tota la vida',
      ruido: 'Quan el soroll baixa, jo soc…',
      gesto: 'El teu gest de cada nit',
      accion: 'La teva acció mínima diària, i a quina hora',
      revision: 'La teva revisió del mes',
    },
    placeholder: 'Escriu aquí…',
    saving: 'Desant…',
    saved: 'Desat',
    error: 'No s’ha pogut desar. Torna-ho a provar.',
    empty: 'Aquí anirà apareixent tot el que escriguis durant el mes, en ordre.',
    borrar: 'Esborrar tot el que he escrit',
    borrarConfirm: 'Segur? S’esborrarà tot el que has escrit a la llibreta del programa. No es pot desfer.',
    borrado: 'Esborrat.',
  },
  sinTest: {
    bienvenida: 'Abans de res, una cosa: fes el test d’ikigai. Són deu minuts. És el teu punt de partida: l’exercici de la primera setmana surt d’aquí, i a l’última el repetiràs per veure què ha canviat.',
    semana1: 'Primera setmana. Encara no has fet el test d’ikigai, i tot el mes parteix d’aquí. Comença per ell: deu minuts. En acabar veuràs l’exercici d’aquesta setmana.',
    button: 'FER EL TEST',
  },
  semanas: {
    antes: 'Abans de començar · El test d’ikigai: una foto d’avui del que fas i des d’on ho fas.',
    lista: [
      'Setmana 1 · El que ja hi ha: l’exercici que et proposa el teu test, una frase per a tot el mes i vint segons d’atenció, tres vegades al dia.',
      'Setmana 2 · El que hi ha a sota: la frase que et frena, de qui és aquesta veu i què protegia.',
      'Setmana 3 · Fer diferent: el fil que travessa la teva vida, cinc minuts de presència al dia i un pas petit en una altra direcció.',
      'Setmana 4 · Tornar a tu: repeteixes el test, rellegeixes la llibreta i t’emportes un gest per a cada nit.',
    ],
  },
  captura: {
    title: 'Això és una foto d’avui. Ho treballem durant un mes?',
    body: '«Un mes coneixent el teu ikigai» és gratuït. Un correu en començar cada setmana, i un altre de curt a mitja setmana, amb exercicis dels meus llibres. Comença el mateix dia que entres. Al teu compte tindràs el calendari i la teva llibreta. Ho deixes quan vulguis.',
    button: 'Començar el mes gratis',
    solo: 'Només envia’m aquest retorn',
    sending: 'Enviant…',
    doneSolo: 'Te l’he enviat. Revisa el correu (i la carpeta de correu brossa, per si de cas).',
  },
  inicio: {
    title: 'El teu punt de partida',
    body: 'Aquesta és la teva foto d’avui. L’exercici de la primera setmana és el que veus a dalt; també et arriba per correu, per fer-lo amb calma. A l’última setmana repetiràs el test i el compararàs amb aquest.',
    sent: 'T’he enviat aquest retorn al correu.',
  },
  testNote: 'Al final, si vols, pots continuar amb un mes d’exercicis gratuït.',
  landing: {
    metaTitle: 'Un mes coneixent el teu ikigai · programa gratuït de 4 setmanes',
    metaDescription: 'Programa gratuït de quatre setmanes: un correu cada setmana amb un exercici de «El Ikigai que no te contaron». Comença amb un test d’ikigai i acaba repetint-lo per veure què ha canviat.',
    eyebrow: 'Programa gratuït · 4 setmanes',
    title: 'Un mes coneixent el teu ikigai',
    lead: 'Quatre setmanes per mirar el que fas, el que et frena i com tornes a tu, amb exercicis dels meus llibres. Comença amb un test de deu minuts i acaba repetint-lo, per veure què s’ha mogut.',
    howTitle: 'Com és',
    needTitle: 'Què necessites',
    need: [
      'Una llibreta i uns minuts al dia.',
      'Un compte gratuït a IKIGAIER (amb Google, un clic). No cal tenir els llibres.',
      'Si durant el teu mes hi ha trobades en grup en línia, t’aviso. Són opcionals.',
      'Si una setmana no pots, no passa res: la setmana següent arriba el correu següent. Et dones de baixa amb un clic.',
    ],
    whoTitle: 'Qui l’escriu',
    who: 'Manel Rueda, autor de «El Ikigai que no te contaron» i «No todo lo que te frena es tuyo». Tot el que faràs surt d’aquests llibres.',
    formTitle: 'Comença avui',
    placeholder: 'el.teu@correu.com',
    button: 'Començar el mes gratis',
    sending: 'Enviant…',
    consent: 'Vull rebre també les cartes d’en Manel i propostes per continuar treballant això. És a part del programa, i em puc donar de baixa quan vulgui.',
    error: 'No s’ha pogut enviar. Revisa el correu i torna-ho a provar.',
    sent: 'T’he enviat un correu. Prem «Confirmar la meva plaça» per començar. Si no el veus, mira a la carpeta de correu brossa.',
    ya: 'Ja ets dins del programa amb aquest correu. El correu de cada setmana t’arriba a aquesta adreça.',
    testFirst: 'Prefereixes començar pel test?',
    testLink: 'Fer el test d’ikigai',
  },
  confirmar: {
    subject: 'Confirma la teva plaça: un mes coneixent el teu ikigai',
    title: 'Confirma la teva plaça',
    text: 'Has demanat fer «Un mes coneixent el teu ikigai». Per començar, confirma que aquest correu és teu. El programa comença el dia que confirmis.',
    button: 'CONFIRMAR LA MEVA PLAÇA',
    note: 'Si no ho has demanat tu, ignora-ho: sense confirmar no rebràs res més.',
  },
  confirmarPage: {
    checking: 'Confirmant…',
    confirmada: () => 'Fet. Comences avui. T’acabo d’escriure amb el que ve.',
    ya: 'Ja eres dins del programa. El correu de cada setmana t’arriba a aquesta mateixa adreça.',
    invalid: 'Aquest enllaç no és vàlid o ja no està actiu.',
    error: 'No s’ha pogut confirmar ara. Torna a prémer el botó del correu d’aquí a uns minuts.',
  },
  dateLocale: 'ca-ES',
  q: ['«', '»'],
  book: 'El Ikigai que no te contaron',
  book2: 'No todo lo que te frena es tuyo',
  chapter: 'Capítol',
  thisWeek: 'Aquesta setmana',
  umbral: { eyebrow: 'Abans de començar la setmana', title: 'Un llindar' },
  allMonth: 'Per a tot el mes',
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
    subject: 'Comences avui: un mes coneixent el teu ikigai',
    blocks: [
      { kind: 'p', text: `T’has apuntat a «Un mes coneixent el teu ikigai». Comences avui, ${start}.` },
      { kind: 'p', text: 'Durant quatre setmanes et arribarà un correu en començar cada setmana, amb el que toca, i un altre de més curt a mitja setmana. El primer arriba avui mateix. Tot surt dels meus llibres, sobretot de «El Ikigai que no te contaron». No cal que els tinguis.' },
      { kind: 'p', text: 'Són quatre setmanes, en aquest ordre: el que ja hi ha, el que hi ha a sota, fer diferent i tornar a tu.' },
      { kind: 'p', text: 'Si durant el teu mes hi ha trobades en grup, en línia, t’aviso la vigília. Són opcionals.' },
      ...encuentrosBlock(CA, c),
      { kind: 'p', text: 'Si una setmana no pots, no passa res. La setmana següent arriba el correu següent.' },
      cita(CA, 'Si un dia falles, l’endemà tornes. Sense drama.', 'Capítol 6'),
      ...sinTestBlocks(CA, c, CA.sinTest.bienvenida),
      { kind: 'p', text: 'Mentrestant, només una cosa: busca una llibreta que et faci gust obrir. Tot el que facis aquest mes hi acabarà, i l’últim dia la rellegiràs sencera.' },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
  semanal: {
    semana1: c => ({
      subject: c.exercise ? `Setmana 1: ${c.exercise.title.toLowerCase()}` : 'Setmana 1: el que ja hi ha',
      blocks: [
        ...(c.tieneTest ? [
          { kind: 'p', text: 'Primera setmana: el que ja hi ha. Comencem pel que va sortir al teu test.' },
          { kind: 'p', text: 'El retorn et va proposar un exercici. Aquesta setmana és per fer-lo de veritat, no per llegir-lo.' },
        ] as ProgramaBlock[] : sinTestBlocks(CA, c, CA.sinTest.semana1)),
        { kind: 'p', text: 'Abans de començar, a la primera pàgina de la llibreta escriu la data d’avui i una sola frase: el que esperes d’aquest mes. No el que creus que hauries d’esperar. El que realment esperes, encara que soni petit. La rellegiràs l’últim dia.' },
        ...(c.exercise ? [exerciseBlock(CA, c.exercise)] : []),
        { kind: 'p', text: 'I una pràctica per a tot el mes, de vint segons. Tres vegades al dia (abans d’una reunió, després de dinar, abans de dormir), fes el VOLver:' },
        ej(CA, 'El mètode VOLver', 5, [
          'V. Veure qui hi ha: com em sento ara mateix?',
          'O. Observar el que fas: què estic fent en aquest moment?',
          'L. Localitzar el lloc: què veig, sento, noto físicament ara?',
          'No escriguis res. Només fes-ho. Amb el temps es torna tan automàtic que el faràs servir sense pensar-hi, just quan més el necessites.',
        ], false, `${CA.allMonth} · Capítol 5`),
        cita(CA, 'El buit no és a la teva vida. És entre tu i la teva vida. És distància, no absència. I la distància no s’omple: es recorre.', 'Capítol 1', true),
        { kind: 'p', text: 'A mitja setmana, un correu curt. D’aquí a set dies, la segona setmana.', muted: true },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves1: c => ({
      subject: 'A mitja setmana',
      blocks: [
        { kind: 'p', text: 'A mitja primera setmana. Si encara no has començat l’exercici, avui també val.' },
        { kind: 'p', text: 'Una pregunta per a aquesta nit, a la llibreta: què has notat aquests dies que no esperaves?' },
        { kind: 'p', text: 'I si t’has recordat del VOLver encara que sigui un cop, ja està funcionant.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    semana2: c => ({
      subject: 'Setmana 2: el que hi ha a sota',
      blocks: [
        { kind: 'p', text: 'Segona setmana: el que hi ha a sota. Fins ara has mirat el que fas. Aquesta setmana mirem el que et frena quan ho vols fer. No per arreglar-ho. Per veure-ho.' },
        umbral(CA, 'Obre la llibreta i acaba aquesta frase, sense pensar-hi gaire: «El que més temo trobar aquí és…».'),
        ej(CA, 'L’autòpsia amable', 2, [
          'Anota els teus tres últims intents de canvi, els que siguin: exercici, un projecte, un hàbit, deixar alguna cosa. Per a cadascun: quina va ser l’espurna? Quant va durar l’eufòria? On va aparèixer la fricció?',
          'Ara la pregunta important: quina sentència et vas dir en abandonar-los? Escriu-la literal, amb les paraules exactes que vas fer servir contra tu.',
          'Mira les tres sentències juntes. S’assemblen? Quina és la frase mare, la que es repeteix a sota de totes?',
        ], true),
        ej(CA, 'Trobar la veu', 7, [
          'Si aquesta frase mare tingués una veu, de qui seria? No busquis culpables; busca només reconèixer. De vegades és una persona concreta. De vegades és «l’ambient» d’una època de la teva vida.',
          'Escriu quants anys tenies, més o menys, quan aquesta frase va començar a sonar dins teu. Aquest número és important: és l’edat de qui continua prenent, en part, les teves decisions d’avui.',
        ], true),
        { kind: 'p', text: 'Guarda aquesta pàgina. A mitja setmana t’escric amb el que es fa amb ella.' },
        { kind: 'p', text: 'Aquesta setmana mira cap a dins. Si en algun moment remou més del que et ve de gust, para. No cal arribar al fons en set dies.', muted: true },
        cita(CA, 'Aquest “jo soc així” que repeteixes no és una descripció. És una instal·lació.', 'Pròleg', true),
        ...encuentrosBlock(CA, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves2: c => ({
      subject: 'A mitja setmana: de qui és aquesta veu',
      blocks: [
        { kind: 'p', text: 'Torna a la teva frase mare i a l’edat que li vas posar. Imagina algú d’aquesta edat exacta, davant teu, explicant-te per què creu això. Li diries «quina ximpleria»? Probablement no. Li diries alguna cosa semblant a: té sentit que pensessis això, amb el que vas viure.' },
        { kind: 'p', text: 'Des d’aquest to, no des del retret, tres preguntes:' },
        ej(CA, 'Les tres preguntes', 10, [
          'De qui és aquesta veu? Descriu-la: edat, situació, si pots fins i tot el lloc on eres.',
          'A qui o a què protegia aleshores? Sigues concret: la teva seguretat, l’afecte d’algú, la pau a casa, el teu lloc al grup?',
          'Protegeix avui alguna cosa que continuï realment en perill? Respon amb honestedat, no amb la resposta que «queda bé».',
          'Si la resposta a la tercera és no, escriu una frase de tancament adreçada a aquesta veu més jove, com ara: «Gràcies per protegir-me aleshores. Ja no cal que continuïs fent-ho així». No ha de sonar perfecta. Ha de ser sincera.',
        ], true),
        cita(CA, 'No cridis al nen que et va protegir. Dona-li les gràcies, i digues-li que ja pot descansar.', 'Capítol 10', true),
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    semana3: c => ({
      subject: 'Setmana 3: fer diferent',
      blocks: [
        { kind: 'p', text: 'Tercera setmana: fer diferent. Amb el que vas veure la setmana passada, tornes al que fas i a com ho vius. Totes dues coses alhora.' },
        umbral(CA, 'Llegeix en veu alta la frase de tancament que vas escriure la setmana passada. Si no la vas arribar a escriure, llegeix la pàgina de la setmana passada que més et va remoure.'),
        { kind: 'p', text: 'Per a una tarda d’aquesta setmana, el que fas:' },
        exerciseBlock(CA, c.semana3.activo),
        { kind: 'p', text: 'I per a cada dia, com ho vius:' },
        exerciseBlock(CA, c.semana3.consciente),
        cita(CA, 'Un ikigaier no tria entre les dues versions: les necessita juntes.', 'Capítol 4'),
        { kind: 'p', text: c.pasoConCuenta
          ? 'Si et ve de gust una mirada més aquesta setmana: PASO és un test breu sobre com et mous pel món. Crea el teu compte perquè el resultat quedi guardat al costat del teu recorregut.'
          : 'Si et ve de gust una mirada més aquesta setmana: PASO és un test breu i gratuït sobre com et mous pel món.', muted: true },
        { kind: 'cta', href: c.links.paso, label: 'FER PASO' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves3: c => ({
      subject: 'A mitja setmana: un pas en una altra direcció',
      blocks: [
        { kind: 'p', text: 'Torna a la teva frase mare. Llegeix-la a poc a poc i fes-li tres preguntes: sempre?, segons qui?, quan va ser l’última vegada que no es va complir? Escriu aquesta excepció. Encara que sigui petita, existeix.' },
        ej(CA, 'La conducta mínima', 11, [
          'Identifica la conducta que la teva frase mare et demana sempre: quedar-te, callar, ajornar, el que sigui en el teu cas.',
          'Ara dissenya la conducta mínima oposada: l’acció real més petita que puguis fer aquesta setmana en la direcció contrària. No la ideal ni la definitiva. La mínima que de veritat faràs.',
          'Fes-la, sentint-te insegur si cal. I després anota què va passar realment, no el que temies que passés.',
        ], true),
        cita(CA, 'La conducta no és la conseqüència del canvi. És el seu punt d’entrada.', 'Capítol 11', true),
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    semana4: c => ({
      subject: 'Setmana 4: tornar a tu',
      blocks: [
        { kind: 'p', text: 'Última setmana: tornar a tu. Toca tornar al principi, amb el que has vist pel camí.' },
        umbral(CA, 'Escriu una excusa que hagis fet servir tota la vida. Ratlla-la, sense esborrar-la: que es continuï llegint.'),
        { kind: 'p', text: 'Primer, repeteix el test. En acabar veuràs les teves respostes de fa un mes al costat de les d’avui. No esperis un gran canvi: un mes és poc. Mira què s’ha mogut i què no.' },
        { kind: 'cta', href: c.links.repetir, label: 'REPETIR EL TEST' },
        { kind: 'p', text: 'Després, una tarda tranquil·la, rellegeix la llibreta sencera des de la primera pàgina, seguida i sense corregir. I escriu això:' },
        ej(CA, 'Els moments sense soroll', 3, [
          'Fes una llista dels teus moments sense soroll: aquelles ocasions, recents o antigues, en què vas estar bé «sense motiu». Sigues concret: on, amb qui, fent què.',
          'Mira’ls junts i busca què tenen en comú. No en el que hi havia, sinó en el que no hi havia: quina pressa, quin paper, quina exigència, quina comparació no sonava?',
          'Acaba amb aquesta frase, a mà: «Quan el soroll baixa, jo soc…», i completa-la amb el primer que et vingui.',
        ], true),
        { kind: 'p', text: 'I un gest per quedar-te amb això. L’Emiko és mestra; en acabar la jornada apaga els llums de l’aula i diu en veu baixa «arigatou». Ningú no la sent. Tria el teu gest, petit i sempre igual, i aquesta setmana fes-lo cada nit mentre rellegeixes la teva frase «Quan el soroll baixa, jo soc…».' },
        cita(CA, 'No et falta res. Et sobra el que no ets.', 'Capítol 3', true),
        ...encuentrosBlock(CA, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves4: c => ({
      subject: 'A mitja setmana: el que t’emportes',
      blocks: [
        { kind: 'p', text: 'Queda poc. Dues coses per endur-te quan això acabi.' },
        ej(CA, 'La teva acció mínima diària', 6, [
          'Tria una sola acció petita que puguis repetir cada dia. Alguna cosa real per a la teva vida actual, no per a la teva vida ideal.',
          'Decideix a quina hora del dia la faràs i registra cada vegada que la compleixes. Si un dia falles, l’endemà tornes. Sense drama.',
        ]),
        ej(CA, 'Revisió mensual', 6, [
          'Què m’ha aportat equilibri aquest mes?',
          'Què m’ha costat més del que valia?',
          'Què vull ajustar el mes que ve?',
        ]),
        { kind: 'p', text: 'Si vols, respon aquest correu amb la teva frase «Quan el soroll baixa, jo soc…». La llegeixo jo.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Has fet l’exercici d’aquesta setmana?', 'Amb un clic n’hi ha prou. No canvia el que reps: només em diu com va.', { si: 'Sí', medias: 'A mitges', no: 'Aquesta setmana no' }),
      ],
    }),
    cierre: c => ({
      subject: 'Després d’aquest mes',
      blocks: [
        { kind: 'p', text: 'Has acabat «Un mes coneixent el teu ikigai». Si n’has fet encara que sigui una part, has fet una cosa que poca gent fa: mirar-te amb calma.' },
        { kind: 'p', text: 'Mira el que tens ara a la llibreta: una frase de fa un mes, una frase mare i de qui era aquella veu, una frase de tancament, el fil que travessa la teva vida, uns dies de presència, un pas petit en una altra direcció i una línia que comença «Quan el soroll baixa, jo soc…». Fa un mes no hi havia res d’això.' },
        { kind: 'p', text: 'Per als dies que vénen tens dues coses: el teu gest de cada nit i la teva acció mínima. I rellegeix la llibreta d’aquí a un mes. Et dirà més que aquest correu.' },
        ...(c.links.curso ? [
          { kind: 'p', text: 'Si vols continuar amb mi: el curs en línia recorre el que hi ha a sota (la por, les màscares, la manera com et parles per dins) en els tres actes del llibre.' },
          ...cursoBlock(c, 'VEURE EL CURS'),
        ] as ProgramaBlock[] : []),
        { kind: 'p', text: 'Si prefereixes continuar pel teu compte, tot això hi és amb més calma als llibres.', muted: true },
        { kind: 'cta', href: c.links.libros, label: 'ELS LLIBRES' },
        { kind: 'p', text: 'I si prefereixes viure-ho en persona, amb altres persones que es fan les teves mateixes preguntes, hi ha el taller presencial «Jo soc IKIGAIER»: quatre hores per escoltar-te.', muted: true },
        { kind: 'cta', href: c.links.taller, label: 'VEURE EL TALLER' },
        { kind: 'p', text: 'I si vols portar tot això a decisions concretes, pots respondre aquest correu.', muted: true },
        cita(CA, 'Continua caminant. Però fes-ho sense allunyar-te de tu.', 'Epíleg'),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
  },
  retomar: { no: 'No passa res si la setmana passada no va poder ser. Aquí tens la següent; si vols, reprèn també l’anterior.', medias: 'A mitges també compta. Continuem.' },
  checkinPage: { si: 'Anotat. Gràcies.', medias: 'Anotat. A mitges també compta.', no: 'Anotat. Si aquesta setmana no ha pogut ser, no passa res: la setmana següent arriba el correu següent.', invalid: 'Enllaç no vàlid.' },
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
  optIn: 'I want to do “A month getting to know your ikigai” for free: an email every week for four weeks, with an exercise from the book, optional group meetings and, at the end, a proposal to keep going. I can unsubscribe at any time.',
  optInDone: 'You have signed up for “A month getting to know your ikigai”. I have emailed you the start date.',
  optInPending: 'One more step: in the email I have just sent you, at the very top, press “Confirm my place”. The programme doesn’t start without it.',
  optInYa: 'You are already in “A month getting to know your ikigai” with this email.',
  abrirMes: 'OPEN YOUR MONTH',
  cierreEco: {
    ancla: x => `A month ago, on the first page, you wrote: “${x}”.`,
    ruido: x => `And this week you ended like this: “When the noise goes down, I am ${x}”.`,
  },
  cuenta: {
    button: 'Start the free month',
    logged: 'Start my month',
    nota: 'I’ll ask you to log in or create your free account (with Google, one click). That is where your month lives: the calendar, each week and what you write.',
  },
  panel: {
    title: 'A month getting to know your ikigai',
    weekOf: n => `Week ${n} of 4`,
    startsOn: d => `You start on ${d}`,
    finished: 'You have finished the month',
    testFirst: 'Before you start, take the ikigai test. Ten minutes. It is your starting point: the first week’s exercise comes from it.',
    testButton: 'Take the test',
    tabs: { semana1: 'Week 1', jueves1: 'Week 1', semana2: 'Week 2', jueves2: 'Week 2', semana3: 'Week 3', jueves3: 'Week 3', semana4: 'Week 4', jueves4: 'Week 4', cierre: 'Closing' },
    libretaTab: 'Your notebook',
    monday: 'Start of the week',
    thursday: 'Midweek',
    opensOn: d => `Opens on ${d}`,
    checkinQuestion: 'Have you done this week’s exercise?',
    checkinLabels: { si: 'Yes', medias: 'Partly', no: 'Not this week' },
    checkinSaved: 'Noted.',
    noInscripcion: 'You are not in “A month getting to know your ikigai” yet.',
    noInscripcionButton: 'Start the free month',
  },
  libreta: {
    intro: 'Write here if you like; the paper notebook works just as well. It saves itself, and only you can see it.',
    campos: {
      ancla: 'The sentence from day one: what you expect from this month',
      ejercicio1: 'What this week’s exercise leaves you with',
      notado: 'What you noticed that you didn’t expect',
      temo: 'What I most fear finding here is…',
      frase_madre: 'Your mother sentence',
      voz: 'Whose voice it is',
      edad: 'How old you were when it started sounding',
      protegia: 'Who or what it was protecting back then',
      cierre_voz: 'Your closing sentence for that voice',
      activo: 'What you do: what this afternoon’s exercise leaves you with',
      consciente: 'How you live it: one sentence each day',
      excepcion: 'The exception: the last time your mother sentence didn’t come true',
      conducta: 'Your minimal behaviour',
      paso_real: 'What really happened',
      excusa: 'The lifelong excuse',
      ruido: 'When the noise goes down, I am…',
      gesto: 'Your gesture every night',
      accion: 'Your minimum daily action, and at what time',
      revision: 'Your monthly review',
    },
    placeholder: 'Write here…',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'It couldn’t be saved. Please try again.',
    empty: 'Everything you write during the month will appear here, in order.',
    borrar: 'Delete everything I have written',
    borrarConfirm: 'Are you sure? Everything you have written in your programme notebook will be deleted. This cannot be undone.',
    borrado: 'Deleted.',
  },
  sinTest: {
    bienvenida: 'Before anything else, one thing: take the ikigai test. It takes ten minutes. It is your starting point: the first week’s exercise comes from it, and in the last week you will repeat it to see what has changed.',
    semana1: 'First week. You haven’t taken the ikigai test yet, and the whole month starts from there. Begin with it: ten minutes. When you finish, you will see this week’s exercise.',
    button: 'TAKE THE TEST',
  },
  semanas: {
    antes: 'Before you start · The ikigai test: a snapshot of what you do and where you do it from.',
    lista: [
      'Week 1 · What is already there: the exercise your test suggests, one sentence for the whole month and twenty seconds of attention, three times a day.',
      'Week 2 · What lies underneath: the sentence that holds you back, whose voice it is and what it was protecting.',
      'Week 3 · Doing it differently: the thread that runs through your life, five minutes of presence a day and a small step in another direction.',
      'Week 4 · Coming back to yourself: you retake the test, reread your notebook and take a gesture with you for every night.',
    ],
  },
  captura: {
    title: 'This is a snapshot of today. Shall we work on it for a month?',
    body: '“A month getting to know your ikigai” is free. One email at the start of each week, and a short one midweek, with exercises from my books. It starts the day you join. Your account holds the calendar and your notebook. You can leave whenever you want.',
    button: 'Start the free month',
    solo: 'Just send me this reading',
    sending: 'Sending…',
    doneSolo: 'I have sent it. Check your inbox (and your spam folder, just in case).',
  },
  inicio: {
    title: 'Your starting point',
    body: 'This is your snapshot of today. The first week’s exercise is the one above; you will also get it by email, to do it calmly. In the last week you will repeat the test and compare it with this one.',
    sent: 'I have sent this reading to your email.',
  },
  testNote: 'At the end, if you like, you can continue with a free month of exercises.',
  landing: {
    metaTitle: 'A month getting to know your ikigai · free 4-week programme',
    metaDescription: 'Free four-week programme: one email every week with an exercise from “El Ikigai que no te contaron”. It starts with an ikigai test and ends by repeating it to see what has changed.',
    eyebrow: 'Free programme · 4 weeks',
    title: 'A month getting to know your ikigai',
    lead: 'Four weeks to look at what you do, what holds you back and how you come back to yourself, with exercises from my books. It starts with a ten-minute test and ends by repeating it, to see what has moved.',
    howTitle: 'How it works',
    needTitle: 'What you need',
    need: [
      'A notebook and a few minutes a day.',
      'A free IKIGAIER account (with Google, one click). You don’t need the books.',
      'If there are online group meetings during your month, I’ll let you know. They are optional.',
      'If you can’t do a week, that’s fine: the next email arrives the following week. You can unsubscribe with one click.',
    ],
    whoTitle: 'Who writes it',
    who: 'Manel Rueda, author of “El Ikigai que no te contaron” and “No todo lo que te frena es tuyo”. Everything you will do comes from those books.',
    formTitle: 'Start today',
    placeholder: 'you@email.com',
    button: 'Start the free month',
    sending: 'Sending…',
    consent: 'I would also like to receive Manel’s letters and ideas to keep working on this. It is separate from the programme, and I can unsubscribe at any time.',
    error: 'It couldn’t be sent. Check the email address and try again.',
    sent: 'I have sent you an email. Press “Confirm my place” to start. If you can’t see it, check your spam folder.',
    ya: 'You are already in the programme with this email. The weekly email reaches you at this address.',
    testFirst: 'Would you rather start with the test?',
    testLink: 'Take the ikigai test',
  },
  confirmar: {
    subject: 'Confirm your place: a month getting to know your ikigai',
    title: 'Confirm your place',
    text: 'You asked to do “A month getting to know your ikigai”. To start, confirm that this email is yours. The programme starts the day you confirm.',
    button: 'CONFIRM MY PLACE',
    note: 'If this wasn’t you, ignore it: without confirming you won’t receive anything else.',
  },
  confirmarPage: {
    checking: 'Confirming…',
    confirmada: () => 'Done. You start today. I have just emailed you what comes next.',
    ya: 'You were already in the programme. The weekly email reaches you at this same address.',
    invalid: 'This link isn’t valid or is no longer active.',
    error: 'It couldn’t be confirmed right now. Press the button in the email again in a few minutes.',
  },
  dateLocale: 'en-GB',
  q: ['“', '”'],
  book: 'El Ikigai que no te contaron',
  book2: 'No todo lo que te frena es tuyo',
  chapter: 'Chapter',
  thisWeek: 'This week',
  umbral: { eyebrow: 'Before the week begins', title: 'A threshold' },
  allMonth: 'For the whole month',
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
    subject: 'You start today: a month getting to know your ikigai',
    blocks: [
      { kind: 'p', text: `You have signed up for “A month getting to know your ikigai”. You start today, ${start}.` },
      { kind: 'p', text: 'For four weeks you will get an email at the start of each week with that week’s work, and a shorter one midweek. The first one arrives today. Everything comes from my books, above all “El Ikigai que no te contaron”. You don’t need to have them.' },
      { kind: 'p', text: 'There are four weeks, in this order: what is already there, what lies underneath, doing it differently and coming back to yourself.' },
      { kind: 'p', text: 'If there are group meetings during your month, online, I’ll let you know the day before. They are optional.' },
      ...encuentrosBlock(EN, c),
      { kind: 'p', text: 'If you can’t do a week, that’s fine. The next email arrives the following week.' },
      cita(EN, 'If you miss a day, you come back the next. No drama.', 'Chapter 6'),
      ...sinTestBlocks(EN, c, EN.sinTest.bienvenida),
      { kind: 'p', text: 'In the meantime, just one thing: find a notebook you enjoy opening. Everything you do this month will end up there, and on the last day you will reread it from start to finish.' },
      { kind: 'sign', text: 'Manel' },
    ],
  }),
  semanal: {
    semana1: c => ({
      subject: c.exercise ? `Week 1: ${c.exercise.title.toLowerCase()}` : 'Week 1: what is already there',
      blocks: [
        ...(c.tieneTest ? [
          { kind: 'p', text: 'First week: what is already there. We start with what came up in your test.' },
          { kind: 'p', text: 'Your reading suggested an exercise. This week is for actually doing it, not just reading it.' },
        ] as ProgramaBlock[] : sinTestBlocks(EN, c, EN.sinTest.semana1)),
        { kind: 'p', text: 'Before you start, on the first page of your notebook write today’s date and one sentence: what you expect from this month. Not what you think you should expect. What you really expect, even if it sounds small. You will reread it on the last day.' },
        ...(c.exercise ? [exerciseBlock(EN, c.exercise)] : []),
        { kind: 'p', text: 'And one practice for the whole month, twenty seconds long. Three times a day (before a meeting, after lunch, before sleeping), do the VOLver:' },
        ej(EN, 'The VOLver method', 5, [
          'V. See who is here: how do I feel right now?',
          'O. Observe what you are doing: what am I doing at this moment?',
          'L. Locate the place: what do I see, hear, feel physically now?',
          'Don’t write anything. Just do it. Over time it becomes so automatic that you will use it without thinking, just when you need it most.',
        ], false, `${EN.allMonth} · Chapter 5`),
        cita(EN, 'The emptiness isn’t in your life. It is between you and your life. It is distance, not absence. And distance isn’t filled: it is travelled.', 'Chapter 1', true),
        { kind: 'p', text: 'Midweek, a short email. In seven days, week two.', muted: true },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves1: c => ({
      subject: 'Midweek',
      blocks: [
        { kind: 'p', text: 'Halfway through the first week. If you haven’t started the exercise yet, today works just as well.' },
        { kind: 'p', text: 'One question for tonight, in your notebook: what have you noticed these days that you didn’t expect?' },
        { kind: 'p', text: 'And if you have remembered the VOLver even once, it is already working.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    semana2: c => ({
      subject: 'Week 2: what lies underneath',
      blocks: [
        { kind: 'p', text: 'Second week: what lies underneath. So far you have looked at what you do. This week we look at what holds you back when you want to do it. Not to fix it. To see it.' },
        umbral(EN, 'Open your notebook and finish this sentence, without thinking too much: “What I most fear finding here is…”.'),
        ej(EN, 'The kind autopsy', 2, [
          'Write down your last three attempts to change, whatever they were: exercise, a project, a habit, giving something up. For each one: what was the spark? How long did the high last? Where did the friction appear?',
          'Now the important question: what sentence did you tell yourself when you gave each one up? Write it word for word, with the exact words you used against yourself.',
          'Look at the three sentences together. Are they alike? Which is the mother sentence, the one repeating underneath them all?',
        ], true),
        ej(EN, 'Finding the voice', 7, [
          'If that mother sentence had a voice, whose would it be? Don’t look for someone to blame; just look to recognise. Sometimes it is a specific person. Sometimes it is “the atmosphere” of a time in your life.',
          'Write down roughly how old you were when that sentence started sounding inside you. That number matters: it is the age of whoever is still making, in part, your decisions today.',
        ], true),
        { kind: 'p', text: 'Keep that page. Midweek I’ll write with what to do with it.' },
        { kind: 'p', text: 'This week looks inward. If at any point it stirs up more than you feel like, stop. There is no need to reach the bottom in seven days.', muted: true },
        cita(EN, 'That ‘I’m just like this’ you keep repeating isn’t a description. It’s an installation.', 'Prologue', true),
        ...encuentrosBlock(EN, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves2: c => ({
      subject: 'Midweek: whose voice is it',
      blocks: [
        { kind: 'p', text: 'Go back to your mother sentence and the age you gave it. Picture someone of exactly that age in front of you, telling you why they believe it. Would you say “how silly”? Probably not. You would say something like: it makes sense that you thought that, given what you lived through.' },
        { kind: 'p', text: 'From that tone, not from reproach, three questions:' },
        ej(EN, 'The three questions', 10, [
          'Whose voice is this? Describe it: age, situation, even the place where you were, if you can.',
          'Who or what was it protecting back then? Be specific: your safety, someone’s affection, peace at home, your place in the group?',
          'Does it protect anything today that is still really in danger? Answer honestly, not with the answer that “looks good”.',
          'If the answer to the third is no, write a closing sentence addressed to that younger voice, something like: “Thank you for protecting me back then. You don’t need to keep doing it this way.” It doesn’t have to sound perfect. It has to be sincere.',
        ], true),
        cita(EN, 'Don’t shout at the child who protected you. Thank them, and tell them they can rest now.', 'Chapter 10', true),
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    semana3: c => ({
      subject: 'Week 3: doing it differently',
      blocks: [
        { kind: 'p', text: 'Third week: doing it differently. With what you saw last week, you go back to what you do and how you live it. Both at once.' },
        umbral(EN, 'Read aloud the closing sentence you wrote last week. If you didn’t get to write it, read the page from last week that stirred you most.'),
        { kind: 'p', text: 'For one afternoon this week, what you do:' },
        exerciseBlock(EN, c.semana3.activo),
        { kind: 'p', text: 'And for every day, how you live it:' },
        exerciseBlock(EN, c.semana3.consciente),
        cita(EN, 'An ikigaier doesn’t choose between the two versions: they need them together.', 'Chapter 4'),
        { kind: 'p', text: c.pasoConCuenta
          ? 'If you’d like one more look this week: PASO is a short test about how you move through the world. Create your account so the result is saved alongside your journey.'
          : 'If you’d like one more look this week: PASO is a short, free test about how you move through the world.', muted: true },
        { kind: 'cta', href: c.links.paso, label: 'TAKE PASO' },
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves3: c => ({
      subject: 'Midweek: one step in another direction',
      blocks: [
        { kind: 'p', text: 'Go back to your mother sentence. Read it slowly and ask it three questions: always? According to whom? When was the last time it didn’t come true? Write down that exception. However small, it exists.' },
        ej(EN, 'The minimal behaviour', 11, [
          'Identify the behaviour your mother sentence always asks of you: staying put, keeping quiet, putting things off, whatever it is in your case.',
          'Now design the opposite minimal behaviour: the smallest real action you can take this week in the other direction. Not the ideal one, not the definitive one. The minimal one you will actually do.',
          'Do it, feeling unsure if you have to. Then write down what really happened, not what you feared would happen.',
        ], true),
        cita(EN, 'Behaviour isn’t the consequence of change. It is its point of entry.', 'Chapter 11', true),
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    semana4: c => ({
      subject: 'Week 4: coming back to yourself',
      blocks: [
        { kind: 'p', text: 'Last week: coming back to yourself. Time to go back to the beginning, with what you have seen along the way.' },
        umbral(EN, 'Write down an excuse you have used all your life. Cross it out, without erasing it: it should still be readable.'),
        { kind: 'p', text: 'First, retake the test. When you finish you will see your answers from a month ago next to today’s. Don’t expect a big change: a month is not long. Look at what has moved and what hasn’t.' },
        { kind: 'cta', href: c.links.repetir, label: 'RETAKE THE TEST' },
        { kind: 'p', text: 'Then, one quiet afternoon, reread your whole notebook from the first page, in one go and without correcting anything. And write this:' },
        ej(EN, 'The moments without noise', 3, [
          'Make a list of your moments without noise: those times, recent or long ago, when you were fine “for no reason”. Be specific: where, with whom, doing what.',
          'Look at them together and find what they have in common. Not in what was there, but in what wasn’t: what hurry, what role, what demand, what comparison wasn’t sounding?',
          'Finish with this sentence, by hand: “When the noise goes down, I am…”, and complete it with the first thing that comes.',
        ], true),
        { kind: 'p', text: 'And a gesture to hold on to it. Emiko is a teacher; at the end of her day she switches off the classroom lights and says “arigatou” under her breath. Nobody hears her. Choose your gesture, small and always the same, and this week do it every night while you reread your sentence “When the noise goes down, I am…”.' },
        cita(EN, 'You aren’t missing anything. You have too much of what you are not.', 'Chapter 3', true),
        ...encuentrosBlock(EN, c),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
    jueves4: c => ({
      subject: 'Midweek: what you take with you',
      blocks: [
        { kind: 'p', text: 'Not long left. Two things to take with you when this ends.' },
        ej(EN, 'Your minimum daily action', 6, [
          'Choose one small action you can repeat every day. Something real for your current life, not for your ideal life.',
          'Decide what time of day you will do it and note each time you do. If you miss a day, you come back the next. No drama.',
        ]),
        ej(EN, 'Monthly review', 6, [
          'What has brought me balance this month?',
          'What has cost me more than it was worth?',
          'What do I want to adjust next month?',
        ]),
        { kind: 'p', text: 'If you like, reply to this email with your sentence “When the noise goes down, I am…”. I read them myself.' },
        { kind: 'sign', text: 'Manel' },
        ...checkinBlock(c, 'Have you done this week’s exercise?', 'One click is enough. It doesn’t change what you receive: it just tells me how it’s going.', { si: 'Yes', medias: 'Partly', no: 'Not this week' }),
      ],
    }),
    cierre: c => ({
      subject: 'After this month',
      blocks: [
        { kind: 'p', text: 'You have finished “A month getting to know your ikigai”. If you have done even part of it, you have done something few people do: look at yourself calmly.' },
        { kind: 'p', text: 'Look at what is in your notebook now: a sentence from a month ago, a mother sentence and whose voice it was, a closing sentence, the thread that runs through your life, a few days of presence, a small step in another direction and a line that begins “When the noise goes down, I am…”. A month ago none of that was there.' },
        { kind: 'p', text: 'For the days ahead you have two things: your gesture every night and your minimum action. And reread the notebook in a month. It will tell you more than this email.' },
        ...(c.links.curso ? [
          { kind: 'p', text: 'If you want to continue with me: the online course goes through what lies underneath (fear, masks, the way you talk to yourself inside) across the three acts of the book.' },
          ...cursoBlock(c, 'SEE THE COURSE'),
        ] as ProgramaBlock[] : []),
        { kind: 'p', text: 'If you would rather continue on your own, all of this is in the books, with more time.', muted: true },
        { kind: 'cta', href: c.links.libros, label: 'THE BOOKS' },
        { kind: 'p', text: 'And if you would rather live it in person, with other people asking themselves the same questions, there is the in-person workshop “I am IKIGAIER”: four hours to listen to yourself.', muted: true },
        { kind: 'cta', href: c.links.taller, label: 'SEE THE WORKSHOP' },
        { kind: 'p', text: 'And if you want to take this into concrete decisions, you can reply to this email.', muted: true },
        cita(EN, 'Keep walking. But do it without moving away from yourself.', 'Epilogue'),
        { kind: 'sign', text: 'Manel' },
      ],
    }),
  },
  retomar: { no: 'It’s fine if last week didn’t happen. Here is the next one; if you like, pick up the previous one too.', medias: 'Partly counts too. We carry on.' },
  checkinPage: { si: 'Noted. Thank you.', medias: 'Noted. Partly counts too.', no: 'Noted. If this week didn’t happen, that’s fine: the next one arrives next week.', invalid: 'Invalid link.' },
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
