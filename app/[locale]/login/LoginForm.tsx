'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const t = useTranslations('auth')
  const tn = useTranslations('nav')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'ca', label: 'CA' },
    { code: 'pt', label: 'PT' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push(`/${locale}/oraculo`)
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setError('Revisa tu email para confirmar el registro.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FDFBF7]">
      <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light tracking-widest text-[#272727] mb-12">
        {tn('title')}
      </h1>

      <div className="w-full max-w-sm">
        <div className="flex mb-8 border-b border-[#272727]/20">
          <button
            className={`flex-1 pb-2 text-sm tracking-wide transition-colors ${
              mode === 'login' ? 'border-b-2 border-[#c2866b] text-[#c2866b]' : 'text-[#272727]/50'
            }`}
            onClick={() => setMode('login')}
          >
            {t('login_title')}
          </button>
          <button
            className={`flex-1 pb-2 text-sm tracking-wide transition-colors ${
              mode === 'register' ? 'border-b-2 border-[#c2866b] text-[#c2866b]' : 'text-[#272727]/50'
            }`}
            onClick={() => setMode('register')}
          >
            {t('register_link')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-sm outline-none placeholder:text-[#272727]/40 focus:border-[#c2866b] transition-colors"
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-sm outline-none placeholder:text-[#272727]/40 focus:border-[#c2866b] transition-colors"
          />

          {error && <p className="text-sm text-[#c2866b]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? t('login_button') : t('register_link')}
          </button>
        </form>

        {/* Language selector */}
        <div className="flex justify-center gap-3 mt-10">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => router.push(`/${lang.code}${pathname.replace(/^\/[a-z]{2}/, '')}`)}
              className={`text-xs tracking-wider transition-colors ${
                lang.code === locale ? 'text-[#c2866b]' : 'text-[#272727]/40 hover:text-[#c2866b]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
