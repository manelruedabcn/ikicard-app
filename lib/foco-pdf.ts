// Generación del PDF del resultado del test FOCO, en el propio navegador.
//
// Misma base que Heridas / Máscaras (html2canvas + jsPDF, compartir en móvil
// o descarga), pero en lugar de una sola captura cortada en páginas, captura
// cada bloque del informe por separado (`.foco-pdf-block`) y los coloca en
// A4 con márgenes. Si un bloque no cabe en lo que queda de página, pasa
// entero a la siguiente: así ninguna tarjeta se parte por la mitad.
//
// Las librerías se importan de forma diferida (solo en el clic) para no cargar
// nada en el render inicial ni romper el SSR.

const MARGIN = 16 // mm
const GAP = 6 // mm entre bloques

// En el clon: fuera la ikionda (html2canvas la desplaza sobre el título) y
// todo lo interactivo; dentro el pie de marca, que en pantalla está oculto.
function prepararClon(doc: Document) {
  doc.querySelectorAll<HTMLElement>('.foco-onda, .foco-no-export').forEach(el => {
    el.style.display = 'none'
  })
  doc.querySelectorAll<HTMLElement>('.foco-print-only').forEach(el => {
    el.style.display = 'block'
  })
}

export async function generarFocoPdf(
  root: HTMLElement,
  fileName = 'Test-FOCO.pdf',
  mode: 'download' | 'share' = 'download',
  locale = 'es'
) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // El pie solo existe para el PDF: se enseña un momento para poder capturarlo.
  const ocultos = Array.from(root.querySelectorAll<HTMLElement>('.foco-print-only'))
  ocultos.forEach(el => { el.style.display = 'block' })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const usableW = pageW - MARGIN * 2
  const fondo = () => {
    pdf.setFillColor(253, 251, 247) // #FDFBF7, el crema de la app
    pdf.rect(0, 0, pageW, pageH, 'F')
  }

  try {
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('.foco-pdf-block'))
    // Todos los bloques a la misma escala: la del más ancho, ajustado al A4.
    const maxPx = Math.max(...blocks.map(b => b.offsetWidth), 1)
    const mmPerPx = usableW / maxPx

    fondo()
    let y = MARGIN
    for (const block of blocks) {
      const canvas = await html2canvas(block, {
        scale: 2,
        backgroundColor: '#FDFBF7',
        useCORS: true,
        onclone: (clonedDoc: Document) => prepararClon(clonedDoc),
      })
      const w = block.offsetWidth * mmPerPx
      const h = (canvas.height / canvas.width) * w
      if (y + h > pageH - MARGIN && y > MARGIN) {
        pdf.addPage()
        fondo()
        y = MARGIN
      }
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN, y, w, Math.min(h, pageH - MARGIN * 2))
      y += h + GAP
    }
  } finally {
    ocultos.forEach(el => { el.style.display = '' })
  }

  const blob = pdf.output('blob')
  const file = new File([blob], fileName, { type: 'application/pdf' })

  // Móvil: menú nativo de compartir (guardar en Archivos, enviar, etc.).
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  if (mode === 'share' && nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({
        title: locale === 'en' ? 'My FOCO result · IKIGAIER' : locale === 'ca' ? 'El meu resultat FOCO · IKIGAIER' : 'Mi resultado FOCO · IKIGAIER',
        text: locale === 'en' ? 'This is my FOCO test result.' : locale === 'ca' ? 'Aquest és el meu resultat del test FOCO.' : 'Este es mi resultado del test FOCO.',
        files: [file],
      })
      return
    } catch (e) {
      // Si la persona cancela el diálogo, no seguimos con la descarga.
      if ((e as Error).name === 'AbortError') return
    }
  }

  // Escritorio o navegadores sin compartir archivos: descarga directa.
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
