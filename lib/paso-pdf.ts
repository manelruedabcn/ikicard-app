// Exportación editorial del informe PASO. El informe se divide en láminas
// independientes buscando espacios visuales vacíos: nunca se desplaza una sola
// imagen entre páginas, que era lo que cortaba titulares y párrafos.

type PasoPdfMeta = { pattern?: string; signature?: string; rarity?: string }
const C = { paper: '#F8F4EE', ink: '#272421', terra: '#C2866B', sage: '#7A8B6F', gold: '#C5A15B' }

function prepararClon(doc: Document) {
  doc.querySelectorAll<HTMLElement>('.paso-print-only').forEach(el => { el.style.display = 'block' })
  doc.querySelectorAll<HTMLElement>('.paso-no-export').forEach(el => { el.style.display = 'none' })
}

function portada(pdf: import('jspdf').jsPDF, locale: string, meta: PasoPdfMeta) {
  const w = pdf.internal.pageSize.getWidth(), h = pdf.internal.pageSize.getHeight()
  pdf.setFillColor(C.paper); pdf.rect(0, 0, w, h, 'F')
  pdf.setFillColor(C.ink); pdf.rect(0, 0, w, 105, 'F')
  pdf.setFillColor(C.sage); pdf.circle(14, 10, 37, 'F')
  pdf.setFillColor(C.terra); pdf.circle(w + 4, h - 8, 45, 'F')
  pdf.setTextColor(248, 244, 238); pdf.setFont('times', 'normal'); pdf.setFontSize(32)
  pdf.text('ikigai', 22, 33); const bw = pdf.getTextWidth('ikigai')
  pdf.setTextColor(194, 134, 107); pdf.text('ER', 22 + bw, 33)
  pdf.setTextColor(197, 161, 91); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setCharSpace(2.2)
  pdf.text(locale === 'en' ? 'YOUR WAY OF WALKING' : 'TU FORMA DE CAMINAR', w / 2, 58, { align: 'center' }); pdf.setCharSpace(0)
  pdf.setTextColor(248, 244, 238); pdf.setFont('times', 'normal'); pdf.setFontSize(27)
  pdf.text(pdf.splitTextToSize(meta.pattern || (locale === 'en' ? 'Your PASO report' : 'Tu informe PASO'), 158), w / 2, 75, { align: 'center' })
  pdf.setTextColor(39, 36, 33); pdf.setFont('times', 'italic'); pdf.setFontSize(17)
  const promise = locale === 'en' ? 'Not a label. A mirror of how you walk today.' : 'No es una etiqueta. Es un espejo de cómo caminas hoy.'
  pdf.text(pdf.splitTextToSize(promise, 145), w / 2, 140, { align: 'center' })
  if (meta.rarity) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(104, 96, 89); pdf.text(meta.rarity, w / 2, 166, { align: 'center' }) }
  if (meta.signature) { pdf.setFontSize(9); pdf.setCharSpace(1.5); pdf.setTextColor(194, 134, 107); pdf.text(meta.signature, w / 2, 181, { align: 'center' }); pdf.setCharSpace(0) }
  pdf.setDrawColor(194, 134, 107); pdf.setLineWidth(0.5); pdf.line(76, 205, 134, 205)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(104, 96, 89)
  pdf.text(locale === 'en' ? 'A personal reading from your answers' : 'Una lectura personal nacida de tus respuestas', w / 2, 219, { align: 'center' })
  pdf.setFontSize(10); pdf.setTextColor(39, 36, 33); pdf.text('www.ikigaier.com', w / 2, 271, { align: 'center' })
}

function tinta(data: Uint8ClampedArray, width: number, y: number) {
  let n = 0
  for (let x = 0; x < width; x += 5) {
    const i = (y * width + x) * 4
    if (Math.abs(data[i] - 253) + Math.abs(data[i + 1] - 251) + Math.abs(data[i + 2] - 247) > 42) n++
  }
  return n
}

function corteSeguro(canvas: HTMLCanvasElement, from: number, ideal: number) {
  if (ideal >= canvas.height) return canvas.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) return ideal
  const span = ideal - from
  const min = Math.max(from + 260, ideal - Math.round(span * 0.22))
  const max = Math.min(canvas.height, ideal + Math.round(span * 0.08))
  const data = ctx.getImageData(0, min, canvas.width, Math.max(1, max - min)).data
  let best = ideal, bestScore = Infinity
  for (let y = min + 12; y < max - 12; y += 3) {
    let score = 0
    for (let d = -10; d <= 10; d += 5) score += tinta(data, canvas.width, y - min + d)
    score += (max - y) * 0.002
    if (score < bestScore) { bestScore = score; best = y }
  }
  return best
}

function marco(pdf: import('jspdf').jsPDF, page: number, locale: string) {
  const w = pdf.internal.pageSize.getWidth(), h = pdf.internal.pageSize.getHeight()
  pdf.setFillColor(C.paper); pdf.rect(0, 0, w, h, 'F')
  pdf.setFont('times', 'normal'); pdf.setFontSize(13); pdf.setTextColor(39, 36, 33); pdf.text('ikigai', 16, 13)
  const bw = pdf.getTextWidth('ikigai'); pdf.setTextColor(194, 134, 107); pdf.text('ER', 16 + bw, 13)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(130, 121, 113)
  pdf.text(locale === 'en' ? 'PERSONAL PASO REPORT' : 'INFORME PERSONAL PASO', w - 16, 13, { align: 'right' })
  pdf.setDrawColor(222, 214, 205); pdf.setLineWidth(0.25); pdf.line(16, 18, w - 16, 18)
  pdf.text(`www.ikigaier.com   ·   ${page}`, w / 2, h - 8, { align: 'center' })
}

async function entregar(pdf: import('jspdf').jsPDF, fileName: string, mode: 'download' | 'share', locale: string) {
  const blob = pdf.output('blob'), file = new File([blob], fileName, { type: 'application/pdf' })
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
  if (mode === 'share' && nav.share && nav.canShare?.({ files: [file] })) {
    try { await nav.share({ title: locale === 'en' ? 'My PASO Report · IKIGAIER' : 'Mi informe PASO · IKIGAIER', text: locale === 'en' ? 'This is my personal PASO report.' : 'Este es mi informe personal PASO.', files: [file] }); return }
    catch (e) { if ((e as Error).name === 'AbortError') return }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a')
  a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function generarPasoPdf(el: HTMLElement, fileName = 'PASO.pdf', mode: 'download' | 'share' = 'download', locale = 'es', meta: PasoPdfMeta = {}) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  await document.fonts?.ready
  const canvas = await html2canvas(el, { scale: 2.25, backgroundColor: '#FDFBF7', useCORS: true, windowWidth: el.scrollWidth, onclone: prepararClon })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  portada(pdf, locale, meta)
  const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight()
  const marginX = 17, top = 23, bottom = 16, imageW = pageW - marginX * 2, imageH = pageH - top - bottom
  const idealSlice = Math.floor(imageH * canvas.width / imageW)
  let from = 0, page = 1
  while (from < canvas.height) {
    const to = corteSeguro(canvas, from, Math.min(canvas.height, from + idealSlice)), sliceH = Math.max(1, to - from)
    const slice = document.createElement('canvas'); slice.width = canvas.width; slice.height = sliceH
    const ctx = slice.getContext('2d'); if (!ctx) throw new Error('PDF canvas unavailable')
    ctx.fillStyle = '#FDFBF7'; ctx.fillRect(0, 0, slice.width, slice.height); ctx.drawImage(canvas, 0, from, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
    pdf.addPage(); marco(pdf, page, locale)
    pdf.addImage(slice.toDataURL('image/jpeg', 0.94), 'JPEG', marginX, top, imageW, sliceH * imageW / canvas.width, undefined, 'FAST')
    from = to; page++
  }
  await entregar(pdf, fileName, mode, locale)
}
