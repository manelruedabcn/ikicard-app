import 'server-only'

// Aviso a Telegram (el canal privado de Manel). Nunca lanza: si Telegram no
// está configurado, tarda o falla, se registra en el log y el flujo sigue.
// Un aviso perdido no debe romper el alta de nadie.
export async function sendTelegram(text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    console.warn('[telegram] no configurado: aviso no enviado')
    return false
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      // Tope de espera: la persona no debe notar el aviso al enviar su formulario.
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[telegram] error:', res.status, detail)
      return false
    }
    return true
  } catch (err) {
    console.error('[telegram] error:', err)
    return false
  }
}
