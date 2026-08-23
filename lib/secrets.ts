import 'server-only'
import { timingSafeEqual } from 'crypto'

// Comparación de secretos en tiempo constante: evita filtrar por tiempo de
// respuesta cuántos caracteres coinciden. Devuelve false si algún lado falta
// o si difieren en longitud (sin cortocircuito observable).
export function safeSecretEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

// Verifica el secreto de los cron (cabecera x-cron-secret) contra CRON_SECRET.
export function verifyCronSecret(headerValue: string | null | undefined): boolean {
  return safeSecretEqual(headerValue, process.env.CRON_SECRET)
}
