# El guía de la web (burbuja con la cara de Manel)

Burbuja abajo a la derecha en todas las páginas de ikigaier.com
(`assets/js/guia.js` en el repo de la web, dibujo en
`assets/images/guia-manel.svg`). **Sin IA**: preguntas cerradas, escritas con
la voz de Manel, que llevan a cada persona a lo que le sirve. ES/CA/EN según
`<html lang>`.

- Ramas: qué es esto · el ikigai · quién es Manel · por dónde empiezo (según
  su momento) · lo gratis (test, programa del mes, PASO, taller gratuito) ·
  acompañamiento 1:1 (llamada, escribir, precio sin cifras) · libros (cuál
  según lo que le pase) · talleres (y aviso de fechas).
- Formularios: **escribir**, **llamada** (nombre, correo, teléfono opcional,
  cuándo le va bien) y **aviso** de talleres. Van a
  `app/api/guia/contacto` (solo desde ikigaier.com), que envía un correo a
  Manel (`GUIA_NOTIFY_EMAIL`, si no `WORKSHOP_NOTIFY_EMAIL`, si no
  manelrueda@gmail.com) con «responder» a esa persona y lo que eligió en el
  guía. No se guarda nada en la base de datos.
- Agenda: si Manel tiene un enlace de reservas (Google Calendar, Calendly),
  se pone en `AGENDA_URL` al principio de `guia.js` y «la llamada» lleva ahí
  en vez de al formulario.
- Reglas: no promete resultados, no da precios ni fechas, no nombra marcos
  internos. Cambiar textos = editar los objetos `T.es/ca/en` de `guia.js`.
