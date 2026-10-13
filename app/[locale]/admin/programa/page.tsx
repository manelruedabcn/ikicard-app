export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/admin'
import { getProgramaResumen, type ProgramaEncuentro } from '@/lib/programa-admin'
import { crearEncuentro, borrarEncuentro } from './actions'

// Panel del programa «Un mes conociendo tu ikigai»: el embudo (Inventario →
// programa → repetición), quién va por qué semana y qué ha respondido cada
// jueves, y los encuentros en grupo (alta y baja sin entrar en Supabase).

const CHECKIN: Record<string, { label: string; cls: string }> = {
  si: { label: 'Sí', cls: 'bg-[#7a8b6f]/15 text-[#4f5d47]' },
  medias: { label: 'A medias', cls: 'bg-[#c2866b]/15 text-[#94563B]' },
  no: { label: 'No', cls: 'bg-[#272727]/10 text-[#272727]/60' },
}

const fecha = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' })
const fechaHora = (d: string) => new Date(d).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })

export default async function ProgramaAdminPage({ params: { locale } }: { params: { locale: string } }) {
  if (!(await isCurrentUserAdmin())) redirect(`/${locale}/dashboard`)
  const r = await getProgramaResumen()

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-12">
        <div>
          <Link href={`/${locale}/admin`} className="text-xs text-[#272727]/45 hover:text-[#c2866b]">← Administración</Link>
          <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl text-[#272727]">Un mes conociendo tu ikigai</h1>
          <p className="mt-1 text-sm text-[#272727]/55">Del test de ikigai al programa, semana a semana. Horas en hora de Madrid.</p>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={r.inventarios.total} label="Tests de ikigai hechos" sub={`${r.inventarios.semana} en los últimos 7 días`} />
          <Stat value={r.leads} label="Han dejado su email" />
          <Stat value={r.activas} label="En el programa ahora" highlight />
          <Stat value={r.completadas} label="Han terminado" sub={`${r.repitieron} repitieron el test · ${r.bajas} bajas`} />
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">Encuentros en grupo</h2>
          <p className="mb-4 text-xs text-[#272727]/50">Cada persona recibe los que caen dentro de su mes: aparecen en sus correos y se le avisa la víspera.</p>
          <form action={crearEncuentro} className="mb-5 grid gap-3 rounded-2xl border border-[#272727]/10 bg-white p-4 sm:grid-cols-[auto_1fr_auto_1fr_auto]">
            <label className="text-xs text-[#272727]/55">Fecha y hora
              <input type="datetime-local" name="starts_at" required className="mt-1 block w-full rounded-lg border border-[#272727]/15 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-[#272727]/55">Enlace (Meet, Zoom…)
              <input type="url" name="url" required placeholder="https://" className="mt-1 block w-full rounded-lg border border-[#272727]/15 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-[#272727]/55">Lengua
              <select name="locale" className="mt-1 block w-full rounded-lg border border-[#272727]/15 px-3 py-2 text-sm">
                <option value="es">Castellano</option>
                <option value="ca">Català</option>
                <option value="en">English</option>
                <option value="">Todas</option>
              </select>
            </label>
            <label className="text-xs text-[#272727]/55">Nota interna (opcional)
              <input name="nota" maxLength={200} className="mt-1 block w-full rounded-lg border border-[#272727]/15 px-3 py-2 text-sm" />
            </label>
            <button className="self-end rounded-full bg-[#272727] px-5 py-2.5 text-xs tracking-wide text-white hover:bg-[#c2866b]">Añadir</button>
          </form>
          <EncuentrosTabla titulo="Próximos" items={r.proximos} borrable />
          {r.pasados.length > 0 && <EncuentrosTabla titulo="Pasados" items={r.pasados} />}
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">Personas</h2>
          <div className="overflow-x-auto rounded-xl border border-[#272727]/15 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#272727] text-left text-[#FDFBF7]">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Lengua</th>
                  <th className="px-4 py-3 font-medium">Empieza</th>
                  <th className="px-4 py-3 font-medium">Va por</th>
                  {[1, 2, 3, 4].map(s => <th key={s} className="px-3 py-3 font-medium">Jueves {s}</th>)}
                  <th className="px-4 py-3 font-medium">Repitió</th>
                </tr>
              </thead>
              <tbody>
                {r.filas.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-6 text-center text-[#272727]/45">Todavía no hay nadie en el programa.</td></tr>
                ) : r.filas.map(f => (
                  <tr key={f.id} className="border-t border-[#272727]/10">
                    <td className="px-4 py-3">{f.email}</td>
                    <td className="px-4 py-3 uppercase text-[#272727]/60">{f.locale}</td>
                    <td className="px-4 py-3 text-[#272727]/60">{fecha(f.start_date)}</td>
                    <td className="px-4 py-3">
                      {f.status === 'baja' ? <span className="text-[#272727]/45">Baja</span>
                        : f.status === 'completada' ? <span className="text-[#4f5d47]">Terminado</span>
                        : f.semana === 0 ? <span className="text-[#272727]/45">Aún no empieza</span>
                        : f.semana >= 5 ? 'Cierre' : `Semana ${f.semana}`}
                    </td>
                    {[1, 2, 3, 4].map(s => (
                      <td key={s} className="px-3 py-3">
                        {f.checkins[s] ? <span className={`rounded-full px-2 py-0.5 text-xs ${CHECKIN[f.checkins[s]].cls}`}>{CHECKIN[f.checkins[s]].label}</span> : <span className="text-[#272727]/25">—</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3">{f.repitio ? 'Sí' : <span className="text-[#272727]/25">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ value, label, sub, highlight = false }: { value: number; label: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-[#c2866b]/40 bg-[#c2866b]/[0.06]' : 'border-[#272727]/10 bg-white'}`}>
      <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] tabular-nums">{value}</p>
      <p className="text-xs text-[#272727]/60">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-[#272727]/45">{sub}</p>}
    </div>
  )
}

function EncuentrosTabla({ titulo, items, borrable = false }: { titulo: string; items: ProgramaEncuentro[]; borrable?: boolean }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs uppercase tracking-[0.15em] text-[#272727]/45">{titulo}</p>
      {items.length === 0 ? (
        <p className="text-sm text-[#272727]/45">No hay encuentros programados. Sin encuentros, los correos no los mencionan.</p>
      ) : (
        <ul className="divide-y divide-[#272727]/10 rounded-xl border border-[#272727]/10 bg-white">
          {items.map(e => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0">
                <span className="text-[#272727]">{fechaHora(e.starts_at)}</span>
                <span className="ml-2 text-xs uppercase text-[#272727]/50">{e.locale || 'todas'}</span>
                {e.nota && <span className="ml-2 text-xs text-[#272727]/50">· {e.nota}</span>}
                <a href={e.url} className="ml-2 break-all text-xs text-[#c2866b] hover:underline">{e.url}</a>
              </span>
              {borrable && (
                <form action={borrarEncuentro}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="text-xs text-[#272727]/45 hover:text-red-700">Borrar</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
