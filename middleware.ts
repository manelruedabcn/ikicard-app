import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['es', 'ca', 'en'],
  defaultLocale: 'es',
  localeDetection: true,
})

export const config = {
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
}
