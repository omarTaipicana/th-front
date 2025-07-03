import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

export const mostrarVistaPreviaPDF = (pdfUrl, fileName) => {
  // Crear el contenedor del modal
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)"; // Centramos el modal
  modal.style.width = "97%";
  modal.style.height = "97%";
  modal.style.zIndex = "10000";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  // Crear el contenedor del iframe
  const iframeContainer = document.createElement("div");
  iframeContainer.style.width = "100%";
  iframeContainer.style.height = "100%";
  iframeContainer.style.backgroundColor = "#fff";
  iframeContainer.style.borderRadius = "10px";
  iframeContainer.style.position = "relative";
  iframeContainer.style.overflow = "hidden"; // Aseguramos que el contenido no se desborde

  // Crear el iframe para mostrar el PDF
  const iframe = document.createElement("iframe");
  iframe.src = pdfUrl;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  // Botón para cerrar el modal
  const closeButton = document.createElement("button");
  closeButton.innerText = "Cerrar";
  closeButton.style.position = "absolute";
  closeButton.style.top = "50px";
  closeButton.style.right = "30px";
  closeButton.style.padding = "10px";
  closeButton.style.backgroundColor = "#ff4444";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    modal.remove();
    URL.revokeObjectURL(pdfUrl); // Liberar el objeto URL
  });

  // Botón para descargar el PDF
  const downloadButton = document.createElement("button");
  downloadButton.innerText = "Descargar";
  downloadButton.style.position = "absolute";
  downloadButton.style.top = "100px";
  downloadButton.style.right = "18px";
  downloadButton.style.padding = "10px";
  downloadButton.style.backgroundColor = "#4caf50";
  downloadButton.style.color = "#fff";
  downloadButton.style.border = "none";
  downloadButton.style.borderRadius = "5px";
  downloadButton.style.cursor = "pointer";
  downloadButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
    modal.remove();
    URL.revokeObjectURL(pdfUrl); // Liberar el objeto URL
  });

  // Ensamblar elementos en el DOM
  iframeContainer.appendChild(iframe);
  modal.appendChild(iframeContainer);
  modal.appendChild(closeButton);
  modal.appendChild(downloadButton);
  document.body.appendChild(modal);
};

export const generarPdfGeneral = (datos, formacionActualFecha, user) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const margenX = 10;
  const margenY = 10;

  if (!Array.isArray(datos)) {
    console.error("Error: 'datos' no es un arreglo.", datos);
    return;
  }

  // Encabezado de la primera hoja
  const fechaTexto = formacionActualFecha
    ? dayjs(formacionActualFecha.fecha).format("DD [de] MMMM [de] YYYY")
    : "";
  const horaTexto = formacionActualFecha?.hora
    ? new Date(`1970-01-01T${formacionActualFecha.hora}`).toLocaleTimeString(
        "es-EC",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      )
    : "";

  const fileName = `Parte_General_${fechaTexto}_${horaTexto}.pdf`;

  doc.setFontSize(10);
  doc.text("DIRECCIÓN GENERAL DE INVESTIGACIÓN", 148, margenY, {
    align: "center",
  });
  doc.text("PARTE DIARIO DE NOVEDADES", 148, margenY + 6, { align: "center" });

  doc.text(`Quito, ${fechaTexto} - hora ${horaTexto}`, 148, margenY + 12, {
    align: "center",
  });

  const grupos = [
    "Directivos Superiores",
    "Directivos Subalternos",
    "Técnico Operativos",
  ];

  // Crear el encabezado jerárquico
  const head = [
    [
      { content: "SECCIONES", rowSpan: 2, styles: { halign: "center" } },
      ...grupos.flatMap((grupo) => [
        {
          content: grupo.toUpperCase(),
          colSpan: datos.length + 1,
          styles: { halign: "center" },
        },
      ]),
      { content: "TOTAL", rowSpan: 2, styles: { halign: "center" } },
    ],
    [
      ...grupos.flatMap(() => [
        ...datos.map((item) => ({
          content: item.novedad,
          styles: {
            halign: "center",
            valign: "middle",
            textOrientation: "up",
          },
        })),
        { content: "Total", styles: { halign: "center" } },
      ]),
    ],
  ];

  const headerTextsFila2 = head[1]
    .map((cell) =>
      typeof cell.content === "string" ? cell.content : cell.content
    )
    .filter((val) => val !== "Total"); // omitir 'Total' si no quieres pintarlo

  // Construir cuerpo de la tabla
  const body = [];
  const totalesPorColumna = Array(
    datos.length * grupos.length + grupos.length + 1
  ).fill(0);

  const secciones = Array.from(
    new Set(datos.flatMap((item) => Object.keys(item.secciones)))
  ).sort();

  secciones.forEach((seccion) => {
    const fila = [seccion];
    let totalFila = 0;

    grupos.forEach((grupo, grupoIndex) => {
      let subtotalGrupo = 0;

      datos.forEach((item, idx) => {
        const dataSeccion = item.secciones[seccion] || {
          resumen: { [grupo]: 0 },
        };
        const count = dataSeccion.resumen[grupo] || 0;
        fila.push(count);
        subtotalGrupo += count;

        const totalIndex = idx + grupoIndex * datos.length;
        totalesPorColumna[totalIndex] += count;

        totalFila += count;
      });

      fila.push(subtotalGrupo);

      const subtotalIndex = datos.length * grupos.length + grupoIndex;
      totalesPorColumna[subtotalIndex] += subtotalGrupo;
    });

    fila.push(totalFila);
    totalesPorColumna[totalesPorColumna.length - 1] += totalFila;
    body.push(fila);
  });

  const filaTotales = ["Totales"];
  totalesPorColumna.forEach((total) => filaTotales.push(total));
  body.push(filaTotales);

  // Generar la tabla de la primera hoja
  // Calcular el total de columnas de la tabla
  const totalColumnas = 1 + grupos.length * (datos.length + 1) + 1;

  // Definir estilos de columnas
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margenX * 2;

  const anchoSeccion = 35;
  const anchoTotal = 15;
  const anchoCols =
    (usableWidth - anchoSeccion - anchoTotal) / (totalColumnas - 2);

  const columnStyles = {
    0: { cellWidth: anchoSeccion },
    [totalColumnas - 1]: { cellWidth: anchoTotal },
  };

  for (let i = 1; i < totalColumnas - 1; i++) {
    columnStyles[i] = { cellWidth: anchoCols };
  }

  autoTable(doc, {
    head,
    body,
    startY: margenY + 18,
    margin: { left: margenX },
    styles: {
      fontSize: 6,
      cellPadding: 1.2,
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [150, 150, 150],
    },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      halign: "center",
      valign: "middle",
      cellPadding: 2,
    },
    columnStyles,
    didParseCell: (data) => {
      const { cell, row, column, section } = data;

      if (section === "head" && row.index === 1) {
        row.height = 35;
        if (column.index !== 0) {
          cell.text = [" "];
        }
      }

      if (section === "body") {
        const isTotalRow = row.index === body.length - 1;

        if (column.index !== 0) {
          cell.styles.valign = "middle";
          cell.styles.halign = "center";
        }

        const isSubtotalCol =
          (column.index - 1) % (datos.length + 1) === datos.length;

        if (isTotalRow) {
          cell.styles.fillColor = [204, 229, 255];
          cell.styles.fontStyle = "bold";
        } else if (isSubtotalCol) {
          cell.styles.fillColor = [255, 229, 204];
        }
      }
    },

    // didDrawCell: (data) => {
    //   const { cell, row, column, section, doc } = data;

    //   if (section === "head" && row.index === 1 && column.index !== 0) {
    //     const text = typeof cell.raw === "object" ? cell.raw.content : cell.raw;

    //     // Limitar texto a máximo 20 caracteres con "..." si es muy largo
    //     const maxChars = 20;
    //     const displayText =
    //       text.length > maxChars ? text.slice(0, maxChars - 3) + "..." : text;

    //     // Ajustar tamaño de fuente según longitud
    //     const maxFontSize = 6;
    //     const minFontSize = 3;
    //     const maxLength = 10;
    //     let fontSize = maxFontSize;
    //     if (displayText.length > maxLength) {
    //       fontSize = Math.max(
    //         minFontSize,
    //         (maxLength * maxFontSize) / displayText.length
    //       );
    //     }

    //     // Centro de la celda
    //     const centerX = cell.x + cell.width / 2 + 2;
    //     const centerY = cell.y + cell.height / 2;

    //     doc.saveGraphicsState();
    //     doc.setTextColor(255, 255, 255);
    //     doc.setFontSize(fontSize);

    //     // Ajuste fino de posición para que el texto rotado no se salga
    //     // Puedes probar con un pequeño desplazamiento en X o Y si es necesario
    //     const adjustedX = centerX + fontSize / 2; // ajusta a necesidad
    //     const adjustedY = centerY;

    //     doc.text(displayText, adjustedX, adjustedY, {
    //       angle: 90,
    //       align: "center",
    //       baseline: "middle",
    //     });

    //     doc.restoreGraphicsState();
    //   }
    // },
  });

  // Obtener solo las celdas del segundo encabezado, quitando primera y última columna

  // Extraer solo los textos del segundo encabezado, sin "SECCIONES" ni "TOTAL"
  // Extraer los textos del segundo encabezado, omitiendo primera y última columna
  const textos = head[1].map((cell) => {
    const content =
      typeof cell.content === "object" ? cell.content.content : cell.content;
    return typeof content === "string" ? content : "";
  });

  // Coordenadas iniciales y ancho de columna
  const startX = margenX + anchoSeccion; // inicio después de primera columna "SECCIONES"
  const startY = margenY + 50;

  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255); // texto blanco

  let acumuladoX = startX;

  textos.forEach((text, index) => {
    const maxChars = 30;
    const displayText =
      text.length > maxChars ? text.slice(0, maxChars - 3) + "..." : text;

    // Tamaño de fuente dinámico (puedes usar fontSize fijo si quieres)
    const maxFontSize = 6;
    const minFontSize = 3;
    const maxLength = 10;
    let fontSize = maxFontSize;
    if (displayText.length > maxLength) {
      fontSize = Math.max(
        minFontSize,
        (maxLength * maxFontSize) / displayText.length
      );
    }

    // Ancho real de la columna (index + 1 porque omites la primera columna)
    const cellWidth = columnStyles[index + 1].cellWidth;

    // Posición X centrada en la columna actual
    const x = acumuladoX + cellWidth / 2;
    const y = startY;

    doc.saveGraphicsState();
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255); // blanco
    doc.setFont("helvetica", "normal");

    doc.text(displayText, x + 1, y + 3, {
      angle: 90,
      align: "left", // ancla desde arriba del texto rotado
      baseline: "middle",
    });

    doc.restoreGraphicsState();

    // Sumar ancho para la próxima columna
    acumuladoX += cellWidth;
  });

  // Después de llamar a autoTable...

  // Segunda hoja con detalles
  // Segunda hoja con detalles
  // Segunda hoja con detalles

  const yInicio = 20;
  const margenX2 = 10;
  const espacioEntreColumnas = 10;
  const anchoColumna =
    (doc.internal.pageSize.getWidth() -
      margenX2 * 2 -
      espacioEntreColumnas * 2) /
    3;

  const columnasX = [
    margenX2,
    margenX2 + anchoColumna + espacioEntreColumnas,
    margenX2 + (anchoColumna + espacioEntreColumnas) * 2,
  ];

  let alturasColumnas = [yInicio, yInicio, yInicio];

  // Recorremos cada novedad
  datos.forEach((item) => {
    const detallesPlanos = Object.entries(item.secciones || {}).flatMap(
      ([grupo, contenido]) => contenido.detalles
    );

    // Saltar si no hay datos
    if (detallesPlanos.length === 0) {
      // Buscar columna con espacio para texto vacío
      let col = alturasColumnas.findIndex(
        (y) => y + 10 <= doc.internal.pageSize.height - 10
      );
      if (col === -1) {
        doc.addPage("landscape");
        alturasColumnas = [yInicio, yInicio, yInicio];
        col = 0;
      }
      alturasColumnas[col] += 10;
      return;
    }

    // Fragmentar en bloques de 40
    const fragmentSize = 40;
    let ordGlobal = 1;

    for (let i = 0; i < detallesPlanos.length; i += fragmentSize) {
      const fragmento = detallesPlanos.slice(i, i + fragmentSize);
      const alturaEstim = fragmento.length * 6 + 8;

      // Buscar columna donde quepa
      let col = alturasColumnas.findIndex(
        (y) => y + alturaEstim <= doc.internal.pageSize.height - 10
      );

      // Si no cabe en ninguna columna, agregar nueva hoja
      if (col === -1) {
        doc.addPage("landscape");
        alturasColumnas = [yInicio, yInicio, yInicio];
        col = 0;
      }

      const startX = columnasX[col];
      const startY = alturasColumnas[col];

      doc.setFontSize(7);
      doc.text(item.novedad.toUpperCase(), startX, startY);

      const body = fragmento.map((persona, idx) => [
        ordGlobal++, // contador global para la novedad actual
        persona.grado,
        persona.nombre,
        persona.detalle,
      ]);

      autoTable(doc, {
        head: [["ORD.", "GRADO", "NOMBRES", "LUGAR"]],
        body,
        startY: startY + 2,
        margin: { left: startX },
        tableWidth: anchoColumna,
        styles: {
          fontSize: 5,
          cellPadding: 1,
          textColor: [0, 0, 0],
        },
        headStyles: {
          halign: "center",
          lineWidth: 0.3,
          lineColor: [150, 150, 150],
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        theme: "grid",
      });

      // Actualizar la altura de esa columna
      alturasColumnas[col] = doc.lastAutoTable.finalY + 5;
    }
  });

  // Convertir PDF a Blob y mostrar vista previa
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  mostrarVistaPreviaPDF(pdfUrl, fileName);
};
