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
PATRONES = {
    "PPPP": {
        "nombre": "Caminante Frontal",
        "bajo_presion": "Se vuelve más tajante, no más despacio. Decide rápido y exige que los demás sigan el ritmo.",
        "teme": "La irrelevancia. Quedarse sin avanzar, sin nada que conquistar, le pesa más que cualquier fracaso.",
    },
    "AAAA": {"nombre": "Caminante en Compañía"},
    "SSSS": {"nombre": "Caminante que Sostiene"},
    "OOOO": {"nombre": "Caminante que Observa"},
    "PA": {
        "nombre": "Caminante que Arrastra",
        "teme": "Que el grupo avance sin su empuje, o que nadie note lo lejos que ha llegado.",
        "retrato": "Avanzas rápido y no caminas en soledad: llevas a otros en tu impulso. Necesitas tanto llegar como que se note lo lejos que has llegado. Tu fuerza mueve a grupos enteros; tu reto, mirar atrás y preguntar antes de arrastrar.",
    },
    "PO": {
        "nombre": "Caminante que Calcula",
        "bajo_presion": "Se vuelve distante y cortante, priorizando la eficacia sobre cualquier consideración que la ralentice.",
    },
    "AS": {
        "nombre": "Caminante que Acoge",
        "retrato": "Caminas pendiente de que nadie se quede atrás. El ritmo lo marca quien va más despacio, porque para ti el camino solo vale si se recorre en compañía y en calma. Tu don es acoger; tu aprendizaje, entender que sostener a alguien no siempre es complacerlo.",
    },
    "SO": {"nombre": "Caminante del Método"},
    "PS": {"nombre": "Caminante que no se Desvía"},
    "AO": {
        "nombre": "Caminante que Observa en Compañía",
        "teme": "Malinterpretar a alguien importante, o que le malinterpreten sin oportunidad de explicarse.",
    },
    "PAO": {"nombre": "Caminante Estratega"},
    "ASO": {
        "nombre": "Caminante que Cuida el Proceso",
        "teme": "Que su cuidado se confunda con lentitud, o que alguien se sienta al margen del camino.",
        "retrato": "Caminas para que el grupo llegue entero, con cada paso bien dado y sin forzar a nadie a correr. Cuidas el ritmo y el proceso por igual. Tu don es que nadie se pierda por el camino; tu aprendizaje, ver que a veces cuidar bien también significa avanzar.",
    },
    "PAS": {
        "nombre": "Caminante Motor",
        "retrato": "Mantienes al grupo en marcha: empujas con energía, cercanía y ritmo, sin frenar pero sin quemar a nadie. Decides sobre la marcha y ya revisarás después. Tu fuerza es sostener el movimiento; tu reto, parar a pensar antes de empujar, no después.",
    },
    "PSO": {"nombre": "Caminante de Paso Firme"},
    "PASO": {
        "nombre": "Caminante en Equilibrio",
        "teme": "Perder esa capacidad de adaptarse y caer en un solo modo de caminar.",
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
