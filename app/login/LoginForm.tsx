'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/oraculo')
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
        IKICARD
      </h1>

      <div className="w-full max-w-sm">
        <div className="flex mb-8 border-b border-[#272727]/20">
          <button
            className={`flex-1 pb-2 text-sm tracking-wide transition-colors ${
              mode === 'login' ? 'border-b-2 border-[#c2866b] text-[#c2866b]' : 'text-[#272727]/50'
            }`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            className={`flex-1 pb-2 text-sm tracking-wide transition-colors ${
              mode === 'register' ? 'border-b-2 border-[#c2866b] text-[#c2866b]' : 'text-[#272727]/50'
            }`}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-sm outline-none placeholder:text-[#272727]/40 focus:border-[#c2866b] transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
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
            {loading ? '...' : mode === 'login' ? 'ENTRAR' : 'REGISTRARSE'}
          </button>
        </form>
      </div>
    </div>
  )
}
