# IKIGAIER — contexto de producto, marca y negocio

> **Origen:** documento generado por el Proyecto de Claude.ai "PROYECTO IKIGAIER"
> (26 documentos: producto, marca, negocio, contenido) el 23-08-2026, e importado
> aquí para que las sesiones de código no trabajen a ciegas sobre tono, colores,
> avatares o modelo de negocio. Resumen fiel; los originales (72 preguntas del
> mazo, tests completos, guía de sesión, plan de negocio) siguen en ese Proyecto web.
> Complementa a `docs/ikiboard.md` (herramientas construidas) y a `CLAUDE.md`.

---

## 0. Qué es esto en una frase

**IKIGAIER / Ikigai Consciente** es el proyecto personal de Manel Rueda: cuatro libros, un mazo físico de 72 cartas, una newsletter en Substack ("Cartas desde Ikigai Consciente" / "Cartas IKIGAIER"), y una mentoría 1:1, todo construido sobre un mismo sistema interno de cuatro fases (Despertar → Descender → Atravesar → Retornar) que nunca se nombra tal cual de cara al público. La web tiene que sostener y conectar estas piezas, no inventar una nueva.

Dominio ya existente: **ikigaier.com** (ej. `https://www.ikigaier.com/es/taller/`, página de lista de espera del taller). Substack: cartas quincenales bajo el nombre "Cartas desde Ikigai Consciente" / "Cartas IKIGAIER".

---

## 1. El autor y el origen

Manel Rueda viene de ingeniería y dirección de empresas. Aplicó el ikigai clásico de los cuatro círculos (pasión / vocación / profesión / misión) como quien resuelve un problema técnico, hasta que un cambio profesional radical se lo rompió. Ahí distinguió dos capas que el ikigai popular no separa:

- **Ikigai Activo**: el que construye, dirige, produce. Mira hacia fuera y hacia adelante.
- **Ikigai Consciente**: el que habita, respira, no necesita llegar a ningún sitio para tener valor. Mira hacia dentro y hacia ahora.

Su tesis en seis palabras: *"el ikigai real es uniendo los dos"*. Todo el proyecto — libros, mazo, cartas, mentoría — es la exploración de esa unión, con foco especial en la parte consciente que el ikigai de internet deja fuera.

---

## 2. El ecosistema completo de producto

Todas estas piezas son la misma estructura interna contada en distintos formatos y momentos del recorrido de una persona. No compiten entre sí.

| Pieza | Qué es | Estado |
|---|---|---|
| 4 libros | *El Ikigai que no te contaron*, *Disciplina para indisciplinados*, *Camina sin separarte de ti*, *No todo lo que te frena es tuyo* | Escritos, en Google Drive del proyecto como .docx |
| Mazo IKIGAIER | 72 cartas físicas, edición fundacional de 50 numeradas y firmadas a mano | Diseño y brief de producción cerrados; producción en marcha |
| Cartas de Substack | Newsletter quincenal, tono íntimo, sin venta directa en el cuerpo | 6 cartas ya escritas (ver sección 10) |
| Mentoría 1:1 | Sesión de acompañamiento de 60-75 min usando el sistema de 4 fases | En fase de piloto (agosto 2026) |
| Taller / Modo Círculo | Sesión en grupo (2-6 o 8-12 personas) con el mazo | Primer taller "Camina sin separarte de ti" en preparación, sin fecha aún; landing de lista de espera ya publicada en ikigaier.com |
| IKIBOARD | "El libro de fotos de tu futuro": producto/imán de conversión del funnel público, ya construido en código en otro repo (`epitaxy`, `docs/ikiboard.md`) | Definido pero documentado solo parcialmente aquí — ver sección 13 |
| Gestor de contenido (`gestor_ikigaier_1.html`) | Mini-app interna para trackear cartas y notes de Substack con métricas (vistas, likes, comentarios, restacks, nuevos suscriptores) y un panel de análisis de rendimiento | Ya construida, vive dentro de este proyecto de Claude |

**Cada libro es la puerta de entrada a una o dos fases del sistema.** El mazo confronta, el libro explica, cada pieza se sostiene sola.

---

## 3. El mazo IKIGAIER — estructura completa

72 cartas: 60 de juego (15 por fase) + 8 comodines + 4 tarjetas de instrucciones. Caja metálica física.

**Las cuatro fases** (cada una con 15 preguntas ya redactadas, ES/EN, ver el inventario completo si hace falta reproducir contenido exacto):

- **DESPERTAR** (D01-D15) — reconocerte, lo que te enciende. Cartas de entrada, no incomodan. Color: crema pergamino `#E8DCC4` / texto `#3A2A15`.
- **DESCENDER** (E01-E15) — mirar lo que evitas, lo pospuesto, lo imitado. Empieza la fricción. Color: terracota `#B8693D` / texto `#F2E8D5`.
- **ATRAVESAR** (A01-A15) — tocar hueso: muerte, duelo, miedo, perdones no dados. Cartas duras. Color: granate profundo `#4A1C1C` / texto `#E8DCC4`.
- **RETORNAR** (R01-R15) — elegir y comprometerte. No pregunta, da órdenes. Color: oro viejo `#D4B26A` / texto `#3A2A15`.

**Comodines** (8, marfil `#F2E8D5` / texto `#2A1810`): 3 Espejo (X1-X3, alteran perspectiva), 2 Silencio (X4-X5, minuto o escritura sin hablar), 2 Intercambio (X6-X7, responder la carta de otro), 1 Legado (X8, carta en blanco donde el jugador escribe su propia pregunta y la firma).

**Instrucciones** (4, negro `#0A0A0A` / oro `#D4B26A`, mismo cromado que el reverso): cómo se juega, las tres reglas, los tres umbrales, ritual final.

**Tres modos de juego:**
1. **Oráculo** — solo, 3 minutos al día, una carta al azar. Puerta de entrada de baja fricción.
2. **Viaje** — solo, 21 días, tres cartas al día en orden por las cuatro fases, con un umbral físico entre cada fase y un ritual final el día 21.
3. **Círculo** — 2 a 6 personas, cada uno roba y responde en voz alta, los demás pueden hacer una sola pregunta.

**Los tres umbrales** (actos de paso obligatorios entre fases):
- Antes de Descender: "Lo que más temo encontrar aquí es…"
- Antes de Atravesar: releer la carta de Descender que más removió, leerla en voz alta.
- Antes de Retornar: escribir una excusa usada toda la vida, tacharla sin borrarla.

**Tono del mazo** (aplica a cualquier texto futuro del universo IKIGAIER, web incluida): sobrio, adulto, directo, a veces incómodo. No promete resultados, no motiva, no celebra, no usa emojis. Pregunta, no explica por qué pregunta. Prueba de fuego para cualquier copy nuevo: *¿suena a alguien que encontró algo y lo comparte, o a alguien que sabe más que tú y viene a enseñártelo? Solo lo primero es IKIGAIER.*

---

## 4. La arquitectura interna — Cuatro Mundos (nota de autor, NO explicar en la web)

Las cuatro fases del mazo, de la guía de mentoría y del sistema entero siguen, sin nombrarlo nunca en público, los Cuatro Mundos de la tradición cabalística: Despertar = Asiyá (acción/materia), Descender = Yetzirá (formación/emoción), Atravesar = Beriá (creación/mente), Retornar = Atzilut (emanación, la más cercana a la fuente). El oro del reverso del mazo y el oro de la fase Retornar son el mismo oro a propósito: el jugador ha estado viendo el destino durante todo el viaje sin saberlo.

**Regla de oro para la web**: esta capa no se nombra ni se explica nunca al usuario/lector/cliente. "Se hace, no se explica." Esto es información de contexto para quien construye, no contenido para publicar.

Cada fase también tiene un respaldo teórico emparejado (para quien diseñe contenidos, no para mostrar en la web con estos nombres): Despertar con Frankl (vacío existencial, dimensión creativa del sentido), Descender con Erikson (generatividad vs. estancamiento) y la técnica de reencuadre en 6 pasos de PNL, Atravesar con Hollis (pregunta del alma en la segunda mitad de la vida) y el metamodelo del lenguaje, Retornar con Brooks (primera y segunda montaña, los cuatro compromisos) y anclaje/asociación de estado.

---

## 5. Sistema de diagnóstico del usuario (capas transversales)

Esto es relevante para la web porque probablemente alimenta tests interactivos, landing pages de captación o el propio IKIBOARD.

1. **Las 3 heridas / "3 pains"** — profesional, relacional, vital. Test de 15 ítems (5 por bloque), escala 1-5. Responde "¿por dónde entra el dolor?". Tiene doble uso: filtro público antes de apuntarse a un programa, y diagnóstico previo a la sesión 1:1. (Test completo redactado en `Guia_Ikigai_Consciente_El_Sistema.md`, sección V — pedir ese documento si hace falta el texto exacto de las 15 frases.)
2. **Las 7 máscaras** — Exigente, Controladora, Manipuladora, Jueza, Complaciente, Víctima, Impostora. Cada una protege de un miedo concreto (no estar a la altura, perder el control, mostrarse tal cual es, ser criticada, el rechazo, no poder cambiar, ser descubierta). Test ya digitalizado en `Herramienta_test_mascaras.md`, con contrato de voz propio (ver sección 9).
3. **Sesgos y creencias** — de *No todo lo que te frena es tuyo*: 10 sesgos, 10 creencias, matriz amenaza → disparo → conducta → refuerzo → corte.
4. **8 patrones de indisciplina** — de *Disciplina para indisciplinados*. No se administra como test en vivo, es trabajo de "deberes" entre sesiones.
5. **Ikigai Activo vs. Ikigai Consciente** — el eje de fondo, no un test puntual.

**Hipótesis de cruce herida-máscara** (sin validar con datos aún): profesional → Exigente/Impostora; relacional → Complaciente/Jueza; vital → Controladora/Víctima; Manipuladora es transversal.

---

## 6. Identidad visual — sistema de diseño ya cerrado

Esto viene directamente del brief técnico de producción del mazo físico y es la base de marca más literal que existe. Reutilizable en la web tal cual:

**Símbolo de marca**: los cinco anillos entrelazados de IKIGAIER, extraídos de la portada del libro *El Ikigai que no te contaron*. Activo maestro: PNG con transparencia, mínimo 3000×3000 px, color `#D4B26A` (oro viejo) sobre fondo `#0A0A0A` (negro noche). **Este PNG no está todavía en este espacio de proyecto** — hay que extraerlo de la portada del libro o pedírselo a Manel antes de maquetar la web.

**Paleta completa** (ya usada en las 72 cartas, coherente en toda la marca):

| Elemento | Fondo | Texto/símbolo |
|---|---|---|
| Base / reverso | `#0A0A0A` negro noche | `#D4B26A` oro viejo |
| Despertar | `#E8DCC4` crema pergamino | `#3A2A15` marrón oscuro cálido |
| Descender | `#B8693D` terracota | `#F2E8D5` marfil |
| Atravesar | `#4A1C1C` granate profundo | `#E8DCC4` crema pergamino |
| Retornar | `#D4B26A` oro viejo | `#3A2A15` marrón oscuro cálido |
| Comodines | `#F2E8D5` marfil cálido | `#2A1810` marrón casi negro |

**Tipografía**: texto central/cuerpo en **Lora Regular** (alternativas: EB Garamond, Cormorant Garamond — las tres gratis en Google Fonts). Elementos secundarios (etiquetas, metadatos) en **Inter Regular**, con letter-spacing alto para mayúsculas tipo "D E S P E R T A R". Ambas disponibles vía Google Fonts, cargables sin problema en una web.

**Sensación general**: cálida, editorial, con negro y oro como ancla. Nada de estética de app de bienestar genérica (sin verdes menta, sin ilustraciones de líneas finas tipo Headspace). El mazo físico, con su caja metálica, marca el nivel de artesanía y sobriedad que la web debería transmitir.

---

## 7. A quién habla — los tres avatares

El proyecto tiene tres perfiles de audiencia candidatos, deliberadamente distintos, que se lanzan uno detrás de otro (no en paralelo) para no diluir la señal.

**Avatar A — El directivo en crisis silenciosa** (el que se está probando ahora, agosto 2026). 40-58 años, carrera consolidada. Dos capas de herida: profesional (la IA devalúa su experiencia, edadismo, ansiedad de quedarse atrás) y vital, más honda y menos verbalizada (hijos que se independizan, amistades que se diluyen, padres que empiezan a faltar, la sensación de ser "el siguiente en la fila" pese a haber hecho todo lo esperado). Rechaza tono motivacional, frameworks de LinkedIn, que le reduzcan esto a "crisis de los 40" resoluble con un hobby. Puerta de entrada: mentoría 1:1 o mazo en Modo Oráculo.

**Avatar B — El buscador cansado de fórmulas**. 30-50 años, ya pasó por terapia/mindfulness/cursos, desconfía de la palabra "framework". Puerta de entrada: mazo en Modo Círculo (candidato natural a futura certificación de facilitadores).

**Avatar C — El que tiene algo terminado que no suelta**. 28-45 años, perfil creativo, perfeccionismo disfrazado de exigencia, miedo a no estar a la altura (territorio exacto de la Carta 5, ver sección 10). Puerta de entrada: el libro *El Ikigai que no te contaron* + Modo Oráculo, sin pedirle nada de pago todavía.

Para la web, esto importa porque la home y las páginas de producto probablemente deben hablarle con precisión al Avatar A ahora mismo, sin cerrar la puerta a los otros dos.

---

## 8. Modelo de negocio (relevante para páginas de producto/precio)

Progresión en tres fases, pensada para 8-15h/semana de disponibilidad:

- **Fase 1 (semanas 1-6, en curso)**: mentoría 1:1 (90-150€ sesión suelta, 400-480€ paquete de 4) y taller online en grupo (35-45€/persona, Modo Círculo).
- **Fase 2 (mes 2-5)**: mazo edición fundacional (60-80€, 50 unidades numeradas y firmadas), libros como funnel (ebook 4,99-7,99€, físico bajo demanda 12-16€ vía KDP), posible membresía de pago en Substack (6-8€/mes).
- **Fase 3 (mes 5-12)**: talleres corporativos B2B (600-1.200€ sesión única, 2.000-3.500€ programa de 3), tirada industrial del mazo (35-45€, vía MakePlayingCards/DriveThruCards), programa grupal de cohortes (150-250€/persona), certificación de facilitadores a explorar (300-500€).

**Ahora mismo (agosto 2026) el proyecto está en piloto de la mentoría 1:1**: 3 plazas, duración corta (2-4 semanas), precio de piloto 150-250€, filtro por Google Form, cobro por transferencia bancaria. Esto es lo más urgente y lo que probablemente necesita página de venta/reserva primero en la web.

Cobro/reservas: transferencia bancaria como método principal (Stripe solo si alguien lo pide explícitamente). Herramientas mencionadas para reservas: Calendly o Cal.com.

---

## 9. Voz y tono — dos capas que la web debe respetar

**Capa 1 — Contrato de voz general del proyecto** (de `Herramienta_test_mascaras.md`, aplica a cualquier copy): calma, honesta, cercana. Nada de tono publicitario ni motivacional de coach. Concreta y anclada, nunca mística o "solo para iniciados". Sin frameworks ni tecnicismos visibles. Frases cortas cuando conviene, sin adornos vacíos, sin emojis. Empieza con una escena reconocible, no con una definición. El lector se ve reflejado antes de que se le explique nada. Cierre honesto, sin promesas grandilocuentes.

**Capa 2 — Criterio de humanización de las cartas de Substack** (instrucción de proyecto, umbrales medibles, aplica sobre todo al contenido tipo newsletter/blog, no necesariamente a copy de producto rígido): evita "No es X, es Y" salvo una vez por pieza, dos puntos tipo "afirmación: reformulación" como máximo 2-3 veces, nada de guiones largos como inciso, cero emojis, cero listas con emoji-viñeta, cero arranques tipo "En un mundo donde...", cero cierres tipo "¿Y tú qué opinas?". Cada carta necesita un detalle real no fabricable. Cierre que revela un instante concreto, no que resume la tesis ni vende el libro en el cuerpo del texto.

Para la web, la parte que más aplica es la Capa 1: nada de lenguaje de landing page agresiva, nada de urgencia falsa, nada de iconos de check verdes y testimonios genéricos. Si hay copy tipo carta o storytelling en la home, aplica también la Capa 2.

---

## 10. Contenido ya escrito (Substack)

Seis cartas publicadas o en borrador hasta ahora, útiles como referencia de tono y como contenido que probablemente hay que enlazar o reflejar en la web:

1. **La primera carta — desde dónde te escribo** (8 jun 2026). Presentación del proyecto, el origen de Manel, la distinción Ikigai Activo/Consciente.
2. **Dos preguntas, no una** (14 jun 2026). Ikigai Activo vs. Ikigai Consciente explicado con la pregunta "¿qué hace que esta vida valga la pena?".
3. **El día que vives en piloto automático** (1 jul 2026). El "modo zombi", no hace falta una crisis para notarlo.
4. **¿Qué hago el martes que la consciencia pincha?**. Los días en que la teoría no funciona, las anclas personales (incluye a su gato, Güero).
5. **Un año revisando un libro que ya estaba terminado** (Carta 5, sobre la máscara de la Exigente/perfeccionismo, el momento de soltar el manuscrito tras una conversación con su madre en un hospital).
6. **Carta de anuncio del taller "Camina sin separarte de ti"** — dos versiones (larga para Substack, corta para email/WhatsApp), enlaza a `https://www.ikigaier.com/es/taller/` como landing de lista de espera, sin fecha ni precio todavía (a propósito).

---

## 11. Activos y URLs conocidos

- **Dominio**: ikigaier.com (ya existe, al menos con la landing `/es/taller/`).
- **Substack**: "Cartas desde Ikigai Consciente" / "Cartas IKIGAIER" (ej. `ikigaier.substack.com`).
- **Gestor de contenido interno**: `gestor_ikigaier_1.html`, mini-app ya construida (HTML/JS con `window.storage`) que trackea cartas y notes con métricas de Substack. Vive en este mismo espacio de proyecto, no en la web pública.
- **Los 4 libros completos** en `.docx`: *NO_TODO_LO_QUE_TE_FRENA_ES_TUYO_0.docx*, *Camina_sin_separarte_de_ti_definitivo.docx*, *El_Ikigai_que_no_te_contaron_00.docx*, *Disciplina_para_indisciplinados00.docx*. Fuente de citas, extractos y estructura de contenidos si la web necesita mostrar fragmentos o vender los libros.
- **IKIBOARD**: existe ya construido en código en otro repositorio del propio Manel (`epitaxy`, documentado en `docs/ikiboard.md`). No está traído a este proyecto todavía — si la web pública tiene que integrar o enlazar IKIBOARD, hay que ir a buscar esa documentación aparte.

---

## 12. Estado actual del proyecto (agosto 2026)

- Piloto de mentoría 1:1 en marcha: 3 plazas, precio 150-250€, duración corta, filtro por Google Form (pendiente de construir), secuencia de 3 emails de venta (problema / consecuencias / transformación) a la lista actual.
- Primer taller en vivo ("Camina sin separarte de ti") en preparación, sin fecha, con landing de lista de espera ya publicada.
- Producción de la edición fundacional del mazo (50 unidades) en marcha, según el brief técnico.
- El Avatar A (directivo en crisis silenciosa) es el que se está validando ahora; los Avatares B y C quedan en reserva.
- Fuente de todo el diagnóstico de negocio: mentoría externa con un asesor (Oscar Feito) el 22 de agosto de 2026, cuyo resumen y transcripción completa existen como documentos aparte si hace falta más detalle textual.

---

## 13. Cabos sueltos y decisiones abiertas (no inventar, preguntar a Manel)

- **El sistema de 4 fases (Despertar/Descender/Atravesar/Retornar) todavía no tiene nombre público.** Cuatro propuestas descartadas: "La Travesía Ikigaier", "El Recorrido Ikigaier", "Las Cuatro Puertas", "El Tránsito Ikigaier". Lo único fijado: no puede llamarse "Camino" (ese nombre ya lo ocupa el Test CAMINO). Si la web necesita nombrar este sistema en algún sitio, hay que resolver esto primero con Manel, no improvisar un nombre nuevo.
- **PASO** (una de las cuatro "coordenadas" de IKIBOARD, descrito como el lead magnet de entrada al funnel) no tiene ninguna documentación en este proyecto más allá de saber que existe y que es la puerta de entrada. Si la web va a usarlo como imán de conversión, hace falta traer esa documentación desde el otro repo (`epitaxy`) primero.
- **El símbolo de marca (PNG maestro)** no está como archivo en este espacio de proyecto; hay que extraerlo de la portada de *El Ikigai que no te contaron* o pedírselo directamente a Manel antes de maquetar cualquier cabecera o favicon.
- **La correlación herida-máscara** (sección 5) es hipótesis razonada, no validada con datos reales todavía.
- **Fecha, precio y plazas del taller** siguen sin cerrar (a propósito, según la Carta 6).

---

## 14. Cómo usar todo esto al construir la web

1. No reinventes el sistema de fases, la paleta ni el tono: todo eso ya está decidido y documentado arriba. La libertad creativa está en cómo se traduce a interfaz web, no en qué se dice o con qué colores.
2. Nunca expliques la capa cabalística/PNL (sección 4) en ningún texto de cara al público. Es contexto de construcción, no contenido.
3. La prioridad de negocio ahora mismo es la mentoría 1:1 en piloto y la lista de espera del taller — si hay que priorizar qué página construir primero, es probablemente una landing de mentoría/taller con formulario de filtro, no una web-escaparate completa.
4. Cualquier copy de marketing (hero de home, páginas de producto) debe pasar el contrato de voz de la sección 9, capa 1, como mínimo.
5. Si hace falta contenido nuevo (textos de producto, descripciones, preguntas de un test embebido) y no está ya escrito en este documento o en los originales del proyecto, pregunta antes de inventar tono o datos — sobre todo precios, fechas y afirmaciones sobre resultados.
6. Los documentos fuente completos (con más detalle del que cabe aquí: las 72 preguntas del mazo palabra por palabra, el test completo de las 3 heridas, el test completo de las 7 máscaras, la guía de sesión minuto a minuto, el plan de negocio íntegro) viven en el proyecto de Claude "PROYECTO IKIGAIER" y se pueden pedir en cualquier momento si Code los necesita textualmente.

---

## Notas de reconciliación código ↔ Proyecto web (añadidas al importar, 23-08-2026)

Dos desajustes detectados entre este documento y el repo real. **No tocar nada sin
confirmar con Manel** — se dejan anotados para no perder el hilo:

1. **Nombre del repo:** el Proyecto web cree que el código (IKIBOARD, PASO) vive en
   un repo llamado `epitaxy`. El repo real es **`ikicard-app`**
   (`github.com/manelruedabcn/ikicard-app`). Las herramientas construidas — PASO,
   Las cuatro estrellas, CAMINO, Máscaras, IKIBOARD — están **aquí**, no en un repo
   aparte. Conviene corregir esa referencia en el Proyecto web.
2. **Paleta (NO es un conflicto — cada cosa tiene la suya, a propósito):** el mazo
   usa negro `#0A0A0A` + oro `#D4B26A` como ancla; la **web pública (front) ya está
   acabada** con fondo crema `#FDFBF7`, texto `#272727` y acento terracota `#c2866b`.
   Son dos paletas distintas e intencionales, no algo pendiente de unificar.
   Tipografía compartida: **Inter + Cormorant Garamond**. (El *back* está en decisión
   aparte; no afecta al front, que está cerrado.)
