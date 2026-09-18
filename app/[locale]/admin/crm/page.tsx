export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/admin'
import { listCrmContacts } from '@/lib/crm'

type Search = { q?: string; status?: string; source?: string; consent?: string }

export default async function CrmPage({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: Search }) {
  if (!(await isCurrentUserAdmin())) redirect(`/${locale}/dashboard`)
  const contacts = await listCrmContacts(searchParams)
  const exportQuery = new URLSearchParams(Object.entries(searchParams).filter(([, v]) => v).map(([k, v]) => [k, v!])).toString()

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href={`/${locale}/admin`} className="text-xs text-[#272727]/45 hover:text-[#c2866b]">← Administración</Link>
            <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-[#272727]">CRM de contactos</h1>
            <p className="mt-1 text-sm text-[#272727]/55">{contacts.length} contactos en esta vista</p>
          </div>
          <a href={`/api/admin/crm/export?${exportQuery}`} className="rounded-full border border-[#272727]/20 px-5 py-2 text-xs tracking-wide text-[#272727] hover:border-[#c2866b] hover:text-[#c2866b]">
            Exportar para Excel
          </a>
        </div>

        <form className="mb-7 grid gap-3 rounded-2xl border border-[#272727]/10 bg-white p-4 sm:grid-cols-5">
          <input name="q" defaultValue={searchParams.q} placeholder="Nombre, correo o teléfono" className="rounded-lg border border-[#272727]/15 px-3 py-2 text-sm sm:col-span-2" />
          <select name="status" defaultValue={searchParams.status} className="rounded-lg border border-[#272727]/15 px-3 py-2 text-sm">
            <option value="">Todos los estados</option><option value="lead">Lead</option><option value="cliente">Cliente</option><option value="inactivo">Inactivo</option>
          </select>
          <select name="source" defaultValue={searchParams.source} className="rounded-lg border border-[#272727]/15 px-3 py-2 text-sm">
            <option value="">Todos los orígenes</option><option value="taller">Taller</option><option value="paso">PASO</option><option value="registro">Plataforma</option>
          </select>
          <select name="consent" defaultValue={searchParams.consent} className="rounded-lg border border-[#272727]/15 px-3 py-2 text-sm">
            <option value="">Cualquier permiso</option><option value="si">Acepta comunicaciones</option><option value="no">Sin permiso comercial</option>
          </select>
          <div className="flex gap-2 sm:col-span-5">
            <button className="rounded-full bg-[#272727] px-5 py-2 text-xs tracking-wide text-white">Filtrar</button>
            <Link href={`/${locale}/admin/crm`} className="rounded-full px-5 py-2 text-xs text-[#272727]/55">Limpiar</Link>
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-[#272727]/10 bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#272727] text-[#FDFBF7]"><tr><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Origen</th><th className="px-4 py-3">Etiquetas</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Comunicaciones</th><th className="px-4 py-3">Próxima acción</th></tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-t border-[#272727]/10 align-top hover:bg-[#c2866b]/[0.035]">
                  <td className="px-4 py-4"><Link href={`/${locale}/admin/crm/${c.id}`} className="font-medium text-[#272727] hover:text-[#c2866b]">{c.first_name || 'Sin nombre'}</Link><div className="mt-1 text-xs text-[#272727]/50">{c.email || c.phone || '—'}</div></td>
                  <td className="px-4 py-4 text-xs text-[#272727]/60">{Array.from(new Set(c.sources.map(s => s.source_type))).join(' · ') || '—'}</td>
                  <td className="px-4 py-4"><div className="flex flex-wrap gap-1">{c.tags.map(tag => <span key={tag.id} className="rounded-full px-2 py-1 text-[10px]" style={{ backgroundColor: `${tag.color}18`, color: tag.color }}>{tag.name}</span>)}</div></td>
                  <td className="px-4 py-4 capitalize text-[#272727]/70">{c.status}</td>
                  <td className="px-4 py-4 text-xs">{c.unsubscribed_at ? <span className="text-red-700">Baja</span> : c.marketing_consent ? <span className="text-[#7a8b6f]">Autorizadas</span> : <span className="text-[#272727]/45">Solo operativas</span>}</td>
                  <td className="px-4 py-4 text-xs text-[#272727]/60">{c.next_action || '—'}{c.next_action_at && <div className="mt-1 text-[#c2866b]">{new Date(c.next_action_at).toLocaleString('es-ES')}</div>}</td>
                </tr>
              ))}
              {contacts.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#272727]/45">No hay contactos con estos filtros.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
