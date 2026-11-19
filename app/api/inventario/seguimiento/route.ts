import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSeguimientoTexts, SEGUIMIENTO_RESPUESTAS, type SeguimientoRespuesta } from '@/lib/inventario-seguimiento-content'
import { getProgramaTexts } from '@/lib/programa-content'
import { empezarUrl } from '@/lib/programa-server'

export const dynamic = 'force-dynamic'

// «¿Lo que leíste tenía que ver contigo?» — respuesta de un clic desde el
// correo de seguimiento del Inventario. Igual que el «¿lo has hecho?» del
// programa: algunos gestores de correo abren los enlaces por su cuenta, así
// que el GET no guarda nada. Es el navegador de la persona (con JavaScript)
// quien confirma con un POST; sin JavaScript, un botón hace lo mismo.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function params(sp: URLSearchParams) {
  const t = sp.get('t') || ''
  const r = sp.get('r') as SeguimientoRespuesta
  const lp = sp.get('l')
  const l = lp === 'en' ? 'en' : lp === 'ca' ? 'ca' : 'es'
  const valid = UUID_RE.test(t) && SEGUIMIENTO_RESPUESTAS.includes(r)
  return { t, r, l, valid }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c] || c)
}

function page(l: string, msg: string, autoPost: boolean, extra = '', confirm = '') {
  return new NextResponse(
    `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>IKIGAIER</title></head>
    <body style="margin:0;background:#FDFBF7;font-family:Georgia,serif;color:#272727;">
      <div style="max-width:440px;margin:0 auto;padding:80px 24px;text-align:center;">
        <p style="letter-spacing:0.3em;font-size:13px;margin:0 0 32px;">IKIGAIER</p>
        <div id="msg" style="${autoPost ? 'visibility:hidden;' : ''}">
          <p style="font-size:17px;line-height:1.7;color:rgba(39,39,39,0.85);margin:0 0 28px;">${escapeHtml(msg)}</p>
          ${extra}
        </div>
        ${autoPost ? `<form method="post"><noscript><button style="font:inherit;padding:10px 18px;border:1px solid #c2866b;background:none;cursor:pointer;">${escapeHtml(confirm)}</button></noscript></form>
        <script>fetch(location.href,{method:'POST'}).then(function(r){document.getElementById('msg').style.visibility='visible';if(!r.ok)document.getElementById('msg').textContent='…'}).catch(function(){})</script>` : ''}
      </div>
    </body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

// Botón al programa para «sí» y «a medias», con ese mismo test como punto de
// partida. Para «no», solo el agradecimiento y el correo para contarlo.
async function extra(l: string, r: SeguimientoRespuesta, t: string): Promise<string> {
  if (r === 'no') return ''
  const admin = createAdminClient()
  const { data } = await admin.from('inventario_seguimientos').select('attempt_id').eq('id', t).maybeSingle()
  if (!data) return ''
  const label = getProgramaTexts(l).captura.button
  return `<a href="${empezarUrl(l, data.attempt_id)}" style="display:inline-block;background:#272727;color:#FDFBF7;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.2em;padding:16px 32px;">${escapeHtml(label)}</a>`
}

export async function GET(req: NextRequest) {
  const { t, r, l, valid } = params(req.nextUrl.searchParams)
  const texts = getSeguimientoTexts(l).page
  if (!valid) return page(l, texts.invalid, false)
  return page(l, texts[r], true, await extra(l, r, t), texts.confirm)
}

export async function POST(req: NextRequest) {
  const { t, r, l, valid } = params(req.nextUrl.searchParams)
  const texts = getSeguimientoTexts(l).page
  if (!valid) return page(l, texts.invalid, false)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('inventario_seguimientos')
    .update({ respuesta: r, respondido_at: new Date().toISOString() })
    .eq('id', t)
    .select('id')
    .maybeSingle()
  if (error) {
    console.error('[inventario seguimiento]', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  if (!data) return page(l, texts.invalid, false)
  // El formulario sin JavaScript también llega aquí: devolvemos la página.
  return page(l, texts[r], false, await extra(l, r, t))
}
