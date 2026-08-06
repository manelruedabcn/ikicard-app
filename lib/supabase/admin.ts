import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente con service_role: se salta la RLS para operaciones de administración.
// SOLO debe usarse en el servidor. La clave nunca llega al navegador.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
