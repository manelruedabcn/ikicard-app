export const dynamic = 'force-dynamic'

import LoginForm from './LoginForm'

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  return <LoginForm locale={locale} />
}
