import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage({ params: { locale } }: { params: { locale: string } }) {
  return <ResetPasswordForm locale={locale} />
}
