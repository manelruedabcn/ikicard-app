// ============================================================
// IKIGAIER — Ventanas de acceso abierto por taller
// Durante un taller, quien escanea el QR fijo entra en la
// herramienta sin tenerla desbloqueada una a una desde /admin.
// Fuera de la ventana, solo entra quien ya la tiene concedida;
// el resto ve el aviso de "ven al próximo taller".
//
// Para el próximo taller: cambia `desde` / `hasta` (hora de
// Madrid, con su desfase) y despliega. Sin ventana = cerrado.
// ============================================================

interface VentanaTaller {
  desde: string // ISO 8601 con zona, p. ej. '2026-09-28T23:45:00+02:00'
  hasta: string
}

const VENTANAS: Record<string, VentanaTaller[]> = {
  mascaras: [
    // Taller del 29/09/2026: abierto hasta las 20:00 (hora de Madrid).
    { desde: '2026-09-28T23:45:00+02:00', hasta: '2026-09-29T20:00:00+02:00' },
  ],
}

// ¿Está abierta ahora la ventana de taller para esta herramienta?
export function tallerAbierto(code: string, ahora: Date = new Date()): boolean {
  const t = ahora.getTime()
  return (VENTANAS[code] ?? []).some(
    v => t >= new Date(v.desde).getTime() && t < new Date(v.hasta).getTime()
  )
}
