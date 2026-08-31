export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin, listUsers, listCatalog, getAdminStats } from '@/lib/admin'
import { grantTool, grantProgram } from './actions'
import ToolTick from './ToolTick'

export default async function AdminPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)
  if (!(await isCurrentUserAdmin())) redirect(`/${locale}/dashboard`)

  const t = await getTranslations('admin')
  const [users, catalog, stats] = await Promise.all([listUsers(), listCatalog(), getAdminStats()])

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] mb-2">{t('title')}</h1>
        <p className="text-sm text-[#272727]/60 mb-8">{t('subtitle', { count: users.length })}</p>

        {/* Métricas clave de uso */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
          <StatCard value={stats.pasoTotal} label={t('stat_paso_total')} highlight />
          <StatCard value={stats.pasoToday} label={t('stat_paso_today')} />
          <StatCard value={stats.pasoWeek} label={t('stat_paso_week')} />
          <StatCard value={stats.journeysStarted} label={t('stat_journeys')} />
          <StatCard value={stats.users} label={t('stat_users')} />
        </div>

        <div className="flex flex-col gap-6">
          {users.map(u => (
            <div key={u.id} className="border border-[#272727]/15 rounded-xl p-6">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className="text-[#272727] font-medium">{u.display_name || u.email.split('@')[0]}</p>
                  <p className="text-xs text-[#272727]/50">{u.email}</p>
                </div>
              </div>

              {/* Dónde está: confirmación y Paso, de un vistazo */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    u.email_confirmed ? 'bg-[#c2866b]/10 text-[#c2866b]' : 'bg-[#272727]/10 text-[#272727]/50'
                  }`}
                >
                  {/* Textos fijos en español (vista interna, solo para ti) en vez de
                      claves de traducción nuevas — evita tocar messages/*.json */}
                  {u.email_confirmed ? 'Confirmado' : 'Sin confirmar'}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    u.paso_codigo ? 'bg-[#c2866b]/10 text-[#c2866b]' : 'bg-[#272727]/10 text-[#272727]/50'
                  }`}
                >
                  {u.paso_codigo ? `Paso: ${u.paso_codigo}` : 'Paso: sin hacer'}
                </span>
              </div>

              {/* Herramientas: marca o desmarca para conceder/revocar al momento */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#272727]/10 pt-4">
                {catalog.tools.map(tool => {
                  const ent = u.tools.find(x => x.tool_id === tool.id)
                  return (
                    <label key={tool.id} className="flex items-center gap-1.5 text-sm text-[#272727]/80 cursor-pointer">
                      <ToolTick userId={u.id} toolId={tool.id} entitlementId={ent?.entitlement_id ?? null} />
                      {tool.name}
                      {ent?.expires_at && (
                        <span className="text-[10px] text-[#c2866b]">
                          · {t('until')} {new Date(ent.expires_at).toLocaleDateString(locale)}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>

              {/* Caso avanzado: conceder con caducidad o fuente concreta (p. ej. "paid" 30 días) */}
              <form action={grantTool} className="flex flex-wrap items-end gap-2 mt-3 pt-3">
                <input type="hidden" name="user_id" value={u.id} />
                <select name="tool_id" required className="text-xs border border-[#272727]/20 rounded px-2 py-1 bg-white">
                  {catalog.tools.map(tool => (
                    <option key={tool.id} value={tool.id}>{tool.name}</option>
                  ))}
                </select>
                <select name="source" className="text-xs border border-[#272727]/20 rounded px-2 py-1 bg-white">
                  <option value="manual">manual</option>
                  <option value="free">free</option>
                  <option value="paid">paid</option>
                  <option value="promo">promo</option>
                </select>
                <input
                  name="days"
                  type="number"
                  min="1"
                  placeholder={t('days_placeholder')}
                  className="text-xs border border-[#272727]/20 rounded px-2 py-1 w-24 bg-white"
                />
                <button className="text-xs tracking-widest text-[#272727]/60 border border-[#272727]/20 px-3 py-1.5 rounded hover:border-[#c2866b] hover:text-[#c2866b] transition-colors">
                  {t('grant_tool')}
                </button>
              </form>

              {/* Asignar programa (si hay) */}
              {catalog.programs.length > 0 && (
                <form action={grantProgram} className="flex flex-wrap items-end gap-2 mt-3">
                  <input type="hidden" name="user_id" value={u.id} />
                  <select name="program_id" required className="text-sm border border-[#272727]/20 rounded px-2 py-1 bg-white">
                    {catalog.programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <select name="source" className="text-sm border border-[#272727]/20 rounded px-2 py-1 bg-white">
                    <option value="manual">manual</option>
                    <option value="free">free</option>
                    <option value="paid">paid</option>
                    <option value="promo">promo</option>
                  </select>
                  <input
                    name="days"
                    type="number"
                    min="1"
                    placeholder={t('days_placeholder')}
                    className="text-sm border border-[#272727]/20 rounded px-2 py-1 w-28 bg-white"
                  />
                  <button className="text-xs tracking-widest border border-[#272727]/30 text-[#272727] px-4 py-2 rounded hover:border-[#c2866b] hover:text-[#c2866b] transition-colors">
                    {t('grant_program')}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? 'border-[#c2866b]/40 bg-[#c2866b]/[0.06]' : 'border-[#272727]/15 bg-white'
      }`}
    >
      <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{value}</p>
      <p className="text-xs text-[#272727]/55 mt-1 leading-tight">{label}</p>
    </div>
  )
}
