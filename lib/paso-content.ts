// AUTO-GENERADO desde preguntas_paso.json / patrones_paso.json. No editar a mano.
// Regenerar con scripts/gen-paso.py si cambian los datos de origen.
// Lógica de cálculo portada de paso-logic.js (validada en prototipo).

export type Dim = 'P' | 'A' | 'S' | 'O'
export const DIMS: Dim[] = ['P', 'A', 'S', 'O']
export const TOTAL_GRUPOS = 28

// Umbrales de la lógica. APROXIMADOS de prototipo — calibrar con datos reales.
export const MARGEN_DOMINANCIA = 3
export const UMBRAL_CONTRADICCION = 3

export interface Grupo {
  grupo: number
  P: string
  A: string
  S: string
  O: string
}

export interface Patron {
  codigo: string
  nombre: string
  retrato: string
  motivacion: string
  bajo_presion: string
  teme: string
  seria_mas_eficaz_si: string
  libro_recomendado: string
}

export interface Answer {
  grupo: number
  mas: Dim
  menos: Dim
}

export interface InformePaso {
  scores: Record<Dim, number>
  mascara: Record<Dim, number>
  natural: Record<Dim, number>
  codigoPatron: string
  brechas: { dimension: Dim; valor: number; direccion: 'exige_de_mas' | 'esconde' | 'alineado' }[]
  puntoCiego: Dim
  contradicciones: Dim[]
}

export const PASO_GRUPOS: Grupo[] = [
  {
    "grupo": 1,
    "P": "Resuelto",
    "A": "Cercano",
    "S": "Sereno",
    "O": "Cuidadoso"
  },
  {
    "grupo": 2,
    "P": "Firme",
    "A": "Cálido",
    "S": "Paciente",
    "O": "Reflexivo"
  },
  {
    "grupo": 3,
    "P": "Directo",
    "A": "Sociable",
    "S": "Constante",
    "O": "Preciso"
  },
  {
    "grupo": 4,
    "P": "Audaz",
    "A": "Cordial",
    "S": "Templado",
    "O": "Meticuloso"
  },
  {
    "grupo": 5,
    "P": "Impulsor",
    "A": "Comunicativo",
    "S": "Fiel",
    "O": "Riguroso"
  },
  {
    "grupo": 6,
    "P": "Competitivo",
    "A": "Optimista",
    "S": "Sosegado",
    "O": "Prudente"
  },
  {
    "grupo": 7,
    "P": "Exigente",
    "A": "Persuasivo",
    "S": "Estable",
    "O": "Detallista"
  },
  {
    "grupo": 8,
    "P": "Autónomo",
    "A": "Entusiasta",
    "S": "Discreto",
    "O": "Escéptico"
  },
  {
    "grupo": 9,
    "P": "Arriesgado",
    "A": "Expresivo",
    "S": "Leal",
    "O": "Metódico"
  },
  {
    "grupo": 10,
    "P": "Contundente",
    "A": "Animoso",
    "S": "Sencillo",
    "O": "Analítico"
  },
  {
    "grupo": 11,
    "P": "Veloz",
    "A": "Receptivo",
    "S": "Constante",
    "O": "Cauto"
  },
  {
    "grupo": 12,
    "P": "Insistente",
    "A": "Encantador",
    "S": "Amable",
    "O": "Ordenado"
  },
  {
    "grupo": 13,
    "P": "Enérgico",
    "A": "Vivaz",
    "S": "Confiable",
    "O": "Selectivo"
  },
  {
    "grupo": 14,
    "P": "Ambicioso",
    "A": "Abierto",
    "S": "Sosegado",
    "O": "Exacto"
  },
  {
    "grupo": 15,
    "P": "Combativo",
    "A": "Espontáneo",
    "S": "Sencillo",
    "O": "Reservado"
  },
  {
    "grupo": 16,
    "P": "Independiente",
    "A": "Locuaz",
    "S": "Complaciente",
    "O": "Sistemático"
  },
  {
    "grupo": 17,
    "P": "Decidido",
    "A": "Alentador",
    "S": "Duradero",
    "O": "Escrupuloso"
  },
  {
    "grupo": 18,
    "P": "Práctico",
    "A": "Ameno",
    "S": "Sereno",
    "O": "Meditativo"
  },
  {
    "grupo": 19,
    "P": "Autoritario",
    "A": "Contagioso",
    "S": "Predecible",
    "O": "Calculador"
  },
  {
    "grupo": 20,
    "P": "Directivo",
    "A": "Sociable",
    "S": "Comedido",
    "O": "Perfeccionista"
  },
  {
    "grupo": 21,
    "P": "Frontal",
    "A": "Efusivo",
    "S": "Confiado",
    "O": "Justo"
  },
  {
    "grupo": 22,
    "P": "Emprendedor",
    "A": "Cálido",
    "S": "Regular",
    "O": "Formal"
  },
  {
    "grupo": 23,
    "P": "Determinado",
    "A": "Popular",
    "S": "Modesto",
    "O": "Cuidadoso"
  },
  {
    "grupo": 24,
    "P": "Osado",
    "A": "Extrovertido",
    "S": "Apacible",
    "O": "Escéptico"
  },
  {
    "grupo": 25,
    "P": "Franco",
    "A": "Simpático",
    "S": "Servicial",
    "O": "Introspectivo"
  },
  {
    "grupo": 26,
    "P": "Autosuficiente",
    "A": "Convincente",
    "S": "Tranquilo",
    "O": "Concienzudo"
  },
  {
    "grupo": 27,
    "P": "Enérgico",
    "A": "Divertido",
    "S": "Amistoso",
    "O": "Riguroso"
  },
  {
    "grupo": 28,
    "P": "Persistente",
    "A": "Inspirador",
    "S": "Paciente",
    "O": "Objetivo"
  }
]

export const PASO_PATRONES: Patron[] = [
  {
    "codigo": "PPPP",
    "nombre": "El Caminante Frontal",
    "retrato": "Caminas de frente, sin rodeos. Donde otros aún miran el mapa, tú ya has dado el primer paso: para ti moverte es la prueba de que la vida avanza. Tu fuerza es que nada te frena; tu reto, recordar que no todo tramo se gana por velocidad, algunos piden presencia.",
    "motivacion": "Llegar, resolver, tener algo que mostrar al final del día. El movimiento mismo es la prueba de que la vida avanza.",
    "bajo_presion": "Se vuelve más brusco, no más lento. Decide rápido y exige que los demás sigan el ritmo.",
    "teme": "La irrelevancia. Quedarse parado sin nada que conquistar le pesa más que cualquier fracaso.",
    "seria_mas_eficaz_si": "Aceptara que algunos tramos del camino no piden velocidad, piden presencia.",
    "libro_recomendado": "El Ikigai que no te contaron"
  },
  {
    "codigo": "AAAA",
    "nombre": "El Caminante Acompañado",
    "retrato": "No concibes el camino en soledad. Cada paso cobra sentido cuando hay alguien al lado con quien compartirlo, y tu energía crece con la del grupo. Tu don es unir a la gente; tu aprendizaje, sostener también los tramos que se recorren sin testigos.",
    "motivacion": "Que el camino se comparta. Un logro sin nadie que lo celebre casi no cuenta como logro.",
    "bajo_presion": "Dispersa energía en conversación y validación, y a veces confunde hablar del problema con resolverlo.",
    "teme": "El camino silencioso, sin testigos ni reconocimiento.",
    "seria_mas_eficaz_si": "Se entrenara en sostener tramos en soledad, sin que eso signifique perder el rumbo.",
    "libro_recomendado": "Camina sin separarte de ti"
  },
  {
    "codigo": "SSSS",
    "nombre": "El Caminante Sostenido",
    "retrato": "Caminas a paso constante, sin sobresaltos ni prisas. Tu terreno es la fiabilidad: los demás saben que estarás ahí, mañana y pasado, al mismo ritmo firme. Tu fuerza es la constancia; tu reto, atreverte a acelerar cuando el momento de verdad lo pide.",
    "motivacion": "Un paso constante, sin sobresaltos. La fiabilidad es su forma de excelencia.",
    "bajo_presion": "Se repliega y busca que todo vuelva cuanto antes al cauce conocido; el cambio brusco le cuesta más que el esfuerzo.",
    "teme": "Que le obliguen a cambiar de ruta sin aviso.",
    "seria_mas_eficaz_si": "Se permitiera acelerar cuando el momento realmente lo pide, en vez de proteger el ritmo por sistema.",
    "libro_recomendado": "Disciplina para indisciplinados"
  },
  {
    "codigo": "OOOO",
    "nombre": "El Caminante Observador",
    "retrato": "Antes de pisar, miras. Estudias el terreno, calculas la ruta y solo entonces avanzas, porque para ti un paso bien pensado vale por diez dados a ciegas. Tu don es la lucidez; tu trampa, creer que el mapa puede estar completo antes de caminar.",
    "motivacion": "Entender el terreno antes de pisarlo. Un paso bien calculado vale más que diez dados a ciegas.",
    "bajo_presion": "Se repliega hacia el análisis y revisa una vez más antes de decidir; el riesgo es que la revisión no termine nunca.",
    "teme": "Equivocarse por no haber mirado bien.",
    "seria_mas_eficaz_si": "Aceptara que ningún mapa está completo antes de caminar, y que parte del terreno solo se conoce pisándolo.",
    "libro_recomendado": "No todo lo que te frena es tuyo"
  },
  {
    "codigo": "PA",
    "nombre": "El Caminante que Arrastra",
    "retrato": "Avanzas rápido y no vas solo: llevas a otros en tu impulso. Necesitas tanto llegar como que se note lo lejos que has llegado. Tu fuerza mueve a grupos enteros; tu reto, mirar atrás y preguntar antes de arrastrar.",
    "motivacion": "Moverse rápido y llevar a otros consigo. Necesita tanto el resultado como el aplauso que lo acompaña.",
    "bajo_presion": "Impone el ritmo sin pedir permiso, y puede arrollar sin darse cuenta a quien camina más despacio.",
    "teme": "Que el grupo avance sin él, o que nadie note lo lejos que ha llegado.",
    "seria_mas_eficaz_si": "Aprendiera a preguntar antes de arrastrar, y a celebrar el paso de otros sin necesitar protagonizarlo.",
    "libro_recomendado": "El Ikigai que no te contaron"
  },
  {
    "codigo": "PO",
    "nombre": "El Caminante Calculador",
    "retrato": "Avanzas, sí, pero solo cuando entiendes el terreno. Analizas primero y luego decides rápido, sin titubear. Tu don es unir cabeza y acción; tu trampa, exigir un análisis perfecto que nunca acaba de llegar.",
    "motivacion": "Avanzar, pero solo después de haber entendido el terreno. Decide rápido una vez que ha analizado.",
    "bajo_presion": "Se vuelve frío y cortante, priorizando la eficacia sobre cualquier consideración que la ralentice.",
    "teme": "Actuar sobre información incompleta y que el error sea evidente para todos.",
    "seria_mas_eficaz_si": "Aceptara que el análisis perfecto no existe, y que parte de caminar es tolerar la incertidumbre.",
    "libro_recomendado": "No todo lo que te frena es tuyo"
  },
  {
    "codigo": "AS",
    "nombre": "El Caminante que Acoge",
    "retrato": "Caminas pendiente de que nadie se quede atrás. El ritmo lo marca el más lento, porque para ti el camino solo vale si se recorre juntos y en calma. Tu don es acoger; tu aprendizaje, entender que sostener a alguien no siempre es complacerlo.",
    "motivacion": "Que nadie se quede atrás. El camino solo tiene sentido si se recorre en buena compañía y sin prisa.",
    "bajo_presion": "Evita el conflicto a toda costa, incluso cuando decir algo incómodo sería lo más útil.",
    "teme": "Romper la armonía del grupo, aunque eso signifique callar algo importante.",
    "seria_mas_eficaz_si": "Entendiera que sostener no siempre significa complacer.",
    "libro_recomendado": "Camina sin separarte de ti"
  },
  {
    "codigo": "SO",
    "nombre": "El Caminante Metódico",
    "retrato": "Confías en el proceso más que en el impulso. Un camino claro, sin atajos ni sorpresas, es tu terreno seguro. Tu fuerza es el orden; tu reto, improvisar cuando el mapa ya no describe lo que estás pisando.",
    "motivacion": "Un proceso claro, sin sorpresas ni atajos. Confía en el sistema más que en el impulso.",
    "bajo_presion": "Se aferra al procedimiento incluso cuando la situación pide flexibilidad.",
    "teme": "El caos, el cambio sin estructura previa que lo sostenga.",
    "seria_mas_eficaz_si": "Se permitiera improvisar cuando el mapa ya no describe el terreno real.",
    "libro_recomendado": "Disciplina para indisciplinados"
  },
  {
    "codigo": "PS",
    "nombre": "El Caminante Terco",
    "retrato": "Cuando eliges una dirección, la sostienes cueste lo que cueste. Tu determinación no se mide en velocidad, sino en que no te desvías. Tu fuerza es esa persistencia; tu trampa, confundir sostener el rumbo con negarte a mirar de nuevo el mapa.",
    "motivacion": "Llegar a la meta sin desviarse, cueste lo que cueste. La determinación es su fuerza, no la velocidad.",
    "bajo_presion": "Se cierra en una sola dirección y le cuesta reconsiderar, aunque el terreno haya cambiado.",
    "teme": "Haber invertido esfuerzo en un camino equivocado y tener que reconocerlo.",
    "seria_mas_eficaz_si": "Distinguiera entre perseverancia y obstinación: no es lo mismo sostener el rumbo que negarse a mirar el mapa de nuevo.",
    "libro_recomendado": "Disciplina para indisciplinados"
  },
  {
    "codigo": "AO",
    "nombre": "El Caminante que Observa en Compañía",
    "retrato": "Miras a las personas antes que al terreno. Escuchas, observas y procesas en silencio antes de opinar, porque entender a quien tienes al lado es tu brújula. Tu don es la lectura fina; tu reto, atreverte a compartir lo que ves aunque aún no esté del todo verificado.",
    "motivacion": "Entender profundamente a quienes le rodean, más que al terreno en sí. Escucha antes de opinar.",
    "bajo_presion": "Se retrae, procesa en silencio, y puede parecer distante justo cuando más se le necesita cerca.",
    "teme": "Malinterpretar a alguien importante, o que le malinterpreten a él sin oportunidad de explicarse.",
    "seria_mas_eficaz_si": "Confiara en compartir una primera impresión, aunque no esté aún del todo verificada.",
    "libro_recomendado": "Camina sin separarte de ti"
  },
  {
    "codigo": "PAO",
    "nombre": "El Caminante Estratega",
    "retrato": "Avanzas con otros, pero por una ruta que ya has estudiado. Combinas impulso, relación y cálculo casi a partes iguales, y sueles tomar el mando con un plan bajo el brazo. Tu don es dirigir con criterio; tu reto, dejar sitio al plan que no es el tuyo.",
    "motivacion": "Avanzar con otros, pero solo por una ruta ya estudiada. Combina impulso, relación y cálculo a partes iguales.",
    "bajo_presion": "Toma el mando del grupo con un plan ya trazado, aunque no siempre lo consulte antes.",
    "teme": "Que el grupo se disperse por falta de dirección clara.",
    "seria_mas_eficaz_si": "Dejara espacio para el plan que no es el suyo, y confiara en que el grupo también sabe leer el terreno.",
    "libro_recomendado": "El Ikigai que no te contaron"
  },
  {
    "codigo": "ASO",
    "nombre": "El Caminante que Cuida el Proceso",
    "retrato": "Caminas para que el grupo llegue entero, con cada paso bien dado y nadie forzado a correr. Cuidas el ritmo y el proceso por igual. Tu don es que nadie se pierda por el camino; tu aprendizaje, ver que a veces cuidar bien también significa avanzar.",
    "motivacion": "Que el grupo llegue entero, con cada paso bien dado y nadie forzado a correr.",
    "bajo_presion": "Ralentiza aún más para no dejar a nadie atrás, incluso cuando la situación pide avanzar.",
    "teme": "Que su cuidado se confunda con lentitud, o que alguien se sienta ignorado por el camino.",
    "seria_mas_eficaz_si": "Aceptara que a veces cuidar bien también significa avanzar, no solo esperar.",
    "libro_recomendado": "No todo lo que te frena es tuyo"
  },
  {
    "codigo": "PAS",
    "nombre": "El Caminante Motor",
    "retrato": "Eres el motor que mantiene al grupo en marcha: empujas con energía, cercanía y ritmo, sin frenar pero sin quemar a nadie. Decides sobre la marcha y ya revisarás después. Tu fuerza es sostener el movimiento; tu reto, parar a pensar antes de empujar, no después.",
    "motivacion": "Que el grupo avance de forma constante, sin frenar pero sin quemar a nadie. Combina impulso, cercanía y ritmo sostenido.",
    "bajo_presion": "Empuja con energía pero se guarda el análisis para después: decide y ya revisará sobre la marcha.",
    "teme": "Que el grupo pierda la cohesión por ir demasiado rápido, o el ritmo por pararse a pensar de más.",
    "seria_mas_eficaz_si": "Se detuviera antes de empujar, no después: la prisa por mantener unido al grupo a veces le impide ver que el rumbo no es el correcto.",
    "libro_recomendado": "Camina sin separarte de ti"
  },
  {
    "codigo": "PSO",
    "nombre": "El Caminante Sólido",
    "retrato": "Avanzas con paso firme, sin prisa pero sin pausa, y siempre sobre terreno ya comprobado. Tu método es tu roca. Tu fuerza es esa solidez; tu trampa, volverte inflexible justo cuando el propio método pide cambiar.",
    "motivacion": "Avanzar con paso firme, sin prisa pero sin pausa, y siempre sobre terreno ya comprobado.",
    "bajo_presion": "Se vuelve inflexible: confía tanto en su método que le cuesta admitir que quizá haya que cambiarlo.",
    "teme": "El error por descuido, y también el caos que rompería su sistema de avance.",
    "seria_mas_eficaz_si": "Aceptara pequeñas dosis de improvisación como parte legítima del camino, no como fallo del plan.",
    "libro_recomendado": "Disciplina para indisciplinados"
  },
  {
    "codigo": "PASO",
    "nombre": "El Caminante Equilibrado",
    "retrato": "Ningún eje manda por encima de los demás: decides, acompañas, sostienes y observas según lo pida cada momento. No tienes un modo por defecto, los tienes todos disponibles. Tu don es la versatilidad; tu reto, confiar en que esa adaptabilidad ya es una fuerza, no algo que compensar.",
    "motivacion": "Ningún eje domina con claridad sobre los demás: decide, acompaña, sostiene y observa según lo pida cada momento, no según un patrón fijo.",
    "bajo_presion": "Responde con la energía que la situación necesita, aunque puede dudar unos instantes de más al no tener un modo por defecto claro.",
    "teme": "Perder esa capacidad de adaptarse y quedar atrapado en un solo modo de caminar.",
    "seria_mas_eficaz_si": "Confiara en que esa versatilidad ya es una fuerza en sí misma, y no algo que compensar por no tener un tipo definido.",
    "libro_recomendado": "Sin uno que destaque especialmente: es el perfil que más se beneficia de ver el método completo"
  }
]

// ---------- Lógica de cálculo (pura) ----------

function contarElecciones(answers: Answer[]) {
  const maskCount: Record<Dim, number> = { P: 0, A: 0, S: 0, O: 0 }
  const menosCount: Record<Dim, number> = { P: 0, A: 0, S: 0, O: 0 }
  for (const a of answers) {
    maskCount[a.mas]++
    menosCount[a.menos]++
  }
  return { maskCount, menosCount }
}

// Punto neutro por dimensión: si eligieras al azar, cada eje saldría BASE veces
// como MÁS y BASE como MENOS. Es el "cero" contra el que se miden ambos gráficos.
const BASE = TOTAL_GRUPOS / DIMS.length

// Máscara (adaptado): cuánto MÁS que el neutro PRESENTAS ese rasgo. Sale de los
// MÁS. Positivo = lo muestras por encima de lo esperable; negativo = lo ocultas.
function calcularMascara(maskCount: Record<Dim, number>): Record<Dim, number> {
  const mascara = {} as Record<Dim, number>
  for (const d of DIMS) mascara[d] = maskCount[d] - BASE
  return mascara
}

// Natural (instintivo): tu nivel real del rasgo. Sale de los MENOS: rechazarlo
// mucho lo baja. Positivo = tu instinto lo sostiene; negativo = tu instinto lo
// rechaza. Misma escala que la máscara (ambos centrados en el neutro), para que
// la brecha entre ambos sea comparable y pueda ir en las dos direcciones.
function calcularNatural(menosCount: Record<Dim, number>): Record<Dim, number> {
  const natural = {} as Record<Dim, number>
  for (const d of DIMS) natural[d] = BASE - menosCount[d]
  return natural
}

function calcularNetScores(
  maskCount: Record<Dim, number>,
  menosCount: Record<Dim, number>
): Record<Dim, number> {
  const net = {} as Record<Dim, number>
  for (const d of DIMS) net[d] = maskCount[d] - menosCount[d]
  return net
}

// Dimensiones dentro de MARGEN_DOMINANCIA del máximo forman el código,
// siempre en orden P-A-S-O. Una sola dominante => se repite 4 veces.
function resolverCodigoPatron(netScores: Record<Dim, number>, margen = MARGEN_DOMINANCIA): string {
  const max = Math.max(...DIMS.map(d => netScores[d]))
  const dominantes = DIMS.filter(d => max - netScores[d] <= margen)
  if (dominantes.length === 1) return dominantes[0].repeat(4)
  if (dominantes.length === 4) return 'PASO'
  return DIMS.filter(d => dominantes.includes(d)).join('')
}

// Brecha por eje = máscara − natural, ambos ya en la misma escala (desviación
// del neutro). Positivo => te exiges de más (presentas el rasgo por encima de tu
// instinto). Negativo => guardas más (tu instinto lo sostiene más de lo que
// muestras). Cero => alineado. Ordenadas por magnitud de la separación.
function calcularBrechas(mascara: Record<Dim, number>, natural: Record<Dim, number>) {
  return DIMS.map(d => {
    const valor = mascara[d] - natural[d]
    return {
      dimension: d,
      valor,
      direccion: (valor > 0 ? 'exige_de_mas' : valor < 0 ? 'esconde' : 'alineado') as
        | 'exige_de_mas'
        | 'esconde'
        | 'alineado',
    }
  }).sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
}

function calcularPuntoCiego(
  maskCount: Record<Dim, number>,
  menosCount: Record<Dim, number>
): Dim {
  const total = {} as Record<Dim, number>
  for (const d of DIMS) total[d] = maskCount[d] + menosCount[d]
  return DIMS.reduce((a, b) => (total[a] <= total[b] ? a : b))
}

function calcularContradicciones(
  maskCount: Record<Dim, number>,
  menosCount: Record<Dim, number>,
  umbral = UMBRAL_CONTRADICCION
): Dim[] {
  return DIMS.filter(d => Math.min(maskCount[d], menosCount[d]) >= umbral)
}

export function calcularInformePaso(answers: Answer[]): InformePaso {
  if (!Array.isArray(answers) || answers.length !== TOTAL_GRUPOS) {
    throw new Error(`calcularInformePaso espera ${TOTAL_GRUPOS} respuestas, recibió ${answers?.length ?? 0}`)
  }
  const { maskCount, menosCount } = contarElecciones(answers)
  const mascara = calcularMascara(maskCount)
  const natural = calcularNatural(menosCount)
  const netScores = calcularNetScores(maskCount, menosCount)
  return {
    scores: netScores,
    mascara,
    natural,
    codigoPatron: resolverCodigoPatron(netScores),
    brechas: calcularBrechas(mascara, natural),
    puntoCiego: calcularPuntoCiego(maskCount, menosCount),
    contradicciones: calcularContradicciones(maskCount, menosCount),
  }
}

export function getPatron(codigo: string): Patron | undefined {
  return PASO_PATRONES.find(p => p.codigo === codigo)
}
