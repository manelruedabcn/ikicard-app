// Seguimiento del Inventario honesto a los 3 días: un correo con una sola
// pregunta y tres botones, y la página que ve la persona al pulsar uno.
// Textos en la voz de Manel, sin prometer nada. Ver docs/inventario.md.

import { contentLang } from '@/lib/content-locale'

export const SEGUIMIENTO_RESPUESTAS = ['si', 'medias', 'no'] as const
export type SeguimientoRespuesta = (typeof SEGUIMIENTO_RESPUESTAS)[number]

export interface SeguimientoTexts {
  subject: string
  intro: string
  question: string
  labels: Record<SeguimientoRespuesta, string>
  note: string
  sign: string
  page: Record<SeguimientoRespuesta, string> & { invalid: string; confirm: string }
}

const ES: SeguimientoTexts = {
  subject: 'Una pregunta sobre tu inventario honesto',
  intro: 'Hace unos días hiciste el inventario honesto y te envié lo que salió.',
  question: '¿Lo que leíste tenía que ver contigo?',
  labels: { si: 'Sí, bastante', medias: 'A medias', no: 'No mucho' },
  note: 'Basta con un clic. Lo leo yo y me ayuda a afinar el test.',
  sign: 'Manel',
  page: {
    si: 'Gracias por contármelo. Si quieres llevarlo a tu semana, «Un mes conociendo tu ikigai» es gratis y parte de ese mismo test.',
    medias: 'Gracias. Una foto de un solo día no lo recoge todo, y a veces lo que encaja aparece al trabajarlo unas semanas. Si te apetece, el programa es gratis y parte de ese mismo test.',
    no: 'Gracias por decírmelo con claridad. Si quieres contarme qué no encajó, escríbeme a hola@ikigaier.com. Lo leo yo.',
    invalid: 'Este enlace ya no es válido.',
    confirm: 'Confirmar',
  },
}

const CA: SeguimientoTexts = {
  subject: 'Una pregunta sobre el teu inventari honest',
  intro: 'Fa uns dies vas fer l’inventari honest i et vaig enviar el que en va sortir.',
  question: 'El que vas llegir tenia a veure amb tu?',
  labels: { si: 'Sí, força', medias: 'A mitges', no: 'No gaire' },
  note: 'N’hi ha prou amb un clic. Ho llegeixo jo i m’ajuda a afinar el test.',
  sign: 'Manel',
  page: {
    si: 'Gràcies per explicar-m’ho. Si vols portar-ho a la teva setmana, «Un mes coneixent el teu ikigai» és gratuït i parteix d’aquest mateix test.',
    medias: 'Gràcies. Una foto d’un sol dia no ho recull tot, i de vegades el que encaixa apareix quan ho treballes unes setmanes. Si et ve de gust, el programa és gratuït i parteix d’aquest mateix test.',
    no: 'Gràcies per dir-m’ho clar. Si vols explicar-me què no va encaixar, escriu-me a hola@ikigaier.com. Ho llegeixo jo.',
    invalid: 'Aquest enllaç ja no és vàlid.',
    confirm: 'Confirmar',
  },
}

const EN: SeguimientoTexts = {
  subject: 'A question about your honest inventory',
  intro: 'A few days ago you took the honest inventory and I sent you what came out of it.',
  question: 'Did what you read have something to do with you?',
  labels: { si: 'Yes, quite a lot', medias: 'Partly', no: 'Not really' },
  note: 'One click is enough. I read every answer myself, and it helps me refine the test.',
  sign: 'Manel',
  page: {
    si: 'Thank you for telling me. If you would like to take it into your week, “A month getting to know your ikigai” is free and starts from that same test.',
    medias: 'Thank you. A snapshot of a single day cannot hold everything, and sometimes what fits shows up after a few weeks of working on it. If you feel like it, the programme is free and starts from that same test.',
    no: 'Thank you for being clear. If you would like to tell me what did not fit, write to me at hola@ikigaier.com. I read every message myself.',
    invalid: 'This link is no longer valid.',
    confirm: 'Confirm',
  },
}

export function getSeguimientoTexts(locale: string): SeguimientoTexts {
  const l = contentLang(locale)
  return l === 'en' ? EN : l === 'ca' ? CA : ES
}
