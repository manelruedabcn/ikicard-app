import { createHmac } from 'crypto'
import { safeSecretEqual } from './secrets'

const APP_URL = 'https://app.ikigaier.com'

// Clave para firmar enlaces de baja. Preferimos una clave propia (UNSUB_SECRET)
// para no reutilizar la de los cron: así una fuga de una no compromete la otra.
// Si no está definida, cae a CRON_SECRET para no romper los enlaces ya enviados
// hasta que se configure la propia.
function unsubKey(): string {
  return process.env.UNSUB_SECRET || process.env.CRON_SECRET || ''
}

// Firma un uid para enlaces de baja sin sesión.
export function unsubToken(uid: string): string {
  return createHmac('sha256', unsubKey()).update(uid).digest('hex').slice(0, 32)
}

// Valida un token de baja en tiempo constante.
export function verifyUnsubToken(uid: string, token: string | null | undefined): boolean {
  return safeSecretEqual(token, unsubToken(uid))
}

export function unsubUrl(uid: string, locale: string): string {
  const l = locale === 'en' ? 'en' : 'es'
  return `${APP_URL}/api/notify/unsubscribe?uid=${uid}&t=${unsubToken(uid)}&l=${l}`
}
