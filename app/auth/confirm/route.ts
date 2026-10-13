import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Enlaces de los correos de Supabase: confirmar la cuenta y restablecer la
// contraseña. Dos formatos:
//   · token_hash + type → el de nuestras plantillas (docs/auth-emails.md).
//     Funciona aunque la persona abra el correo en otro dispositivo.
//   · code → el de la plantilla por defecto de Supabase (PKCE). Solo funciona
//     en el mismo navegador donde se registró; lo aceptamos por compatibilidad.
// Vive fuera de [locale] y está excluida del middleware de next-intl.

const OTP_TYPES: EmailOtpType[] = ['signup', 'email', 'recovery', 'invite', 'magiclink', 'email_change']
const LOCALES = ['es', 'ca', 'en']

// Destino tras confirmar. Acepta una ruta del propio sitio o una URL completa
// de este mismo origen (la plantilla pasa {{ .RedirectTo }}, que es absoluta).
// Si apunta otra vez a /auth/confirm, se desenvuelve su propio `next`.
function resolveNext(raw: string | null, origin: string, depth = 0): string | null {
  if (!raw || depth > 2) return null
  if (/^\/(?![/\\])/.test(raw)) {
    const u = new URL(raw, origin)
    if (u.pathname === '/auth/confirm') return resolveNext(u.searchParams.get('next'), origin, depth + 1)
    return `${u.pathname}${u.search}`
  }
  try {
    const u = new URL(raw)
    if (u.origin !== origin) return null
    if (u.pathname === '/auth/confirm') return resolveNext(u.searchParams.get('next'), origin, depth + 1)
    return `${u.pathname}${u.search}`
  } catch {
    return null
  }
}

function localeOf(path: string | null): string {
  const seg = path?.split('/')[1] || ''
  return LOCALES.includes(seg) ? seg : 'es'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = resolveNext(searchParams.get('next'), origin)
  const locale = localeOf(next)
  // Recuperar contraseña siempre acaba en el formulario de nueva contraseña.
  const destino = type === 'recovery'
    ? `/${locale}/reset-password`
    : next && next !== '/' ? next : `/${locale}/dashboard`

  const supabase = createClient()
  let ok = false
  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    ok = !error
    if (error) console.error('[auth confirm] verifyOtp:', error.message)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
    if (error) console.error('[auth confirm] exchangeCode:', error.message)
  }

  if (ok) return NextResponse.redirect(`${origin}${destino}`)
  // Enlace caducado, ya usado o abierto en otro navegador (formato code):
  // al login con un aviso. Si la cuenta ya quedó confirmada, puede entrar.
  return NextResponse.redirect(`${origin}/${locale}/login?error=link`)
}
