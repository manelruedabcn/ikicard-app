# «Un mes conociendo tu ikigai» — programa gratuito de 4 semanas

Continuación del [Inventario honesto](inventario.md). Quien recibe su devolución
por email puede marcar una casilla aparte para apuntarse. Es la herramienta de
conversión del embudo: quien llega al final ha trabajado un mes y conoce a Manel.

## Cómo funciona

- **Inicio:** cada persona empieza el **lunes siguiente** a apuntarse (fecha de
  Madrid). Recibe al momento un correo de bienvenida con esa fecha.
- **Correos** (a las 8:00 de Madrid, desde `/api/cron/programa`, que GitHub
  Actions llama cada hora: `.github/workflows/programa.yml`):

| Día | Correo | Contenido | Fuente |
|---|---|---|---|
| 0 | Semana 1 | El ejercicio que le salió en el Inventario + la frase ancla en la libreta | Ejercicio de su devolución, cap. 1 |
| 7 | Semana 2 | Tu mapa del Ikigai Activo | Cap. 4 y Herramientas |
| 14 | Semana 3 | PASO (con cuenta en la app) + la pregunta del contraste interno | PASO, cap. 8 |
| 21 | Semana 4 | Repetir el Inventario (enlace personal) + revisión mensual | Cap. 6 |
| 28 | Cierre | Propuesta: el curso online; el libro; responder al correo | Epílogo |

- **Encuentros en grupo** (opcionales, online): se dan de alta en la tabla
  `programa_encuentros` (fecha y hora, enlace, lengua; vacía = todas). A cada
  persona se le invita a los que caen dentro de su mes (30 días desde su
  inicio): aparecen en los correos de bienvenida y de las semanas 2 y 4, y se
  avisa **la víspera** con su propio correo.
- **Semana 4:** el enlace `…/inventario?prog=<token>` guarda el nuevo intento
  como final y muestra «Hace un mes y hoy»: solo las respuestas que han
  cambiado, una al lado de la otra, sin interpretar.
- **Semana 3, PASO con cuenta:** el enlace lleva a registrarse/entrar y vuelve
  a `/paso`; con sesión, el resultado queda guardado (y IKIBOARD lo lee). El
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

## Cómo dar de alta un encuentro

Supabase → Table Editor → `programa_encuentros` → Insert row:
`starts_at` (fecha y hora; se muestra en hora de Madrid), `url` (enlace de la
videollamada), `locale` (`es`, `ca`, `en` o vacío para todas).
