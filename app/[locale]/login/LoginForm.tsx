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
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ]

  function switchMode(next: 'login' | 'register' | 'forgot') {
    setMode(next)
    setError('')
    setMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push(`/${locale}/dashboard`)
        router.refresh()
      }
    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage(t('register_confirm'))
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage(t('forgot_sent'))
      }
    }

    setLoading(false)
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
        {mode === 'forgot' ? (
          <div className="mb-8">
            <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{t('forgot_title')}</p>
            <p className="text-sm text-[#272727]/60 mt-2">{t('forgot_desc')}</p>
          </div>
        ) : (
          <div className="flex mb-8 border-b border-[#272727]/20">
            <button
              className={`flex-1 pb-2 text-sm tracking-wide transition-colors ${
                mode === 'login' ? 'border-b-2 border-[#c2866b] text-[#c2866b]' : 'text-[#272727]/50'
              }`}
              onClick={() => switchMode('login')}
            >
              {t('login_title')}
            </button>
            <button
              className={`flex-1 pb-2 text-sm tracking-wide transition-colors ${
                mode === 'register' ? 'border-b-2 border-[#c2866b] text-[#c2866b]' : 'text-[#272727]/50'
              }`}
              onClick={() => switchMode('register')}
            >
              {t('register_link')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-sm outline-none placeholder:text-[#272727]/40 focus:border-[#c2866b] transition-colors"
          />
          {mode !== 'forgot' && (
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-sm outline-none placeholder:text-[#272727]/40 focus:border-[#c2866b] transition-colors"
            />
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="self-end text-xs text-[#272727]/50 hover:text-[#c2866b] transition-colors"
            >
              {t('forgot_link')}
            </button>
          )}

          {error && <p className="text-sm text-[#c2866b]">{error}</p>}
          {message && <p className="text-sm text-[#272727]/70">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-50"
          >
            {loading
              ? '...'
              : mode === 'login'
                ? t('login_button')
                : mode === 'register'
                  ? t('register_link')
                  : t('forgot_button')}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs text-[#272727]/50 hover:text-[#c2866b] transition-colors mt-2"
            >
              {t('back_to_login')}
            </button>
          )}
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

        {/* Volver a la web de marketing */}
        <a
          href={`https://www.ikigaier.com/${['es', 'ca', 'en'].includes(locale) ? locale : 'es'}/`}
          className="mt-8 block text-center text-xs tracking-wider text-[#272727]/40 hover:text-[#c2866b] transition-colors"
        >
          {t('back_to_site')}
        </a>
      </div>
    </div>
  )
}
