# Test FOCO — «¿Eres de una cosa o de muchas?»

Test de autoconocimiento (no médico) de la práctica ikigaier sobre el espectro
especialista ↔ multipotencial. Contenido cerrado con Manel el 01/11/2026
(antes vivía como página suelta en Claude); pasado a la app el 22/11/2026.

- **Ruta:** `/foco` (ES/CA/EN). Pública, sin cuenta, como PASO e Inventario.
  Con sesión, el resultado se guarda en `foco_results` y se muestra al volver.
- **Permiso:** `foco` gratis para todos (trigger de alta + backfill en
  `migrations/foco.sql`), para que aparezca en el panel.
- **Reglas:** `lib/foco.ts` (códigos, cálculo determinista, cero IA).
  25 frases 1-5; cuatro dimensiones de espectro (`int`, `ene`, `rit`, `ide`)
  y una de integración (`gin`: cierre y visibilidad). 0-100 por dimensión;
  zonas A < 38 ≤ M ≤ 62 < B. Perfil = zona de la media de las cuatro.
- **Textos:** `lib/foco-content.ts` (`getFocoCopy(locale)`). CA y EN son
  traducción fiel del castellano. ⚠️ Pendiente de revisión de Manel.
- **PDF:** `lib/foco-pdf.ts` (misma mecánica que Heridas/Máscaras: html2canvas
  + jsPDF, compartir en móvil o descarga). Libre, sin registro. Pie de marca
  solo en el PDF (`.foco-print-only`).
- **Seguir explorando (sin sesión):** recuadro final con las herramientas que
  son gratis de verdad: test de ikigai (`/inventario`), PASO y el programa de
  un mes (`/programa`), más «Crear mi cuenta gratuita». Si se registra, el
  resultado hecho sin cuenta (guardado en `localStorage`) se guarda al volver.
  ⚠️ Si se añaden herramientas gratis al alta, revisar este texto.
- **Pendiente:** que IKIBOARD lea `foco_results` en el punto de partida.
