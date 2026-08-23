# CLAUDE.md — IKIGAIER (ikicard-app)

Contexto persistente del proyecto. Se carga cada sesión. Si algo aquí choca con
lo que ves en el código, gana el código — pero avísame para actualizar esto.

## Qué es esto

**IKIGAIER**: plataforma de autoconocimiento basada en permisos. No es "una app de
cards": es un ecosistema de herramientas que cada usuario va desbloqueando, con un
dashboard dinámico por usuario. Producto de **Manuel (Manel)**; se trabaja en
**español**. La voz de todo el copy es la de Manel (calma, honesta, sin tono
publicitario, muestreada de sus libros/manuscrito).

## Contexto de marca y producto — Ikigai Consciente / IKIGAIER

Este contexto existe para que cualquier trabajo sobre la app mantenga coherencia con el
sistema, el tono y el producto físico/editorial del que forma parte. Consultar antes de
tomar decisiones de copy, UX, gamificación o mensajes al usuario.

### Las dos almas del sistema

El marco se sostiene en dos dimensiones complementarias, nunca jerárquicas:

- **Ikigai Activo** — lo que la persona hace y construye: trabajo, proyectos, logros. Es el qué.
- **Ikigai Consciente** — desde dónde lo hace: presencia, coherencia, no traicionarse en las
  decisiones pequeñas. Es el cómo/desde dónde.

Un *ikigaier* es quien integra las dos. La app no debe reforzar solo el Activo (productividad,
logro, métricas de progreso) a costa del Consciente (presencia, pausa, honestidad interna).

### El producto IKIGAIER

Mazo de 72 cartas físico (edición fundacional limitada y numerada a mano) que forma parte del
ecosistema junto al libro Más allá del Ikigai. Estructura en cuatro fases de 15 cartas
(Despertar, Descender, Atravesar, Retornar), 8 comodines y 4 tarjetas de instrucciones. Tres
modos de juego: Oráculo (una carta al día, solo), Viaje (21 días, en solitario, con tres
umbrales entre fases), Círculo (2-6 personas, sesión guiada). Esta app es la extensión digital
de ese producto, no un sustituto ni un juego de gamificación genérico.

### Tono y voz — reglas duras para cualquier texto o interacción de la app

- Sobria, adulta, directa. A veces incómoda. Nunca solemne ni motivacional.
- No promete resultados, no afirma, no celebra en exceso, no usa emojis.
- No lenguaje de coach ni de "encuentra tu propósito en 5 pasos".
- No frameworks explicados al usuario. Se siente, no se explica.
- Confía en que el usuario sabrá qué hacer con cada pregunta, no se le dan respuestas.
- Prueba de fuego para cualquier texto nuevo: ¿suena a alguien que encontró algo y lo comparte,
  o a alguien que sabe más que tú y viene a enseñártelo? Solo lo primero vale.
- Nada de badges, rachas o notificaciones tipo "¡Vamos, tú puedes!". Si hay progreso o
  gamificación, debe sentirse ritual (umbrales, fases, sello), no como una app de hábitos.

### Público (para decisiones de producto/UX, no para segmentar copy explícitamente)

Tres avatares candidatos, validados uno a la vez: directivo/a en crisis silenciosa (40-58),
buscador/a cansado/a de fórmulas (30-50), alguien con un proyecto terminado que no suelta por
perfeccionismo (28-45). Los tres rechazan por igual el tono coach y las fórmulas rápidas.

### Nota

El sistema tiene una capa interna adicional (referencias a Cábala, PNL, y a los autores que
inspiran la metodología de mentoría 1:1) que es uso interno del autor y nunca se expone en el
producto, la app ni el copy de cara al usuario. Si el trabajo en este repo toca esa capa,
tratarla como confidencial de diseño, no como contenido a mostrar.

## Reglas de oro (no romper)

1. **Audita antes de tocar.** No rompas lo que ya está en producción: **IKICARD**,
   **Viaje**, **PASO**.
2. **RLS-first.** Toda tabla nueva con Row Level Security; el acceso a datos pasa
   por Supabase con políticas por usuario. Migración de Supabase **antes** que el
   código que la usa.
3. **Permisos por herramienta, sin condicionales hardcodeados.** El acceso se
   resuelve en `lib/entitlements.ts` (`getMyTools()` / `hasAccess(code)`), que
   delega en la función SQL `get_my_tools()`. Crece por **módulos**, no por `if`s.
4. **Bases ocultas.** DISC, cábala, PNL y demás marcos sostienen por debajo; sus
   términos **nunca** se muestran al usuario. Solo se ve la voz de Manel.
5. **Copy no etéreo.** Nada místico ni "solo para iniciados": concreto, anclado en
   lo que el usuario ya conoce, entendible a la primera.
6. **Los libros de Manel son la fuente de verdad.** Mi aporte enriquece aristas,
   no sustituye el material. Ver `docs/fuentes.md`.

## Stack

- **Next.js 14 (App Router)** + React 18 + TypeScript.
- **next-intl** para el chrome (nav/UI). Locales `['en','es']`, `defaultLocale: 'en'`.
  Ruta con segmento dinámico `[locale]`.
- **Supabase** (`@supabase/ssr`): auth, Postgres con RLS, Storage (bucket privado
  `ikiboard`). Clientes en `lib/supabase/` (client/server).
- **Resend** para email (`lib/notify.ts`, `lib/email.ts`). Plataforma de email
  marketing propia en construcción (no Mailchimp) — ver memoria.
- **jsPDF + html2canvas** para exportar informes a PDF (patrón PASO / Máscaras).
- Build: `npm run build` (usa `npx next build`; en macOS **no** hay `timeout`).

## El universo de herramientas

Cada herramienta = una migración `migrations/<tool>.sql` + carpeta
`app/[locale]/<tool>/` (page.tsx servidor que gatea con `hasAccess` + `<Tool>Client.tsx`)
+ contenido en `lib/<tool>-content.ts`. Resultados en su tabla `<tool>_results`.

| Herramienta | Ruta | Aporta | Estado |
|---|---|---|---|
| **PASO** | `/paso` | base DISC oculta; "cómo caminas" | En prod (2026-08-20) |
| **Las cuatro estrellas** | `/estrellas` | tu estilo / cómo eres en el mundo | Bilingüe |
| **CAMINO** | `/camino` | tus capacidades / orientación | Bilingüe |
| **Máscaras** | `/mascaras` | qué te frena hoy (el espejo) | Bilingüe |
| **La herida que más pesa** | `/heridas` | de qué te proteges (3 heridas: profesional/relacional/vital) | En prod (ES; EN pendiente) |
| **IKIBOARD** | `/ikiboard` | **PROYECTO FINAL** — ver abajo | Bilingüe |
| Taller, Viaje, Oráculo, IKICARD | varios | módulos previos | En prod / activos |

### IKIBOARD = el proyecto final ("el libro de fotos de tu futuro")

Es el **destino** del embudo, no una herramienta más. Lee lo ya hecho (no repite
tests) y lo junta: cruza `estilo × orientación × máscara` en un **borrador
determinista (cero IA)** y produce el **álbum** (4 ámbitos: Cuerpo y vida ·
Vínculos · Lo material · Vocación, con el propósito presidiendo) + el **mapa
"para volver a ti"** (PDF). **Definición canónica y detallada en `docs/ikiboard.md`.**

## Patrón de contenido bilingüe (importante)

Decisión: el contenido vive en **`.ts`**, no en `messages/*.json`. Cada
`lib/<tool>-content.ts` tiene datasets `_ES`/`_EN` + **getters por locale**
(p. ej. `getEstrellas(locale)`, `getMasks(locale)`, `getIkiboardCopy(locale)`).

- `lib/content-locale.ts` → `contentLang(locale): 'es'|'en'` es el selector base.
- La **lógica/cálculo** (scoring, `computeDominant`, umbrales, ids de pasos) va
  sobre **códigos independientes del idioma**; solo cambia el texto visible.
- En componentes cliente: los que reciben `locale` llaman al getter; el chrome
  inline se localiza con `const en = contentLang(locale) === 'en'` y ternarios.
- IKIBOARD: `IKIBOARD_STEPS` (ES) es canónico para la lógica; `getIkiSteps(locale)`
  solo para mostrar. Copy agrupado en `getIkiboardCopy(locale)`.
- next-intl (`useTranslations('nav')`) solo para el chrome del shell, no el contenido.

## Dónde está el contexto persistente

- **`docs/`** — memoria externa por pieza. Al definir algo importante, escríbelo
  aquí y re-léelo en vez de fiarte de recordar:
  - `docs/proyecto-ikigaier.md` — **marca, voz, negocio, mazo, avatares, paleta**
    (importado del Proyecto de Claude.ai "PROYECTO IKIGAIER"). Léelo antes de tocar
    copy, colores o cualquier cosa de marketing/producto.
  - `docs/ikiboard.md` — qué es IKIBOARD y su integración en el embudo.
  - `docs/fuentes.md` — mapeo de cada pieza → su libro/ejercicio.
- **Memoria de Claude** (`~/.claude/projects/.../memory/`) — decisiones de producto,
  perfil de usuario, feedback de trabajo. `MEMORY.md` es el índice.

## Estado de despliegue

PASO ya en producción. Falta subir la plataforma + módulos nuevos
(mascaras → estrellas → camino → ikiboard). **Migración Supabase siempre antes que
el código.** Ver memoria `project_deploy_pendiente`.

## Convenciones al trabajar

- Antes de editar un `lib/<tool>-content.ts` convertido a getters, comprueba que
  todos los consumidores usan los getters nuevos (grep de símbolos viejos) para no
  romper el build.
- Verifica con `npm run build` (exit 0) tras tocar contenido/rutas.
- Comenta en la voz y densidad del código existente (comentarios en español).
