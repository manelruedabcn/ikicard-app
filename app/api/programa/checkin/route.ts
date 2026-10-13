import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PROGRAMA_CHECKINS, type ProgramaCheckin } from '@/lib/programa'
import { getProgramaTexts } from '@/lib/programa-content'
import { inscripcionPorToken } from '@/lib/programa-server'

export const dynamic = 'force-dynamic'

// «¿Has hecho el ejercicio de esta semana?» — respuesta de un clic desde el
// correo del jueves. Algunos gestores de correo abren los enlaces por su
// cuenta para analizarlos; por eso el GET no guarda nada: muestra la página y
// es el navegador de la persona (con JavaScript) quien confirma con un POST.
// Sin JavaScript, un botón hace lo mismo. Nunca bloquea el programa.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function params(sp: URLSearchParams) {
  const t = sp.get('t') || ''
  const s = Number(sp.get('s'))
  const r = sp.get('r') as ProgramaCheckin
  const lp = sp.get('l')
  const l = lp === 'en' ? 'en' : lp === 'ca' ? 'ca' : 'es'
  const valid = UUID_RE.test(t) && Number.isInteger(s) && s >= 1 && s <= 4 && PROGRAMA_CHECKINS.includes(r)
  return { t, s, r, l, valid }
}

function page(l: string, msg: string, autoPost: boolean, button?: string) {
  return new NextResponse(
    `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>IKIGAIER</title></head>
    <body style="margin:0;background:#FDFBF7;font-family:Georgia,serif;color:#272727;">
      <div style="max-width:420px;margin:0 auto;padding:80px 24px;text-align:center;">
        <p style="letter-spacing:0.3em;font-size:13px;margin:0 0 32px;">IKIGAIER</p>
        <p id="msg" style="font-size:17px;line-height:1.7;color:rgba(39,39,39,0.85);${autoPost ? 'visibility:hidden;' : ''}">${msg}</p>
        ${autoPost ? `<form method="post"><noscript><button style="font:inherit;padding:10px 18px;border:1px solid #c2866b;background:none;cursor:pointer;">${button}</button></noscript></form>
        <script>fetch(location.href,{method:'POST'}).then(function(r){document.getElementById('msg').style.visibility='visible';if(!r.ok)document.getElementById('msg').textContent='…'}).catch(function(){})</script>` : ''}
      </div>
    </body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(req: NextRequest) {
  const { r, l, valid } = params(req.nextUrl.searchParams)
  const t = getProgramaTexts(l).checkinPage
  if (!valid) return page(l, t.invalid, false)
  return page(l, t[r], true, l === 'en' ? 'Confirm' : l === 'ca' ? 'Confirmar' : 'Confirmar')
}

export async function POST(req: NextRequest) {
  const { t: token, s, r, l, valid } = params(req.nextUrl.searchParams)
  const texts = getProgramaTexts(l).checkinPage
  if (!valid) return page(l, texts.invalid, false)
  const insc = await inscripcionPorToken(token)
  if (!insc) return page(l, texts.invalid, false)

  const admin = createAdminClient()
  const { error } = await admin
    .from('programa_checkins')
    .upsert({ inscripcion_id: insc.id, semana: s, respuesta: r, updated_at: new Date().toISOString() }, { onConflict: 'inscripcion_id,semana' })
  if (error) {
    console.error('[programa checkin]', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  // El formulario sin JavaScript también llega aquí: devolvemos la página.
  return page(l, texts[r], false)
}
