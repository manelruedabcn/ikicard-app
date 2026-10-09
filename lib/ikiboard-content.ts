// ============================================================
// IKIBOARD — Contenido del recorrido (voz de Manel).
// El tablero vivo del método: primero DEFINIR el propósito hacia
// dentro (pasos 1-6), luego MONTAR el tablero hacia fuera (7-9).
//
// Bilingüe: el contenido vive en dos datasets (_ES / _EN) y se
// selecciona por locale con getters. La LÓGICA del recorrido
// (stepDone, firstIncomplete, cercanía) se apoya en ids/kinds que
// son idénticos en los dos idiomas, así que sigue usando el dataset
// canónico ES sin traducir nada.
// ============================================================

import { contentLang } from './content-locale'

// ------------------------------------------------------------
// Tipos (independientes del idioma).
// ------------------------------------------------------------
export type IkiStepKind = 'prompt' | 'proposito' | 'frenos' | 'paso'

export interface IkiStep {
  // id del campo en content (prompt/proposito). frenos no usa; paso usa paso_que/paso_cuando.
  id: string
  kind: IkiStepKind
  // Rótulo de sección (kicker), agrupa varias pantallas bajo un mismo momento.
  section: string
  title: string
  hint?: string
  placeholder?: string
  // Se puede saltar sin responder (no bloquea avanzar).
  optional?: boolean
}

export type IkiAmbitoId = 'cuerpo' | 'vinculos' | 'material' | 'vocacion'

export interface IkiAmbito {
  id: IkiAmbitoId
  label: string
  hint: string
}

export type IkiEstado = 'lejos' | 'en_proceso' | 'conseguido'

// Estados de cercanía en orden, para pintar el selector y calcular
// el resumen por zona. El peso da el "cuánto de cerca" (0 → 1).
export const IKI_ESTADOS: { id: IkiEstado; peso: number }[] = [
  { id: 'lejos', peso: 0 },
  { id: 'en_proceso', peso: 0.5 },
  { id: 'conseguido', peso: 1 },
]

// La forma completa del copy de una pantalla, en un idioma.
export interface IkiboardCopy {
  intro: {
    kicker: string
    title: string
    hook: string
    body: string
    cta: string
  }
  coordinates: {
    kicker: string
    title: string
    body: string
    paso: string
    estrella: string
    camino: string
    mascara: string
    ready: string
    missing: string
    continue: string
  }
  frenos: {
    body: string
    cta: string
    ctaHecho: string
    yaTienes: string
  }
  paso: {
    queLabel: string
    quePlaceholder: string
    cuandoLabel: string
    cuandoPlaceholder: string
    semilla: string
  }
  definido: {
    kicker: string
    title: string
    body: string
    cta: string
  }
  borrador: {
    kicker: string
    title: string
    sub: string
    identidadLabel: string
    vocacionLabel: string
    vocacionEjemplo: string
    instruccionesLabel: string
    faltanTitle: string
    faltanSub: string
    estrellaCta: string
    estrellaHecho: string
    caminoCta: string
    caminoHecho: string
  }
  board: {
    kicker: string
    title: string
    sub: string
    proposito: string
    empty: string
    add: string
    addTitle: string
    iconLabel: string
    fraseLabel: string
    frasePlaceholder: string
    fraseHint: string
    doyLabel: string
    doyPlaceholder: string
    doyHint: string
    save: string
    remove: string
    back: string
    cercaniaLabel: string
    estados: Record<IkiEstado, string>
    zonaResumen: string
    zonaVacia: string
    motor: string
    frenoLabel: string
    frenoVacio: string
    pasoLabel: string
    pasoVacio: string
    priority: string
    makePriority: string
    evolution: string
    farCount: string
    processCount: string
    achievedCount: string
    repasar: string
  }
  // Micro-copy suelto (rótulos de botones, del mapa, mensajes de error).
  ui: {
    navBack: string
    navFinish: string
    navSkip: string
    navNext: string
    donePropositoLabel: string
    doneReview: string
    borradorPasoLabel: string
    borradorSeedDone: string
    borradorSeedCta: string
    seedTmpl: (x: string) => string
    frenoMiedoLabel: string
    boardAddShort: string
    boardVerMapa: string
    boardDoyPrefix: string
    toolPaso: string
    toolEstrella: string
    toolCamino: string
    toolMascara: string
    addModeIcon: string
    addModePhoto: string
    addCancel: string
    addSaving: string
    addSaveError: string
    photoFormatError: string
    photoSizeError: string
    mapBack: string
    mapSavePdf: string
    mapKicker: string
    mapTitle: string
    mapSub: string
    mapSecAnsias: string
    mapPropositoInline: string
    mapSecPartes: string
    mapLblComoCaminas: string
    mapLblComoEstas: string
    mapLblTerreno: string
    mapReferentePrefix: string
    mapLblDesviarte: string
    mapSecAlbum: string
    mapAunPorDibujar: string
    mapSecRuta: string
    mapLblEscena: string
    mapLblGesto: string
    mapLblFreno: string
    mapReconoceTmpl: (name: string) => string
    mapRutaVacia: string
    mapFooter: string
    pasoFallbackName: string
  }
}

// ------------------------------------------------------------
// El recorrido "definir" (pasos 2-6) como una lista de pantallas,
// una cosa por pantalla (nunca formulario). El cliente las recorre
// en orden y guarda cada respuesta por su id.
//
//   prompt    = una pregunta abierta (campo de texto). Guarda en
//               content[id].
//   proposito = la frase-norte destilada; preside el tablero.
//   frenos    = no guarda aquí: enlaza a la herramienta de máscaras
//               (el "freno" vive en mask_results) y vuelve.
//   paso      = dos campos (qué + cuándo). El "qué" hereda como
//               semilla lo que la persona escribió en su máscara.
// ------------------------------------------------------------
export const IKIBOARD_STEPS: IkiStep[] = [
  // --- El deseo abre el álbum. Fuente: Camina, ejercicio 1, pregunta 4. ---
  {
    id: 'deseo_reconocido',
    kind: 'prompt',
    section: 'La tierra deseada',
    title: '¿Qué deseo no te atreves a reconocer?',
    hint: 'Puede ser una forma de vivir, una relación, un proyecto, una casa, dinero, descanso o libertad. No tienes que justificarlo todavía.',
    placeholder: 'Lo que de verdad deseo es…',
  },
  {
    id: 'ya_no_representa',
    kind: 'prompt',
    section: 'La tierra deseada',
    title: '¿Qué funciona, pero ya no te representa?',
    hint: 'A veces lo que ocupa espacio en tu vida impide ver lo que deseas. Escríbelo para no llevarlo sin querer a tu álbum.',
    placeholder: 'Esto ya no me representa…',
    optional: true,
  },
  // --- Paso 2: Ver claro (las 4 miradas del propósito, una a una) ---
  {
    id: 'amas',
    kind: 'prompt',
    section: 'Ver claro',
    title: 'Lo que amas',
    hint: '¿Qué haces que se te pasa el tiempo sin darte cuenta? Eso que harías aunque nadie te pagara.',
    placeholder: 'Escribe lo que te venga, sin filtrar…',
  },
  {
    id: 'talento',
    kind: 'prompt',
    section: 'Ver claro',
    title: 'Lo que se te da bien',
    hint: 'Aquello que a ti te sale fácil y a otros les cuesta. Lo que la gente te reconoce o te pide.',
    placeholder: 'Escribe lo que te venga…',
  },
  {
    id: 'necesitan',
    kind: 'prompt',
    section: 'Ver claro',
    title: 'Lo que tu entorno necesita de ti',
    hint: 'Mira a tu alrededor: tu gente, tu trabajo, tu comunidad. ¿Qué falta que tú podrías aportar?',
    placeholder: 'Escribe lo que te venga…',
  },
  {
    id: 'sostiene',
    kind: 'prompt',
    section: 'Ver claro',
    title: 'Lo que puede sostenerte',
    hint: 'De todo lo anterior, ¿qué podría, además, darte de vivir? Es opcional: no todo tiene por qué hacerlo.',
    placeholder: 'Puedes dejarlo en blanco…',
    optional: true,
  },
  // --- Cierre del paso 2: destilar el norte ---
  {
    id: 'proposito',
    kind: 'proposito',
    section: 'Tu propósito',
    title: 'Tu propósito, en una frase',
    hint: 'Junta lo anterior en una sola frase, en positivo. No busques la perfecta: esta frase es tu camino de vuelta a ti, y presidirá tu tablero.',
    placeholder: 'Quiero…',
  },
  // --- Paso 3: Quién estás siendo (identidad / presente) ---
  {
    id: 'identidad',
    kind: 'prompt',
    section: 'Quién estás siendo',
    title: 'Estoy siendo alguien que…',
    hint: 'El propósito no se alcanza, se habita. No se trata de convertirte en otra persona, sino de ser más tú. Complétalo en presente.',
    placeholder: 'Estoy siendo alguien que…',
  },
  // --- Paso 4: Lo que das (el sello: recibir para compartir) ---
  {
    id: 'lo_que_das',
    kind: 'prompt',
    section: 'Lo que das',
    title: '¿Qué mejora a tu alrededor?',
    hint: 'Cuando tú caminas hacia esto, ¿a quién más le llega? ¿Qué reciben los demás de que tú seas así?',
    placeholder: 'Escribe lo que te venga…',
  },
  // --- Paso 5: Lo que te frena (enlaza a la herramienta de máscaras) ---
  {
    id: 'frenos',
    kind: 'frenos',
    section: 'Lo que te frena',
    title: 'Lo que hoy te detiene por dentro',
    hint: 'Para caminar hacia ahí, primero hay que ver qué te frena. No es una etiqueta: es un espejo.',
  },
  // --- Paso 6: El paso concreto (se pule en el mundo) ---
  {
    id: 'paso',
    kind: 'paso',
    section: 'Tu paso',
    title: 'Un paso concreto',
    hint: 'El propósito se pule en el mundo, no escondido en tu cabeza. No hace falta un plan: basta un gesto pequeño y cuándo lo darás.',
  },
]

// Mismo orden e ids que el canónico ES; solo cambian los textos visibles.
const IKIBOARD_STEPS_EN: IkiStep[] = [
  {
    id: 'deseo_reconocido',
    kind: 'prompt',
    section: 'The land you long for',
    title: 'What desire don’t you dare admit?',
    hint: 'It can be a way of living, a relationship, a project, a home, money, rest or freedom. You don’t have to justify it yet.',
    placeholder: 'What I truly want is…',
  },
  {
    id: 'ya_no_representa',
    kind: 'prompt',
    section: 'The land you long for',
    title: 'What works, but no longer represents you?',
    hint: 'Sometimes what fills your life keeps you from seeing what you want. Write it down so you don’t carry it into your album by accident.',
    placeholder: 'This no longer represents me…',
    optional: true,
  },
  {
    id: 'amas',
    kind: 'prompt',
    section: 'Seeing clearly',
    title: 'What you love',
    hint: 'What makes you lose track of time? The thing you’d do even if no one paid you.',
    placeholder: 'Write whatever comes, unfiltered…',
  },
  {
    id: 'talento',
    kind: 'prompt',
    section: 'Seeing clearly',
    title: 'What you’re good at',
    hint: 'What comes easily to you and is hard for others. What people recognise in you or ask of you.',
    placeholder: 'Write whatever comes…',
  },
  {
    id: 'necesitan',
    kind: 'prompt',
    section: 'Seeing clearly',
    title: 'What the people around you need from you',
    hint: 'Look around you: your people, your work, your community. What’s missing that you could bring?',
    placeholder: 'Write whatever comes…',
  },
  {
    id: 'sostiene',
    kind: 'prompt',
    section: 'Seeing clearly',
    title: 'What could sustain you',
    hint: 'Of all the above, what could also earn you a living? It’s optional: not everything has to.',
    placeholder: 'You can leave this blank…',
    optional: true,
  },
  {
    id: 'proposito',
    kind: 'proposito',
    section: 'Your purpose',
    title: 'Your purpose, in one sentence',
    hint: 'Bring the above together into a single, positive sentence. Don’t chase the perfect one: this sentence is your way back to yourself, and it will preside over your board.',
    placeholder: 'I want…',
  },
  {
    id: 'identidad',
    kind: 'prompt',
    section: 'Who you’re being',
    title: 'I’m being someone who…',
    hint: 'Purpose isn’t reached, it’s inhabited. It’s not about becoming someone else, but about being more you. Complete it in the present.',
    placeholder: 'I’m being someone who…',
  },
  {
    id: 'lo_que_das',
    kind: 'prompt',
    section: 'What you give',
    title: 'What improves around you?',
    hint: 'When you walk toward this, who else does it reach? What do others receive from you being this way?',
    placeholder: 'Write whatever comes…',
  },
  {
    id: 'frenos',
    kind: 'frenos',
    section: 'What holds you back',
    title: 'What stops you from within today',
    hint: 'To walk toward it, first you have to see what holds you back. It’s not a label: it’s a mirror.',
  },
  {
    id: 'paso',
    kind: 'paso',
    section: 'Your step',
    title: 'One concrete step',
    hint: 'Purpose is polished in the world, not hidden in your head. You don’t need a plan: just a small gesture and when you’ll make it.',
  },
]

const IKIBOARD_STEPS_CA: IkiStep[] = [
  {
    id: 'deseo_reconocido',
    kind: 'prompt',
    section: 'La terra desitjada',
    title: "Quin desig no t'atreveixes a reconèixer?",
    hint: "Pot ser una manera de viure, una relació, un projecte, una casa, diners, descans o llibertat. Encara no cal que ho justifiquis.",
    placeholder: 'El que de debò desitjo és…',
  },
  {
    id: 'ya_no_representa',
    kind: 'prompt',
    section: 'La terra desitjada',
    title: 'Què funciona, però ja no et representa?',
    hint: "De vegades el que ocupa espai a la teva vida impedeix veure el que desitges. Escriu-ho per no portar-ho sense voler al teu àlbum.",
    placeholder: 'Això ja no em representa…',
    optional: true,
  },
  {
    id: 'amas',
    kind: 'prompt',
    section: 'Veure clar',
    title: 'El que estimes',
    hint: "Què fas que se t'escapa el temps sense adonar-te'n? Allò que faries encara que ningú no et pagués.",
    placeholder: 'Escriu el que et vingui, sense filtrar…',
  },
  {
    id: 'talento',
    kind: 'prompt',
    section: 'Veure clar',
    title: "El que se't dona bé",
    hint: 'Allò que a tu et surt fàcil i als altres els costa. El que la gent et reconeix o et demana.',
    placeholder: 'Escriu el que et vingui…',
  },
  {
    id: 'necesitan',
    kind: 'prompt',
    section: 'Veure clar',
    title: "Què necessiten de tu els qui t'envolten",
    hint: 'Mira al teu voltant: la teva gent, la teva feina, la teva comunitat. Què falta que tu podries aportar?',
    placeholder: 'Escriu el que et vingui…',
  },
  {
    id: 'sostiene',
    kind: 'prompt',
    section: 'Veure clar',
    title: 'Què et podria sostenir',
    hint: "De tot l'anterior, què podria, a més, donar-te per viure? És opcional: no tot ho ha de fer.",
    placeholder: 'Ho pots deixar en blanc…',
    optional: true,
  },
  {
    id: 'proposito',
    kind: 'proposito',
    section: 'El teu propòsit',
    title: 'El teu propòsit, en una frase',
    hint: "Reuneix tot l'anterior en una sola frase positiva. No busquis la perfecta: aquesta frase és el teu camí de tornada a tu, i presidirà el teu tauler.",
    placeholder: 'Vull…',
  },
  {
    id: 'identidad',
    kind: 'prompt',
    section: 'Qui estàs sent',
    title: 'Estic sent algú que…',
    hint: "El propòsit no s'assoleix, s'habita. No es tracta de convertir-te en una altra persona, sinó de ser més tu. Completa-ho en present.",
    placeholder: 'Estic sent algú que…',
  },
  {
    id: 'lo_que_das',
    kind: 'prompt',
    section: 'El que dones',
    title: 'Què millora al teu voltant?',
    hint: 'Quan camines cap a això, a qui més arriba? Què reben els altres pel fet que tu siguis així?',
    placeholder: 'Escriu el que et vingui…',
  },
  {
    id: 'frenos',
    kind: 'frenos',
    section: 'Què et frena',
    title: "Què t'atura des de dins avui",
    hint: "Per caminar-hi, primer has de veure què et frena. No és una etiqueta: és un mirall.",
  },
  {
    id: 'paso',
    kind: 'paso',
    section: 'El teu pas',
    title: 'Un pas concret',
    hint: "El propòsit es poleix al món, no s'amaga al cap. No necessites un pla: només un gest petit i quan el faràs.",
  },
]

// Devuelve los pasos en el idioma del contenido (para PINTAR). La
// lógica del recorrido usa el canónico IKIBOARD_STEPS.
export function getIkiSteps(locale: string): IkiStep[] {
  const l = contentLang(locale)
  return l === 'en' ? IKIBOARD_STEPS_EN : l === 'ca' ? IKIBOARD_STEPS_CA : IKIBOARD_STEPS
}

// ------------------------------------------------------------
// FASE 2 — Las cuatro zonas del álbum. Orden de la rejilla 2×2:
// izquierda = te sostiene (recibir), derecha = compartes (dar).
// ------------------------------------------------------------
const IKIBOARD_AMBITOS_ES: IkiAmbito[] = [
  { id: 'cuerpo', label: 'Cuerpo y vida', hint: 'Tu salud, tu energía, tu ritmo, el descanso.' },
  { id: 'vinculos', label: 'Vínculos', hint: 'Amor, familia, amistad, tu comunidad.' },
  { id: 'material', label: 'Lo material', hint: 'Tu hogar, tu coche, tus medios, los lugares.' },
  { id: 'vocacion', label: 'Vocación', hint: 'Tu trabajo, tu proyecto, lo que aportas.' },
]

const IKIBOARD_AMBITOS_EN: IkiAmbito[] = [
  { id: 'cuerpo', label: 'Body & life', hint: 'Your health, your energy, your rhythm, rest.' },
  { id: 'vinculos', label: 'Bonds', hint: 'Love, family, friendship, your community.' },
  { id: 'material', label: 'The material', hint: 'Your home, your car, your means, places.' },
  { id: 'vocacion', label: 'Vocation', hint: 'Your work, your project, what you contribute.' },
]

const IKIBOARD_AMBITOS_CA: IkiAmbito[] = [
  { id: 'cuerpo', label: 'Cos i vida', hint: 'La teva salut, la teva energia, el teu ritme, el descans.' },
  { id: 'vinculos', label: 'Vincles', hint: 'Amor, família, amistat, la teva comunitat.' },
  { id: 'material', label: 'El material', hint: 'El teu habitatge, el teu cotxe, els teus mitjans, els llocs.' },
  { id: 'vocacion', label: 'Vocació', hint: 'La teva feina, el teu projecte, el que aportes.' },
]

export function getIkiAmbitos(locale: string): IkiAmbito[] {
  const l = contentLang(locale)
  return l === 'en' ? IKIBOARD_AMBITOS_EN : l === 'ca' ? IKIBOARD_AMBITOS_CA : IKIBOARD_AMBITOS_ES
}

// ------------------------------------------------------------
// El copy completo de la herramienta, en cada idioma.
// ------------------------------------------------------------
const COPY_ES: IkiboardCopy = {
  intro: {
    kicker: 'IKIBOARD',
    title: 'Encuentra lo que de verdad quieres',
    hook: 'No lo que deberías querer, ni lo que quieren los demás. Lo tuyo.',
    body: 'La mayoría de tableros son una lista de cosas que quieres tener. Este empieza por dentro: descubrir qué quieres de verdad, para ser la persona que ya eres cuando nadie te dice cómo ser.',
    cta: 'Empezar',
  },
  coordinates: {
    kicker: 'Tu punto de partida',
    title: 'Esto es lo que ya sabemos de ti',
    body: 'Usaremos lo que ya has descubierto. No tienes que repetir ninguna herramienta; puedes completar lo que falte ahora o continuar con lo que ya tienes.',
    paso: 'Cómo caminas',
    estrella: 'Cómo estás en el mundo',
    camino: 'Con qué capacidades cuentas',
    mascara: 'Qué puede frenarte',
    ready: 'Ya disponible',
    missing: 'Por descubrir',
    continue: 'Continuar con mi mapa',
  },
  frenos: {
    body: 'Descúbrelo con el espejo de las máscaras. Al terminar, vuelves aquí con tu resultado.',
    cta: 'Descubrir qué me frena',
    ctaHecho: 'Repasar mi máscara',
    yaTienes: 'Ya conoces la máscara que hoy más te gobierna:',
  },
  paso: {
    queLabel: 'Mi paso',
    quePlaceholder: 'Esta semana voy a…',
    cuandoLabel: 'Cuándo',
    cuandoPlaceholder: 'El martes por la mañana / cuando llegue a casa…',
    semilla: 'Lo trajiste de tu máscara. Ajústalo si quieres.',
  },
  definido: {
    kicker: 'El camino para volver a ti',
    title: 'Has puesto en palabras lo que de verdad quieres',
    body: 'Esto es la raíz. Ahora la haces imagen: montas el álbum del futuro de tu vida para tenerlo delante cada día.',
    cta: 'Montar mi álbum',
  },
  borrador: {
    kicker: 'Tu borrador',
    title: 'Lo que tus respuestas dibujan de ti',
    sub: 'No lo he inventado: sale de cruzar cómo eres, lo que se te da bien y lo que hoy te frena.',
    identidadLabel: 'Quién estás siendo',
    vocacionLabel: 'Tu terreno para aportar',
    vocacionEjemplo: 'Antes que tú lo encarnó',
    instruccionesLabel: 'Para seguir tu camino',
    faltanTitle: 'Para completar tu retrato',
    faltanSub: 'Cada pieza afina el cruce. Puedes hacerlas ahora o volver más tarde.',
    estrellaCta: 'Descubrir tu estilo (Las cuatro estrellas)',
    estrellaHecho: 'Tu estilo',
    caminoCta: 'Descubrir tus capacidades (Test CAMINO)',
    caminoHecho: 'Tus capacidades',
  },
  board: {
    kicker: 'El álbum del futuro de tu vida',
    title: 'La vida que ya estás viviendo',
    sub: 'Cada zona es una página. Míralas juntas: cuánto de cerca estás en cada parte de tu vida.',
    proposito: 'Tu propósito',
    empty: 'Aún no has puesto ninguna foto aquí.',
    add: 'Añadir una foto',
    addTitle: 'Una foto de tu vida',
    iconLabel: 'Elige una imagen',
    fraseLabel: 'En presente',
    frasePlaceholder: 'Vivo… / Ya soy…',
    fraseHint: 'No el objeto: quién eres cuando ya lo vives.',
    doyLabel: '¿Qué doy con esto?',
    doyPlaceholder: 'A quién le llega, qué mejora alrededor…',
    doyHint: 'Lo que te sostiene, atravesado hacia fuera.',
    save: 'Ponerla en el álbum',
    remove: 'Quitar',
    back: 'Volver al álbum',
    cercaniaLabel: '¿Cuánto la vives ya?',
    estados: {
      lejos: 'Aún lejos',
      en_proceso: 'La voy viviendo',
      conseguido: 'Ya es mía',
    },
    zonaResumen: 'de cerca',
    zonaVacia: 'Sin fotos aún',
    motor: 'Lo que mueve tu álbum',
    frenoLabel: 'Lo que hoy te frena',
    frenoVacio: 'Aún por descubrir',
    pasoLabel: 'Tu paso',
    pasoVacio: 'Aún sin definir',
    priority: 'Mi escena ahora',
    makePriority: 'Mover esta escena',
    evolution: 'Tu álbum hoy',
    farCount: 'aún lejos',
    processCount: 'tomando forma',
    achievedCount: 'ya en tu vida',
    repasar: 'Repasar mi propósito',
  },
  ui: {
    navBack: '← Atrás',
    navFinish: 'Terminar',
    navSkip: 'Saltar',
    navNext: 'Seguir',
    donePropositoLabel: 'Tu propósito',
    doneReview: 'Repasar lo que definí',
    borradorPasoLabel: 'Cómo caminas',
    borradorSeedDone: '✓ Ya hay una escena en Vocación',
    borradorSeedCta: 'Usar como borrador en mi álbum',
    seedTmpl: (x: string) => `Estoy explorando ${x}.`,
    frenoMiedoLabel: 'El miedo detrás:',
    boardAddShort: '+ Añadir',
    boardVerMapa: 'Ver y descargar mi mapa',
    boardDoyPrefix: 'Doy:',
    toolPaso: 'PASO',
    toolEstrella: 'Las cuatro estrellas',
    toolCamino: 'CAMINO',
    toolMascara: 'Máscaras',
    addModeIcon: 'Elegir icono',
    addModePhoto: 'Subir mi foto',
    addCancel: 'Cancelar',
    addSaving: 'Guardando…',
    addSaveError: 'No se ha podido guardar. Tu escena sigue aquí para que puedas intentarlo de nuevo.',
    photoFormatError: 'Formato no admitido. Usa una imagen JPG, PNG, WEBP o HEIC.',
    photoSizeError: 'La imagen supera los 8 MB. Prueba con una más ligera.',
    mapBack: '← Volver al álbum',
    mapSavePdf: 'Guardar en PDF',
    mapKicker: 'IKIBOARD',
    mapTitle: 'Tu mapa para volver a ti',
    mapSub: 'Tu álbum muestra la vida que ansías. Este mapa recoge desde dónde partes y qué puede ayudarte a recorrerla.',
    mapSecAnsias: 'La vida que verdaderamente ansías',
    mapPropositoInline: 'Tu propósito:',
    mapSecPartes: 'Desde dónde partes',
    mapLblComoCaminas: 'Cómo caminas',
    mapLblComoEstas: 'Cómo estás en el mundo',
    mapLblTerreno: 'Un terreno que podrías explorar',
    mapReferentePrefix: 'Referente:',
    mapLblDesviarte: 'Qué puede desviarte',
    mapSecAlbum: 'El álbum del futuro de tu vida',
    mapAunPorDibujar: 'Aún por dibujar.',
    mapSecRuta: 'Tu ruta de inicio',
    mapLblEscena: 'La escena que estás moviendo',
    mapLblGesto: 'Tu próximo gesto',
    mapLblFreno: 'Cuando aparezca el freno',
    mapReconoceTmpl: (name: string) => `Reconoce a ${name} antes de que decida por ti.`,
    mapRutaVacia: 'Elige en tu álbum una sola escena para empezar a moverla.',
    mapFooter: 'Este mapa es un espejo y una dirección posible. Tú eliges el destino y corriges el camino cuando deje de representarte.',
    pasoFallbackName: 'Tu forma de caminar',
  },
}

const COPY_EN: IkiboardCopy = {
  intro: {
    kicker: 'IKIBOARD',
    title: 'Find what you truly want',
    hook: 'Not what you should want, nor what others want. What’s yours.',
    body: 'Most vision boards are a list of things you want to have. This one starts from within: discovering what you truly want, so you can be the person you already are when no one tells you how to be.',
    cta: 'Start',
  },
  coordinates: {
    kicker: 'Your starting point',
    title: 'This is what we already know about you',
    body: 'We’ll use what you’ve already discovered. You don’t have to repeat any tool; you can complete what’s missing now or continue with what you already have.',
    paso: 'How you walk',
    estrella: 'How you are in the world',
    camino: 'What capabilities you have',
    mascara: 'What can hold you back',
    ready: 'Available',
    missing: 'Discover',
    continue: 'Continue with my map',
  },
  frenos: {
    body: 'Discover it with the mirror of the masks. When you finish, you come back here with your result.',
    cta: 'Discover what holds me back',
    ctaHecho: 'Review my mask',
    yaTienes: 'You already know the mask that most governs you today:',
  },
  paso: {
    queLabel: 'My step',
    quePlaceholder: 'This week I’m going to…',
    cuandoLabel: 'When',
    cuandoPlaceholder: 'Tuesday morning / when I get home…',
    semilla: 'You brought this from your mask. Adjust it if you like.',
  },
  definido: {
    kicker: 'The way back to yourself',
    title: 'You’ve put into words what you truly want',
    body: 'This is the root. Now you make it image: you build the album of your life to come, to have it before you every day.',
    cta: 'Build my album',
  },
  borrador: {
    kicker: 'Your draft',
    title: 'What your answers draw of you',
    sub: 'I didn’t invent it: it comes from crossing how you are, what you’re good at, and what holds you back today.',
    identidadLabel: 'Who you’re being',
    vocacionLabel: 'Your ground to contribute',
    vocacionEjemplo: 'Someone embodied it before you',
    instruccionesLabel: 'To follow your path',
    faltanTitle: 'To complete your portrait',
    faltanSub: 'Each piece sharpens the crossing. You can do them now or come back later.',
    estrellaCta: 'Discover your style (The Four Stars)',
    estrellaHecho: 'Your style',
    caminoCta: 'Discover your capabilities (CAMINO test)',
    caminoHecho: 'Your capabilities',
  },
  board: {
    kicker: 'The album of your life to come',
    title: 'The life you’re already living',
    sub: 'Each zone is a page. See them together: how close you are in each part of your life.',
    proposito: 'Your purpose',
    empty: 'You haven’t placed any photo here yet.',
    add: 'Add a photo',
    addTitle: 'A photo of your life',
    iconLabel: 'Choose an image',
    fraseLabel: 'In the present',
    frasePlaceholder: 'I live… / I already am…',
    fraseHint: 'Not the object: who you are when you already live it.',
    doyLabel: 'What do I give with this?',
    doyPlaceholder: 'Who it reaches, what improves around you…',
    doyHint: 'What sustains you, turned outward.',
    save: 'Put it in the album',
    remove: 'Remove',
    back: 'Back to the album',
    cercaniaLabel: 'How much do you live it already?',
    estados: {
      lejos: 'Still far',
      en_proceso: 'I’m living into it',
      conseguido: 'It’s already mine',
    },
    zonaResumen: 'lived',
    zonaVacia: 'No photos yet',
    motor: 'What moves your album',
    frenoLabel: 'What holds you back today',
    frenoVacio: 'Not discovered yet',
    pasoLabel: 'Your step',
    pasoVacio: 'Not defined yet',
    priority: 'My scene now',
    makePriority: 'Move this scene',
    evolution: 'Your album today',
    farCount: 'still far',
    processCount: 'taking shape',
    achievedCount: 'already in your life',
    repasar: 'Review my purpose',
  },
  ui: {
    navBack: '← Back',
    navFinish: 'Finish',
    navSkip: 'Skip',
    navNext: 'Continue',
    donePropositoLabel: 'Your purpose',
    doneReview: 'Review what I defined',
    borradorPasoLabel: 'How you walk',
    borradorSeedDone: '✓ There’s already a scene in Vocation',
    borradorSeedCta: 'Use as a draft in my album',
    seedTmpl: (x: string) => `I’m exploring ${x}.`,
    frenoMiedoLabel: 'The fear behind it:',
    boardAddShort: '+ Add',
    boardVerMapa: 'See and download my map',
    boardDoyPrefix: 'I give:',
    toolPaso: 'PASO',
    toolEstrella: 'The Four Stars',
    toolCamino: 'CAMINO',
    toolMascara: 'Masks',
    addModeIcon: 'Choose icon',
    addModePhoto: 'Upload my photo',
    addCancel: 'Cancel',
    addSaving: 'Saving…',
    addSaveError: 'Couldn’t save. Your scene is still here so you can try again.',
    photoFormatError: 'Unsupported format. Use a JPG, PNG, WEBP or HEIC image.',
    photoSizeError: 'The image exceeds 8 MB. Try a lighter one.',
    mapBack: '← Back to the album',
    mapSavePdf: 'Save as PDF',
    mapKicker: 'IKIBOARD',
    mapTitle: 'Your map back to yourself',
    mapSub: 'Your album shows the life you long for. This map gathers where you start from and what can help you walk it.',
    mapSecAnsias: 'The life you truly long for',
    mapPropositoInline: 'Your purpose:',
    mapSecPartes: 'Where you start from',
    mapLblComoCaminas: 'How you walk',
    mapLblComoEstas: 'How you are in the world',
    mapLblTerreno: 'A field you could explore',
    mapReferentePrefix: 'Reference:',
    mapLblDesviarte: 'What can throw you off',
    mapSecAlbum: 'The album of your life to come',
    mapAunPorDibujar: 'Not drawn yet.',
    mapSecRuta: 'Your starting route',
    mapLblEscena: 'The scene you’re moving',
    mapLblGesto: 'Your next move',
    mapLblFreno: 'When the block shows up',
    mapReconoceTmpl: (name: string) => `Recognise ${name} before it decides for you.`,
    mapRutaVacia: 'Choose a single scene in your album to start moving it.',
    mapFooter: 'This map is a mirror and a possible direction. You choose the destination and correct the path when it no longer represents you.',
    pasoFallbackName: 'Your way of walking',
  },
}

const COPY_CA: IkiboardCopy = {
  intro: {
    kicker: 'IKIBOARD',
    title: 'Troba el que de debò vols',
    hook: "No el que hauries de voler, ni el que volen els altres. El que és teu.",
    body: "La majoria dels taulers de visió són una llista de coses que vols tenir. Aquest comença per dins: descobrir el que de debò vols, perquè puguis ser la persona que ja ets quan ningú no et diu com has de ser.",
    cta: 'Comença',
  },
  coordinates: {
    kicker: 'El teu punt de partida',
    title: 'Això és el que ja sabem de tu',
    body: "Farem servir el que ja has descobert. No cal que repeteixis cap eina; pots completar el que et falta ara o continuar amb el que ja tens.",
    paso: 'Com camines',
    estrella: 'Com ets en el món',
    camino: 'Quines capacitats tens',
    mascara: 'Què et pot frenar',
    ready: 'Disponible',
    missing: 'Descobreix',
    continue: 'Continua amb el meu mapa',
  },
  frenos: {
    body: "Descobreix-ho amb el mirall de les màscares. Quan acabis, tornes aquí amb el teu resultat.",
    cta: 'Descobreix què em frena',
    ctaHecho: 'Revisa la meva màscara',
    yaTienes: 'Ja saps quina màscara et governa més avui:',
  },
  paso: {
    queLabel: 'El meu pas',
    quePlaceholder: 'Aquesta setmana faré…',
    cuandoLabel: 'Quan',
    cuandoPlaceholder: 'Dimarts al matí / quan arribi a casa…',
    semilla: 'Ho has portat de la teva màscara. Ajusta-ho si vols.',
  },
  definido: {
    kicker: 'El camí de tornada a tu',
    title: 'Has posat en paraules el que de debò vols',
    body: "Aquesta és l'arrel. Ara la converteixes en imatge: construeixes l'àlbum de la teva vida que ve, per tenir-lo davant cada dia.",
    cta: 'Construeix el meu àlbum',
  },
  borrador: {
    kicker: 'El teu esborrany',
    title: 'El que dibuixen les teves respostes de tu',
    sub: "No me l'he inventat: surt de creuar com ets, en què ets bo i què et frena avui.",
    identidadLabel: 'Qui estàs sent',
    vocacionLabel: 'El teu terreny per aportar',
    vocacionEjemplo: 'Algú ho va encarnar abans que tu',
    instruccionesLabel: 'Per seguir el teu camí',
    faltanTitle: 'Per completar el teu retrat',
    faltanSub: 'Cada peça afina el creuament. Les pots fer ara o tornar-hi més tard.',
    estrellaCta: 'Descobreix el teu estil (Els quatre estels)',
    estrellaHecho: 'El teu estil',
    caminoCta: 'Descobreix les teves capacitats (Test CAMINO)',
    caminoHecho: 'Les teves capacitats',
  },
  board: {
    kicker: "L'àlbum de la teva vida que ve",
    title: 'La vida que ja estàs vivint',
    sub: 'Cada zona és una pàgina. Mira-les juntes: com de prop estàs de cadascuna a la teva vida.',
    proposito: 'El teu propòsit',
    empty: "Encara no hi has posat cap foto.",
    add: 'Afegeix una foto',
    addTitle: 'Una foto de la teva vida',
    iconLabel: 'Tria una imatge',
    fraseLabel: 'En present',
    frasePlaceholder: 'Visc… / Ja soc…',
    fraseHint: "No l'objecte: qui ets quan ja ho vius.",
    doyLabel: 'Què dono amb això?',
    doyPlaceholder: 'A qui arriba, què millora al teu voltant…',
    doyHint: 'El que et sosté, girat cap enfora.',
    save: "Posa-ho a l'àlbum",
    remove: 'Treure',
    back: "Torna a l'àlbum",
    cercaniaLabel: 'Quant ho vius ja?',
    estados: {
      lejos: 'Encara lluny',
      en_proceso: 'Ho estic vivint',
      conseguido: 'Ja és meu',
    },
    zonaResumen: 'viscut',
    zonaVacia: 'Encara cap foto',
    motor: 'Què mou el teu àlbum',
    frenoLabel: 'Què et frena avui',
    frenoVacio: 'Encara no descobert',
    pasoLabel: 'El teu pas',
    pasoVacio: 'Encara no definit',
    priority: 'La meva escena ara',
    makePriority: 'Mou aquesta escena',
    evolution: 'El teu àlbum avui',
    farCount: 'encara lluny',
    processCount: 'prenent forma',
    achievedCount: 'ja a la teva vida',
    repasar: 'Repassa el meu propòsit',
  },
  ui: {
    navBack: '← Enrere',
    navFinish: 'Acabar',
    navSkip: 'Saltar',
    navNext: 'Continuar',
    donePropositoLabel: 'El teu propòsit',
    doneReview: 'Repassa el que he definit',
    borradorPasoLabel: 'Com camines',
    borradorSeedDone: '✓ Ja hi ha una escena a Vocació',
    borradorSeedCta: "Fes-la servir d'esborrany al meu àlbum",
    seedTmpl: (x: string) => `Estic explorant ${x}.`,
    frenoMiedoLabel: 'La por que hi ha darrere:',
    boardAddShort: '+ Afegeix',
    boardVerMapa: 'Veure i descarregar el meu mapa',
    boardDoyPrefix: 'Dono:',
    toolPaso: 'PASO',
    toolEstrella: 'Els quatre estels',
    toolCamino: 'CAMINO',
    toolMascara: 'Màscares',
    addModeIcon: 'Tria icona',
    addModePhoto: 'Puja la meva foto',
    addCancel: 'Cancel·la',
    addSaving: 'Desant…',
    addSaveError: "No s'ha pogut desar. La teva escena encara és aquí perquè ho tornis a provar.",
    photoFormatError: 'Format no admès. Fes servir una imatge JPG, PNG, WEBP o HEIC.',
    photoSizeError: "La imatge supera els 8 MB. Prova'n una de més lleugera.",
    mapBack: "← Torna a l'àlbum",
    mapSavePdf: 'Desar en PDF',
    mapKicker: 'IKIBOARD',
    mapTitle: 'El teu mapa de tornada a tu',
    mapSub: "El teu àlbum mostra la vida que desitges. Aquest mapa reuneix d'on parteixes i què et pot ajudar a caminar-la.",
    mapSecAnsias: 'La vida que de debò desitges',
    mapPropositoInline: 'El teu propòsit:',
    mapSecPartes: "D'on parteixes",
    mapLblComoCaminas: 'Com camines',
    mapLblComoEstas: 'Com ets en el món',
    mapLblTerreno: 'Un terreny que podries explorar',
    mapReferentePrefix: 'Referent:',
    mapLblDesviarte: 'Què et pot desviar',
    mapSecAlbum: "L'àlbum de la teva vida que ve",
    mapAunPorDibujar: 'Encara per dibuixar.',
    mapSecRuta: 'La teva ruta de partida',
    mapLblEscena: "L'escena que mous",
    mapLblGesto: 'El teu següent gest',
    mapLblFreno: 'Quan apareix el bloqueig',
    mapReconoceTmpl: (name: string) => `Reconeix ${name} abans que decideixi per tu.`,
    mapRutaVacia: 'Tria una sola escena del teu àlbum per començar a moure-la.',
    mapFooter: 'Aquest mapa és un mirall i una direcció possible. Tu tries el destí i corregeixes el camí quan ja no et representa.',
    pasoFallbackName: 'La teva manera de caminar',
  },
}

// Devuelve todo el copy de IKIBOARD en el idioma del contenido.
export function getIkiboardCopy(locale: string): IkiboardCopy {
  const l = contentLang(locale)
  return l === 'en' ? COPY_EN : l === 'ca' ? COPY_CA : COPY_ES
}
