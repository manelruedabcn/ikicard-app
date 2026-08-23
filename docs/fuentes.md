# Fuentes de IKIBOARD

De dónde se nutre cada pieza de la lógica del IKIBOARD. Regla de oro: **los libros de Manel son la verdad** (la biblia); lo que se añade es enriquecimiento, y siempre distinguible. Ninguna zona ni frase del tablero se inventa: todo tiene una fuente aquí.

---

## Los libros fuente (la biblia)

Manuscritos en OneDrive: `MANEL AUTOR/IKIGAI/MANUSCRITOS/CASTELLANO/`

| Clave | Libro | Archivo | Qué aporta |
|---|---|---|---|
| **IKIGAI** | *El Ikigai que no te contaron* | `El_Ikigai_que _no_te_contaron_00.docx` | Los tests puntuables (Estrellas, CAMINO), la matriz, las 4 preguntas del ikigai |
| **CAMINA** | *Camina sin separarte de ti* | `Camina_sin_separarte_de_ti_definitivo.docx` | La brújula de las máscaras y los ejercicios de honestidad / cuerpo / deseo |
| **MASTER** | *IKIGAIER* (master bruto) | `IKIGAIER (6 x 9)-MASTER BRUTO  FEBRERO  2026.docx` | Capítulo de Relaciones (mapa de vínculos), presencia consciente, 5 arrepentimientos |

Extracción de texto: `unzip -o "<docx>" word/document.xml` y parsear los `<w:t>`.

---

## Reglas que rigen el uso de las fuentes

1. **Bases ocultas.** DISC, cábala, Sefirot y PNL no se muestran al usuario. Los nombres propios de las herramientas de Manel (PASO, Las cuatro estrellas, CAMINO y Máscaras) se conservan en sus módulos independientes; dentro del journey de IKIBOARD aparece primero su significado humano, no una acumulación de etiquetas.
2. **La voz es de Manel.** Todo copy se muestrea del manuscrito. Calma, honesta, directa, sin tono publicitario ni frases etéreas "solo para iniciados".
3. **El libro gana.** Ante conflicto entre mi aporte y el libro, manda el libro.
4. **Determinista fuera de la IA.** La lógica del borrador es código puro (sumar puntuaciones, buscar en tablas). Ningún paso depende de que una IA interprete texto libre.

---

## Las tres capas de la lógica

```
CAPA 1 · INSTRUMENTOS  (revelan tu materia prima)
   Máscaras (7) · Estrellas (4) · CAMINO (6)
                    ↓
CAPA 2 · DEFINIR  (destila tu propósito)  = Fase 1 de IKIBOARD
   4 miradas → propósito → identidad → lo que das → freno → paso
                    ↓
CAPA 3 · HABITAR  (vives el propósito)  = Fase 2, el tablero
   4 zonas de vida: Cuerpo y vida · Vínculos · Lo material · Vocación
```

IKIBOARD es el director de orquesta: los instrumentos suenan, DEFINIR los recoge en una frase, el tablero los pone delante cada día.

---

## Los instrumentos (tests puntuables → deterministas)

### Máscaras — 7 tipos
- **Fuente:** CAMINA, "La brújula de las máscaras" + Ejercicio 2 "Mi máscara dominante". (Máscaras extra Desconfiado/Solitario en MASTER, aún no incorporadas.)
- **Mecánica:** 7 frases, puntúas 1–5 → dominante + top3 + miedo debajo. Umbrales del libro: 4–5 gobierna, 3 asoma, 1–2 no te define.
- **Ya existe** como módulo (`/mascaras`, tabla `mask_results`).
- **Alimenta:** el **freno** del tablero + la semilla del **paso** (parte 4 del ejercicio, "empezaría por…").

### Estrellas (Cuatro Estrellas) — 4 estilos
- **Fuente:** IKIGAI, "Test de las cuatro estrellas".
- **Mecánica:** 20 frases 1–5, suma por bloques → estilo dominante.
  - Explorador (1–5) · Comunicador (6–10) · Protector (11–15) · Visionario (16–20).
  - Cada estilo trae Características / Fortalezas / Desafíos / Profesiones / Referente (Ada Lovelace, Maria Montessori, Mieko Kamiya, Frida Kahlo).
- **Alimenta:** "lo que amas" + la identidad ("estoy siendo alguien que…"); es el **eje-fila** del cruce.

### CAMINO — 6 orientaciones
- **Fuente:** IKIGAI, "Test CAMINO".
- **Mecánica:** 30 frases 1–5, suma por bloques → orientación dominante.
  - Constructor (1–5) · Analista (6–10) · Maestro (11–15) · Innovador (16–20) · Negociador (21–25) · Organizador (26–30).
  - Las 30 frases y las descripciones de los 6 tipos ya están digitalizadas en el módulo CAMINO.
- **Alimenta:** "lo que se te da bien" (tus capacidades); es el **eje-columna** del cruce.

### Matriz Estrella × CAMINO — 24 celdas
- **Fuente:** IKIGAI, "Matriz ESTRELLA / CAMINO (I y II)".
- **Mecánica:** `matriz[estrella][camino]` → una celda de 24, la orientación más específica del ikigai activo (con ejemplo real: p. ej. Explorador×Constructor → "proyectos al aire libre / Thomas Andrews"; Protector×Maestro → "educadores sociales / Clara Barton").
- **Alimenta:** la zona **Vocación** (auto-genera) + la columna vertebral del **propósito** + las **instrucciones para seguir tu camino**.
- **Ojo:** la matriz es TODA ikigai activo = Vocación. No cubre Cuerpo ni Vínculos.

### Las 4 preguntas del ikigai
- **Fuente:** IKIGAI, "Las cuatro preguntas" / "Los cuatro pilares".
- ¿Qué amas? · ¿En qué eres bueno? · ¿Qué necesita el mundo de ti? · ¿Por qué te pueden pagar?
- Intersecciones: Pasión, Misión, Profesión, Vocación.
- **Alimenta:** el esqueleto de la Fase 1 (las 4 miradas) que los instrumentos rellenan.

---

## Los ejercicios guiados (no puntúan → guían, tú los llenas)

Cubren las zonas que la matriz no alcanza. No auto-generan un "tipo"; ofrecen una semilla honesta en la voz de Manel que la persona completa.

### El deseo — el corazón del tablero
- **Fuente:** CAMINA, Ejercicio 1 "¿Dónde me estoy alejando de mí?", **Pregunta 4: "¿Qué deseo que no me atrevo a reconocer?"**
- **Alimenta:** el **pórtico del montaje del tablero** — el punto donde IKIBOARD deja de ser test y se vuelve deseo.
- Complemento: MASTER, los **5 arrepentimientos de Bronnie Ware** (no vivir fiel a ti, no cuidar tus relaciones, no permitirte ser feliz) como marco para destapar deseos.

### Las otras 3 preguntas de Camina Ej.1
- P1 "¿Qué funciona pero ya no me representa?" → punto de partida / lo que sobra.
- P2 "¿Qué sostengo por miedo, imagen o costumbre?" → refuerza el **freno**.
- P3 "¿Qué hago bien pero me vacía?" → el **anti-ikigai** (lo que NO va en Vocación).

### Vínculos
- **Fuente:** MASTER, Ejercicio 7.2 "Mapa de relaciones".
- Te dibujas en el centro; colocas a las personas significativas; anotas qué te aporta cada una (apoyo, inspiración, paz, confianza, creatividad, claridad); eliges **un gesto pequeño para nutrir** las que te sostienen; marcas las que te drenan.
- **Alimenta:** los deseos de la zona **Vínculos** + el "**¿qué doy?**" de esas tarjetas (el gesto para nutrir).

### Cuerpo y vida
- **Fuente:** CAMINA, Ejercicio 3 "¿Dónde sientes la desconexión?" (dónde lo notas en el cuerpo, qué sensación, qué emoción) + MASTER, **presencia consciente** (respiración, sensaciones, entorno) y el material de **equilibrio / saturación**.
- **Alimenta:** los deseos de la zona **Cuerpo y vida** (salud, energía, ritmo, descanso).

---

## Mapa final: cada pieza del IKIBOARD → su fuente

| Pieza del tablero | Fuente | Tipo |
|---|---|---|
| **Propósito** (preside) | Matriz Estrella×CAMINO + 4 preguntas ikigai (IKIGAI) | determinista |
| **Identidad** ("estoy siendo…") | Estrella dominante (IKIGAI) | determinista |
| **Zona Vocación** | Matriz Estrella×CAMINO (IKIGAI) | auto-genera |
| **Zona Vínculos** | Mapa de relaciones (MASTER 7.2) | guiado |
| **Zona Cuerpo y vida** | Desconexión + presencia (CAMINA Ej.3 / MASTER) | guiado |
| **Zona Lo material** | deseo tangible: hogar, coche, medios, lugares y estabilidad | guiado por el usuario |
| **El deseo** que abre el tablero | CAMINA Ej.1 P4 + 5 arrepentimientos (MASTER) | pórtico |
| **"¿Qué doy?"** | misión (IKIGAI) + gesto para nutrir (MASTER 7.2) | mixto |
| **El freno** (motor) | Máscaras (CAMINA) + Ej.1 P2 | determinista |
| **El paso** | Ejercicio máscara parte 4 (CAMINA) | del usuario |
| **Instrucciones para tu camino** | celda de la matriz + freno + paso | determinista |

**Conclusión:** ninguna zona queda en blanco ni inventada. Vocación se rellena sola desde los tests; Vínculos y Cuerpo se rellenan con un ejercicio corto en la voz de Manel; el deseo (Camina Ej.1 P4) es lo que enciende todo.
