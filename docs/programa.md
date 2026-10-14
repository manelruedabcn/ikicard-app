# «Un mes conociendo tu ikigai» — programa gratuito de 4 semanas

Continuación del [Inventario honesto](inventario.md). Quien recibe su devolución
por email puede marcar una casilla aparte para apuntarse. Es la herramienta de
conversión del embudo: quien llega al final ha trabajado un mes y conoce a Manel.

## Cómo funciona

- **Dos entradas al mismo programa** (columna `origen`):
  - **Test** (`origen = test`): al acabar el test, el recuadro final presenta
    el programa como siguiente paso. «Empezar el mes gratis» lo pide; «Solo
    envíame esta devolución», no.
  - **Página del programa** (`/[locale]/programa`, `origen = programa`): para
    redes, talleres, newsletter o QR. Solo pide el correo; llega «Confirma tu
    plaza» por separado (reenvío limitado a uno cada 10 minutos). Al confirmar,
    la bienvenida le pide **hacer el test primero** con su enlace personal
    (`/inventario?prog=token`): ese test es su punto de partida, se guarda como
    `first_answers` y la devolución se le envía sola a su correo. Si llega al
    primer lunes sin test, la semana 1 se lo vuelve a pedir.
  - El mismo enlace personal repite el test en la semana 4. Antes de la
    semana 4, repetirlo no compara nada.
- **Doble confirmación:** pedir el programa crea la inscripción **pendiente**.
  El correo de la devolución abre con un recuadro «Confirma tu plaza» y un
  botón; solo al pulsarlo entra en el programa (`/api/programa/confirmar`).
  Quien no lo pulsa recibe su devolución y nada más. Si tiene sesión en la
  app con ese mismo correo ya verificado, entra directamente. Repetir el test
  antes de confirmar actualiza la misma pendiente (mismo enlace).
- **Inicio:** cada persona empieza el **lunes siguiente** a confirmar (fecha de
  Madrid). Recibe al momento un correo de bienvenida con esa fecha; si ese
  envío falla, la tarea programada lo reintenta cada hora hasta su primer lunes.
- **Correos** (a las 8:00 de Madrid, desde `/api/cron/programa`, que GitHub
  Actions llama cada hora: `.github/workflows/programa.yml`):

| Día | Correo | Contenido | Fuente |
|---|---|---|---|
| 0 (lunes) | Semana 1 | El ejercicio que le salió en el Inventario + la frase ancla en la libreta | Ejercicio de su devolución, cap. 1 |
| 3 (jueves) | Jueves 1 | Dos líneas, una pregunta y «¿lo has hecho?» | — |
| 7 | Semana 2 | Tu mapa del Ikigai Activo | Cap. 4 y Herramientas |
| 10 | Jueves 2 | Ídem | — |
| 14 | Semana 3 | PASO + la pregunta del contraste interno | PASO, cap. 8 |
| 17 | Jueves 3 | Ídem | — |
| 21 | Semana 4 | Repetir el Inventario (enlace personal) + revisión mensual | Cap. 6 |
| 24 | Jueves 4 | Ídem, con el enlace para repetir | — |
| 28 | Cierre | Propuesta: el curso online; el libro; responder al correo | Epílogo |

- **«¿Has hecho el ejercicio de esta semana?»** (correos del jueves): un clic
  con «Sí · A medias · Esta semana no». **No bloquea nada**: el lunes siguiente
  llega igual; si respondió «no» o «a medias», empieza reconociéndolo («No
  pasa nada si la semana pasada no pudo ser…»). Se guarda en
  `programa_checkins` y sirve para saber quién se implica de verdad. Como
  algunos gestores de correo abren los enlaces solos para analizarlos, el
  clic solo se registra cuando el navegador de la persona lo confirma.
- Si la tarea programada falla varios días, los lunes y el cierre pendientes
  se recuperan, pero un recordatorio de jueves atrasado se descarta.

- **Encuentros en grupo** (opcionales, online): se dan de alta en la tabla
  `programa_encuentros` (fecha y hora, enlace, lengua; vacía = todas). A cada
  persona se le invita a los que caen dentro de su mes (30 días desde su
  inicio): aparecen en los correos de bienvenida y de las semanas 2 y 4, y se
  avisa **la víspera** con su propio correo.
- **Semana 4:** el enlace `…/inventario?prog=<token>` guarda el nuevo intento
  como final y muestra «Hace un mes y hoy»: solo las respuestas que han
  cambiado, una al lado de la otra, sin interpretar.
- **Semana 3, PASO:** por defecto, el enlace lleva directo a `/paso`, sin
  registro (y se invita a crear cuenta). Con `PROGRAMA_PASO_CON_CUENTA=1`, lleva
  a registrarse/entrar y vuelve a `/paso`; con sesión, el resultado queda
  guardado (y IKIBOARD lo lee). Activarlo **solo** cuando el correo de
  verificación de cuentas de Supabase funcione (servidor de correo propio). El
  correo aclara que la «máscara» de PASO es la forma adaptada de actuar, no
  las siete máscaras del libro (que quedan para el curso).
- **Cierre:** el botón del curso usa `PROGRAMA_CURSO_URL` (variable de
  entorno). Mientras no exista, lleva a la página de talleres de cada lengua.

Reglas de contenido: en el mes no entran el miedo, las máscaras ni el diálogo
interno como temas (son del curso), ni cartas del mazo (son del Viaje). Sin
rachas ni reproches: si alguien se salta una semana, el siguiente correo llega igual.

## Datos

`migrations/programa.sql` (requiere `inventario.sql`). RLS sin políticas: solo
el servidor.

- `programa_inscripciones`: una por persona y edición; una sola **activa** por
  email. Guarda las respuestas y el ejercicio con los que entró, el token del
  enlace de la semana 4 y los intentos inicial y final.
- `programa_envios`: cada correo enviado (clave inscripción + mensaje). Evita
  duplicados aunque la tarea se ejecute cada hora; si un envío falla, se
  libera y se reintenta en la siguiente ejecución.
- `programa_encuentros`: los encuentros, que da de alta Manel.
- `programa_checkins`: la respuesta de un clic de cada jueves (semana 1-4).

Baja: cada correo lleva un enlace firmado `prog:<id>` que pasa la inscripción
a `baja` (no toca el consentimiento de marketing, que es aparte). CRM: origen
`programa`, etiqueta «Un mes conociendo tu ikigai».

## Dónde está cada cosa

| Pieza | Archivo |
|---|---|
| Calendario (sin texto) | `lib/programa.ts` |
| Textos de los correos (castellano, catalán, inglés) | `lib/programa-content.ts` |
| Inscribir, construir y enviar sin duplicados | `lib/programa-server.ts` |
| Plantilla del correo | `sendProgramaEmail` en `lib/email.ts` |
| Tarea programada | `app/api/cron/programa` + `.github/workflows/programa.yml` |
| Casilla de inscripción y comparación de la semana 4 | `app/[locale]/inventario/` |

## Pendiente de revisión de Manel

Todos los textos de `lib/programa-content.ts` que no son citas ni ejercicios
del libro (bienvenida, frases de unión, cierre, aviso de encuentro) y las
traducciones al catalán y al inglés.

## Panel de administración

`/es/admin/programa` (botón «Programa · un mes» en Administración):

- El embudo: tests de ikigai hechos, emails dejados, personas en el programa,
  terminadas, cuántas repitieron el test y bajas.
- Cada persona: lengua, fecha de inicio, semana en curso, lo que respondió cada
  jueves y si repitió el test.
- Los encuentros en grupo: alta (fecha y hora de Madrid, enlace, lengua, nota
  interna) y borrado, sin entrar en Supabase.
