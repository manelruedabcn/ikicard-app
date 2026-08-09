type EventParams = Record<string, string | number | boolean | undefined>

/**
 * Envía un evento de conversión a Google Analytics (GA4) de forma segura.
 * Fire-and-forget: nunca bloquea la UI ni rompe el flujo de la app.
 */
export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
