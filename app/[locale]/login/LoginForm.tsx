'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

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
        trackEvent('login', { method: 'email' })
        router.push(`/${locale}/dashboard`)
        router.refresh()
      }
    } else if (mode === 'register') {
      // Igual que en Google: forzamos el destino del enlace de confirmación a
      // nuestro propio callback. Sin esto, Supabase usa el Site URL del
      // panel (a menudo desactualizado o solo el dominio raíz), el enlace no
      // llega a /auth/callback, y la sesión nunca se canjea — aunque el email
      // sí queda confirmado en Supabase, así que parece que "no funciona".
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        trackEvent('sign_up', { method: 'email' })
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

  async function handleGoogle() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
      },
    })
    if (error) setError(error.message)
    // Si no hay error, el navegador ya está redirigiendo a Google.
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

        {mode !== 'forgot' && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 border border-[#272727]/20 text-sm text-[#272727] hover:border-[#c2866b] hover:text-[#c2866b] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
              </svg>
              {t('google_button')}
            </button>
            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-[#272727]/15" />
              <span className="text-xs text-[#272727]/40">{t('or')}</span>
              <span className="flex-1 h-px bg-[#272727]/15" />
            </div>
          </>
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
