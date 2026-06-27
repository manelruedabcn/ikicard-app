'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { PLAYABLE_CARDS } from '@/lib/cards'

interface Session {
  card_code: string
  sello: string | null
  played_at: string
}

interface Props {
  userId: string
  locale: string
  todaySessions: Session[]
  history: Session[]
  allPlayedCodes: string[]
}

function pickCard(allPlayedCodes: string[]): string {
  const notSeen = PLAYABLE_CARDS.filter(c => !allPlayedCodes.includes(c))
  const pool = notSeen.length > 0 ? notSeen : PLAYABLE_CARDS
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function OraculoClient({ userId, locale, todaySessions, history, allPlayedCodes }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('oraculo')
  const tn = useTranslations('nav')

  const alreadyPlayedToday = todaySessions.length > 0
  const todayCard = alreadyPlayedToday ? todaySessions[0] : null

  const [selectedCard] = useState<string>(() =>
    alreadyPlayedToday ? todaySessions[0].card_code : pickCard(allPlayedCodes)
  )
  const [sello, setSello] = useState(todayCard?.sello || '')
  const [saved, setSaved] = useState(alreadyPlayedToday)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ]

  async function handleSave() {
    if (!sello.trim()) return
    setSaving(true)
    setError('')

    const { error } = await supabase.from('oracle_sessions').insert({
      user_id: userId,
      card_code: selectedCard,
      sello: sello.trim(),
      played_at: new Date().toISOString(),
    })

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = `/${locale}/login`
  }

  async function handleShare() {
    const cardQuestion = selectedCard
    const shareText = `${cardQuestion}\n\nikigaier.com`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IKICARD',
          text: shareText,
        })
      } catch {
        // Usuario canceló — no hacer nada
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback final: alert
        alert(shareText)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-2xl tracking-widest text-[#272727]">
          {tn('title')}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
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
          <button
            onClick={handleLogout}
            className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
          >
            {tn('logout')}
          </button>
        </div>
      </div>

      {/* Carta del día */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-[#272727]/40 tracking-widest uppercase mb-4 text-center">
          {t('label')}
        </p>

        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md mb-6">
          <Image
            src={`/cards/${selectedCard}.png`}
            alt={selectedCard}
            fill
            className="object-cover"
            priority
          />
        </div>

        <p className="text-center font-[family-name:var(--font-cormorant)] text-lg text-[#272727]/60 mb-6">
          {selectedCard}
        </p>

        <button
          onClick={handleShare}
          className="w-full py-3 border border-[#272727]/30 text-[#272727]/60 text-xs tracking-widest hover:border-[#c2866b] hover:text-[#c2866b] transition-colors mb-6"
        >
          {copied ? '✓ COPIADO' : t('share_button')}
        </button>

        {/* Sello */}
        {saved ? (
          <div className="text-center">
            <p className="text-xs text-[#272727]/40 tracking-widest uppercase mb-1">{t('sello_label')}</p>
            <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#c2866b]">
              {sello}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={t('sello_placeholder')}
              value={sello}
              onChange={e => setSello(e.target.value)}
              maxLength={40}
              className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-center text-sm outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors font-[family-name:var(--font-cormorant)] text-lg"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleSave}
              disabled={saving || !sello.trim()}
              className="w-full py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
            >
              {saving ? '...' : t('save_button')}
            </button>
          </div>
        )}
      </div>

      {/* Historial */}
      {history.length > 0 && (
        <div className="w-full max-w-sm mt-12">
          <p className="text-xs text-[#272727]/40 tracking-widest uppercase mb-4">{t('history_label')}</p>
          <div className="flex flex-col gap-3">
            {history.map((s, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-[#272727]/10 pb-3">
                <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={`/cards/${s.card_code}.png`}
                    alt={s.card_code}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-[#272727]/40">{s.card_code}</p>
                  {s.sello && (
                    <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#c2866b]">
                      {s.sello}
                    </p>
                  )}
                  <p className="text-xs text-[#272727]/30">
                    {new Date(s.played_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
