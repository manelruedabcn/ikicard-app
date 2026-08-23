'use client'

// Aviso discreto cuando un guardado en Supabase falla. Las herramientas
// guardan en segundo plano; si la red o la base fallan, sin esto el usuario
// creería que quedó guardado. Aquí se lo decimos y le damos reintentar, sin
// bloquear la pantalla ni perder lo que tiene delante.
export function SaveError({
  show,
  retrying,
  onRetry,
}: {
  show: boolean
  retrying: boolean
  onRetry: () => void
}) {
  if (!show) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-[#c2866b]/40 bg-[#FDFBF7] px-4 py-3 shadow-lg">
        <p className="flex-1 text-xs leading-snug text-[#272727]/75">
          No se ha podido guardar. Sigue aquí; puedes reintentarlo.
        </p>
        <button
          onClick={onRetry}
          disabled={retrying}
          className="shrink-0 rounded-full bg-[#c2866b] px-4 py-1.5 text-[11px] tracking-widest uppercase text-[#FDFBF7] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {retrying ? 'Reintentando…' : 'Reintentar'}
        </button>
      </div>
    </div>
  )
}
