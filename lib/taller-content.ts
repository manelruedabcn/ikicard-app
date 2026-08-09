// AUTO-GENERADO desde el cuaderno "Camina sin separarte de ti". No editar a mano.
// Regenerar con scripts/gen-taller.py si cambia el cuaderno.

export type Block =
  | { kind: 'reading'; paras: string[] }
  | { kind: 'quote'; lines: string[] }
  | { kind: 'exercise'; label: string; title: string }
  | { kind: 'question'; id: string; prompt: string; hint?: string; label?: string }
  | { kind: 'scale'; id: string; statement: string }
  | { kind: 'freewrite'; id: string; title?: string; prompt?: string }
  | { kind: 'tallernote'; title: string; text: string }

export interface Section {
  id: string
  label: string
  title: string
  blocks: Block[]
}

export const TALLER_CONTENT: Section[] = [
  {
    "id": "intro",
    "label": "",
    "title": "Antes de empezar",
    "blocks": [
      {
        "kind": "reading",
        "paras": [
          "Este cuaderno nace del libro El Ikigai que no te contaron, pero no necesitas haberlo leído para usarlo. Es una invitación independiente a hacerte preguntas distintas. A parar. A escucharte.",
          "Durante mucho tiempo nos han vendido el propósito como una fórmula bonita: cuatro círculos, una etiqueta profesional, una respuesta definitiva. Pero la vida no suele funcionar así.",
          "A veces el propósito no aparece como una gran revelación. Aparece como una incomodidad. Como esa sensación de que algo no encaja del todo, aunque por fuera todo funcione razonablemente bien.",
          "Este cuaderno no te promete que encuentres «tu propósito» en sus páginas. Te promete algo más honesto: preguntas que te ayuden a ver dónde te estás alejando de ti y cuál puede ser tu primer paso para volver a caminar más cerca."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "No vienes a encontrar una respuesta prefabricada.",
          "Vienes a escucharte con más verdad."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Cómo usar este cuaderno"
      },
      {
        "kind": "reading",
        "paras": [
          "No hay una forma correcta de recorrer estas páginas. Puedes seguirlas en orden o saltar a donde necesites. Puedes escribir mucho o poco. Puedes volver dentro de tres meses y ver qué ha cambiado."
        ]
      },
      {
        "kind": "reading",
        "paras": [
          "Sin prisa. Date el tiempo que cada pregunta te pida. Si algo te remueve, quédate ahí.",
          "Sin filtro. Escribe lo que sientas, no lo que creas que deberías sentir. Nadie va a leerlo si tú no quieres.",
          "Sin juicio. No hay respuestas buenas ni malas. Hay respuestas verdaderas y respuestas de compromiso. Las primeras a veces duelen; las segundas, a la larga, también.",
          "Con honestidad. Es la única regla. Si te mientes, el cuaderno no te lo recriminará. Pero tú lo sabrás."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Dos formas de recorrer este cuaderno"
      },
      {
        "kind": "reading",
        "paras": [
          "Este cuaderno puede acompañarte de dos maneras distintas, y las dos son legítimas. Conviene que decidas cuál es la tuya antes de empezar, aunque siempre puedes cambiar de ruta sobre la marcha.",
          "La ruta solo (o con amigos)",
          "Avanzas a tu ritmo. Sesiones cortas, de veinte a treinta minutos, repartidas a lo largo de varias semanas. Si trabajas con una persona de confianza, podéis contrastaros las respuestas. El cuaderno completo —tal cual está— es para esta ruta.",
          "La ruta taller (con facilitador)",
          "Si vas a trabajarlo en un taller guiado, no pretendas hacerlo entero. Encontrarás algunas páginas marcadas con la frase «Si lo trabajas en taller» que sugieren prompts de compartir en pareja, y otras que tu facilitador puede saltarse. En un taller de dos horas, mi recomendación es: bienvenida y respiración, Sección 1, Ejercicio 1, Brújula y Ejercicio 2, Ejercicio 3 corporal guiado en voz alta, palabra ancla y primer paso. Las páginas más extensas, la sección de Herramientas y los diarios de integración quedan como tarea para casa. El taller introduce y detona; el recorrido completo se hace después en solitario.",
          "Si te interesa trabajar este cuaderno en formato taller, puedes contactar con el autor para explorar cómo organizarlo."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "El recorrido"
      },
      {
        "kind": "reading",
        "paras": [
          "Antes de empezar, te muestro por dónde vamos. No para que lo memorices, sino para que sepas dónde estás cuando te canses y para que no temas perderte:",
          "Uno.  Parar y escuchar.",
          "Dos.  Mirar dónde te has alejado de ti.",
          "Tres.  Reconocer las máscaras que te sostienen.",
          "Cuatro.  Bajar de la mente al cuerpo.",
          "Cinco.  Cerrar y elegir un primer paso.",
          "No es un método. Es un orden de mirada. Cinco gestos sencillos para que lo importante no quede tapado por lo urgente."
        ]
      }
    ]
  },
  {
    "id": "s1",
    "label": "SECCIÓN UNO",
    "title": "Parar y escuchar",
    "blocks": [
      {
        "kind": "reading",
        "paras": [
          "Vivimos rodeados de ruido. Notificaciones, prisas, obligaciones, expectativas. La mayoría de las decisiones las tomamos sin darnos cuenta, empujados por inercias que ni siquiera hemos elegido.",
          "Antes de preguntarte hacia dónde quieres ir, conviene que te preguntes dónde estás. Y para eso hace falta algo que nuestra cultura ha convertido casi en un acto de rebeldía: parar.",
          "Parar no es rendirse. Es dejar de correr el tiempo suficiente para escuchar lo que el ruido tapa."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "No puedes encontrar tu voz",
          "si solo escuchas el ruido."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Tu punto de partida"
      },
      {
        "kind": "reading",
        "paras": [
          "Antes de avanzar, mira dónde estás hoy. Responde con lo primero que te venga. Sin analizar demasiado."
        ]
      },
      {
        "kind": "question",
        "id": "s1_energia",
        "prompt": "¿Con qué energía empiezas este cuaderno?"
      },
      {
        "kind": "question",
        "id": "s1_esperas",
        "prompt": "¿Qué esperas encontrar en estas páginas?"
      },
      {
        "kind": "question",
        "id": "s1_temes",
        "prompt": "¿Qué temes encontrar?"
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Un espacio antes de seguir"
      },
      {
        "kind": "reading",
        "paras": [
          "Algunas cosas necesitan página propia, sin pregunta detrás. Aquí tienes una. Para lo que surja al haber empezado."
        ]
      },
      {
        "kind": "freewrite",
        "id": "s1_espacio"
      }
    ]
  },
  {
    "id": "s2",
    "label": "SECCIÓN DOS",
    "title": "El ikigai que no te contaron",
    "blocks": [
      {
        "kind": "reading",
        "paras": [
          "Ikigai es una palabra japonesa que une iki (vida) y gai (valor, sentido, merecimiento). No es una meta que se alcanza. Es una razón para levantarte cada mañana. Algo que ya está en ti, esperando a ser reconocido y cultivado.",
          "Seguramente has visto el famoso diagrama del ikigai: cuatro círculos que se cruzan —lo que amas, lo que el mundo necesita, lo que te pagan por hacer, lo que se te da bien—, y en el centro, tu propósito.",
          "Es bonito. Es ordenado. Es demasiado limpio para ser verdad.",
          "La vida rara vez encaja en diagramas. El propósito no suele aparecer como una intersección perfecta de cuatro variables. Aparece desordenado. Incómodo. A veces como una sensación de vacío, no como una certeza luminosa.",
          "Lo que no te contaron del ikigai —y lo que sí encontrarás en el libro que inspira este cuaderno— es que el propósito no es solo lo que haces, sino desde dónde lo haces. Por eso hablamos de dos dimensiones: el Ikigai Activo y el Ikigai Consciente. Y de quien aprende a integrarlas: el ikigaier."
        ]
      },
      {
        "kind": "question",
        "id": "s2_ikigais",
        "prompt": "Antes de seguir, una pregunta para ti: ¿con cuál de los dos ikigais te identificas más ahora mismo —el Activo (lo que haces, produces, construyes) o el Consciente (cómo habitas, sientes, eliges)—? ¿Cuál sientes que te falta o te reclama más atención?"
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Ikigai Activo e Ikigai Consciente"
      },
      {
        "kind": "reading",
        "paras": [
          "Ikigai Activo es lo que haces y construyes: tu trabajo, tus proyectos, tus responsabilidades, tus logros. Es el qué.",
          "Puedes tener un Ikigai Activo impecable —un buen trabajo, una familia, proyectos interesantes— y aun así sentir que algo no encaja. Que caminas, pero no sabes hacia dónde. Que haces, pero no sabes desde dónde.",
          "Ikigai Consciente es desde dónde haces todo eso. Es la cualidad de presencia con la que vives. Es saber por qué dices sí y por qué dices no. Es no traicionarte en las decisiones pequeñas.",
          "El Ikigai Consciente no se mide en logros. Se mide en coherencia."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "Puedes estar haciendo muchas cosas correctas",
          "y, aun así, sentir que te estás alejando de ti."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Las dos almas del ikigai"
      },
      {
        "kind": "reading",
        "paras": [
          "Estas dos dimensiones —Ikigai Activo (lo que haces, construyes, contribuyes) y Ikigai Consciente (desde dónde lo haces, cómo habitas, qué eliges)— no son rivales. Son las dos almas del mismo recorrido.",
          "A quien aprende a integrarlas le llamo ikigaier: alguien que hace desde el ser. No es elegir entre una y otra. Es reconocer que el propósito pleno habita justo donde ambas se tocan."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "El ikigai consciente no se persigue.",
          "Se cultiva desde la relación cotidiana",
          "contigo mismo y con la vida."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "¿Y si el propósito no es una etiqueta?"
      },
      {
        "kind": "reading",
        "paras": [
          "Hay una pregunta que nos han enseñado a hacernos mal: «¿cuál es mi propósito?», como si la respuesta fuera un sustantivo. Una profesión. Un destino fijo.",
          "Pero el propósito vital rara vez es un sustantivo. Es más bien un verbo. Una dirección. La sensación de estar donde debes, incluso cuando no sabes exactamente hacia dónde vas.",
          "Quizá la pregunta no es «¿cuál es mi propósito?» sino algo más cercano a:"
        ]
      },
      {
        "kind": "question",
        "id": "s2_donde_debo",
        "prompt": "¿En qué momentos siento que estoy donde debo estar?"
      },
      {
        "kind": "question",
        "id": "s2_comun",
        "prompt": "¿Qué tienen en común esos momentos?"
      },
      {
        "kind": "question",
        "id": "s2_aleja",
        "prompt": "¿Qué me aleja de sentirme así más a menudo?"
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "El piloto automático"
      },
      {
        "kind": "reading",
        "paras": [
          "Gran parte de nuestra vida transcurre en piloto automático. Nos despertamos, trabajamos, respondemos, comemos, dormimos. Repetimos. Y un día levantamos la cabeza y nos preguntamos: ¿cómo he llegado hasta aquí?",
          "No hay nada malo en el piloto automático. Es necesario para funcionar. El problema aparece cuando no sabemos que está activado. Cuando pasan los años y no recordamos haber elegido.",
          "El piloto automático es silencioso. Vive de la costumbre, del miedo al cambio, de lo que «toca hacer». Y tiene un aliado poderoso: el ruido. Cuanto más ruido hay fuera, menos nos escuchamos por dentro."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "No se trata de eliminar el piloto automático.",
          "Se trata de saber cuándo conviene desactivarlo."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Tu piloto automático"
      },
      {
        "kind": "reading",
        "paras": [
          "Tómate un momento para mirar tu vida con honestidad. No para juzgarte. Solo para ver."
        ]
      },
      {
        "kind": "question",
        "id": "s2_pa_areas",
        "prompt": "¿En qué áreas de tu vida sientes que llevas tiempo en piloto automático? (Trabajo, pareja, rutinas, ocio, decisiones…)"
      },
      {
        "kind": "question",
        "id": "s2_pa_momento",
        "prompt": "Si miras atrás, ¿hubo un momento en que empezaste a «dejarte llevar» en esa área?"
      },
      {
        "kind": "question",
        "id": "s2_pa_mando",
        "prompt": "¿Qué necesitarías para recuperar el mando?"
      },
      {
        "kind": "exercise",
        "label": "EJERCICIO 1",
        "title": "¿Dónde me estoy alejando de mí?"
      },
      {
        "kind": "reading",
        "paras": [
          "Este es el primer ejercicio grande del cuaderno. No tengas prisa. Cada pregunta merece su espacio. Si necesitas cerrar los ojos un momento antes de escribir, hazlo.",
          "No hay respuestas correctas en este ejercicio. Hay respuestas verdaderas. La primera que escribes suele ser la que dirías en voz alta para quedar bien contigo mismo; la segunda empieza a ser tuya. Si algo te hace ruido al escribirlo, quédate ahí. Ese ruido es información."
        ]
      },
      {
        "kind": "question",
        "id": "e1_q1",
        "prompt": "¿Qué parte de mi vida funciona, pero ya no me representa del todo?",
        "hint": "(Por fuera parece que va bien. Por dentro, algo se ha apagado.)",
        "label": "Pregunta 1 de 4"
      },
      {
        "kind": "question",
        "id": "e1_q2",
        "prompt": "¿Qué estoy sosteniendo por miedo, imagen o costumbre?",
        "hint": "(Lo que hago no porque quiera, sino porque dejar de hacerlo me da miedo, me haría quedar mal o «siempre se ha hecho así».)",
        "label": "Pregunta 2 de 4"
      },
      {
        "kind": "question",
        "id": "e1_q3",
        "prompt": "¿Qué hago bien, pero me vacía?",
        "hint": "(Hay cosas en las que somos competentes, incluso brillantes, pero cada vez que las hacemos sentimos que perdemos algo. Energía. Sentido. Vida.)",
        "label": "Pregunta 3 de 4"
      },
      {
        "kind": "question",
        "id": "e1_q4",
        "prompt": "¿Qué deseo que no me atrevo a reconocer?",
        "hint": "(Eso que está ahí, susurrando, pero que te da vergüenza admitir incluso ante ti mismo. No hace falta que sea grandioso. Solo tiene que ser verdad.)",
        "label": "Pregunta 4 de 4"
      },
      {
        "kind": "tallernote",
        "title": "Si lo trabajas en taller",
        "text": "Comparte con un compañero una de las cuatro respuestas que has escrito —la que tú elijas, ni siquiera tiene que ser la más fuerte. Solo cinco minutos cada uno. Quien escucha no responde, no aconseja, no consuela: solo escucha. Después intercambiáis los roles."
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Después del ejercicio"
      },
      {
        "kind": "reading",
        "paras": [
          "Has mirado de frente. No es poca cosa. La mayoría de la gente pasa años sin hacerse estas preguntas. Tú acabas de dedicarles tiempo y honestidad.",
          "Antes de seguir, date un momento para recoger lo que ha aparecido."
        ]
      },
      {
        "kind": "question",
        "id": "e1_patron",
        "prompt": "¿Hay algún patrón que se repita en tus respuestas?"
      },
      {
        "kind": "question",
        "id": "e1_removido",
        "prompt": "¿Qué respuesta te ha removido más? ¿Por qué crees que ha sido esa?"
      },
      {
        "kind": "question",
        "id": "e1_emocion",
        "prompt": "¿Qué emoción predomina ahora mismo? (Alivio, tristeza, miedo, rabia, esperanza, confusión…)"
      },
      {
        "kind": "reading",
        "paras": [
          "Respira. No hay prisa."
        ]
      }
    ]
  },
  {
    "id": "s3",
    "label": "SECCIÓN TRES",
    "title": "Máscaras y miedo",
    "blocks": [
      {
        "kind": "reading",
        "paras": [
          "Si en la sección anterior exploraste dónde te alejas de ti, en esta vas a explorar por qué. Y la respuesta, casi siempre, tiene que ver con dos viejos conocidos: las máscaras que nos ponemos y el miedo que las sostiene.",
          "No vamos a juzgarlos. Las máscaras y el miedo no son defectos. Son mecanismos. En algún momento nos protegieron. Nos ayudaron a encajar, a sobrevivir, a ser aceptados. El problema no es que existan. El problema es cuando las llevamos tanto tiempo puestas que ya no recordamos qué hay debajo.",
          "Yo cargué con la máscara Exigente durante años sin saber que la cargaba. Me parecía sentido común: si me esfuerzo más, las cosas saldrán mejor. Tardé en ver que esa máscara no me hacía mejor; me hacía estar siempre insatisfecho con lo que ya era. Verla fue el principio de poder soltarla un poco."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Las máscaras que nos protegen"
      },
      {
        "kind": "reading",
        "paras": [
          "Todos tenemos máscaras. Las construimos sin darnos cuenta, casi siempre en la infancia o la adolescencia, cuando aprendimos que ser nosotros mismos no siempre era seguro o suficiente.",
          "Algunas habituales:"
        ]
      },
      {
        "kind": "reading",
        "paras": [
          "La Exigente. Nada está suficientemente bien. Se exige a sí misma (y a los demás) un nivel que nunca se alcanza. No celebra los logros porque siempre hay algo que mejorar.",
          "La Controladora. Necesita tenerlo todo previsto. Delegar es perder el control. La incertidumbre le pesa, y prefiere hacerlo ella antes que confiar.",
          "La Manipuladora. Mueve los hilos con sutileza para no mostrarse tal cual es. Consigue que los demás hagan lo que quiere sin pedirlo abiertamente.",
          "La Jueza. Critica para no ser criticada. Señala en los demás lo que no se permite a sí misma. Su dureza por fuera tapa una fragilidad que no se atreve a mostrar.",
          "La Complaciente. Dice sí cuando quiere decir no. Antepone las necesidades ajenas a las propias. Su valor depende de ser aceptada y querida, aunque sea a costa de sí misma.",
          "La Víctima. Convierte la vida en algo que te pasa a ti, no en algo que tú protagonizas. Espera que las circunstancias cambien para poder cambiar ella.",
          "La Impostora. Vive con el miedo constante a ser descubierta. Cree que en cualquier momento alguien se dará cuenta de que no sabe, no merece o no está a la altura."
        ]
      },
      {
        "kind": "reading",
        "paras": [
          "Posiblemente te reconozcas en más de una. Es normal. No son compartimentos estancos."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "Construimos máscaras para sobrevivir.",
          "El problema no es la máscara:",
          "es olvidar que la llevas."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "El miedo como timonel silencioso"
      },
      {
        "kind": "reading",
        "paras": [
          "Detrás de cada máscara hay un miedo. A veces es evidente. Otras está tan enterrado que ni lo identificamos como miedo: lo llamamos «prudencia», «realismo» o «sentido común».",
          "El miedo no es el enemigo. Es un mecanismo que un día fue útil. El problema aparece cuando sigue dirigiendo el barco sin que nos hayamos dado cuenta.",
          "Algunos miedos que suelen esconderse tras las máscaras:"
        ]
      },
      {
        "kind": "reading",
        "paras": [
          "Miedo a no estar a la altura (máscara de la Exigente).",
          "Miedo a perder el control (máscara de la Controladora).",
          "Miedo a mostrarse tal cual es (máscara de la Manipuladora).",
          "Miedo a ser criticada (máscara de la Jueza).",
          "Miedo al rechazo (máscara de la Complaciente).",
          "Miedo a no ser capaz de cambiar (máscara de la Víctima).",
          "Miedo a ser descubierta (máscara de la Impostora)."
        ]
      },
      {
        "kind": "question",
        "id": "s3_miedo",
        "prompt": "Leyendo esto… ¿qué miedo reconoces como tuyo? ¿Cuál te ha estado acompañando sin que le pusieras nombre?"
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Reconocer sin juzgar"
      },
      {
        "kind": "reading",
        "paras": [
          "Llegados a este punto, es posible que estés tentado de juzgarte. De decirte «¿cómo he podido vivir así tanto tiempo?» o «soy un fraude».",
          "No lo hagas.",
          "Las máscaras no las elegiste desde la maldad ni desde la mentira. Las elegiste —o te las pusieron— desde la necesidad. Hiciste lo que pudiste con lo que tenías. Y gracias a esas máscaras, probablemente, llegaste hasta aquí.",
          "El trabajo ahora no es arrancártelas de golpe. Eso dolería y probablemente no funcionaría. El trabajo es más sutil y más poderoso: saber que las llevas. Y empezar a preguntarte, cada vez que aparezcan: ¿la necesito ahora? ¿O ya puedo ir soltándola un poco?"
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "No se trata de arrancarte la máscara.",
          "Se trata de saber que la llevas",
          "y elegir cuándo usarla y cuándo no."
        ]
      },
      {
        "kind": "exercise",
        "label": "EJERCICIO 2",
        "title": "Mi máscara dominante"
      },
      {
        "kind": "reading",
        "paras": [
          "Ahora vas a poner nombre, forma y consecuencias a tu máscara principal. Puede que tengas varias, pero elige la que más peso tiene en tu vida ahora mismo. La que más decisiones está tomando por ti.",
          "Tómate tu tiempo. Si necesitas cerrar el cuaderno y volver mañana, hazlo. Este ejercicio merece presencia."
        ]
      },
      {
        "kind": "question",
        "id": "e2_q1",
        "prompt": "La máscara que más uso es…",
        "hint": "(Descríbela. Ponle nombre. ¿Cómo se comporta? ¿Qué dice? ¿Qué imagen proyecta?)",
        "label": "1 de 4"
      },
      {
        "kind": "question",
        "id": "e2_q2",
        "prompt": "Me ha servido para…",
        "hint": "(Sé justo. Esta máscara no es una villana. Te ha protegido, te ha permitido conseguir cosas, te ha ayudado a encajar. Reconócelo.)",
        "label": "2 de 4"
      },
      {
        "kind": "question",
        "id": "e2_q3",
        "prompt": "Pero hoy me cuesta…",
        "hint": "(¿Qué precio estás pagando por llevarla? ¿Qué te impide? ¿Qué cansancio genera? ¿Qué relaciones o decisiones están mediadas por ella?)",
        "label": "3 de 4"
      },
      {
        "kind": "question",
        "id": "e2_q4",
        "prompt": "Si caminara sin separarme de mí, empezaría por…",
        "hint": "(No hace falta que sea un plan de vida. Basta un gesto. Algo pequeño. Una verdad que llevas tiempo posponiendo.)",
        "label": "4 de 4"
      },
      {
        "kind": "quote",
        "lines": [
          "Has mirado de frente.",
          "Respira.",
          "No hay prisa."
        ]
      },
      {
        "kind": "reading",
        "paras": [
          "Tómate el espacio que necesites antes de continuar. Notas, sensaciones, lo que haya quedado flotando."
        ]
      },
      {
        "kind": "freewrite",
        "id": "e2_espacio"
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Brújula de las máscaras"
      },
      {
        "kind": "reading",
        "paras": [
          "Aquí tienes una versión breve de la brújula para puntuar dónde están tus máscaras hoy. Léela rápido, sin pensar demasiado.",
          "Puntúa del 1 al 5 cuánto te identificas con cada frase. 1 = nada identificado/a.  5 = totalmente identificado/a."
        ]
      },
      {
        "kind": "scale",
        "id": "e2_sc1",
        "statement": "1.  Siento que nada de lo que hago es suficientemente bueno; siempre se puede mejorar más."
      },
      {
        "kind": "scale",
        "id": "e2_sc2",
        "statement": "2.  Necesito tenerlo todo bajo control; delegar me genera ansiedad."
      },
      {
        "kind": "scale",
        "id": "e2_sc3",
        "statement": "3.  A menudo consigo que los demás hagan lo que yo quiero sin pedirlo directamente."
      },
      {
        "kind": "scale",
        "id": "e2_sc4",
        "statement": "4.  Tiendo a señalar los errores ajenos antes de que otros vean los míos."
      },
      {
        "kind": "scale",
        "id": "e2_sc5",
        "statement": "5.  Me cuesta decir que no, incluso cuando sé que debería hacerlo."
      },
      {
        "kind": "scale",
        "id": "e2_sc6",
        "statement": "6.  Siento que las cosas me pasan a mí; espero a que cambien las circunstancias."
      },
      {
        "kind": "scale",
        "id": "e2_sc7",
        "statement": "7.  Vivo con el miedo a que en cualquier momento alguien descubra que no sé lo suficiente."
      },
      {
        "kind": "reading",
        "paras": [
          "Las máscaras con puntuaciones más altas (4-5) son las dominantes. Las de puntuación media (3) son secundarias pero presentes. Las bajas (1-2) probablemente no te definen ahora mismo."
        ]
      },
      {
        "kind": "question",
        "id": "e2_top3",
        "prompt": "Anota tus tres máscaras principales, ordenadas de mayor a menor:"
      },
      {
        "kind": "reading",
        "paras": [
          "Volverás a esta brújula. Dentro de unos meses, puntúa de nuevo y compara. Las máscaras se mueven con el tiempo y el trabajo personal."
        ]
      },
      {
        "kind": "tallernote",
        "title": "Si lo trabajas en taller",
        "text": "En grupo: cada persona dice en voz alta el nombre de su máscara dominante. Solo el nombre, sin justificarlo. Notar el efecto de pronunciarlo delante de otros. La máscara pierde fuerza cuando deja de ser secreta."
      }
    ]
  },
  {
    "id": "s4",
    "label": "SECCIÓN CUATRO",
    "title": "Del entender al sentir",
    "blocks": [
      {
        "kind": "reading",
        "paras": [
          "Has hecho trabajo mental. Has puesto nombre a patrones, máscaras, miedos. Has comprendido cosas que quizá antes solo intuías. Eso importa. Pero no es suficiente.",
          "Comprender con la mente es solo el primer paso. Lo que transforma de verdad es lo que baja al cuerpo y a la emoción. Porque el propósito no se fija solo pensando. También necesita sentirse.",
          "Esta sección es un puente. De la cabeza al resto de ti."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "No basta con entender"
      },
      {
        "kind": "reading",
        "paras": [
          "Puedes entender perfectamente que tu máscara Complaciente te está agotando. Puedes ver con claridad que el miedo al rechazo te hace decir síes que te vacían. Puedes tenerlo todo analizado. Y aun así, mañana, volver a hacer lo mismo.",
          "Esto a mí me costó entenderlo. Soy de los que durante mucho tiempo creyó que con pensar las cosas bastaba. Tuve que llegar a un punto en que mi cabeza tenía la conclusión clara y mi vida seguía exactamente igual. Ahí entendí que comprender no es lo mismo que cambiar. Lo segundo pasa por el cuerpo.",
          "No ocurre porque seas débil o porque no lo hayas entendido bien. Ocurre porque el cambio real no pasa solo por el intelecto. Pasa por el cuerpo, por la emoción, por lo que ocurre cuando bajas la guardia y te permites sentir lo que has estado pensando."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "Puedes leer cien libros sobre el agua.",
          "Pero solo sabrás lo que es el agua",
          "cuando te metas en ella."
        ]
      },
      {
        "kind": "exercise",
        "label": "EJERCICIO 3",
        "title": "¿Dónde sientes la desconexión?"
      },
      {
        "kind": "reading",
        "paras": [
          "Las emociones no viven solo en la cabeza. Viven en el cuerpo. La desconexión, el vacío, la sensación de alejarte de ti… todo eso tiene una residencia física, aunque no le hayas prestado atención hasta ahora.",
          "Este ejercicio no es para analizar. Es para sentir. Si puedes, antes de escribir cierra los ojos unos segundos y lleva la atención al cuerpo."
        ]
      },
      {
        "kind": "question",
        "id": "e3_cuerpo",
        "prompt": "Cuando piensas en esa área de tu vida donde te estás alejando de ti… ¿en qué parte del cuerpo lo notas?",
        "hint": "(Pecho, garganta, estómago, hombros, mandíbula, espalda… No lo pienses. Localízalo.)"
      },
      {
        "kind": "question",
        "id": "e3_sensacion",
        "prompt": "¿Qué sensación física es? Descríbela como si se lo contaras a alguien que no tiene cuerpo.",
        "hint": "(Presión, vacío, nudo, hormigueo, frío, calor, pesadez, inquietud…)"
      },
      {
        "kind": "question",
        "id": "e3_emocion",
        "prompt": "¿Qué emoción asocias a esa sensación?",
        "hint": "(Si no encuentras la palabra exacta, describe la atmósfera: ¿es oscura, densa, punzante, sorda…?)"
      },
      {
        "kind": "question",
        "id": "e3_cuanto",
        "prompt": "¿Hace cuánto que convives con esa sensación sin haberle prestado atención?"
      },
      {
        "kind": "tallernote",
        "title": "Si lo trabajas en taller",
        "text": "En pareja, sin abrir los ojos al principio: uno cuenta dónde siente la desconexión en su cuerpo. El otro escucha sin tocar y sin hablar. Cuando termina, intercambiáis. No hace falta análisis después. El reconocimiento mutuo ya es suficiente."
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Diario de integración"
      },
      {
        "kind": "reading",
        "paras": [
          "Las páginas siguientes son para ti. Sin preguntas. Sin guion. Un espacio donde volcar lo que ha removido todo este trabajo.",
          "A veces las respuestas más importantes aparecen cuando dejamos de buscar. Suelta el bolígrafo. Respira. Y si algo quiere salir, aquí tiene dónde."
        ]
      },
      {
        "kind": "freewrite",
        "id": "s4_diario1",
        "title": "Lo que va apareciendo"
      },
      {
        "kind": "freewrite",
        "id": "s4_diario2",
        "title": "Sensaciones que se quedan"
      },
      {
        "kind": "freewrite",
        "id": "s4_diario3",
        "title": "Lo que aún no tiene forma"
      },
      {
        "kind": "freewrite",
        "id": "s4_diario4",
        "title": "Lo que ya quiere salir"
      },
      {
        "kind": "exercise",
        "label": "HERRAMIENTAS",
        "title": "Cómo brillas, cómo te mueves"
      },
      {
        "kind": "reading",
        "paras": [
          "Hasta aquí has mirado lo que te aleja de ti. Ahora vamos a mirar lo otro: dos cosas que ya están funcionando bien en ti, casi sin que te des cuenta. Lo que se te enciende cuando estás en tu mejor versión, y la forma natural en que avanzas cuando avanzas. Son dos preguntas para responder rápido, de un tirón, sin pensarlas demasiado.",
          "Escribe lo primero que te venga, antes de que la cabeza lo corrija. Eso suele ser lo más cercano a la verdad."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Cómo brillas"
      },
      {
        "kind": "reading",
        "paras": [
          "Piensa en un momento reciente —de la semana pasada, del mes pasado— en el que sentiste que estabas en tu mejor versión haciendo algo. No tiene que ser profesional ni grandioso. Puede ser una conversación, una tarea cotidiana, un instante."
        ]
      },
      {
        "kind": "question",
        "id": "h_brillas",
        "prompt": "¿Qué estabas haciendo exactamente? Descríbelo en tres frases."
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Cómo te mueves"
      },
      {
        "kind": "reading",
        "paras": [
          "Cuando avanzas en la vida —cuando abordas un proyecto, una decisión, una situación nueva—, ¿cómo lo haces?"
        ]
      },
      {
        "kind": "question",
        "id": "h_mueves",
        "prompt": "¿Te lanzas y vas viendo? ¿Necesitas planificar antes? ¿Acompañas a otros para entender? ¿Mediates entre voces? ¿Construyes paso a paso, ladrillo a ladrillo? Descríbete en tres frases."
      },
      {
        "kind": "reading",
        "paras": [
          "Estas dos respuestas son tu primer mapa cualitativo. Cómo brillas te dice qué te pone en presencia plena; cómo te mueves te dice qué cualidad tiene tu manera de avanzar. La combinación de ambas es la base de tu Ikigai Activo."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "El diagrama clásico, mirado de cerca"
      },
      {
        "kind": "reading",
        "paras": [
          "Has hecho el ejercicio de cómo brillas y cómo te mueves. Ahora vamos a usar el diagrama clásico del ikigai —ese de los cuatro círculos— pero con distancia. Ya sabes lo que pienso de él: es bonito, es ordenado y es demasiado limpio para ser verdad.",
          "Aun así, sirve. No como respuesta —no te dice cuál es tu propósito—, sino como diagnóstico. Te ayuda a ver dónde tienes movimiento y dónde tienes ausencia. Lo que el diagrama sí sabe decir es por dónde te falta camino.",
          "Responde las cuatro preguntas con honestidad. Y cuando llegues a las intersecciones, no busques «la casilla mágica» del centro. Mira qué cuadrante está más vacío en tu vida hoy. Ahí está la información."
        ]
      },
      {
        "kind": "question",
        "id": "d_pasion",
        "prompt": "1. ¿Qué te apasiona?",
        "hint": "(lo que amas hacer, lo que te hace perder la noción del tiempo)"
      },
      {
        "kind": "question",
        "id": "d_talento",
        "prompt": "2. ¿Qué se te da bien?",
        "hint": "(tus talentos naturales y habilidades desarrolladas)"
      },
      {
        "kind": "question",
        "id": "d_mundo",
        "prompt": "3. ¿Qué necesita el mundo de ti?",
        "hint": "(qué ves que falta y tú podrías aportar)"
      },
      {
        "kind": "question",
        "id": "d_pagar",
        "prompt": "4. ¿Por qué podrían pagarte?",
        "hint": "(qué tuyo tiene valor para otros, aunque aún no lo hayas monetizado)"
      },
      {
        "kind": "reading",
        "paras": [
          "Pasión + Talento = tu vocación. Lo que haces bien y te llena.",
          "Pasión + Necesidad = tu misión. Lo que amas y el mundo reclama.",
          "Talento + Mercado = tu profesión. Lo que haces bien y tiene valor económico.",
          "Necesidad + Mercado = tu contribución. Lo que el mundo necesita y puede sostenerte.",
          "Mira tus respuestas. Las casillas vacías son tu información. No las casillas llenas. Si una intersección te ha quedado pobre o impostada, ahí hay un territorio sin habitar. Eso es lo que el diagrama sí sabe decir, y es valioso.",
          "Lo que no sabe decir es el desde dónde. Por eso el centro de los cuatro círculos no es tu Ikigai, sino —en todo caso— tu Ikigai Activo. La otra mitad —el Ikigai Consciente— no aparece en este mapa. La has trabajado en las páginas anteriores."
        ]
      },
      {
        "kind": "question",
        "id": "d_activo",
        "prompt": "Mira lo que has escrito sobre cómo brillas y cómo te mueves, y lo que acabas de ver en el diagrama. A partir de ahí, escribe una frase que resuma tu Ikigai Activo hoy:"
      }
    ]
  },
  {
    "id": "s5",
    "label": "SECCIÓN CINCO",
    "title": "Cerrar y caminar",
    "blocks": [
      {
        "kind": "reading",
        "paras": [
          "Todo este recorrido —parar, comprender, reconocer máscaras, sentir dónde duele— no tendría sentido si no desembocara en algo. En un movimiento. Por pequeño que sea.",
          "No se trata de que salgas de estas páginas con tu vida resuelta. Se trata de que salgas con algo que antes no tenías: claridad, honestidad, una decisión, un primer paso. O simplemente la certeza de que ya no quieres seguir caminando separado de ti.",
          "Esta sección es para cerrar la experiencia y para abrir lo que viene después."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Tus dos ikigais hoy"
      },
      {
        "kind": "reading",
        "paras": [
          "Has hecho un viaje por tu Ikigai Activo (cómo brillas, cómo te mueves, el mapa, lo que haces y construyes) y por tu Ikigai Consciente (las máscaras, el miedo, el sentir, el desde dónde).",
          "Ahora es el momento de mirarlos juntos. Porque el ikigaier no es quien elige uno y descuida el otro. Es quien aprende a moverlos al mismo tiempo."
        ]
      },
      {
        "kind": "question",
        "id": "s5_activo",
        "prompt": "Ikigai Activo — Lo que he descubierto sobre lo que hago:"
      },
      {
        "kind": "question",
        "id": "s5_consciente",
        "prompt": "Ikigai Consciente — Lo que he descubierto sobre desde dónde lo hago:"
      },
      {
        "kind": "question",
        "id": "s5_reforzar",
        "prompt": "¿Dónde necesitas reforzar cada uno?"
      },
      {
        "kind": "question",
        "id": "s5_juntos",
        "prompt": "Mi primer paso para moverlos juntos es…",
        "hint": "(Un gesto concreto que honre tanto lo que haces como desde dónde lo haces.)"
      },
      {
        "kind": "reading",
        "paras": [
          "No se trata de equilibrarlos como quien hace malabares. Se trata de recordar que el hacer y el ser no son dos vidas distintas. Son la misma. Y caminan contigo."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Mi palabra ancla"
      },
      {
        "kind": "reading",
        "paras": [
          "Si tuvieras que resumir todo lo que has visto en estas páginas en una sola palabra, ¿cuál sería?",
          "No la busques con la cabeza. Déjala aparecer. Puede ser una palabra concreta o abstracta, poética o sencilla, evidente o sorprendente. Lo único que importa es que resuene con verdad."
        ]
      },
      {
        "kind": "question",
        "id": "s5_palabra",
        "prompt": "[  Escribe aquí tu palabra  ]"
      },
      {
        "kind": "question",
        "id": "s5_palabra_por",
        "prompt": "¿Por qué esta palabra? ¿Qué representa para ti?"
      },
      {
        "kind": "reading",
        "paras": [
          "Esta palabra es tu ancla. Cuando dentro de unas semanas el ruido vuelva a subir, cuando la máscara quiera tomar el mando otra vez, vuelve a ella. Es tu recordatorio."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Mi primer paso coherente"
      },
      {
        "kind": "reading",
        "paras": [
          "No necesitas un plan de vida. Necesitas un primer paso. Algo concreto, realista y verdadero. Algo que puedas hacer esta semana o este mes.",
          "No tiene que ser grandioso. Tiene que ser verdad."
        ]
      },
      {
        "kind": "question",
        "id": "s5_paso",
        "prompt": "Mi primer paso coherente será…"
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Detallando el paso"
      },
      {
        "kind": "question",
        "id": "s5_paso_necesito",
        "prompt": "¿Qué necesito para darlo? (Tiempo, recursos, ayuda, permiso…)"
      },
      {
        "kind": "question",
        "id": "s5_paso_impide",
        "prompt": "¿Qué podría impedírmelo? (Anticípalo: ¿qué excusa, qué miedo, qué circunstancia?)"
      },
      {
        "kind": "question",
        "id": "s5_paso_quien",
        "prompt": "¿A quién se lo contaré para que sea más real?",
        "hint": "(Decirlo en voz alta a alguien multiplica las probabilidades de hacerlo.)"
      },
      {
        "kind": "question",
        "id": "s5_paso_cuando",
        "prompt": "¿Cuándo lo haré?",
        "hint": "(Ponle fecha. Sin fecha, es un deseo. Con fecha, es un compromiso.)"
      },
      {
        "kind": "reading",
        "paras": [
          "Respira. Ya tienes un paso."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Lo que no quiero volver a traicionarme"
      },
      {
        "kind": "reading",
        "paras": [
          "Este es quizá el espacio más íntimo del cuaderno.",
          "Después de todo lo que has visto, después de identificar las máscaras, los miedos, las desconexiones… hay algo en ti que ya sabe. Una verdad que te has contado en susurros pero que quizá nunca has escrito.",
          "Escríbela aquí. Para ti. Sin testigos."
        ]
      },
      {
        "kind": "freewrite",
        "id": "s5_traicion"
      },
      {
        "kind": "quote",
        "lines": [
          "Hay cosas que solo son verdad",
          "cuando te atreves a escribirlas."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Carta a mi yo futuro"
      },
      {
        "kind": "reading",
        "paras": [
          "Imagina que dentro de tres meses encuentras esta carta. Has vivido, has tomado decisiones, quizá has dado ese primer paso… o quizá no. Sea como sea, ¿qué te gustaría recordar? ¿Qué te gustaría que tu yo de dentro de tres meses no olvidara?",
          "Escribe la carta. Sé honesto. Sé amable. Háblale como le hablarías a alguien a quien quieres de verdad."
        ]
      },
      {
        "kind": "freewrite",
        "id": "s5_carta",
        "prompt": "Querido yo de dentro de tres meses:"
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Compromiso conmigo"
      },
      {
        "kind": "reading",
        "paras": [
          "Las páginas de este cuaderno no tienen poder por sí mismas. El poder está en lo que tú hagas con lo que has visto.",
          "Este es tu cierre. Tu declaración de intenciones. Tu compromiso."
        ]
      },
      {
        "kind": "question",
        "id": "s5_compromiso",
        "prompt": "Hoy, después de todo este recorrido, me llevo esto:"
      },
      {
        "kind": "reading",
        "paras": [
          "Fecha:  ____________________________",
          "Firma:  ____________________________",
          "Firmar no es para nadie más que para ti. Es un gesto. Un cierre. Un principio."
        ]
      },
      {
        "kind": "exercise",
        "label": "",
        "title": "Antes de cerrar"
      },
      {
        "kind": "reading",
        "paras": [
          "Has llegado al final de este cuaderno. Ojalá no sea un final, sino un comienzo.",
          "Tómate un último momento para mirar atrás. Repasa mentalmente lo que has escrito. Las respuestas, las resistencias, las revelaciones pequeñas. Date cuenta de lo que ha cambiado desde la primera página hasta ahora."
        ]
      },
      {
        "kind": "question",
        "id": "s5_cierre_entrada",
        "prompt": "¿Cómo entraste a este cuaderno y cómo sales?"
      },
      {
        "kind": "question",
        "id": "s5_cierre_cambiado",
        "prompt": "¿Qué ha cambiado en ti?"
      },
      {
        "kind": "question",
        "id": "s5_cierre_llevas",
        "prompt": "¿Qué te llevas puesto —no solo pensado— de toda esta experiencia?"
      },
      {
        "kind": "reading",
        "paras": [
          "Gracias por el viaje. Ha sido tuyo."
        ]
      },
      {
        "kind": "quote",
        "lines": [
          "El propósito no es lo que haces.",
          "Es desde dónde lo haces.",
          "Camina sin separarte de ti."
        ]
      }
    ]
  }
]

export const ANSWERABLE_IDS: string[] = ["s1_energia", "s1_esperas", "s1_temes", "s1_espacio", "s2_ikigais", "s2_donde_debo", "s2_comun", "s2_aleja", "s2_pa_areas", "s2_pa_momento", "s2_pa_mando", "e1_q1", "e1_q2", "e1_q3", "e1_q4", "e1_patron", "e1_removido", "e1_emocion", "s3_miedo", "e2_q1", "e2_q2", "e2_q3", "e2_q4", "e2_espacio", "e2_sc1", "e2_sc2", "e2_sc3", "e2_sc4", "e2_sc5", "e2_sc6", "e2_sc7", "e2_top3", "e3_cuerpo", "e3_sensacion", "e3_emocion", "e3_cuanto", "s4_diario1", "s4_diario2", "s4_diario3", "s4_diario4", "h_brillas", "h_mueves", "d_pasion", "d_talento", "d_mundo", "d_pagar", "d_activo", "s5_activo", "s5_consciente", "s5_reforzar", "s5_juntos", "s5_palabra", "s5_palabra_por", "s5_paso", "s5_paso_necesito", "s5_paso_impide", "s5_paso_quien", "s5_paso_cuando", "s5_traicion", "s5_carta", "s5_compromiso", "s5_cierre_entrada", "s5_cierre_cambiado", "s5_cierre_llevas"]
