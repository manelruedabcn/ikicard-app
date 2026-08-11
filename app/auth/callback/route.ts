import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Callback de OAuth (Google). El proveedor devuelve aquí un `code` que se
// canjea por una sesión; luego se redirige a `next` (el dashboard con su
// idioma). Vive fuera de [locale] y está excluida del middleware de next-intl,
// así que no recibe prefijo de idioma.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/en/dashboard'

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
