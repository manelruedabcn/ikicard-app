// Generación del PDF del resultado de Máscaras en el propio navegador.
//
// window.print() no sirve en móvil: en Safari es confuso y en los navegadores
// dentro de apps (Instagram, etc.) no hace nada. Aquí capturamos el informe a
// imagen y lo montamos en un PDF A4 real, que luego se comparte con el menú
// nativo del móvil (o se descarga como fallback).
//
// Misma maqueta que el informe PASO: se clona el informe a un ancho editorial
// fijo y se captura por bloques semánticos ([data-pdf-block]), así nunca se
// corta un título, una tarjeta o un párrafo por la mitad. La portada ocupa su
// propia página; cada sección numerada abre página nueva.
//
// Las librerías se importan de forma diferida (solo en el clic) para no cargar
// nada en el render inicial ni romper el SSR.

// Enseña el pie con QR (oculto en pantalla) y esconde lo interactivo.
function prepararClon(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.mask-print-only').forEach(el => {
    el.style.display = 'block'
  })
  root.querySelectorAll<HTMLElement>('.mask-no-export').forEach(el => {
    el.style.display = 'none'
  })
}

function nuevaPagina(pdf: import('jspdf').jsPDF, numero: number, folio: string) {
  if (numero > 1) pdf.addPage()
  // Folio editorial discreto en las páginas interiores.
  if (numero > 1) {
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(194, 134, 107)
    pdf.text(folio, 14, 9)
    pdf.setTextColor(135, 132, 127)
    pdf.text(String(numero).padStart(2, '0'), pageW - 14, pageH - 8, { align: 'right' })
  }
}

export async function generarMascarasPdf(
  el: HTMLElement,
  fileName = 'Mascaras.pdf',
  mode: 'download' | 'share' = 'download',
  locale = 'es',
) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const en = locale === 'en'
  const folio = en ? 'M  A  S  K  S' : 'M  Á  S  C  A  R  A  S'

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const marginX = 14
  const topY = 14
  const bottomY = 14
  const contentW = pageW - marginX * 2
  const contentH = pageH - topY - bottomY
  const gap = 5

  const holder = document.createElement('div')
  holder.style.position = 'fixed'
  holder.style.left = '-10000px'
  holder.style.top = '0'
  holder.style.width = '760px'
  holder.style.background = '#FDFBF7'
  holder.style.zIndex = '-1'

  // Escala tipográfica propia del papel (como PASO): sube solo los niveles de
  // lectura de las secciones interiores; la portada llena el A4.
  const pdfStyles = document.createElement('style')
  pdfStyles.textContent = `
    .mask-pdf-mode section [class~="text-sm"],
    .mask-pdf-mode section [class~="text-[15px]"] { font-size: 17px !important; line-height: 1.5 !important; }
    .mask-pdf-mode section [class~="text-xs"] { font-size: 14px !important; line-height: 1.45 !important; }
    .mask-pdf-mode section [class~="text-[10px]"],
    .mask-pdf-mode section [class~="text-[11px]"] { font-size: 14px !important; line-height: 1.35 !important; }
    .mask-pdf-mode section [class~="text-3xl"] { font-size: 39px !important; line-height: 1.08 !important; }
    .mask-pdf-mode section [class~="text-2xl"] { font-size: 30px !important; line-height: 1.15 !important; }
    .mask-pdf-mode section [class~="text-xl"],
    .mask-pdf-mode section [class~="text-lg"] { font-size: 24px !important; line-height: 1.2 !important; }
    .mask-pdf-mode > header > div:last-child {
      min-height: 720px !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }
  `
  holder.appendChild(pdfStyles)

  const clone = el.cloneNode(true) as HTMLElement
  clone.style.width = '760px'
  clone.style.maxWidth = 'none'
  clone.classList.add('mask-pdf-mode')
  prepararClon(clone)
  holder.appendChild(clone)
  document.body.appendChild(holder)

  let page = 1
  let y = topY
  nuevaPagina(pdf, page, folio)

  try {
    const blocks = Array.from(clone.querySelectorAll<HTMLElement>('[data-pdf-block]'))

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      const forcePage = block.dataset.pdfBreak === 'before'
      const canvas = await html2canvas(block, {
        scale: 2,
        backgroundColor: '#FDFBF7',
        useCORS: true,
        logging: false,
        windowWidth: 760,
        // Colchón para descendentes de la tipografía editorial.
        height: Math.ceil(block.scrollHeight) + 24,
      })

      const isCover = i === 0
      const blockW = isCover ? pageW - 10 : contentW
      let drawW = blockW
      let drawH = (canvas.height * drawW) / canvas.width
      const maxH = isCover ? pageH - 10 : contentH
      if (drawH > maxH) {
        const ratio = maxH / drawH
        drawH *= ratio
        drawW *= ratio
      }

      // Un encabezado keep-next nunca queda huérfano al pie del folio.
      let reserve = 0
      if (block.dataset.pdfKeepNext === 'true' && blocks[i + 1]) {
        const nextRect = blocks[i + 1].getBoundingClientRect()
        reserve = Math.min(48, (nextRect.height * contentW) / Math.max(nextRect.width, 1))
      }

      if (!isCover && ((forcePage && y > topY + 60) || y + drawH + reserve > pageH - bottomY)) {
        page += 1
        nuevaPagina(pdf, page, folio)
        y = topY
      }

      const x = isCover ? 5 + (blockW - drawW) / 2 : marginX + (contentW - drawW) / 2
      const drawY = isCover ? 5 + (maxH - drawH) / 2 : y
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', x, drawY, drawW, drawH)
      y = isCover ? pageH : y + drawH + gap
    }
  } finally {
    holder.remove()
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
        title: en ? 'My Masks Report · IKIGAIER' : 'Mi informe de Máscaras · IKIGAIER',
        text: en ? 'This is my personal report.' : 'Este es mi informe personal.',
        files: [file],
      })
      return
    } catch (e) {
      // Si la persona cancela el diálogo, no seguimos con la descarga.
      if ((e as Error).name === 'AbortError') return
    }
  }

  // Escritorio o navegadores sin compartir archivos: descarga directa. La URL
  // se revoca más tarde (hacerlo al instante falla en algunos móviles).
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
