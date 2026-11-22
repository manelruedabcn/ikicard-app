// ============================================================
// TEST FOCO — textos visibles (ES / CA / EN).
//
// Fuente: el test FOCO cerrado con Manel el 01/11/2026 (castellano,
// textos sencillos, válidos para hombre y mujer). El catalán y el
// inglés son traducción fiel de ese castellano: mismas frases, mismo
// nivel de lenguaje. La lógica vive en lib/foco.ts; aquí solo hay
// texto, ordenado por los mismos códigos.
// ============================================================

import { contentLang } from './content-locale'
import type { FocoDim, FocoInteg, FocoZone } from './foco'

interface DimZone { z: string; f: string; x: string; o: string }
interface DimText { name: string; a: string; b: string; zones: Record<FocoZone, DimZone> }
interface ProfileText { t: string; l: string; ct: string; c: string[] }
interface IntegText { z: string; t: string; s: string[] }

export interface FocoCopy {
  eyebrow: string
  title: [string, string]
  lead: string
  body: string
  intro: { name: string; q: string }[]
  start: string
  meta: string
  question: (n: number, total: number) => string
  back: string
  hint: string
  scale: string[]
  resultEyebrow: string
  culpaEyebrow: string
  mapTitle: string
  mapSub: string
  easy: string
  hard: string
  tryThis: string
  keepBalance: string
  integTitle: string
  integSub: string
  integName: string
  integPoles: [string, string]
  principio: string[]
  practica: string
  next: { href: string; title: string; text: string }[]
  copy: string
  copied: string
  copyFail: string
  again: string
  saved: string
  footer: string
  summary: (profile: string, lines: string[], integ: string, ct: string) => string
  dims: Record<FocoDim, DimText>
  profiles: Record<FocoZone, ProfileText>
  integ: Record<FocoInteg, IntegText>
  questions: string[]
}

const ES: FocoCopy = {
  eyebrow: 'Test FOCO · gratis',
  title: ['¿Eres de una cosa', 'o de muchas?'],
  lead: 'Hay personas que disfrutan haciendo una sola cosa muy bien. Y otras que disfrutan haciendo muchas cosas distintas. Las dos formas están bien.',
  body: 'Este test te dice cuál es la tuya. Y te dice tres cosas más: qué te sale fácil, qué te cuesta y qué puedes probar.',
  intro: [
    { name: 'Lo que te gusta', q: '¿Una cosa muy a fondo o muchas cosas distintas?' },
    { name: 'Cuando cambias de tarea', q: '¿Te cansa o te da energía?' },
    { name: 'Cómo trabajas', q: '¿Una cosa detrás de otra o varias a la vez?' },
    { name: 'Cómo te presentas', q: '¿Dices «soy esto» o «soy muchas cosas»?' },
    { name: 'Cómo lo llevas', q: '¿Terminas lo que empiezas? ¿Enseñas lo que haces?' },
  ],
  start: 'EMPEZAR EL TEST',
  meta: '25 preguntas · 5 minutos · sin registro · resultado al instante',
  question: (n, total) => `Pregunta ${n} de ${total}`,
  back: '← Anterior',
  hint: 'No hay respuestas buenas ni malas.',
  scale: ['No, nada', 'Un poco', 'A veces', 'Bastante', 'Sí, mucho'],
  resultEyebrow: 'Tu resultado · Test FOCO',
  culpaEyebrow: 'Esto no es un defecto',
  mapTitle: 'Tu mapa',
  mapSub: 'Cada línea va de un lado a otro. El punto marca dónde estás tú hoy. Ningún lado es mejor que el otro.',
  easy: 'Te sale fácil',
  hard: 'Te cuesta',
  tryThis: 'Prueba esto',
  keepBalance: 'Para seguir en equilibrio',
  integTitle: 'Cómo lo llevas',
  integSub: 'No importa de qué lado eres. Lo que importa es si terminas lo que empiezas y si enseñas lo que haces.',
  integName: 'Tu forma de llevarlo',
  integPoles: ['Me pesa', 'Lo llevo bien'],
  principio: ['No te quedes en un extremo.', 'Tu fuerza está en tu lado.', 'Para crecer, mira hacia el otro.'],
  practica: 'Práctica ikigaier',
  next: [
    { href: '/es/paso', title: 'Test PASO', text: 'Descubre cómo caminas por la vida.' },
    { href: 'https://www.ikigaier.com/es/libros/', title: 'Los libros', text: 'Un camino en tres libros: liberar, actuar y alinear.' },
    { href: 'https://www.ikigaier.com/es/talleres/', title: 'Los talleres', text: 'Presenciales u online, para ti o para tu equipo.' },
  ],
  copy: 'Copiar mi resultado',
  copied: 'Resultado copiado. Ya puedes pegarlo donde quieras.',
  copyFail: 'No se ha podido copiar automáticamente en este navegador.',
  again: 'Repetir el test',
  saved: 'Guardado en tu cuenta.',
  footer: 'FOCO es un test para conocerte mejor. No es un test médico.',
  summary: (p, lines, integ, ct) =>
    `Mi resultado en el Test FOCO (práctica ikigaier): ${p}.\n${lines.map(l => `· ${l}`).join('\n')}\n· Cómo lo llevo: ${integ}\n«${ct}»`,
  dims: {
    int: {
      name: 'Lo que te gusta', a: 'Una cosa a fondo', b: 'Muchas cosas',
      zones: {
        A: { z: 'Una cosa a fondo', f: 'Aprender cada vez más de tu tema. Ser la persona a la que todos preguntan.', x: 'Tener que saltar de un tema a otro todo el rato.', o: 'Prueba algo nuevo una hora a la semana. Algo que no tenga nada que ver con lo tuyo. Te puede dar ideas.' },
        M: { z: 'Un poco de las dos', f: 'Tienes un tema tuyo y también curiosidad por otros.', x: 'Que te obliguen a elegir solo un lado.', o: 'Cuida tu tema principal. Y no dejes de probar cosas nuevas.' },
        B: { z: 'Muchas cosas', f: 'Descubrir cosas nuevas y unir ideas que vienen de sitios distintos.', x: 'Sentir que no dominas nada a fondo.', o: 'Elige una o dos cosas y apréndelas más a fondo. Eso hace más fuerte todo lo demás.' },
      },
    },
    ene: {
      name: 'Cuando cambias de tarea', a: 'Me cansa', b: 'Me da energía',
      zones: {
        A: { z: 'Te cansa cambiar', f: 'Estar mucho rato con una sola tarea, sin que nadie te moleste.', x: 'Las interrupciones y los días llenos de cosas cortitas.', o: 'Practica cambios pequeños. Por ejemplo, una pausa corta o una tarea distinta al final del día.' },
        M: { z: 'Te adaptas', f: 'Puedes estar mucho rato con algo y también cambiar si hace falta.', x: 'Los días de hacer siempre lo mismo y los días de saltar sin parar.', o: 'Fíjate en qué te da energía y qué te la quita. Y elige.' },
        B: { z: 'Te da energía', f: 'Los días variados. Cambiar de tarea te despierta.', x: 'Las tareas largas que se repiten.', o: 'Una vez al día, prueba a hacer una sola cosa durante 45 minutos, sin cambiar. Luego mira cómo te has sentido y cuánto has avanzado.' },
      },
    },
    rit: {
      name: 'Cómo trabajas', a: 'Una detrás de otra', b: 'Varias a la vez',
      zones: {
        A: { z: 'Una detrás de otra', f: 'Hacer una cosa, acabarla bien y pasar a la siguiente.', x: 'Tener muchas cosas abiertas a la vez.', o: 'Ten un segundo proyecto pequeño, sin prisa. A veces ayuda a desatascar el principal.' },
        M: { z: 'Por temporadas', f: 'Ir a tope con un proyecto un tiempo y luego cambiar a otro.', x: 'Hacerlo todo a la vez, o no poder cambiar cuando ya te has cansado.', o: 'Pon fecha de inicio y de final a cada temporada. Así cambias porque lo decides, no porque huyes.' },
        B: { z: 'Varias a la vez', f: 'Llevar varios proyectos que se ayudan entre ellos.', x: 'Que te obliguen a hacer solo una cosa. Y también tener tantas cosas que ninguna avanza.', o: 'Elige 1 o 2 proyectos principales y termínalos. Los demás, apúntalos en una lista para más adelante.' },
      },
    },
    ide: {
      name: 'Cómo te presentas', a: 'Soy esto', b: 'Soy muchas cosas',
      zones: {
        A: { z: 'Soy esto', f: 'Saber muy bien quién eres en tu trabajo.', x: 'Los cambios grandes, como cambiar de empresa o jubilarte. Puedes sentir que ya no sabes quién eres.', o: 'Piensa en una o dos cosas que eres además de tu trabajo. Tú eres más que tu profesión.' },
        M: { z: 'Uno principal y más', f: 'Tienes una cosa principal y otras alrededor.', x: 'Cuando algo nuevo pide más espacio y no sabes dónde ponerlo.', o: 'De vez en cuando, mira si cómo te presentas sigue siendo verdad hoy.' },
        B: { z: 'Soy muchas cosas', f: 'Juntar mundos distintos. Ser quien conecta cosas que otros no ven juntas.', x: 'Cuando te preguntan «¿a qué te dedicas?». Sientes que no encajas en ninguna caja.', o: 'Busca lo que une todo lo que haces y ponle un nombre. Así es fácil explicar quién eres.' },
      },
    },
  },
  profiles: {
    A: { t: 'Eres de una cosa', l: 'Te gusta ir a fondo y aprender mucho de un tema. A esto se le llama ser especialista.', ct: 'No te cierras. Vas a fondo.',
      c: ['A lo mejor te han dicho que solo sabes de lo tuyo. Y has sentido que tenías menos creatividad que otras personas.', 'Saber mucho de algo es muy valioso. No tienes que cambiar. Solo abre alguna ventana de vez en cuando.'] },
    M: { t: 'Eres de las dos', l: 'Tienes un tema tuyo y también curiosidad por otros. Según el momento, vas a fondo o pruebas cosas nuevas.', ct: 'No te falta decisión. Eres un puente.',
      c: ['A lo mejor has sentido que no eras ni una cosa ni la otra.', 'Estar en medio es una ventaja: entiendes a los dos lados. Solo tienes que elegir cuándo ir a fondo y cuándo abrirte.'] },
    B: { t: 'Eres de muchas cosas', l: 'Te gustan muchos temas y pasar de uno a otro te da energía. A esto se le llama ser multipotencial.', ct: 'No te falta foco. Tu foco se mueve.',
      c: ['A lo mejor te han dicho que te dispersas. Que te centres en una cosa y punto. A lo mejor hasta has escondido lo que haces.', 'Tener muchos intereses no es un fallo. Es tu forma de ser. No tienes que apagar tu curiosidad. Solo necesitas ordenarla.'] },
  },
  integ: {
    L: { z: 'Te pesa', t: 'Ahora mismo te cuesta. Tienes cosas a medias o escondes parte de lo que haces. No es culpa tuya: muchas veces pasa por intentar ser como los demás esperan.',
      s: ['Elige una sola cosa y termínala este mes. Aunque sea pequeña.', 'Escribe todo lo que tienes empezado. Lo que no toca ahora, déjalo para luego, sin culpa.', 'Cuéntale a alguien de confianza algo que haces y que no sueles contar.'] },
    M: { z: 'Vas bien', t: 'Lo llevas bastante bien. Todavía hay cosas a medias o partes de ti que no enseñas.',
      s: ['Una vez a la semana, decide qué es lo más importante.', 'Celebra lo que terminas, no solo lo que empiezas.', 'Prueba a contar algo de ti que normalmente callas.'] },
    H: { z: 'Lo llevas bien', t: 'Terminas lo importante y enseñas lo que haces sin miedo.',
      s: ['Sigue revisando tus proyectos para que no se te acumulen.', 'Cuenta cómo te organizas. Puede ayudar a otras personas.', 'De vez en cuando, prueba lo que hace el otro lado de tu mapa.'] },
  },
  questions: [
    'Me gustan cosas muy diferentes. Por ejemplo, la cocina y la música, o los números y el arte.',
    'Cuando cambio de tarea, me siento con más energía.',
    'Tengo varios proyectos empezados al mismo tiempo.',
    'Si me preguntan «¿a qué te dedicas?», no me basta con una sola respuesta.',
    'Termino las cosas que me importan.',
    'Prefiero saber mucho de una cosa que un poco de muchas.',
    'Si me interrumpen, me cuesta volver a lo que estaba haciendo.',
    'Me gusta acabar una cosa antes de empezar otra.',
    'Mi trabajo dice muy bien quién soy.',
    'Tengo cosas empezadas que llevan mucho tiempo paradas.',
    'Cuando descubro algo nuevo, quiero aprenderlo enseguida.',
    'Si hago lo mismo mucho rato, me aburro, aunque me guste.',
    'Pasar de un proyecto a otro me da ideas nuevas.',
    'Soy muchas cosas a la vez, no solo una.',
    'Hablo de todo lo que hago, aunque no tenga que ver con mi trabajo.',
    'Me gusta ser la persona que más sabe de un tema.',
    'Trabajo mejor si puedo estar horas con la misma tarea.',
    'Tener muchas cosas a medias me agobia.',
    'Me gusta que me conozcan por una sola cosa.',
    'Alguna vez he escondido algo que hago para que no me critiquen.',
    'Lo que me gusta ha cambiado mucho con los años.',
    'Un día con tareas variadas me cansa menos que un día con una sola tarea.',
    'Me organizo mejor con varios proyectos que con uno solo.',
    'Mezclar cosas distintas es lo que me hace especial.',
    'Sé qué es lo más importante ahora y qué puede esperar.',
  ],
}

const CA: FocoCopy = {
  eyebrow: 'Test FOCO · gratuït',
  title: ['Ets d’una cosa', 'o de moltes?'],
  lead: 'Hi ha persones que gaudeixen fent una sola cosa molt bé. I d’altres que gaudeixen fent moltes coses diferents. Les dues maneres estan bé.',
  body: 'Aquest test et diu quina és la teva. I et diu tres coses més: què et surt fàcil, què et costa i què pots provar.',
  intro: [
    { name: 'El que t’agrada', q: 'Una cosa molt a fons o moltes coses diferents?' },
    { name: 'Quan canvies de tasca', q: 'Et cansa o et dona energia?' },
    { name: 'Com treballes', q: 'Una cosa darrere l’altra o diverses alhora?' },
    { name: 'Com et presentes', q: 'Dius «soc això» o «soc moltes coses»?' },
    { name: 'Com ho portes', q: 'Acabes el que comences? Ensenyes el que fas?' },
  ],
  start: 'COMENÇAR EL TEST',
  meta: '25 preguntes · 5 minuts · sense registre · resultat a l’instant',
  question: (n, total) => `Pregunta ${n} de ${total}`,
  back: '← Anterior',
  hint: 'No hi ha respostes bones ni dolentes.',
  scale: ['No, gens', 'Una mica', 'De vegades', 'Força', 'Sí, molt'],
  resultEyebrow: 'El teu resultat · Test FOCO',
  culpaEyebrow: 'Això no és un defecte',
  mapTitle: 'El teu mapa',
  mapSub: 'Cada línia va d’un costat a l’altre. El punt marca on ets tu avui. Cap costat és millor que l’altre.',
  easy: 'Et surt fàcil',
  hard: 'Et costa',
  tryThis: 'Prova això',
  keepBalance: 'Per seguir en equilibri',
  integTitle: 'Com ho portes',
  integSub: 'No importa de quin costat ets. El que importa és si acabes el que comences i si ensenyes el que fas.',
  integName: 'La teva manera de portar-ho',
  integPoles: ['Em pesa', 'Ho porto bé'],
  principio: ['No et quedis en un extrem.', 'La teva força és al teu costat.', 'Per créixer, mira cap a l’altre.'],
  practica: 'Pràctica ikigaier',
  next: [
    { href: '/ca/paso', title: 'Test PASO', text: 'Descobreix com camines per la vida.' },
    { href: 'https://www.ikigaier.com/ca/llibres/', title: 'Els llibres', text: 'Un camí en tres llibres: alliberar, actuar i alinear.' },
    { href: 'https://www.ikigaier.com/ca/tallers/', title: 'Els tallers', text: 'Presencials o en línia, per a tu o per al teu equip.' },
  ],
  copy: 'Copiar el meu resultat',
  copied: 'Resultat copiat. Ja el pots enganxar on vulguis.',
  copyFail: 'No s’ha pogut copiar automàticament en aquest navegador.',
  again: 'Repetir el test',
  saved: 'Desat al teu compte.',
  footer: 'FOCO és un test per conèixer-te millor. No és un test mèdic.',
  summary: (p, lines, integ, ct) =>
    `El meu resultat al Test FOCO (pràctica ikigaier): ${p}.\n${lines.map(l => `· ${l}`).join('\n')}\n· Com ho porto: ${integ}\n«${ct}»`,
  dims: {
    int: {
      name: 'El que t’agrada', a: 'Una cosa a fons', b: 'Moltes coses',
      zones: {
        A: { z: 'Una cosa a fons', f: 'Aprendre cada vegada més del teu tema. Ser la persona a qui tothom pregunta.', x: 'Haver de saltar d’un tema a un altre tota l’estona.', o: 'Prova alguna cosa nova una hora a la setmana. Una cosa que no tingui res a veure amb el que fas. Et pot donar idees.' },
        M: { z: 'Una mica de les dues', f: 'Tens un tema teu i també curiositat per d’altres.', x: 'Que t’obliguin a triar només un costat.', o: 'Cuida el teu tema principal. I no deixis de provar coses noves.' },
        B: { z: 'Moltes coses', f: 'Descobrir coses noves i unir idees que vénen de llocs diferents.', x: 'Sentir que no domines res a fons.', o: 'Tria una o dues coses i aprèn-les més a fons. Això fa més fort tota la resta.' },
      },
    },
    ene: {
      name: 'Quan canvies de tasca', a: 'Em cansa', b: 'Em dona energia',
      zones: {
        A: { z: 'Et cansa canviar', f: 'Estar molta estona amb una sola tasca, sense que ningú et molesti.', x: 'Les interrupcions i els dies plens de coses curtetes.', o: 'Practica canvis petits. Per exemple, una pausa curta o una tasca diferent al final del dia.' },
        M: { z: 'T’adaptes', f: 'Pots estar molta estona amb una cosa i també canviar si cal.', x: 'Els dies de fer sempre el mateix i els dies de saltar sense parar.', o: 'Fixa’t en què et dona energia i què te la treu. I tria.' },
        B: { z: 'Et dona energia', f: 'Els dies variats. Canviar de tasca et desperta.', x: 'Les tasques llargues que es repeteixen.', o: 'Un cop al dia, prova de fer una sola cosa durant 45 minuts, sense canviar. Després mira com t’has sentit i quant has avançat.' },
      },
    },
    rit: {
      name: 'Com treballes', a: 'Una darrere l’altra', b: 'Diverses alhora',
      zones: {
        A: { z: 'Una darrere l’altra', f: 'Fer una cosa, acabar-la bé i passar a la següent.', x: 'Tenir moltes coses obertes alhora.', o: 'Tingues un segon projecte petit, sense pressa. De vegades ajuda a desencallar el principal.' },
        M: { z: 'Per temporades', f: 'Anar a fons amb un projecte un temps i després canviar a un altre.', x: 'Fer-ho tot alhora, o no poder canviar quan ja t’has cansat.', o: 'Posa data d’inici i de final a cada temporada. Així canvies perquè ho decideixes, no perquè fuges.' },
        B: { z: 'Diverses alhora', f: 'Portar diversos projectes que s’ajuden entre ells.', x: 'Que t’obliguin a fer només una cosa. I també tenir tantes coses que cap no avança.', o: 'Tria 1 o 2 projectes principals i acaba’ls. Els altres, apunta’ls en una llista per a més endavant.' },
      },
    },
    ide: {
      name: 'Com et presentes', a: 'Soc això', b: 'Soc moltes coses',
      zones: {
        A: { z: 'Soc això', f: 'Saber molt bé qui ets a la feina.', x: 'Els canvis grans, com canviar d’empresa o jubilar-te. Pots sentir que ja no saps qui ets.', o: 'Pensa en una o dues coses que ets a més de la teva feina. Tu ets més que la teva professió.' },
        M: { z: 'Un de principal i més', f: 'Tens una cosa principal i d’altres al voltant.', x: 'Quan alguna cosa nova demana més espai i no saps on posar-la.', o: 'De tant en tant, mira si com et presentes continua sent veritat avui.' },
        B: { z: 'Soc moltes coses', f: 'Ajuntar mons diferents. Ser qui connecta coses que d’altres no veuen juntes.', x: 'Quan et pregunten «a què et dediques?». Sents que no encaixes en cap capsa.', o: 'Busca el que uneix tot el que fas i posa-li un nom. Així és fàcil explicar qui ets.' },
      },
    },
  },
  profiles: {
    A: { t: 'Ets d’una cosa', l: 'T’agrada anar a fons i aprendre molt d’un tema. D’això se’n diu ser especialista.', ct: 'No et tanques. Vas a fons.',
      c: ['Potser t’han dit que només saps del teu. I has sentit que tenies menys creativitat que altres persones.', 'Saber molt d’una cosa és molt valuós. No has de canviar. Només obre alguna finestra de tant en tant.'] },
    M: { t: 'Ets de les dues', l: 'Tens un tema teu i també curiositat per d’altres. Segons el moment, vas a fons o proves coses noves.', ct: 'No et falta decisió. Ets un pont.',
      c: ['Potser has sentit que no eres ni una cosa ni l’altra.', 'Estar al mig és un avantatge: entens els dos costats. Només has de triar quan anar a fons i quan obrir-te.'] },
    B: { t: 'Ets de moltes coses', l: 'T’agraden molts temes i passar d’un a l’altre et dona energia. D’això se’n diu ser multipotencial.', ct: 'No et falta focus. El teu focus es mou.',
      c: ['Potser t’han dit que et disperses. Que et centris en una cosa i prou. Potser fins i tot has amagat el que fas.', 'Tenir molts interessos no és un error. És la teva manera de ser. No has d’apagar la teva curiositat. Només cal que l’ordenis.'] },
  },
  integ: {
    L: { z: 'Et pesa', t: 'Ara mateix et costa. Tens coses a mitges o amagues part del que fas. No és culpa teva: moltes vegades passa per intentar ser com els altres esperen.',
      s: ['Tria una sola cosa i acaba-la aquest mes. Encara que sigui petita.', 'Escriu tot el que tens començat. El que no toca ara, deixa-ho per després, sense culpa.', 'Explica a algú de confiança alguna cosa que fas i que no sols explicar.'] },
    M: { z: 'Vas bé', t: 'Ho portes força bé. Encara hi ha coses a mitges o parts de tu que no ensenyes.',
      s: ['Un cop a la setmana, decideix què és el més important.', 'Celebra el que acabes, no només el que comences.', 'Prova d’explicar alguna cosa de tu que normalment calles.'] },
    H: { z: 'Ho portes bé', t: 'Acabes el que és important i ensenyes el que fas sense por.',
      s: ['Continua revisant els teus projectes perquè no se t’acumulin.', 'Explica com t’organitzes. Pot ajudar altres persones.', 'De tant en tant, prova el que fa l’altre costat del teu mapa.'] },
  },
  questions: [
    'M’agraden coses molt diferents. Per exemple, la cuina i la música, o els números i l’art.',
    'Quan canvio de tasca, em sento amb més energia.',
    'Tinc diversos projectes començats alhora.',
    'Si em pregunten «a què et dediques?», no em n’hi ha prou amb una sola resposta.',
    'Acabo les coses que m’importen.',
    'Prefereixo saber molt d’una cosa que una mica de moltes.',
    'Si m’interrompen, em costa tornar al que estava fent.',
    'M’agrada acabar una cosa abans de començar-ne una altra.',
    'La meva feina diu molt bé qui soc.',
    'Tinc coses començades que fa molt de temps que estan aturades.',
    'Quan descobreixo alguna cosa nova, vull aprendre-la de seguida.',
    'Si faig el mateix molta estona, m’avorreixo, encara que m’agradi.',
    'Passar d’un projecte a un altre em dona idees noves.',
    'Soc moltes coses alhora, no només una.',
    'Parlo de tot el que faig, encara que no tingui res a veure amb la meva feina.',
    'M’agrada ser la persona que més sap d’un tema.',
    'Treballo millor si puc estar hores amb la mateixa tasca.',
    'Tenir moltes coses a mitges m’angoixa.',
    'M’agrada que em coneguin per una sola cosa.',
    'Alguna vegada he amagat alguna cosa que faig perquè no em critiquin.',
    'El que m’agrada ha canviat molt amb els anys.',
    'Un dia amb tasques variades em cansa menys que un dia amb una sola tasca.',
    'M’organitzo millor amb diversos projectes que amb un de sol.',
    'Barrejar coses diferents és el que em fa especial.',
    'Sé què és el més important ara i què pot esperar.',
  ],
}

const EN: FocoCopy = {
  eyebrow: 'FOCO test · free',
  title: ['Are you a one-thing person', 'or a many-things person?'],
  lead: 'Some people enjoy doing one thing really well. Others enjoy doing lots of different things. Both ways are fine.',
  body: 'This test tells you which one is yours. And it tells you three more things: what comes easily to you, what you find hard, and what you can try.',
  intro: [
    { name: 'What you like', q: 'One thing in depth, or many different things?' },
    { name: 'When you switch tasks', q: 'Does it tire you or give you energy?' },
    { name: 'How you work', q: 'One thing after another, or several at once?' },
    { name: 'How you introduce yourself', q: 'Do you say “I am this” or “I am many things”?' },
    { name: 'How you handle it', q: 'Do you finish what you start? Do you show what you do?' },
  ],
  start: 'START THE TEST',
  meta: '25 questions · 5 minutes · no sign-up · instant result',
  question: (n, total) => `Question ${n} of ${total}`,
  back: '← Back',
  hint: 'There are no right or wrong answers.',
  scale: ['Not at all', 'A little', 'Sometimes', 'Quite a lot', 'Yes, a lot'],
  resultEyebrow: 'Your result · FOCO test',
  culpaEyebrow: 'This is not a flaw',
  mapTitle: 'Your map',
  mapSub: 'Each line goes from one side to the other. The dot shows where you are today. Neither side is better than the other.',
  easy: 'Comes easily',
  hard: 'You find hard',
  tryThis: 'Try this',
  keepBalance: 'To stay in balance',
  integTitle: 'How you handle it',
  integSub: 'It doesn’t matter which side you are on. What matters is whether you finish what you start and whether you show what you do.',
  integName: 'Your way of handling it',
  integPoles: ['It weighs on me', 'I handle it well'],
  principio: ['Don’t stay at one extreme.', 'Your strength is on your side.', 'To grow, look towards the other.'],
  practica: 'The ikigaier practice',
  next: [
    { href: '/en/paso', title: 'PASO test', text: 'Discover how you walk through life.' },
    { href: 'https://www.ikigaier.com/en/books/', title: 'The books', text: 'A path in three books: release, act and align.' },
    { href: 'https://www.ikigaier.com/en/workshops/', title: 'The workshops', text: 'In person or online, for you or your team.' },
  ],
  copy: 'Copy my result',
  copied: 'Result copied. You can paste it wherever you like.',
  copyFail: 'It couldn’t be copied automatically in this browser.',
  again: 'Take the test again',
  saved: 'Saved to your account.',
  footer: 'FOCO is a test to get to know yourself better. It is not a medical test.',
  summary: (p, lines, integ, ct) =>
    `My result in the FOCO test (the ikigaier practice): ${p}.\n${lines.map(l => `· ${l}`).join('\n')}\n· How I handle it: ${integ}\n“${ct}”`,
  dims: {
    int: {
      name: 'What you like', a: 'One thing in depth', b: 'Many things',
      zones: {
        A: { z: 'One thing in depth', f: 'Learning more and more about your subject. Being the person everyone asks.', x: 'Having to jump from one subject to another all the time.', o: 'Try something new for one hour a week. Something that has nothing to do with your thing. It can give you ideas.' },
        M: { z: 'A bit of both', f: 'You have a subject of your own and you are curious about others too.', x: 'Being forced to pick just one side.', o: 'Look after your main subject. And keep trying new things.' },
        B: { z: 'Many things', f: 'Discovering new things and joining ideas that come from different places.', x: 'Feeling that you don’t master anything in depth.', o: 'Pick one or two things and learn them more deeply. That makes everything else stronger.' },
      },
    },
    ene: {
      name: 'When you switch tasks', a: 'It tires me', b: 'It gives me energy',
      zones: {
        A: { z: 'Switching tires you', f: 'Spending a long time on one task, with nobody disturbing you.', x: 'Interruptions and days full of short little tasks.', o: 'Practise small changes. For example, a short break or a different task at the end of the day.' },
        M: { z: 'You adapt', f: 'You can stay with something for a long time and also switch when needed.', x: 'Days of always doing the same thing, and days of jumping around non-stop.', o: 'Notice what gives you energy and what takes it away. And choose.' },
        B: { z: 'It gives you energy', f: 'Varied days. Switching tasks wakes you up.', x: 'Long tasks that repeat.', o: 'Once a day, try doing just one thing for 45 minutes, without switching. Then notice how you felt and how far you got.' },
      },
    },
    rit: {
      name: 'How you work', a: 'One after another', b: 'Several at once',
      zones: {
        A: { z: 'One after another', f: 'Doing one thing, finishing it well and moving on to the next.', x: 'Having lots of things open at the same time.', o: 'Keep a small second project, with no rush. Sometimes it helps unblock the main one.' },
        M: { z: 'In seasons', f: 'Going all in on one project for a while and then switching to another.', x: 'Doing everything at once, or not being able to switch when you are tired.', o: 'Give each season a start date and an end date. That way you switch because you decide to, not because you are running away.' },
        B: { z: 'Several at once', f: 'Running several projects that help each other.', x: 'Being forced to do just one thing. And also having so many things that none of them moves forward.', o: 'Pick 1 or 2 main projects and finish them. Write the rest on a list for later.' },
      },
    },
    ide: {
      name: 'How you introduce yourself', a: 'I am this', b: 'I am many things',
      zones: {
        A: { z: 'I am this', f: 'Knowing very well who you are in your work.', x: 'Big changes, like changing company or retiring. You may feel you no longer know who you are.', o: 'Think of one or two things you are besides your job. You are more than your profession.' },
        M: { z: 'One main thing and more', f: 'You have one main thing and others around it.', x: 'When something new asks for more room and you don’t know where to put it.', o: 'Every now and then, check whether the way you introduce yourself is still true today.' },
        B: { z: 'I am many things', f: 'Bringing different worlds together. Being the one who connects things others don’t see together.', x: 'When people ask “what do you do?”. You feel you don’t fit in any box.', o: 'Look for what links everything you do and give it a name. Then it is easy to explain who you are.' },
      },
    },
  },
  profiles: {
    A: { t: 'You are a one-thing person', l: 'You like to go deep and learn a lot about one subject. This is called being a specialist.', ct: 'You are not closed off. You go deep.',
      c: ['Maybe you have been told you only know about your own thing. And you have felt less creative than other people.', 'Knowing a lot about something is very valuable. You don’t have to change. Just open a window now and then.'] },
    M: { t: 'You are a bit of both', l: 'You have a subject of your own and you are curious about others too. Depending on the moment, you go deep or you try new things.', ct: 'You don’t lack decision. You are a bridge.',
      c: ['Maybe you have felt you were neither one thing nor the other.', 'Being in the middle is an advantage: you understand both sides. You just need to choose when to go deep and when to open up.'] },
    B: { t: 'You are a many-things person', l: 'You like many subjects, and moving from one to another gives you energy. This is called being a multipotentialite.', ct: 'You don’t lack focus. Your focus moves.',
      c: ['Maybe you have been told you are scattered. That you should focus on one thing, full stop. Maybe you have even hidden what you do.', 'Having many interests is not a fault. It is the way you are. You don’t have to switch off your curiosity. You just need to give it some order.'] },
  },
  integ: {
    L: { z: 'It weighs on you', t: 'Right now it is hard. You have things half done, or you hide part of what you do. It is not your fault: it often comes from trying to be what others expect.',
      s: ['Pick just one thing and finish it this month. Even a small one.', 'Write down everything you have started. Whatever isn’t for now, leave it for later, without guilt.', 'Tell someone you trust about something you do that you don’t usually talk about.'] },
    M: { z: 'You are doing well', t: 'You handle it fairly well. There are still things half done, or parts of you that you don’t show.',
      s: ['Once a week, decide what matters most.', 'Celebrate what you finish, not only what you start.', 'Try sharing something about yourself that you usually keep quiet.'] },
    H: { z: 'You handle it well', t: 'You finish what matters and you show what you do without fear.',
      s: ['Keep reviewing your projects so they don’t pile up.', 'Share how you organise yourself. It can help other people.', 'Every now and then, try what the other side of your map does.'] },
  },
  questions: [
    'I like very different things. For example, cooking and music, or numbers and art.',
    'When I switch tasks, I feel more energetic.',
    'I have several projects started at the same time.',
    'If someone asks me “what do you do?”, one single answer is not enough.',
    'I finish the things that matter to me.',
    'I would rather know a lot about one thing than a little about many.',
    'If I am interrupted, it is hard for me to get back to what I was doing.',
    'I like to finish one thing before starting another.',
    'My work says very well who I am.',
    'I have things I started that have been on hold for a long time.',
    'When I discover something new, I want to learn it straight away.',
    'If I do the same thing for a long time, I get bored, even if I like it.',
    'Moving from one project to another gives me new ideas.',
    'I am many things at once, not just one.',
    'I talk about everything I do, even if it has nothing to do with my job.',
    'I like being the person who knows the most about a subject.',
    'I work better if I can spend hours on the same task.',
    'Having lots of things half done stresses me out.',
    'I like being known for just one thing.',
    'I have sometimes hidden something I do so that I wouldn’t be criticised.',
    'What I like has changed a lot over the years.',
    'A day of varied tasks tires me less than a day with just one task.',
    'I organise myself better with several projects than with just one.',
    'Mixing different things is what makes me special.',
    'I know what matters most right now and what can wait.',
  ],
}

export function getFocoCopy(locale: string): FocoCopy {
  const l = contentLang(locale)
  return l === 'en' ? EN : l === 'ca' ? CA : ES
}
