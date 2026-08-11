import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'IKIGAIER <hola@ikigaier.com>'
const APP_URL = 'https://app.ikigaier.com'

type Lang = 'es' | 'en'

function shell(inner: string): string {
  return `
  <div style="background:#FDFBF7;padding:32px 0;font-family:Georgia,'Times New Roman',serif;color:#272727;">
    <div style="max-width:520px;margin:0 auto;padding:0 24px;">
      <p style="letter-spacing:0.3em;font-size:13px;color:#272727;text-align:center;margin:0 0 28px;">IKIGAIER</p>
      ${inner}
      <hr style="border:none;border-top:1px solid rgba(39,39,39,0.12);margin:32px 0 16px;" />
      <p style="font-size:11px;color:rgba(39,39,39,0.4);text-align:center;line-height:1.6;margin:0;">
        app.ikigaier.com
      </p>
    </div>
  </div>`
}

function button(href: string, label: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:#272727;color:#FDFBF7;text-decoration:none;font-size:12px;letter-spacing:0.2em;padding:16px 32px;">${label}</a>
  </div>`
}

// ── Enrollment (al comenzar el Viaje) ────────────────────────
const enrollmentCopy: Record<Lang, { subject: string; html: (unsubUrl: string) => string }> = {
  es: {
    subject: 'Has comenzado tu Viaje de 20 días',
    html: unsubUrl => shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">Has comenzado tu Viaje</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        Durante los próximos 20 días caminas contigo. Cada día recibes tres cartas —mañana, mediodía y noche— y de cada una te llevas una palabra.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        No hay atajos. Si un día no apareces, ese día se pierde: forma parte del viaje. Ve a tu ritmo, pero ve cada día.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        Atraviesas cuatro fases: <em>Despertar, Descender, Atravesar y Retornar</em>. Al final tendrás el mapa completo de tu viaje.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        Te enviaré un recordatorio suave cada mañana para que no pierdas el día.
      </p>
      ${button(APP_URL, 'ABRIR MI VIAJE')}
      <p style="font-size:11px;color:rgba(39,39,39,0.4);text-align:center;margin-top:24px;">
        Si no quieres recibir recordatorios, <a href="${unsubUrl}" style="color:rgba(39,39,39,0.5);">desactívalos aquí</a>.
      </p>
    `),
  },
  en: {
    subject: 'You have begun your 20-day Journey',
    html: unsubUrl => shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">You have begun your Journey</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        For the next 20 days you walk with yourself. Each day you receive three cards —morning, midday and night— and from each one you keep a word.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        No shortcuts. If you don't show up one day, that day is lost: it's part of the journey. Go at your pace, but go every day.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        You move through four phases: <em>Awaken, Descend, Cross and Return</em>. At the end you'll have the full map of your journey.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        I'll send you a gentle reminder each morning so you don't lose the day.
      </p>
      ${button(APP_URL, 'OPEN MY JOURNEY')}
      <p style="font-size:11px;color:rgba(39,39,39,0.4);text-align:center;margin-top:24px;">
        If you'd rather not get reminders, <a href="${unsubUrl}" style="color:rgba(39,39,39,0.5);">turn them off here</a>.
      </p>
    `),
  },
}

// ── Recordatorio diario ──────────────────────────────────────
const reminderCopy: Record<Lang, { subject: (day: number) => string; html: (day: number, unsubUrl: string) => string }> = {
  es: {
    subject: day => `Tu Viaje · Día ${day} de 20`,
    html: (day, unsubUrl) => shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">Día ${day} de 20</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);text-align:center;">
        Hoy te esperan tres cartas. Tómate un momento, léelas con calma y quédate con una palabra de cada una.
      </p>
      ${button(APP_URL, 'ENTRAR AL VIAJE')}
      <p style="font-size:11px;color:rgba(39,39,39,0.4);text-align:center;margin-top:24px;">
        <a href="${unsubUrl}" style="color:rgba(39,39,39,0.5);">Desactivar recordatorios</a>
      </p>
    `),
  },
  en: {
    subject: day => `Your Journey · Day ${day} of 20`,
    html: (day, unsubUrl) => shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">Day ${day} of 20</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);text-align:center;">
        Three cards await you today. Take a moment, read them calmly and keep one word from each.
      </p>
      ${button(APP_URL, 'ENTER THE JOURNEY')}
      <p style="font-size:11px;color:rgba(39,39,39,0.4);text-align:center;margin-top:24px;">
        <a href="${unsubUrl}" style="color:rgba(39,39,39,0.5);">Turn off reminders</a>
      </p>
    `),
  },
}

function lang(l?: string): Lang {
  return l === 'en' ? 'en' : 'es'
}

export async function sendEnrollmentEmail(to: string, locale: string, unsubUrl: string) {
  const c = enrollmentCopy[lang(locale)]
  return resend.emails.send({ from: FROM, to, subject: c.subject, html: c.html(unsubUrl) })
}

export async function sendReminderEmail(to: string, locale: string, day: number, unsubUrl: string) {
  const c = reminderCopy[lang(locale)]
  return resend.emails.send({ from: FROM, to, subject: c.subject(day), html: c.html(day, unsubUrl) })
}
