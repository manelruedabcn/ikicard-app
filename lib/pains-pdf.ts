// Generación del PDF del resultado de La herida dominante en el propio
// navegador. Misma mecánica que /mascaras y PASO (ver lib/masks-pdf.ts):
// window.print() no sirve en móvil, así que capturamos el informe a imagen
// y lo montamos en un PDF A4 real, compartido con el menú nativo del móvil
// (o descargado como fallback en escritorio).
//
// Las librerías se importan de forma diferida (solo en el clic) para no
// cargar nada en el render inicial ni romper el SSR.

function prepararClon(doc: Document) {
  doc.querySelectorAll<HTMLElement>('.pain-print-only').forEach(el => {
    el.style.display = 'block'
  })
  doc.querySelectorAll<HTMLElement>('.pain-no-export').forEach(el => {
    el.style.display = 'none'
  })
}

export async function generarPainsPdf(el: HTMLElement, fileName = 'LaHeridaDominante.pdf') {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#FDFBF7',
    useCORS: true,
    windowWidth: el.scrollWidth,
    onclone: (clonedDoc: Document) => prepararClon(clonedDoc),
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  let heightLeft = imgH
  let position = 0
  pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH)
  heightLeft -= pageH
  while (heightLeft > 0) {
    position -= pageH
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH)
    heightLeft -= pageH
  }

  const blob = pdf.output('blob')
  const file = new File([blob], fileName, { type: 'application/pdf' })

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file] })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
