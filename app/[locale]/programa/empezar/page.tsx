export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { inscribirConCuenta } from '@/lib/programa-server'
import { getProgramaTexts } from '@/lib/programa-content'

// Entrada al programa con cuenta. Sin sesión, al registro/login y de vuelta
// aquí. Con sesión, inscribe (o reconoce que ya está dentro) y lleva al
// panel del programa. ?intento=<id>: el test que acaba de hacer, que pasa a
// ser su punto de partida.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EmpezarProgramaPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams?: { intento?: string }
}) {
  const intento = searchParams?.intento && UUID_RE.test(searchParams.intento) ? searchParams.intento : null
  const self = `/${locale}/programa/empezar${intento ? `?intento=${intento}` : ''}`

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect(`/${locale}/login?modo=registro&next=${encodeURIComponent(self)}`)

  let ok = true
  try {
    await inscribirConCuenta({ userId: user.id, email: user.email, locale, attemptId: intento })
  } catch (err) {
    console.error('[programa empezar]', err)
    ok = false
  }
  if (ok) redirect(`/${locale}/mes`)

  const t = getProgramaTexts(locale).confirmarPage
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
      <p className="max-w-sm text-center text-[#272727]/75">{t.error}</p>
    </div>
  )
}
