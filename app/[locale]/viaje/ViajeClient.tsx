'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import {
  buildAssignment,
  computeCurrentDay,
  phaseForDay,
  isSlotUnlocked,
  SLOTS,
  SLOT_HOURS,
  UMBRAL_ENTRY_DAYS,
  PHASE_ORDER,
  type Slot,
  type Phase,
} from '@/lib/journey'

interface Session {
  id: string
  started_at: string
  current_day: number
  status: string
  language: string
}
interface Card {
  day: number
  slot: string
  card_code: string
  sello: string | null
  answered_at: string | null
}
interface Gift {
  phase: string
  gift_text: string
}
interface Props {
  userId: string
  locale: string
  session: Session | null
  cards: Card[]
  gifts: Gift[]
}

export default function ViajeClient({ userId, locale, session, cards, gifts }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const t = useTranslations('viaje')
  const tn = useTranslations('nav')

  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [finalDon, setFinalDon] = useState('')
  const [finalIntent, setFinalIntent] = useState('')
  const [showFinal, setShowFinal] = useState(false)

  // ---- Sin sesión: pantalla de inicio ----
  async function startJourney() {
    setBusy(true)
    const { data: newSession, error } = await supabase
      .from('journey_sessions')
      .insert({ user_id: userId, language: locale, status: 'active', current_day: 1 })
      .select('id')
      .single()

    if (error || !newSession) {
      setBusy(false)
      return
    }

    const rows = buildAssignment().map(a => ({
      session_id: newSession.id,
      day: a.day,
      slot: a.slot,
      card_code: a.card_code,
    }))
    await supabase.from('journey_cards').insert(rows)
    trackEvent('journey_started', { tool: 'viaje' })
    router.refresh()
  }

  if (!session) {
    return (
      <Shell locale={locale} tn={tn}>
        <div className="w-full max-w-sm text-center mt-16">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] mb-4">
            {t('start_title')}
          </h2>
          <p className="text-sm text-[#272727]/60 mb-10">{t('start_desc')}</p>
          <button
            onClick={startJourney}
            disabled={busy}
            className="w-full py-4 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
          >
            {busy ? '...' : t('start_button')}
          </button>
        </div>
      </Shell>
    )
  }

  const currentDay = computeCurrentDay(session.started_at)
  const giftMap: Record<string, string> = Object.fromEntries(gifts.map(g => [g.phase, g.gift_text]))

  // ---- Umbral pendiente (cruzar fase previa + don) ----
  let pendingUmbral: { entryDay: number; phase: Phase } | null = null
  for (const [entryDayStr, phase] of Object.entries(UMBRAL_ENTRY_DAYS)) {
    const entryDay = Number(entryDayStr)
    if (currentDay >= entryDay && !giftMap[phase]) {
      pendingUmbral = { entryDay, phase }
      break
    }
  }

  async function saveGift(phase: Phase, text: string) {
    if (!text.trim()) return
    setBusy(true)
    await supabase.from('journey_gifts').insert({
      session_id: session!.id,
      phase,
      gift_text: text.trim(),
    })
    setInput('')
    setBusy(false)
    router.refresh()
  }

  if (pendingUmbral) {
    const umbralKeys: Partial<Record<Phase, string>> = {
      despertar: 'umbral_1',
      descender: 'umbral_2',
      atravesar: 'umbral_3',
    }
    const umbralKey = umbralKeys[pendingUmbral.phase]!
    return (
      <Shell locale={locale} tn={tn}>
        <div className="w-full max-w-sm text-center mt-12">
          <p className="text-xs text-[#272727]/40 tracking-widest uppercase mb-6">{t('umbral_title')}</p>
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] leading-relaxed mb-10">
            {t(umbralKey)}
          </p>
          <p className="text-xs text-[#272727]/50 mb-3">{t('don_prompt')}</p>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('don_placeholder')}
            className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-center text-sm outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors font-[family-name:var(--font-cormorant)] text-lg mb-8"
          />
          <button
            onClick={() => saveGift(pendingUmbral!.phase, input)}
            disabled={busy || !input.trim()}
            className="w-full py-4 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
          >
            {t('umbral_confirm')}
          </button>
        </div>
      </Shell>
    )
  }

  // ---- Ritual final (día 21) ----
  async function completeJourney() {
    if (!finalIntent.trim() || !finalDon.trim()) return
    setBusy(true)
    await supabase.from('journey_gifts').insert({
      session_id: session!.id,
      phase: 'retornar',
      gift_text: `${finalDon.trim()} — ${t('final_prompt')} ${finalIntent.trim()}`,
    })
    await supabase.from('journey_sessions').update({ status: 'completed' }).eq('id', session!.id)
    trackEvent('journey_completed', { tool: 'viaje' })
    setBusy(false)
    router.refresh()
  }

  if (showFinal && currentDay >= 21) {
    return (
      <Shell locale={locale} tn={tn}>
        <div className="w-full max-w-sm text-center mt-10">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] mb-8">
            {t('final_title')}
          </h2>
          <p className="text-xs text-[#272727]/40 tracking-widest uppercase mb-4">{t('final_gifts_label')}</p>
          <div className="flex flex-col gap-2 mb-10">
            {PHASE_ORDER.map(p =>
              giftMap[p] ? (
                <p key={p} className="font-[family-name:var(--font-cormorant)] text-lg text-[#c2866b]">
                  {giftMap[p]}
                </p>
              ) : null
            )}
          </div>
          <p className="text-xs text-[#272727]/50 mb-3">{t('don_prompt')}</p>
          <input
            type="text"
            value={finalDon}
            onChange={e => setFinalDon(e.target.value)}
            placeholder={t('don_placeholder')}
            className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-center text-sm outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors font-[family-name:var(--font-cormorant)] text-lg mb-6"
          />
          <p className="text-xs text-[#272727]/50 mb-3">{t('final_prompt')}</p>
          <input
            type="text"
            value={finalIntent}
            onChange={e => setFinalIntent(e.target.value)}
            placeholder={t('final_placeholder')}
            className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-center text-sm outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors font-[family-name:var(--font-cormorant)] text-lg mb-8"
          />
          <button
            onClick={completeJourney}
            disabled={busy || !finalDon.trim() || !finalIntent.trim()}
            className="w-full py-4 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
          >
            {t('final_button')}
          </button>
        </div>
      </Shell>
    )
  }

  // ---- Vista del día actual ----
  async function answerCard(day: number, slot: Slot, sello: string) {
    if (!sello.trim()) return
    setBusy(true)
    await supabase
      .from('journey_cards')
      .update({ sello: sello.trim(), answered_at: new Date().toISOString() })
      .eq('session_id', session!.id)
      .eq('day', day)
      .eq('slot', slot)
    trackEvent('save_sello', { tool: 'viaje', day, slot })
    setInput('')
    setBusy(false)
    router.refresh()
  }

  const dayCards = SLOTS.map(slot => cards.find(c => c.day === currentDay && c.slot === slot))
  const allAnswered = dayCards.every(c => c?.answered_at)
  const phase = phaseForDay(currentDay)

  return (
    <Shell locale={locale} tn={tn}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-2">
          <p className="text-xs text-[#272727]/40 tracking-widest uppercase">
            {t('phase_' + phase)}
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">
            {t('day_label', { day: currentDay })}
          </h2>
        </div>

        <Link
          href={`/${locale}/viaje/mapa`}
          className="block text-center text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors mb-8 tracking-wide"
        >
          {t('map_link')}
        </Link>

        <div className="flex flex-col gap-8">
          {SLOTS.map((slot, i) => {
            const card = dayCards[i]
            const unlocked = isSlotUnlocked(slot, true)
            return (
              <SlotCard
                key={slot}
                slot={slot}
                card={card}
                unlocked={unlocked}
                locale={locale}
                t={t}
                busy={busy}
                onAnswer={s => answerCard(currentDay, slot, s)}
              />
            )
          })}
        </div>

        {currentDay >= 21 && allAnswered && (
          <button
            onClick={() => setShowFinal(true)}
            className="w-full mt-10 py-4 bg-[#c2866b] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#272727] transition-colors"
          >
            {t('final_open')}
          </button>
        )}
      </div>
    </Shell>
  )
}

// ---------- Subcomponentes ----------

function Shell({
  locale,
  tn,
  children,
}: {
  locale: string
  tn: (k: string) => string
  children: React.ReactNode
}) {
  const supabase = createClient()
  async function logout() {
    await supabase.auth.signOut()
    window.location.href = `/${locale}/login`
  }
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      <div className="w-full max-w-sm flex items-center justify-between mb-8">
        <Link
          href={`/${locale}/dashboard`}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          ← {tn('title')}
        </Link>
        <button
          onClick={logout}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          {tn('logout')}
        </button>
      </div>
      {children}
    </div>
  )
}

function SlotCard({
  slot,
  card,
  unlocked,
  locale,
  t,
  busy,
  onAnswer,
}: {
  slot: Slot
  card: Card | undefined
  unlocked: boolean
  locale: string
  t: (k: string, v?: Record<string, string | number | Date>) => string
  busy: boolean
  onAnswer: (sello: string) => void
}) {
  const [value, setValue] = useState('')
  const answered = !!card?.answered_at

  return (
    <div>
      <p className="text-xs text-[#272727]/40 tracking-widest uppercase mb-3 text-center">
        {t('slot_' + slot)}
      </p>

      {!unlocked ? (
        <div className="w-full aspect-[2/3] rounded-xl bg-[#272727]/5 flex items-center justify-center">
          <p className="text-xs text-[#272727]/40 text-center px-6">
            {t('locked', { hour: SLOT_HOURS[slot] })}
          </p>
        </div>
      ) : (
        <>
          <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md mb-4">
            {card && (
              <Image
                src={`/cards/${locale}/${card.card_code}.png`}
                alt={card.card_code}
                fill
                className="object-cover"
              />
            )}
          </div>
          {answered ? (
            <p className="text-center font-[family-name:var(--font-cormorant)] text-2xl text-[#c2866b]">
              {card?.sello}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder={t('sello_placeholder')}
                value={value}
                onChange={e => setValue(e.target.value)}
                maxLength={40}
                className="w-full border-b border-[#272727]/30 bg-transparent py-2 text-center text-sm outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors font-[family-name:var(--font-cormorant)] text-lg"
              />
              <button
                onClick={() => onAnswer(value)}
                disabled={busy || !value.trim()}
                className="w-full py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
              >
                {t('save_button')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
