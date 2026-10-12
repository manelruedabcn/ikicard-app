# Inventario honesto — el test de entrada (lead magnet)

Test de ikigai **gratuito y sin cuenta** en `/inventario`. Es la puerta del
embudo para quien no conoce a Manel: «No te dice a qué dedicarte. Te dice desde
dónde empiezas». Convive con PASO (`/paso`), que sigue siendo el test de
autoconocimiento gratuito; no lo sustituye.

## Recorrido previsto (decidido con Manel, oct-2026)

1. **Inventario honesto** (este módulo) → devolución en pantalla + email.
2. **Un mes conociendo tu ikigai** (gratuito, solo texto): instrucciones por
   escrito 1–2 veces por semana + 1–2 encuentros en grupo; por grupos con fecha
   de inicio. Semana 4: repetir el Inventario y comparar. *Pendiente (paso 2).*
3. Al final, lo de pago: curso online en vídeo (2 h), taller, 1 a 1; aparte,
   libro y mazo (Viaje). En el mes **no** entran miedo, máscaras ni diálogo
   interno como temas (quedan para el curso), ni cartas del mazo.

## Qué es y qué no es

- 15 preguntas cerradas + 1 abierta opcional. Todas ancladas en
  *El Ikigai que no te contaron* (la fuente aparece bajo cada pregunta).
- Activo (5): las cuatro preguntas del mapa (cap. 4) + elegir la frase de
  CAMINO que otros te reconocen (sin puntuar). Consciente (6): presencia,
  cotidiano, paz (cap. 1 y 4), valor negociado y apagarte (cap. 7), vínculo
  (cap. 8). Entre las dos (2): ritmo y energía (cap. 7). Contexto (2):
  ocupación y piloto automático (cap. 1). Abierta: lo que aplazas (cap. 1).
- **No** mide ni diagnostica: no hay puntuación global, perfiles ni
  porcentajes. Las escalas son una **adaptación editorial** (el libro pide una
  palabra o una respuesta escrita en estos ejercicios).
- **Cero IA**: reglas fijas sobre códigos. El texto libre se devuelve literal
  y nunca se interpreta.

## Dónde está cada cosa

| Pieza | Archivo |
|---|---|
| Reglas (códigos, sin texto) | `lib/inventario.ts` |
| Textos, devolución y versión en texto | `lib/inventario-content.ts` |
| Página pública | `app/[locale]/inventario/` |
| Registrar test completado | `app/api/inventario/track` |
| Email + consentimiento + CRM | `app/api/inventario/lead` |
| Correo de la devolución | `sendInventarioEmail` en `lib/email.ts` |
| Tablas | `migrations/inventario.sql` |

La página, el servidor y el email usan **la misma** función
(`buildDevolucion`): la lectura es idéntica en los tres sitios. El servidor
recalcula a partir de los códigos; no acepta texto del cliente salvo la
respuesta abierta.

## Reglas (propuesta editorial, revisar con datos)

- **Activo claro**: «claro» en casi todas las cuatro preguntas (si «de qué
  vivir» es «no es mi pregunta», se cuentan tres).
- **Activo abierto**: 2+ respuestas «ahora mismo no / no lo sé».
- **Presencia baja**: ni momento de ayer ni gesto cotidiano. **Alta**: ambos sí.
- **Coherencia (atención)**: valor negociado de forma continua o «tengo que
  apagarme». **(sostiene)**: puede ser quien es y no negocia valores.
- **Desgaste**: ritmo que desgasta **y** casi nunca energía al terminar el día.
- **Incierto**: 4+ respuestas de «no lo sé / depende» → ruta propia.
- Prioridad de la observación principal: desgaste → coherencia → presencia →
  Activo abierto → vínculo → paz. Se muestra una principal y, como mucho, una
  línea «También marcaste».
- Lo que sostiene: como mucho una pieza Activo y una Consciente.
- Ejercicio (literal del libro): desgaste → La ecología de tu semana (7);
  coherencia → Escucha tu voz interna (11); presencia → Encuentra tu cotidiano
  (4); Activo abierto → Lo que dejaste atrás (4); vínculo → El contraste
  interno (8); paz → Los siete pilares hoy (10); nada → Tu ikigai en el tiempo
  (9); incierto → El inventario honesto (1).
- Sin empleo remunerado (cuidados, estudios, búsqueda, jubilación): nota fija
  sobre «de qué podría vivir»; el desgaste no se interpreta.

## Textos nuevos (no son del libro) — pendientes de revisión de Manel

En `lib/inventario-content.ts`: las frases de las columnas (`MIRROR_ES`), los
textos de «lo que sostiene» (`SUPPORTS_ES.text`), los `lead`/`note`/`intro` de
cada observación, las rutas «incierto»/«nada», las dos notas de «dos
respuestas juntas» y el chrome (portada, cierre, email). Las citas (`quote`) y
los ejercicios son literales del libro.

## Datos y privacidad

- `inventario_attempts`: respuestas cerradas (códigos) de cada test completado,
  sin PII. El texto libre solo se guarda si la persona pide la devolución por
  email (se enlaza a su lead).
- `inventario_leads`: email único. Envío de la devolución = transaccional.
  Marketing solo con el checkbox (`consent`), que no se pierde si repite el test
  sin marcarlo. Baja con enlace firmado `inv:<id>` → marca el lead y el CRM.
- CRM: origen `inventario`, etiqueta «Inventario honesto». `?src=` en la URL
  (o `utm_source`) se guarda como canal (blog, libro, taller, linkedin…).

## Idiomas

Solo español por ahora. `/ca/inventario` y `/en/inventario` muestran el
contenido en español hasta que exista la traducción (mismo criterio que la
primera versión de `heridas`).
