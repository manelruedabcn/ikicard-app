export const dynamic = 'force-dynamic'

import LoginForm from './LoginForm'

// `next`: ruta interna a la que volver tras entrar (p. ej. el QR del taller
// lleva a /mascaras). Solo rutas del propio sitio; lo demás, al dashboard.
function safeNext(raw?: string): string | null {
  return raw && /^\/(?![/\\])/.test(raw) ? raw : null
}

export default function LoginPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams: { next?: string }
}) {
  return <LoginForm locale={locale} next={safeNext(searchParams.next)} />
}
