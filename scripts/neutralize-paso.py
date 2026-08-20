# -*- coding: utf-8 -*-
# Aplica lenguaje inclusivo (sin género) a los JSON fuente de PASO y regenera lib/paso-content.ts.
# Palabras del test: adjetivo invariable cuando existe; micro-frase cuando no.
import json, subprocess

BASE = '/Users/manuelrueda/Downloads/files 2'

# --- 28 grupos x 4 palabras (P, A, S, O) neutralizadas ---
GRUPOS = {
    1:  ["Con decisión", "Afable", "Apacible", "Prudente"],
    2:  ["Firme", "Con calidez", "Paciente", "Con reflexión"],
    3:  ["Frontal", "Sociable", "Constante", "Con precisión"],
    4:  ["Audaz", "Cordial", "Estable", "Detallista"],
    5:  ["Con empuje", "Elocuente", "Fiel", "Con rigor"],
    6:  ["Tenaz", "Optimista", "En calma", "Prudente"],
    7:  ["Exigente", "Convincente", "Estable", "Detallista"],
    8:  ["Autosuficiente", "Entusiasta", "Con discreción", "Con reservas"],
    9:  ["Valiente", "Con expresividad", "Leal", "Con método"],
    10: ["Contundente", "Alegre", "Humilde", "Con análisis"],
    11: ["Veloz", "Con apertura", "Constante", "Con cautela"],
    12: ["Insistente", "Con encanto", "Amable", "Con orden"],
    13: ["Con energía", "Vivaz", "Confiable", "Con criterio"],
    14: ["Con ambición", "Con apertura", "En calma", "Con exactitud"],
    15: ["Con brío", "Natural", "Humilde", "Con reserva"],
    16: ["Independiente", "Locuaz", "Complaciente", "Con sistema"],
    17: ["Con decisión", "Que alienta", "Que perdura", "Con esmero"],
    18: ["Eficaz", "Agradable", "Apacible", "Con reflexión"],
    19: ["Dominante", "Que contagia", "Predecible", "Con cálculo"],
    20: ["Que dirige", "Sociable", "Con mesura", "Perfeccionista"],
    21: ["Frontal", "Con efusión", "Con confianza", "Ecuánime"],
    22: ["Con iniciativa", "Con calidez", "Regular", "Formal"],
    23: ["Con determinación", "Popular", "Humilde", "Prudente"],
    24: ["Valiente", "Sociable", "Apacible", "Con reservas"],
    25: ["Con franqueza", "Afable", "Servicial", "Con introspección"],
    26: ["Autosuficiente", "Convincente", "Apacible", "Con esmero"],
    27: ["Con energía", "Jovial", "Amable", "Con rigor"],
    28: ["Persistente", "Que inspira", "Paciente", "Imparcial"],
}

# --- Overrides por patrón (codigo -> campos a reemplazar) ---
# Toda la lectura del patrón en 2ª persona ("tú"), homogénea con las etiquetas
# ("Qué te mueve", "Lo que temes"…), el retrato y la narrativa. Sin género.
PATRONES = {
    "PPPP": {
        "nombre": "Caminante Frontal",
        "motivacion": "Llegar, resolver, tener algo que mostrar al final del día. El movimiento mismo es la prueba de que la vida avanza.",
        "bajo_presion": "Te vuelves más tajante, no más despacio. Decides rápido y exiges que los demás sigan el ritmo.",
        "teme": "La irrelevancia. Quedarte sin avanzar, sin nada que conquistar, te pesa más que cualquier fracaso.",
        "seria_mas_eficaz_si": "Aceptaras que algunos tramos del camino no piden velocidad, piden presencia.",
    },
    "AAAA": {
        "nombre": "Caminante en Compañía",
        "motivacion": "Que el camino se comparta. Un logro sin nadie que lo celebre casi no cuenta como logro.",
        "bajo_presion": "Dispersas energía en conversación y validación, y a veces confundes hablar del problema con resolverlo.",
        "teme": "El camino silencioso, sin testigos ni reconocimiento.",
        "seria_mas_eficaz_si": "Te entrenaras en sostener tramos en soledad, sin que eso signifique perder el rumbo.",
    },
    "SSSS": {
        "nombre": "Caminante que Sostiene",
        "motivacion": "Un paso constante, sin sobresaltos. La fiabilidad es tu forma de excelencia.",
        "bajo_presion": "Te repliegas y buscas que todo vuelva cuanto antes al cauce conocido; el cambio brusco te cuesta más que el esfuerzo.",
        "teme": "Que te obliguen a cambiar de ruta sin aviso.",
        "seria_mas_eficaz_si": "Te permitieras acelerar cuando el momento realmente lo pide, en vez de proteger el ritmo por sistema.",
    },
    "OOOO": {
        "nombre": "Caminante que Observa",
        "motivacion": "Entender el terreno antes de pisarlo. Un paso bien calculado vale más que diez dados a ciegas.",
        "bajo_presion": "Te repliegas hacia el análisis y revisas una vez más antes de decidir; el riesgo es que la revisión no termine nunca.",
        "teme": "Equivocarte por no haber mirado bien.",
        "seria_mas_eficaz_si": "Aceptaras que ningún mapa está completo antes de caminar, y que parte del terreno solo se conoce pisándolo.",
    },
    "PA": {
        "nombre": "Caminante que Arrastra",
        "motivacion": "Moverte rápido y llevar a otros contigo. Necesitas tanto el resultado como el aplauso que lo acompaña.",
        "bajo_presion": "Impones el ritmo sin pedir permiso, y puedes arrollar sin darte cuenta a quien camina más despacio.",
        "teme": "Que el grupo avance sin tu empuje, o que nadie note lo lejos que has llegado.",
        "seria_mas_eficaz_si": "Aprendieras a preguntar antes de arrastrar, y a celebrar el paso de otros sin necesitar protagonizarlo.",
        "retrato": "Avanzas rápido y sueles llevar a otros en tu impulso: pocas veces caminas del todo en soledad. Necesitas tanto llegar como que se note lo lejos que has llegado. Tu fuerza mueve a grupos enteros; tu reto, mirar atrás y preguntar antes de arrastrar.",
    },
    "PO": {
        "nombre": "Caminante que Calcula",
        "motivacion": "Avanzar, pero solo después de haber entendido el terreno. Decides rápido una vez que has analizado.",
        "bajo_presion": "Te vuelves distante y cortante, priorizando la eficacia sobre cualquier consideración que la ralentice.",
        "teme": "Actuar sobre información incompleta y que el error sea evidente para todos.",
        "seria_mas_eficaz_si": "Aceptaras que el análisis perfecto no existe, y que parte de caminar es tolerar la incertidumbre.",
    },
    "AS": {
        "nombre": "Caminante que Acoge",
        "motivacion": "Que nadie se quede atrás. El camino solo tiene sentido si se recorre en buena compañía y sin prisa.",
        "bajo_presion": "Evitas el conflicto a toda costa, incluso cuando decir algo incómodo sería lo más útil.",
        "teme": "Romper la armonía del grupo, aunque eso signifique callar algo importante.",
        "seria_mas_eficaz_si": "Entendieras que sostener no siempre significa complacer.",
        "retrato": "Caminas pendiente de que nadie se quede atrás. El ritmo lo marca quien va más despacio, porque tiendes a sentir que el camino sabe mejor si se recorre en compañía y en calma. Tu don es acoger; tu aprendizaje, entender que sostener a alguien no siempre es complacerlo.",
    },
    "SO": {
        "nombre": "Caminante del Método",
        "motivacion": "Un proceso claro, sin sorpresas ni atajos. Confías en el sistema más que en el impulso.",
        "bajo_presion": "Te aferras al procedimiento incluso cuando la situación pide flexibilidad.",
        "teme": "El caos, el cambio sin estructura previa que lo sostenga.",
        "seria_mas_eficaz_si": "Te permitieras improvisar cuando el mapa ya no describe el terreno real.",
    },
    "PS": {
        "nombre": "Caminante que no se Desvía",
        "motivacion": "Llegar a la meta sin desviarte, cueste lo que cueste. La determinación es tu fuerza, no la velocidad.",
        "bajo_presion": "Te cierras en una sola dirección y te cuesta reconsiderar, aunque el terreno haya cambiado.",
        "teme": "Haber invertido esfuerzo en un camino equivocado y tener que reconocerlo.",
        "seria_mas_eficaz_si": "Distinguieras entre perseverancia y obstinación: no es lo mismo sostener el rumbo que negarte a mirar el mapa de nuevo.",
    },
    "AO": {
        "nombre": "Caminante que Observa en Compañía",
        "motivacion": "Entender profundamente a quienes te rodean, más que al terreno en sí. Escuchas antes de opinar.",
        "bajo_presion": "Te retraes, procesas en silencio, y puedes parecer distante justo cuando más se te necesita cerca.",
        "teme": "Malinterpretar a alguien importante, o que te malinterpreten sin oportunidad de explicarte.",
        "seria_mas_eficaz_si": "Confiaras en compartir una primera impresión, aunque no esté aún del todo verificada.",
    },
    "PAO": {
        "nombre": "Caminante Estratega",
        "motivacion": "Avanzar con otros, pero solo por una ruta ya estudiada. Combinas impulso, relación y cálculo a partes iguales.",
        "bajo_presion": "Tomas el mando del grupo con un plan ya trazado, aunque no siempre lo consultes antes.",
        "teme": "Que el grupo se disperse por falta de dirección clara.",
        "seria_mas_eficaz_si": "Dejaras espacio para el plan que no es el tuyo, y confiaras en que el grupo también sabe leer el terreno.",
    },
    "ASO": {
        "nombre": "Caminante que Cuida el Proceso",
        "motivacion": "Que el grupo llegue entero, con cada paso bien dado y sin forzar a nadie a correr.",
        "bajo_presion": "Ralentizas aún más para no dejar a nadie atrás, incluso cuando la situación pide avanzar.",
        "teme": "Que tu cuidado se confunda con lentitud, o que alguien se sienta al margen del camino.",
        "seria_mas_eficaz_si": "Aceptaras que a veces cuidar bien también significa avanzar, no solo esperar.",
        "retrato": "Caminas para que el grupo llegue entero, con cada paso bien dado y sin forzar a nadie a correr. Cuidas el ritmo y el proceso por igual. Tu don es que nadie se pierda por el camino; tu aprendizaje, ver que a veces cuidar bien también significa avanzar.",
    },
    "PAS": {
        "nombre": "Caminante Motor",
        "motivacion": "Que el grupo avance de forma constante, sin frenar pero sin quemar a nadie. Combinas impulso, cercanía y ritmo sostenido.",
        "bajo_presion": "Empujas con energía pero te guardas el análisis para después: decides y ya revisarás sobre la marcha.",
        "teme": "Que el grupo pierda la cohesión por ir demasiado rápido, o el ritmo por pararte a pensar de más.",
        "seria_mas_eficaz_si": "Te detuvieras antes de empujar, no después: la prisa por mantener unido al grupo a veces te impide ver que el rumbo no es el correcto.",
        "retrato": "Mantienes al grupo en marcha: empujas con energía, cercanía y ritmo, sin frenar pero sin quemar a nadie. Decides sobre la marcha y ya revisarás después. Tu fuerza es sostener el movimiento; tu reto, parar a pensar antes de empujar, no después.",
    },
    "PSO": {
        "nombre": "Caminante de Paso Firme",
        "motivacion": "Avanzar con paso firme, sin prisa pero sin pausa, y siempre sobre terreno ya comprobado.",
        "bajo_presion": "Te vuelves inflexible: confías tanto en tu método que te cuesta admitir que quizá haya que cambiarlo.",
        "teme": "El error por descuido, y también el caos que rompería tu sistema de avance.",
        "seria_mas_eficaz_si": "Aceptaras pequeñas dosis de improvisación como parte legítima del camino, no como fallo del plan.",
    },
    "PASO": {
        "nombre": "Caminante en Equilibrio",
        "motivacion": "Ningún eje domina con claridad sobre los demás: decides, acompañas, sostienes y observas según lo pida cada momento, no según un patrón fijo.",
        "bajo_presion": "Respondes con la energía que la situación necesita, aunque puedes dudar unos instantes de más al no tener un modo por defecto claro.",
        "teme": "Perder esa capacidad de adaptarte y caer en un solo modo de caminar.",
        "seria_mas_eficaz_si": "Confiaras en que esa versatilidad ya es una fuerza en sí misma, y no algo que compensar por no tener un tipo definido.",
    },
}

# --- Aplicar a preguntas ---
with open(f'{BASE}/preguntas_paso.json') as f:
    preguntas = json.load(f)
for q in preguntas:
    p, a, s, o = GRUPOS[q["grupo"]]
    q["palabra_p"], q["palabra_a"], q["palabra_s"], q["palabra_o"] = p, a, s, o
with open(f'{BASE}/preguntas_paso.json', 'w') as f:
    json.dump(preguntas, f, ensure_ascii=False, indent=2)

# --- Aplicar a patrones ---
with open(f'{BASE}/patrones_paso.json') as f:
    patrones = json.load(f)
for pat in patrones:
    ov = PATRONES.get(pat["codigo"], {})
    for k, v in ov.items():
        pat[k] = v
with open(f'{BASE}/patrones_paso.json', 'w') as f:
    json.dump(patrones, f, ensure_ascii=False, indent=2)

print("JSON fuente actualizados. Regenerando paso-content.ts...")
subprocess.run(['python3', '/Users/manuelrueda/ikicard-app/scripts/gen-paso.py'], check=True)
