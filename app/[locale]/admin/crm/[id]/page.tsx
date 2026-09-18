export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/admin'
import { getCrmContact } from '@/lib/crm'
import { addCrmNote, addCrmTag, removeCrmTag, updateCrmContact } from '../actions'

export default async function ContactPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  if (!(await isCurrentUserAdmin())) redirect(`/${locale}/dashboard`)
  const result = await getCrmContact(id)
  if (!result) notFound()
  const { contact, notes, allTags } = result
  const assigned = new Set(contact.tags.map(t => t.id))

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href={`/${locale}/admin/crm`} className="text-xs text-[#272727]/45 hover:text-[#c2866b]">← CRM de contactos</Link>
        <div className="mt-5 mb-8 flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727]">{contact.first_name || 'Sin nombre'}</h1><p className="mt-1 text-sm text-[#272727]/55">{contact.email || 'Sin correo'}{contact.phone ? ` · ${contact.phone}` : ''}</p></div>
          <span className="rounded-full bg-[#c2866b]/10 px-4 py-2 text-xs uppercase tracking-wide text-[#c2866b]">{contact.status}</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-[#272727]/10 bg-white p-6">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">Seguimiento</h2>
            <form action={updateCrmContact} className="mt-5 space-y-4">
              <input type="hidden" name="contact_id" value={contact.id} /><input type="hidden" name="locale" value={locale} />
              <label className="block text-xs text-[#272727]/55">Estado<select name="status" defaultValue={contact.status} className="mt-1 w-full rounded-lg border border-[#272727]/15 px-3 py-2 text-sm text-[#272727]"><option value="lead">Lead</option><option value="cliente">Cliente</option><option value="inactivo">Inactivo</option></select></label>
              <label className="block text-xs text-[#272727]/55">Próxima acción<input name="next_action" defaultValue={contact.next_action ?? ''} placeholder="Llamar, enviar propuesta…" className="mt-1 w-full rounded-lg border border-[#272727]/15 px-3 py-2 text-sm text-[#272727]" /></label>
              <label className="block text-xs text-[#272727]/55">Fecha y hora<input name="next_action_at" type="datetime-local" defaultValue={contact.next_action_at ? new Date(contact.next_action_at).toISOString().slice(0, 16) : ''} className="mt-1 w-full rounded-lg border border-[#272727]/15 px-3 py-2 text-sm text-[#272727]" /></label>
              <button className="rounded-full bg-[#272727] px-5 py-2 text-xs tracking-wide text-white">Guardar seguimiento</button>
            </form>
          </section>

          <section className="rounded-2xl border border-[#272727]/10 bg-white p-6">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">Datos y permisos</h2>
            <dl className="mt-5 space-y-3 text-sm"><div><dt className="text-xs text-[#272727]/45">Comunicaciones comerciales</dt><dd className="mt-1">{contact.unsubscribed_at ? 'Se dio de baja' : contact.marketing_consent ? 'Autorizadas' : 'No autorizadas · solo mensajes operativos'}</dd></div><div><dt className="text-xs text-[#272727]/45">Origen</dt><dd className="mt-1 capitalize">{Array.from(new Set(contact.sources.map(s => s.source_type))).join(' · ') || '—'}</dd></div><div><dt className="text-xs text-[#272727]/45">Alta</dt><dd className="mt-1">{new Date(contact.created_at).toLocaleString('es-ES')}</dd></div></dl>
          </section>

          <section className="rounded-2xl border border-[#272727]/10 bg-white p-6 md:col-span-2">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">Etiquetas</h2>
            <div className="mt-4 flex flex-wrap gap-2">{contact.tags.map(tag => <form action={removeCrmTag} key={tag.id}><input type="hidden" name="contact_id" value={contact.id} /><input type="hidden" name="locale" value={locale} /><input type="hidden" name="tag_id" value={tag.id} /><button title="Quitar etiqueta" className="rounded-full px-3 py-1.5 text-xs" style={{ backgroundColor: `${tag.color}18`, color: tag.color }}>{tag.name} ×</button></form>)}</div>
            <form action={addCrmTag} className="mt-4 flex flex-wrap gap-2"><input type="hidden" name="contact_id" value={contact.id} /><input type="hidden" name="locale" value={locale} /><select name="tag_id" defaultValue="" className="rounded-lg border border-[#272727]/15 px-3 py-2 text-sm"><option value="">Elegir etiqueta</option>{allTags.filter(t => !assigned.has(t.id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select><input name="new_tag" placeholder="O crear una nueva" className="rounded-lg border border-[#272727]/15 px-3 py-2 text-sm" /><button className="rounded-full border border-[#272727]/20 px-4 py-2 text-xs">Añadir</button></form>
          </section>

          <section className="rounded-2xl border border-[#272727]/10 bg-white p-6 md:col-span-2">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">Notas privadas</h2>
            <form action={addCrmNote} className="mt-4"><input type="hidden" name="contact_id" value={contact.id} /><input type="hidden" name="locale" value={locale} /><textarea name="body" required maxLength={4000} rows={4} placeholder="Añade contexto, una conversación o el siguiente paso…" className="w-full rounded-xl border border-[#272727]/15 p-3 text-sm" /><button className="mt-2 rounded-full bg-[#c2866b] px-5 py-2 text-xs tracking-wide text-white">Añadir nota</button></form>
            <div className="mt-6 space-y-3">{notes.map(note => <article key={note.id} className="rounded-xl bg-[#272727]/[0.035] p-4"><p className="whitespace-pre-wrap text-sm leading-relaxed text-[#272727]/80">{note.body}</p><time className="mt-2 block text-[11px] text-[#272727]/40">{new Date(note.created_at).toLocaleString('es-ES')}</time></article>)}{notes.length === 0 && <p className="text-sm text-[#272727]/40">Todavía no hay notas.</p>}</div>
          </section>
        </div>
      </div>
    </main>
  )
}
