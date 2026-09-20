import { Resend } from 'resend'
import { DIMS, getPasoPatterns, getLocalizedPatron, type Dim, type InformePaso } from '@/lib/paso-content'
import { calcularSegmentos, firmaTexto } from '@/lib/paso-segments'
import { generarNarrativa } from '@/lib/paso-narrativa'
import { generarTitulares } from '@/lib/paso-titulares'
import { getRareza } from '@/lib/paso-rareza'

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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[char] || char)
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
// Lo pidió la persona al terminar el test. El correo reproduce la lectura
// personal calculada con sus valores; el enlace sirve para volver a la ficha
// estable de su Caminante, pero ya no sustituye al informe completo.
export async function sendResultEmail(to: string, locale: string, codigo: string, inf: InformePaso) {
  const l = lang(locale)
  const patron = getLocalizedPatron(codigo, l)
  const nombre = patron?.nombre ?? ''
  const url = `${APP_URL}/${l}/paso/forma/${encodeURIComponent(codigo)}`
  const segmentos = calcularSegmentos(inf.scores)
  const firma = firmaTexto(segmentos)
  const dominante = DIMS.reduce((a, b) => (segmentos[a] >= segmentos[b] ? a : b))
  const titulares = generarTitulares(inf, dominante, l)
  const narrativa = generarNarrativa(inf, l)
  const rareza = getRareza(codigo)

  const eje: Record<Lang, Record<Dim, string>> = {
    es: { P: 'Pisar firme', A: 'Acompañar', S: 'Sostener', O: 'Observar' },
    en: { P: 'Press on', A: 'Accompany', S: 'Sustain', O: 'Observe' },
  }
  const rarezaTexto: Record<Lang, Record<typeof rareza, string>> = {
    es: { frecuente: 'Una forma frecuente de caminar', habitual: 'Una forma habitual de caminar', poco: 'Una forma poco frecuente de caminar' },
    en: { frecuente: 'A frequent way of walking', habitual: 'A usual way of walking', poco: 'A less frequent way of walking' },
  }
  const labels = l === 'es'
    ? { reading: 'Tu lectura personal', gap: 'La distancia entre tu máscara y tu naturaleza', gapIntro: 'Cada fila compara cómo te muestras para adaptarte con cómo eres cuando no necesitas representar ningún papel. Los puntos miden separación, no capacidad: cuantos más puntos, mayor es el esfuerzo de adaptación.', gapRepeat: 'Una distancia pequeña habla de coherencia entre dentro y fuera. Una distancia grande señala una forma que tu máscara amplifica o contiene.', shown: 'Cómo te muestras', inside: 'Cómo caminas por dentro', motivation: 'Lo que te mueve', pressure: 'Bajo presión', fear: 'Lo que temes', effective: 'Serías más eficaz si…', book: 'Un libro para seguir caminando', cta: 'VOLVER A MI FORMA', note: 'Este correo contiene la lectura calculada con tus respuestas.' }
    : { reading: 'Your personal reading', gap: 'The distance between your mask and your nature', gapIntro: 'Each row compares how you show up in order to adapt with who you are when you do not need to play a role. Points measure separation, not ability: the more points, the greater the effort of adaptation.', gapRepeat: 'A small distance suggests coherence between inside and outside. A large distance points to a way your mask amplifies or holds back.', shown: 'How you show up', inside: 'How you walk inside', motivation: 'What moves you', pressure: 'Under pressure', fear: 'What you fear', effective: 'You would be more effective if…', book: 'A book to keep walking', cta: 'RETURN TO MY SHAPE', note: 'This email contains the reading calculated from your answers.' }

  const graphRows = DIMS.map(d => {
    const maskWidth = Math.max(4, Math.min(100, ((inf.mascara[d] + 28) / 56) * 100))
    const naturalWidth = Math.max(4, Math.min(100, ((inf.natural[d] + 28) / 56) * 100))
    return `<tr>
      <td style="padding:10px 8px 10px 0;width:105px;font-size:13px;color:#272727;">${eje[l][d]}</td>
      <td style="padding:7px 0;">
        <div style="font-size:10px;color:#8b8179;margin-bottom:3px;">${labels.shown}: ${inf.mascara[d]}</div>
        <div style="height:7px;background:#eee9e3;"><div style="height:7px;width:${maskWidth}%;background:#c2866b;"></div></div>
        <div style="font-size:10px;color:#8b8179;margin:5px 0 3px;">${labels.inside}: ${inf.natural[d]}</div>
        <div style="height:7px;background:#eee9e3;"><div style="height:7px;width:${naturalWidth}%;background:#7a8b6f;"></div></div>
      </td>
    </tr>`
  }).join('')

  const signatureRows = DIMS.map(d => {
    const zone = segmentos[d]
    const width = Math.max(8, (zone / 7) * 100)
    const active = d === dominante
    return `<tr>
      <td style="padding:10px 10px 10px 0;width:105px;font-size:13px;color:#272727;">${eje[l][d]}</td>
      <td style="padding:10px 0;">
        <div style="height:14px;background:#e8e2dc;border-radius:7px;overflow:hidden;"><div style="height:14px;width:${width}%;background:${active ? '#c2866b' : '#7a8b6f'};border-radius:7px;"></div></div>
      </td>
      <td style="padding:10px 0 10px 12px;width:52px;font-size:13px;font-weight:bold;color:#5c554f;text-align:right;">${zone}/7</td>
    </tr>`
  }).join('')

  const gapRows = inf.brechas.map((b, index) => {
    const abs = Math.abs(b.valor)
    const traits: Record<Lang, Record<Dim, string>> = {
      es: { P: 'la decisión y el impulso para avanzar', A: 'la conexión y la cercanía con los demás', S: 'la calma y la constancia', O: 'la observación y el análisis' },
      en: { P: 'decision and the drive to move forward', A: 'connection and closeness with others', S: 'calm and steadiness', O: 'observation and analysis' },
    }
    const degree = l === 'es'
      ? (abs >= 7 ? 'mucho más' : abs >= 3 ? 'algo más' : 'ligeramente más')
      : (abs >= 7 ? 'much more' : abs >= 3 ? 'somewhat more' : 'slightly more')
    const trait = traits[l][b.dimension]
    const direction = l === 'es'
      ? (b.direccion === 'exige_de_mas'
          ? `Tu máscara amplifica ${trait}: por fuera expresa ${degree} de lo que te nace naturalmente.`
          : b.direccion === 'esconde'
            ? `Tu máscara contiene ${trait}: por dentro hay ${degree} de lo que dejas ver.`
            : `Tu máscara y tu naturaleza muestran un nivel muy parecido de ${trait}.`)
      : (b.direccion === 'exige_de_mas'
          ? `Your mask amplifies ${trait}: outwardly it appears ${degree} than comes naturally to you.`
          : b.direccion === 'esconde'
            ? `Your nature carries ${degree} ${trait} than your mask allows others to see.`
            : `Your mask and your nature show a very similar level of ${trait}.`)
    return `<li style="margin:0 0 9px;"><strong>${index + 1}. ${eje[l][b.dimension]}</strong>: ${escapeHtml(direction)}${b.valor ? ` (${abs} ${l === 'es' ? 'puntos de separación' : 'points of separation'})` : ''}</li>`
  }).join('')

  const patternFields = patron ? [
    [labels.motivation, patron.motivacion],
    [labels.pressure, patron.bajo_presion],
    [labels.fear, patron.teme],
    [labels.effective, patron.seria_mas_eficaz_si],
  ].map(([label, text]) => `<div style="margin:0 0 18px;"><p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#c2866b;margin:0 0 5px;">${escapeHtml(label)}</p><p style="font-size:14px;line-height:1.65;margin:0;color:#403b37;">${escapeHtml(text)}</p></div>`).join('') : ''
  const pasoMeaning = l === 'es'
    ? [
        ['Pisar firme', 'La energía para decidir, tomar posición y avanzar. En equilibrio aporta determinación y valentía; cuando domina puede convertirse en presión, impaciencia o necesidad de control.'],
        ['Acompañar', 'La energía para conectar, expresarte y crear pertenencia. En equilibrio aporta cercanía, entusiasmo y capacidad de unir; cuando domina puedes buscar aprobación o adaptarte demasiado.'],
        ['Sostener', 'La energía para conservar la calma, cuidar el ritmo y mantener los compromisos. En equilibrio aporta estabilidad, paciencia y confianza; cuando domina puede costarte cambiar, poner límites o afrontar un conflicto.'],
        ['Observar', 'La energía para leer el terreno, comprender los matices y buscar claridad. En equilibrio aporta criterio, precisión y profundidad; cuando domina puedes sobreanalizar, dudar o esperar demasiado antes de actuar.'],
      ]
    : [
        ['Press on', 'The energy to decide, take a stand and move forward. In balance it brings determination and courage; when it dominates it can become pressure, impatience or a need for control.'],
        ['Accompany', 'The energy to connect, express yourself and create belonging. In balance it brings warmth, enthusiasm and unity; when it dominates you may seek approval or adapt too much.'],
        ['Sustain', 'The energy to remain calm, protect your pace and keep commitments. In balance it brings stability, patience and trust; when it dominates change, boundaries or conflict may become difficult.'],
        ['Observe', 'The energy to read the terrain, understand nuance and seek clarity. In balance it brings judgement, precision and depth; when it dominates you may overanalyse, doubt or wait too long before acting.'],
      ]
  const mapHtml = getPasoPatterns(l).map(p => `<li style="margin:0 0 5px;${p.codigo === codigo ? 'font-weight:bold;color:#272727;' : 'color:#77706a;'}">${p.codigo === codigo ? '● ' : ''}${escapeHtml(p.nombre)}</li>`).join('')

  const c = l === 'en'
    ? {
        subject: `Your way of walking: ${nombre}`,
        heading: 'Your complete result',
        intro: 'This is the personal reading drawn by your answers:',
      }
    : {
        subject: `Tu forma de caminar: ${nombre}`,
        heading: 'Tu resultado completo',
        intro: 'Esta es la lectura personal que dibujan tus respuestas:',
      }

  const delivery = await resend.emails.send({
    from: FROM,
    to,
    subject: c.subject,
    html: shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">${c.heading}</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(39,39,39,0.8);text-align:center;">${c.intro}</p>
      <p style="font-family:Georgia,serif;font-size:30px;text-align:center;color:#272727;margin:12px 0 4px;">${escapeHtml(nombre)}</p>
      <p style="font-size:12px;text-align:center;color:#8b8179;margin:5px 0;">${escapeHtml(rarezaTexto[l][rareza])}</p>
      <p style="font-size:11px;letter-spacing:.22em;text-align:center;color:#a59b92;margin:8px 0 26px;">${escapeHtml(firma)}</p>
      ${titulares.map((text, i) => `<p style="${i === 0 ? 'font-family:Georgia,serif;font-size:24px;color:#272727;' : 'font-size:14px;color:#766e68;'}line-height:1.5;text-align:center;margin:${i === 0 ? '0 0 10px' : '3px 0'};">${escapeHtml(text)}</p>`).join('')}
      ${patron?.retrato ? `<p style="font-size:15px;line-height:1.7;color:#5c554f;text-align:center;margin:28px 0;">${escapeHtml(patron.retrato)}</p>` : ''}
      <div style="background:#faf7f2;padding:18px 20px;margin:24px 0;"><p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8b8179;margin:0 0 12px;">${l === 'es' ? 'Qué mide PASO' : 'What PASO measures'}</p>${pasoMeaning.map(([name, text]) => `<p style="font-size:13px;line-height:1.55;margin:0 0 10px;color:#5c554f;"><strong>${escapeHtml(name)}</strong><br>${escapeHtml(text)}</p>`).join('')}</div>
      <div style="background:#f5f1eb;padding:18px 20px;margin:24px 0;">
        <p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8b8179;margin:0 0 8px;">${l === 'es' ? 'Tu firma PASO' : 'Your PASO signature'}</p>
        <p style="font-size:13px;line-height:1.55;color:#5c554f;margin:0 0 12px;">${l === 'es' ? 'Esta combinación origina el nombre de tu Caminante. Cada barra sitúa una dimensión entre la zona 1 (presencia muy baja) y la zona 7 (presencia muy alta).' : 'This combination gives your Walker its name. Each bar places one dimension between zone 1 (very low presence) and zone 7 (very high presence).'}</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;">${signatureRows}</table>
      </div>
      ${patternFields}
      <p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#c2866b;margin:30px 0 8px;">${labels.reading}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#faf7f2;padding:12px;">${graphRows}</table>
      <div style="margin:28px 0;">
        <p style="font-size:14px;line-height:1.7;color:#5c554f;">${escapeHtml(narrativa.intro)}</p>
        ${narrativa.lineas.map(line => `<p style="font-size:15px;line-height:1.7;border-left:2px solid #c2866b;padding-left:14px;color:#403b37;">${escapeHtml(line)}</p>`).join('')}
        ${narrativa.sintesis ? `<p style="font-size:14px;line-height:1.7;color:#272727;">${escapeHtml(narrativa.sintesis)}</p>` : ''}
        ${narrativa.invitacion ? `<p style="font-family:Georgia,serif;font-size:20px;color:#c2866b;">${escapeHtml(narrativa.invitacion)}</p>` : ''}
      </div>
      <div style="background:#f5f1eb;padding:18px 20px;margin:24px 0;"><p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8b8179;margin:0 0 8px;">${labels.gap}</p><p style="font-size:13px;line-height:1.55;color:#5c554f;margin:0 0 14px;">${escapeHtml(labels.gapIntro)}</p><ol style="font-size:13px;line-height:1.55;color:#5c554f;margin:0;padding-left:18px;list-style:none;">${gapRows}</ol><p style="font-size:12px;line-height:1.5;color:#8b8179;border-top:1px solid #ded8d1;margin:14px 0 0;padding-top:12px;">${escapeHtml(labels.gapRepeat)}</p></div>
      <div style="background:#f5f1eb;padding:18px 20px;margin:24px 0;"><p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8b8179;margin:0 0 12px;">${l === 'es' ? 'Las 15 formas de caminar' : 'The 15 ways of walking'}</p><ul style="font-size:13px;line-height:1.45;margin:0;padding-left:18px;">${mapHtml}</ul></div>
      ${patron?.libro_recomendado ? `<div style="border:1px solid #e1c7ba;background:#fbf4f0;padding:18px;text-align:center;margin:28px 0;"><p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#c2866b;margin:0 0 8px;">${labels.book}</p><p style="font-family:Georgia,serif;font-size:21px;margin:0;">${escapeHtml(patron.libro_recomendado)}</p></div>` : ''}
      ${button(url, labels.cta)}
      <p style="font-size:12px;color:rgba(39,39,39,0.5);text-align:center;margin-top:8px;">${labels.note}</p>
    `),
  })
  if (delivery.error) throw new Error(delivery.error.message)
  return delivery
}

// ── Aviso interno · nueva inscripción a taller ───────────────
export async function sendWorkshopAdminEmail(input: {
  nombre: string
  contacto: string
  tipoContacto: string
  createdAt: string
}) {
  const notifyTo = process.env.WORKSHOP_NOTIFY_EMAIL || 'manelrueda@gmail.com'
  const safe = (s: string) => s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[c] || c)

  return resend.emails.send({
    from: FROM,
    to: notifyTo,
    subject: `Nueva inscripción al taller · ${input.nombre}`,
    html: shell(`
      <h1 style="font-size:26px;font-weight:normal;text-align:center;margin:0 0 20px;">Nueva inscripción</h1>
      <p style="font-size:15px;line-height:1.8;color:rgba(39,39,39,0.8);">
        <strong>Nombre:</strong> ${safe(input.nombre)}<br>
        <strong>Contacto:</strong> ${safe(input.contacto)}<br>
        <strong>Tipo:</strong> ${safe(input.tipoContacto)}<br>
        <strong>Taller:</strong> 29 de septiembre · 19:00 h · Vilanova i la Geltrú<br>
        <strong>Registro:</strong> ${safe(new Date(input.createdAt).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }))}
      </p>
      ${button(`${APP_URL}/es/admin`, 'VER INSCRIPCIONES')}
    `),
  })
}
