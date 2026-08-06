export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin, listUsers, listCatalog } from '@/lib/admin'
import { grantTool, grantProgram, revokeEntitlement } from './actions'

export default async function AdminPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)
  if (!(await isCurrentUserAdmin())) redirect(`/${locale}/dashboard`)

  const t = await getTranslations('admin')
  const [users, catalog] = await Promise.all([listUsers(), listCatalog()])

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] mb-2">{t('title')}</h1>
        <p className="text-sm text-[#272727]/60 mb-10">{t('subtitle', { count: users.length })}</p>

        <div className="flex flex-col gap-6">
          {users.map(u => (
            <div key={u.id} className="border border-[#272727]/15 rounded-xl p-6">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="text-[#272727] font-medium">{u.display_name || u.email.split('@')[0]}</p>
                  <p className="text-xs text-[#272727]/50">{u.email}</p>
                </div>
              </div>

              {/* Permisos actuales */}
              {u.tools.length === 0 ? (
                <p className="text-xs text-[#272727]/40 mb-4">{t('no_tools')}</p>
              ) : (
                <ul className="flex flex-col gap-2 mb-4">
                  {u.tools.map(tool => (
                    <li key={tool.entitlement_id} className="flex items-center justify-between text-sm">
                      <span className="text-[#272727]/80">
                        {tool.tool_name}
                        <span className="text-xs text-[#272727]/40 ml-2">
                          {tool.source}
                          {tool.expires_at
                            ? ` · ${t('until')} ${new Date(tool.expires_at).toLocaleDateString(locale)}`
                            : ` · ${t('forever')}`}
                        </span>
                      </span>
                      <form action={revokeEntitlement}>
                        <input type="hidden" name="entitlement_id" value={tool.entitlement_id} />
                        <button className="text-xs text-[#c2866b] hover:underline">{t('revoke')}</button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}

              {/* Asignar herramienta */}
              <form action={grantTool} className="flex flex-wrap items-end gap-2 border-t border-[#272727]/10 pt-4">
                <input type="hidden" name="user_id" value={u.id} />
                <select name="tool_id" required className="text-sm border border-[#272727]/20 rounded px-2 py-1 bg-white">
                  {catalog.tools.map(tool => (
                    <option key={tool.id} value={tool.id}>{tool.name}</option>
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
                <button className="text-xs tracking-widest bg-[#272727] text-[#FDFBF7] px-4 py-2 rounded hover:bg-[#c2866b] transition-colors">
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
