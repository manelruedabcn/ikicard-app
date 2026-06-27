import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localeDetection: true,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Supabase auth for non-protected paths, let next-intl handle them
  const isProtected = pathname.match(new RegExp('^/(en|es)?/?oraculo'))
  const isLogin = pathname.match(new RegExp('^/(en|es)?/?login/?$'))

  if (!isProtected && !isLogin) {
    return intlMiddleware(request)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas protegidas
  if (!user && isProtected) {
    const locale = pathname.match(new RegExp('^/(en|es)'))?.[1] || 'en'
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // Si ya hay sesión y va a login, redirige al oráculo
  if (user && isLogin) {
    const locale = pathname.match(new RegExp('^/(en|es)'))?.[1] || 'en'
    return NextResponse.redirect(new URL(`/${locale}/oraculo`, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
