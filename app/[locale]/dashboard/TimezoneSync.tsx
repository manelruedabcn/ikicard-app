'use client'

// Captura la zona horaria del dispositivo (IANA, sin permisos) y la guarda en
// el perfil para poder enviar los recordatorios del Viaje a la hora local de
// cada persona. Solo escribe si cambió, y recuerda el último valor enviado en
// el navegador para no repetir el upsert en cada carga. Módulo aislado.

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const LS_KEY = 'ikigaier_tz_synced_v1'

export default function TimezoneSync({ userId }: { userId: string }) {
  useEffect(() => {
    let tz = 'Europe/Madrid'
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz
    } catch {}

    if (localStorage.getItem(LS_KEY) === tz) return

    const supabase = createClient()
    supabase
      .from('profiles')
      .update({ timezone: tz })
      .eq('id', userId)
      .then(({ error }) => {
        if (!error) localStorage.setItem(LS_KEY, tz)
      })
  }, [userId])

  return null
}
