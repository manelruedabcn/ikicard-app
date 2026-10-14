import { NextRequest, NextResponse } from 'next/server'
import { getProgramaTexts, formatProgramaDate } from '@/lib/programa-content'
import { confirmarInscripcion } from '@/lib/programa-server'

export const dynamic = 'force-dynamic'

// «Confirmar mi plaza» — botón del correo de la devolución del Inventario.
// Como en el check-in del jueves, el GET no cambia nada: algunos gestores de
// correo abren los enlaces por su cuenta para analizarlos. La página confirma
// con un POST desde el navegador de la persona; sin JavaScript, con un botón.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function params(sp: URLSearchParams) {
  const t = sp.get('t') || ''
  const lp = sp.get('l')
  const l = lp === 'en' ? 'en' : lp === 'ca' ? 'ca' : 'es'
  return { t, l, valid: UUID_RE.test(t) }
}

function page(l: string, msg: string, autoPost: boolean, button?: string) {
  return new NextResponse(
    `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>IKIGAIER</title></head>
    <body style="margin:0;background:#FDFBF7;font-family:Georgia,serif;color:#272727;">
      <div style="max-width:420px;margin:0 auto;padding:80px 24px;text-align:center;">
        <p style="letter-spacing:0.3em;font-size:13px;margin:0 0 32px;">IKIGAIER</p>
        <p id="msg" style="font-size:17px;line-height:1.7;color:rgba(39,39,39,0.85);">${msg}</p>
        ${autoPost ? `<form method="post"><noscript><button style="font:inherit;padding:10px 18px;border:1px solid #c2866b;background:none;cursor:pointer;">${button}</button></noscript></form>
        <script>fetch(location.href,{method:'POST',headers:{'x-js':'1'}}).then(function(r){return r.json()}).then(function(j){document.getElementById('msg').textContent=j.msg}).catch(function(){})</script>` : ''}
      </div>
    </body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(req: NextRequest) {
  const { l, valid } = params(req.nextUrl.searchParams)
  const t = getProgramaTexts(l).confirmarPage
  if (!valid) return page(l, t.invalid, false)
  return page(l, t.checking, true, l === 'en' ? 'Confirm' : 'Confirmar')
}

export async function POST(req: NextRequest) {
  const { t: token, l, valid } = params(req.nextUrl.searchParams)
  const texts = getProgramaTexts(l).confirmarPage
  const js = req.headers.get('x-js') === '1'
  const reply = (msg: string, status = 200) =>
    js ? NextResponse.json({ msg }, { status }) : page(l, msg, false)

  if (!valid) return reply(texts.invalid, 400)
  try {
    const { estado, inscripcion } = await confirmarInscripcion(token)
    if (estado === 'confirmada' && inscripcion) {
      return reply(texts.confirmada(formatProgramaDate(inscripcion.locale, inscripcion.start_date)))
    }
    return reply(estado === 'ya' ? texts.ya : texts.invalid, estado === 'ya' ? 200 : 400)
  } catch (err) {
    console.error('[programa confirmar]', err)
    return reply(texts.error, 500)
  }
}
