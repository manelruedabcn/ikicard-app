import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Callback compartido: OAuth (Google) y confirmación de email/alta por
// contraseña (LoginForm pasa emailRedirectTo=aquí en ambos casos). En los dos
// flujos llega un `code` que se canjea por una sesión; luego se redirige a
// `next` (el dashboard con su idioma). Vive fuera de [locale] y está excluida
// del middleware de next-intl, así que no recibe prefijo de idioma.
// Solo aceptamos rutas relativas del propio sitio como destino. Un `next`
// como "//evil.com" o "/\evil.com" saldría fuera al concatenarlo con origin;
// exigimos que empiece por un único "/" seguido de un carácter que no sea "/"
// ni "\". Cualquier otra cosa cae al dashboard por defecto.
function safeNext(raw: string | null): string {
  if (raw && /^\/(?![/\\]).*/.test(raw)) return raw
  return '/en/dashboard'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Sin código o con error: de vuelta al login (idioma por defecto).
  return NextResponse.redirect(`${origin}/en/login?error=oauth`)
}
