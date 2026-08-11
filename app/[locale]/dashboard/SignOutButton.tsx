'use client'

import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton({ locale }: { locale: string }) {
  const tn = useTranslations('nav')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = `/${locale}/login`
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
    >
      {tn('logout')}
    </button>
  )
}
