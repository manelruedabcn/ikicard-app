'use client'

// Marca/desmarca una herramienta para un usuario en el CRM del admin.
// Encapsula el toggle: si ya tiene la herramienta, desmarcar revoca; si no
// la tiene, marcar concede (manual, sin caducidad — para casos con fuente o
// expiración concretas sigue estando el formulario de abajo).
import { useState, useTransition } from 'react'
import { grantTool, revokeEntitlement } from './actions'

export default function ToolTick({
  userId,
  toolId,
  entitlementId,
}: {
  userId: string
  toolId: string
  entitlementId: string | null
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const checked = entitlementId !== null

  function toggle() {
    setError(null)
    startTransition(async () => {
      try {
        if (checked) {
          const fd = new FormData()
          fd.set('entitlement_id', entitlementId!)
          await revokeEntitlement(fd)
        } else {
          const fd = new FormData()
          fd.set('user_id', userId)
          fd.set('tool_id', toolId)
          fd.set('source', 'manual')
          await grantTool(fd)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={toggle}
        className="accent-[#c2866b] disabled:opacity-50"
      />
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </span>
  )
}
