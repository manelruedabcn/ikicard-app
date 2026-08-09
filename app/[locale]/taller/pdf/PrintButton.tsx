'use client'

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-[#272727] px-6 py-2 text-xs tracking-widest uppercase text-[#FDFBF7] hover:bg-[#c2866b] transition-colors print:hidden"
    >
      {label}
    </button>
  )
}
