import { contentLang } from '@/lib/content-locale'

// Aviso para quien llega a /mascaras fuera de la ventana del taller
// y no tiene la herramienta desbloqueada. Sin login: no hace falta
// cuenta para leer que esto se hace en taller.
export default function TallerCerrado({ locale }: { locale: string }) {
  const en = contentLang(locale) === 'en'
  const web = 'https://www.ikigaier.com/es/taller/'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FDFBF7]">
      <div className="w-full max-w-md text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-6">
          {en ? 'The mask compass' : 'La brújula de las máscaras'}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#272727] leading-tight mb-6">
          {en ? 'This test is done in the workshop.' : 'Este test se hace en el taller.'}
        </h1>
        <p className="text-sm leading-relaxed text-[#272727]/70 mb-10">
          {en
            ? 'It only opens during IKIGAIER workshops, in the room, with others. To do it, come to the next workshop.'
            : 'Solo se abre durante los talleres IKIGAIER, en la sala, con otras personas. Para hacerlo, ven al próximo taller.'}
        </p>
        <a
          href={web}
          className="inline-block px-8 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors"
        >
          {en ? 'See the next workshop' : 'Ver el próximo taller'}
        </a>
      </div>
    </div>
  )
}
