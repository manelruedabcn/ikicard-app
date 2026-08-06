'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm({ locale }: { locale: string }) {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth')
  const tn = useTranslations('nav')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => {
        router.push(`/${locale}/dashboard`)
        router.refresh()
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FDFBF7]">
      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light tracking-widest text-[#272727] mb-2">
        {tn('title')}
      </h1>
      <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-12">
        {tn('tagline')}
      </p>

      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{t('reset_title')}</p>
          <p className="text-sm text-[#272727]/60 mt-2">{t('reset_desc')}</p>
        </div>

        {done ? (
          <p className="text-sm text-[#272727]/70">{t('reset_done')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder={t('new_password')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-sm outline-none placeholder:text-[#272727]/40 focus:border-[#c2866b] transition-colors"
            />

            {error && <p className="text-sm text-[#c2866b]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-50"
            >
              {loading ? '...' : t('reset_button')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
