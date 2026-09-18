import { NextResponse } from 'next/server'
import { isCurrentUserAdmin } from '@/lib/admin'
import { listCrmContacts } from '@/lib/crm'

export const dynamic = 'force-dynamic'

function csv(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export async function GET(req: Request) {
  if (!(await isCurrentUserAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const contacts = await listCrmContacts({
    q: url.searchParams.get('q') || undefined,
    status: url.searchParams.get('status') || undefined,
    source: url.searchParams.get('source') || undefined,
    consent: url.searchParams.get('consent') || undefined,
  })
  const rows = [
    ['Nombre', 'Email', 'Teléfono', 'Estado', 'Origen', 'Etiquetas', 'Comunicaciones comerciales', 'Próxima acción', 'Fecha próxima acción', 'Fecha de alta'],
    ...contacts.map(c => [c.first_name, c.email, c.phone, c.status, Array.from(new Set(c.sources.map(s => s.source_type))).join(', '), c.tags.map(t => t.name).join(', '), c.unsubscribed_at ? 'Baja' : c.marketing_consent ? 'Sí' : 'No', c.next_action, c.next_action_at, c.created_at]),
  ]
  const body = '\uFEFF' + rows.map(row => row.map(csv).join(';')).join('\r\n')
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="ikigaier-contactos-${new Date().toISOString().slice(0, 10)}.csv"` } })
}
