// Generación del PDF del resultado de La herida que más pesa, en el propio
// navegador. Misma mecánica que Máscaras / PASO.
//
// window.print() no sirve en móvil: en Safari es confuso y en los navegadores
// dentro de apps (Instagram, etc.) no hace nada. Aquí capturamos el informe a
// imagen y lo montamos en un PDF A4 real, que luego se comparte con el menú
// nativo del móvil (o se descarga como fallback). Funciona igual en iPhone,
// Android y navegadores embebidos.
//
// Las librerías se importan de forma diferida (solo en el clic) para no cargar
// nada en el render inicial ni romper el SSR.

// Prepara el clon del informe para el PDF: enseña el pie con QR (que en
// pantalla está oculto) y esconde lo interactivo (botones y ejercicio).
function prepararClon(doc: Document) {
  doc.querySelectorAll<HTMLElement>('.heridas-print-only').forEach(el => {
    el.style.display = 'block'
  })
  doc.querySelectorAll<HTMLElement>('.heridas-no-export').forEach(el => {
    el.style.display = 'none'
  })
}

export async function generarHeridasPdf(el: HTMLElement, fileName = 'Herida-dominante.pdf') {
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

  // El informe es más alto que una página: se reparte en varias A4, desplazando
  // la misma imagen hacia arriba página a página.
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

  // Móvil: menú nativo de compartir (guardar en Archivos, enviar, etc.).
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file] })
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
