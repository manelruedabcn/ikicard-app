// ============================================================
// IKIBOARD — Biblioteca de iconos propios (Fase 2).
// Iconos sobrios de línea (no clipart ni emojis), para cuando
// ninguna foto representa el deseo. Estética calma, coherente
// con la voz del método. Set inicial: se irá ampliando.
//
// Cada icono guarda su SVG interno (paths de línea). Se dibujan
// dentro de un <svg> con stroke=currentColor, así heredan el
// color del tablero. Son strings controlados por nosotros.
// ============================================================

export interface IkiIcon {
  id: string
  label: string
  svg: string
}

// Iconos agrupados por ámbito (para ofrecer los afines primero),
// pero cualquiera puede usarse en cualquier zona.
export const IKIBOARD_ICONS: Record<string, IkiIcon[]> = {
  cuerpo: [
    { id: 'corazon', label: 'Corazón', svg: '<path d="M12 20s-6.5-4.3-8.6-7.6C1.9 9.4 3.4 6 6.4 6c1.9 0 3 1.2 3.6 2.1C10.6 7.2 11.7 6 13.6 6c3 0 4.5 3.4 3 6.4C18.5 15.7 12 20 12 20z"/>' },
    { id: 'hoja', label: 'Hoja', svg: '<path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z"/><path d="M5 19c3.5-3.5 6-6 9-8"/>' },
    { id: 'sol', label: 'Sol', svg: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>' },
    { id: 'luna', label: 'Descanso', svg: '<path d="M20 14.5A7.5 7.5 0 1 1 9.5 4 6 6 0 0 0 20 14.5z"/>' },
  ],
  vinculos: [
    { id: 'personas', label: 'Personas', svg: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.4-5 5.5-5s5.5 2 5.5 5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M15.5 20c.2-2.6 1.8-4.2 3.6-4.2S22 17 22 20"/>' },
    { id: 'chat', label: 'Conversación', svg: '<path d="M5 6h14v9H10l-4 3v-3H5z"/>' },
    { id: 'regalo', label: 'Regalo', svg: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 13h16M12 9v11"/><path d="M12 9C10 9 8 8 8 6.5S9.5 4 12 6c2.5-2 4-.5 4 .5S14 9 12 9z"/>' },
    { id: 'manos', label: 'Cuidado', svg: '<path d="M12 20s-5-3.2-6.6-5.6C4.2 12.4 5 10 7 10c1.2 0 2 .8 2.5 1.5C10 10.8 10.8 10 12 10s2 .8 2.5 1.5C15 10.8 15.8 10 17 10c2 0 2.8 2.4 1.6 4.4C17 16.8 12 20 12 20z"/>' },
  ],
  material: [
    { id: 'casa', label: 'Hogar', svg: '<path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>' },
    { id: 'coche', label: 'Coche', svg: '<path d="M5 16v-3l2-5h10l2 5v3"/><path d="M3 16h18M6 16v2M18 16v2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>' },
    { id: 'lugar', label: 'Lugar', svg: '<path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11z"/><circle cx="12" cy="10" r="2.5"/>' },
    { id: 'montana', label: 'Viaje', svg: '<path d="M3 19l6-10 4 6 2-3 6 7z"/>' },
    { id: 'llave', label: 'Medios', svg: '<circle cx="8" cy="14" r="3.5"/><path d="M10.5 11.5 20 2M16 6l2 2M18 4l2 2"/>' },
  ],
  vocacion: [
    { id: 'maletin', label: 'Trabajo', svg: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>' },
    { id: 'pluma', label: 'Crear', svg: '<path d="M4 20l1-4L15 6l3 3L8 19l-4 1z"/><path d="M13 8l3 3"/>' },
    { id: 'idea', label: 'Idea', svg: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c.8.8 1 1.5 1 3h6c0-1.5.2-2.2 1-3a6 6 0 0 0-4-10z"/>' },
    { id: 'diana', label: 'Meta', svg: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>' },
  ],
}

// Todos los iconos en una lista plana (para resolver un id -> svg).
export const ALL_ICONS: IkiIcon[] = Object.values(IKIBOARD_ICONS).flat()

export function iconById(id: string): IkiIcon | undefined {
  return ALL_ICONS.find(i => i.id === id)
}
