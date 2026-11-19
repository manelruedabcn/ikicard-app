import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/secrets'
import { madridParts, PROGRAMA_SEND_HOUR } from '@/lib/programa'
import { enviarSeguimientos } from '@/lib/inventario-seguimiento'

export const dynamic = 'force-dynamic'

// Seguimiento del Inventario honesto a los 3 días. Lo dispara GitHub Actions
// cada hora, en el mismo flujo que el programa (.github/workflows/programa.yml).
// Solo envía de 8:00 a 21:00 de Madrid; inventario_seguimientos impide
// duplicados aunque se ejecute cada hora.
export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get('x-cron-secret'))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const { hour } = madridParts()
  if (hour < PROGRAMA_SEND_HOUR || hour >= 21) return NextResponse.json({ ok: true, skipped: 'hour' })
  try {
    const result = await enviarSeguimientos()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[inventario seguimiento cron]', err)
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 })
  }
}
