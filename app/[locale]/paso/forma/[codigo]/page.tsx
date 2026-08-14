import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { PASO_PATRONES, getPatron } from '@/lib/paso-content'
import { getRareza } from '@/lib/paso-rareza'

export const dynamic = 'force-dynamic'

// Página pública de una FORMA de caminar (uno de los 15 Caminantes), servida
// por su código. NO reproduce el informe personal (eso depende de las
// respuestas y solo vive en el resultado del test / dashboard): muestra el
// retrato del Caminante, que sí se deriva del código. Es el enlace compartible
// del lead magnet — sin estado, permanente — y empuja a hacer el propio test.

// Enlaces de compra por libro (espejo del que usa PasoClient). Los libros sin
// entrada (p. ej. Equilibrio) no muestran enlace.
const LIBRO_LINKS: Record<string, string> = {
  'El Ikigai que no te contaron': 'https://amzn.eu/d/087ECE8M',
  'No todo lo que te frena es tuyo': 'https://amzn.eu/d/0gyFdxbV',
  'Disciplina para indisciplinados': 'https://amzn.eu/d/03GIlPhr',
  'Camina sin separarte de ti': 'https://amzn.eu/d/01keLRwF',
}

export default async function FormaPage({
  params: { locale, codigo },
}: {
  params: { locale: string; codigo: string }
}) {
  const code = decodeURIComponent(codigo).toUpperCase()
  const patron = getPatron(code)
  if (!patron) notFound()

  const t = await getTranslations('paso')
  const tn = await getTranslations('nav')
  const rareza = getRareza(code)

  const orden = { frecuente: 0, habitual: 1, poco: 2 } as const
  const mapa = [...PASO_PATRONES].sort(
    (a, b) => orden[getRareza(a.codigo)] - orden[getRareza(b.codigo)],
  )

  const libroLink = LIBRO_LINKS[patron.libro_recomendado]

  const campos: [string, string][] = [
    [t('motivacion'), patron.motivacion],
    [t('bajo_presion'), patron.bajo_presion],
    [t('teme'), patron.teme],
    [t('eficaz'), patron.seria_mas_eficaz_si],
  ]

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <Link
          href={`/${locale}`}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          ← {tn('title')}
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Cabecera: el Caminante */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c2866b] mb-2">{t('your_pattern')}</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727]">
            {patron.nombre}
          </h1>
          <p className="text-sm text-[#272727]/55 mt-2">{t('rareza_' + rareza)}</p>
        </div>

        {/* Retrato */}
        {patron.retrato && (
          <p className="text-[15px] leading-relaxed text-[#272727]/80 text-center mt-8 mb-10 px-1">
            {patron.retrato}
          </p>
        )}

        {/* Lectura del patrón */}
        <div className="flex flex-col gap-6">
          {campos.map(([label, text]) => (
            <div key={label}>
              <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1">{label}</p>
              <p className="text-sm leading-relaxed text-[#272727]/80">{text}</p>
            </div>
          ))}
        </div>

        {/* Mapa de las 15 formas, resaltando esta */}
        <div className="mt-10 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
          <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-2">{t('mapa_title')}</p>
          <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('mapa_intro')}</p>
          <ul className="flex flex-col gap-1.5">
            {mapa.map(p => {
              const activo = p.codigo === code
              return (
                <li
                  key={p.codigo}
                  className={`flex items-baseline justify-between text-sm ${
                    activo ? 'text-[#272727] font-medium' : 'text-[#272727]/55'
                  }`}
                >
                  <span>
                    {activo && <span className="text-[#c2866b] mr-1.5">●</span>}
                    {p.nombre}
                  </span>
                  <span className="text-xs text-[#272727]/35 ml-3 shrink-0">
                    {t('rareza_short_' + getRareza(p.codigo))}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Libro */}
        <div className="mt-6 rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-5 text-center">
          <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">{t('book')}</p>
          {libroLink ? (
            <a href={libroLink} target="_blank" rel="noopener noreferrer" className="group inline-block">
              <span className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] underline decoration-[#c2866b]/40 underline-offset-4 group-hover:decoration-[#c2866b]">
                {patron.libro_recomendado}
              </span>
              <span className="block text-xs tracking-widest uppercase text-[#c2866b] mt-2">{t('book_cta')}</span>
            </a>
          ) : (
            <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">
              {patron.libro_recomendado}
            </p>
          )}
        </div>

        {/* CTA: haz tu propio test (motor de tráfico) */}
        <div className="mt-8 rounded-xl bg-[#272727]/[0.03] px-5 py-6 text-center">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] mb-2">
            {t('intro_title')}
          </p>
          <p className="text-sm leading-relaxed text-[#272727]/70 mb-5 px-1">{t('intro_desc')}</p>
          <Link
            href={`/${locale}/paso`}
            className="inline-block px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors"
          >
            {t('intro_start')}
          </Link>
        </div>

        {/* Encuadre: PASO es un espejo, no un diagnóstico */}
        <p className="mt-10 text-center text-xs leading-relaxed text-[#272727]/40 px-2">
          {t('nota_espejo')}
        </p>
      </div>
    </div>
  )
}
