import { Resend } from 'resend'
import { getPatron } from '@/lib/paso-content'

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

// ── Bienvenida del lead (al capturar email en el test PASO) ──
// Promesa abierta: recibir las herramientas de IKIGAIER a medida que se
// abren. Sin fechas ni cadencia. Refuerza el intercambio y calienta el
// dominio en Resend.
const leadWelcomeCopy: Record<Lang, { subject: string; html: (unsubUrl: string) => string }> = {
  es: {
    subject: 'Bienvenido a IKIGAIER',
    html: unsubUrl => shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">Gracias por dejar tu rastro</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        Acabas de ver la primera forma de cómo caminas. Es solo un esbozo.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        IKIGAIER es un universo de herramientas para conocerte mejor, y las voy abriendo poco a poco. Te avisaré cuando llegue la siguiente —sin ruido, sin prisa.
      </p>
      ${button(APP_URL, 'VOLVER A IKIGAIER')}
      <p style="font-size:11px;color:rgba(39,39,39,0.4);text-align:center;margin-top:24px;">
        Si prefieres no recibir nada, <a href="${unsubUrl}" style="color:rgba(39,39,39,0.5);">date de baja aquí</a>.
      </p>
    `),
  },
  en: {
    subject: 'Welcome to IKIGAIER',
    html: unsubUrl => shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">Thank you for leaving your trace</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        You've just seen the first shape of how you walk. It's only a sketch.
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);">
        IKIGAIER is a universe of tools to know yourself better, and I open them little by little. I'll let you know when the next one arrives —no noise, no rush.
      </p>
      ${button(APP_URL, 'BACK TO IKIGAIER')}
      <p style="font-size:11px;color:rgba(39,39,39,0.4);text-align:center;margin-top:24px;">
        If you'd rather not hear from me, <a href="${unsubUrl}" style="color:rgba(39,39,39,0.5);">unsubscribe here</a>.
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

export async function sendLeadWelcomeEmail(to: string, locale: string, unsubUrl: string) {
  const c = leadWelcomeCopy[lang(locale)]
  return resend.emails.send({ from: FROM, to, subject: c.subject, html: c.html(unsubUrl) })
}

// ── Resultado del test (transaccional) ───────────────────────
// Lo pidió la persona al terminar el test. Lleva un enlace permanente a su
// forma de caminar (uno de los 15 Caminantes). No es el informe personal fino
// (eso depende de las respuestas y vive en el resultado/dashboard): es su
// forma, para volver a ella y compartirla.
export async function sendResultEmail(to: string, locale: string, codigo: string) {
  const l = lang(locale)
  const patron = getPatron(codigo)
  const nombre = patron?.nombre ?? ''
  const url = `${APP_URL}/${l}/paso/forma/${encodeURIComponent(codigo)}`

  const c = l === 'en'
    ? {
        subject: `Your way of walking: ${nombre}`,
        heading: 'Your result',
        intro: 'You just discovered your way of walking:',
        cta: 'SEE MY SHAPE',
        note: 'The link is permanent —come back to it whenever you like.',
      }
    : {
        subject: `Tu forma de caminar: ${nombre}`,
        heading: 'Tu resultado',
        intro: 'Acabas de descubrir tu forma de caminar:',
        cta: 'VER MI FORMA',
        note: 'El enlace es permanente —vuelve a él cuando quieras.',
      }

  return resend.emails.send({
    from: FROM,
    to,
    subject: c.subject,
    html: shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">${c.heading}</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);text-align:center;">${c.intro}</p>
      <p style="font-family:Georgia,serif;font-size:28px;text-align:center;color:#272727;margin:12px 0 4px;">${nombre}</p>
      ${button(url, c.cta)}
      <p style="font-size:12px;color:rgba(39,39,39,0.5);text-align:center;margin-top:8px;">${c.note}</p>
    `),
  })
}
