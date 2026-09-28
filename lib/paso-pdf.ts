// Generación del PDF del resultado PASO en el propio navegador.
//
// window.print() no sirve en móvil: en Safari es confuso y en los navegadores
// dentro de apps (Instagram, etc.) no hace nada. Aquí capturamos el informe a
// imagen y lo montamos en un PDF A4 real. El botón de descarga debe descargar
// el archivo; compartir ya tiene su propia acción separada en la interfaz.
//
// Las librerías se importan de forma diferida (solo en el clic) para no cargar
// nada en el render inicial ni romper el SSR.

// Prepara el clon del informe para el PDF: enseña el pie con QR (que en pantalla
// está oculto) y esconde lo interactivo (botones y CTA), que no pinta en papel.
function prepararClon(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.paso-print-only').forEach(el => {
    el.style.display = 'block'
  })
  root.querySelectorAll<HTMLElement>('.paso-no-export').forEach(el => {
    el.style.display = 'none'
  })
}

function nuevaPagina(pdf: import('jspdf').jsPDF, numero: number) {
  if (numero > 1) pdf.addPage()

  // Un folio editorial discreto: orienta sin competir con el contenido.
  if (numero > 1) {
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(194, 134, 107)
    pdf.text('P  ·  A  ·  S  ·  O', 14, 9)
    pdf.setTextColor(135, 132, 127)
    pdf.text(String(numero).padStart(2, '0'), pageW - 14, pageH - 8, { align: 'right' })
  }
}

export async function generarPasoPdf(
  el: HTMLElement,
  fileName = 'PASO.pdf',
) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const marginX = 14
  const topY = 14
  const bottomY = 14
  const contentW = pageW - marginX * 2
  const contentH = pageH - topY - bottomY
  const gap = 5

  // El PDF tiene su propia maqueta. Clonamos el informe a un ancho editorial
  // estable (activa las rejillas de dos columnas) y capturamos bloques
  // semánticos completos. Así nunca cortamos un título, una tarjeta o un
  // párrafo por la mitad.
  const holder = document.createElement('div')
  holder.style.position = 'fixed'
  holder.style.left = '-10000px'
  holder.style.top = '0'
  holder.style.width = '760px'
  holder.style.background = '#FDFBF7'
  holder.style.zIndex = '-1'

  // Escala tipográfica propia del papel. No ampliamos toda la interfaz: solo
  // elevamos los niveles de lectura de las secciones interiores para mantener
  // la portada y las proporciones gráficas intactas.
  const pdfStyles = document.createElement('style')
  pdfStyles.textContent = `
    .paso-pdf-mode section [class~="text-sm"],
    .paso-pdf-mode section [class~="text-[15px]"] {
      font-size: 17px !important;
      line-height: 1.5 !important;
    }
    .paso-pdf-mode section [class~="text-xs"] {
      font-size: 14px !important;
      line-height: 1.45 !important;
    }
    .paso-pdf-mode section [class~="text-[10px]"],
    .paso-pdf-mode section [class~="text-[11px]"] {
      font-size: 14px !important;
      line-height: 1.35 !important;
    }
    .paso-pdf-mode section [class~="text-3xl"] {
      font-size: 39px !important;
      line-height: 1.08 !important;
    }
    .paso-pdf-mode section [class~="text-2xl"] {
      font-size: 30px !important;
      line-height: 1.15 !important;
    }
    .paso-pdf-mode section [class~="text-xl"] {
      font-size: 24px !important;
      line-height: 1.2 !important;
    }
    .paso-pdf-mode > header > div:last-child {
      min-height: 720px !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }
    .paso-pdf-mode section > [data-pdf-block][data-pdf-break="before"] > div:first-child > span:first-child {
      font-size: 18px !important;
      line-height: 1 !important;
      letter-spacing: 0.22em !important;
    }
    .paso-pdf-mode .pdf-definition-grid > div {
      padding-top: 20px !important;
      padding-bottom: 20px !important;
    }
    .paso-pdf-mode .pdf-definition-block > div:first-child p {
      margin-top: 6px !important;
    }
    .paso-pdf-mode .pdf-definition-grid {
      margin-top: 16px !important;
    }
    .paso-pdf-mode .pdf-distance-explainer > div {
      padding-top: 34px !important;
      padding-bottom: 34px !important;
    }
    .paso-pdf-mode .pdf-distance-summary {
      padding-top: 38px !important;
      padding-bottom: 34px !important;
    }
  `
  holder.appendChild(pdfStyles)

  const clone = el.cloneNode(true) as HTMLElement
  clone.style.width = '760px'
  clone.style.maxWidth = 'none'
  clone.classList.add('paso-pdf-mode')
  prepararClon(clone)
  holder.appendChild(clone)
  document.body.appendChild(holder)

  let page = 1
  let y = topY
  nuevaPagina(pdf, page)

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
        // Algunas fuentes editoriales descienden unos píxeles fuera de la caja
        // calculada por el navegador. Este colchón evita cortar descendentes,
        // la última línea de un párrafo o las etiquetas bajo un gráfico.
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

      // Un encabezado marcado keep-next nunca queda huérfano al pie del folio.
      let reserve = 0
      if (block.dataset.pdfKeepNext === 'true' && blocks[i + 1]) {
        const nextRect = blocks[i + 1].getBoundingClientRect()
        reserve = Math.min(48, (nextRect.height * contentW) / Math.max(nextRect.width, 1))
      }

      // Si la página solo contiene una breve conclusión, permitimos que la
      // sección siguiente arranque debajo: evita crear un folio casi vacío.
      // En cualquier otra situación, el inicio de sección abre página nueva.
      // La portada ocupa casi todo el A4 y se centra con su propio margen de
      // 5 mm. No debe evaluarse con el límite inferior de las páginas
      // interiores: hacerlo añadía una primera hoja en blanco.
      if (!isCover && ((forcePage && y > topY + 60) || y + drawH + reserve > pageH - bottomY)) {
        page += 1
        nuevaPagina(pdf, page)
        y = topY
      }

      const x = isCover ? 5 + (blockW - drawW) / 2 : marginX + (contentW - drawW) / 2
      const drawY = isCover ? 5 + (maxH - drawH) / 2 : y
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', x, drawY, drawW, drawH)
      y += drawH + gap
    }
  } finally {
    holder.remove()
  }

  const blob = pdf.output('blob')
  // Descarga directa. Revocamos la URL después de que el navegador haya tenido
  // tiempo de iniciar la transferencia (hacerlo en el mismo instante falla en
  // algunos navegadores móviles).
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()

  // El componente conserva esta URL para mostrar un enlace explícito. Es el
  // fallback fiable en navegadores integrados que bloquean la descarga
  // programática al finalizar un proceso asíncrono.
  return url
}
