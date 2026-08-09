'use client'

// Recoge el resultado de PASO que alguien hizo SIN sesión (guardado en el
// navegador por PasoClient) y lo inserta en cuanto entra ya registrado.
// Si el insert falla, deja el dato en el navegador para reintentar la próxima
// vez; si va bien, lo limpia. Módulo aislado: solo corre en el dashboard.

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PASO_PENDING_KEY } from '@/lib/paso-segments'

export default function PasoResultSync({ userId }: { userId: string }) {
  useEffect(() => {
    const raw = localStorage.getItem(PASO_PENDING_KEY)
    if (!raw) return

    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(raw)
    } catch {
      localStorage.removeItem(PASO_PENDING_KEY)
      return
    }

    const supabase = createClient()
    supabase
      .from('paso_results')
      .insert({ user_id: userId, ...payload })
      .then(({ error }) => {
        if (!error) localStorage.removeItem(PASO_PENDING_KEY)
      })
  }, [userId])

  return null
}
