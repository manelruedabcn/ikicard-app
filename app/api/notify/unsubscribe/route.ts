import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { unsubToken } from '@/lib/notify'

// Baja de recordatorios sin sesión, vía enlace firmado del email.
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid') || ''
  const t = req.nextUrl.searchParams.get('t') || ''
  const l = req.nextUrl.searchParams.get('l') === 'en' ? 'en' : 'es'

  const isLead = uid.startsWith('lead:')
  const done = isLead
    ? (l === 'en'
        ? "Done. You won't receive more emails from IKIGAIER."
        : 'Hecho. No recibirás más correos de IKIGAIER.')
    : (l === 'en'
        ? 'Reminders turned off. You can re-enable them from the app.'
        : 'Recordatorios desactivados. Puedes reactivarlos desde la app.')
  const bad = l === 'en' ? 'Invalid link.' : 'Enlace no válido.'

  const page = (msg: string) => new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IKIGAIER</title></head>
    <body style="margin:0;background:#FDFBF7;font-family:Georgia,serif;color:#272727;">
      <div style="max-width:420px;margin:0 auto;padding:80px 24px;text-align:center;">
        <p style="letter-spacing:0.3em;font-size:13px;margin:0 0 32px;">IKIGAIER</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(39,39,39,0.8);">${msg}</p>
      </div>
    </body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  )

  if (!uid || !t || t !== unsubToken(uid)) return page(bad)

  const admin = createAdminClient()
  // uid con prefijo "lead:<id>" → baja de email marketing (tabla paso_leads).
  // Sin prefijo → baja de recordatorios del Viaje (perfil logueado).
  if (uid.startsWith('lead:')) {
    await admin.from('paso_leads').update({ unsubscribed_at: new Date().toISOString() }).eq('id', uid.slice(5))
  } else {
    await admin.from('profiles').update({ notify_opt_out: true }).eq('id', uid)
  }

  return page(done)
}
