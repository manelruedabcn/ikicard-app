import { createHmac } from 'crypto'

const APP_URL = 'https://app.ikigaier.com'

// Firma un uid con CRON_SECRET para enlaces de baja sin sesión.
export function unsubToken(uid: string): string {
  return createHmac('sha256', process.env.CRON_SECRET || '').update(uid).digest('hex').slice(0, 32)
}

export function unsubUrl(uid: string, locale: string): string {
  const l = locale === 'en' ? 'en' : 'es'
  return `${APP_URL}/api/notify/unsubscribe?uid=${uid}&t=${unsubToken(uid)}&l=${l}`
}
