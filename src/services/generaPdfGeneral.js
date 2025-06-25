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
  modal.style.width = "95%";
  modal.style.height = "95%";
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
  doc.text(
    "PARTE ELEVADO A LA UNIDAD DE ADMINISTRACION DEL TALENTO HUMANO",
    148,
    margenY + 6,
    { align: "center" }
  );
  doc.text("SECCIÓN DE TALENTO HUMANO DE LA DGIN", 148, margenY + 12, {
    align: "center",
  });
  doc.text(`Quito, ${fechaTexto} - hora ${horaTexto}`, 148, margenY + 18, {
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
  autoTable(doc, {
    head,
    body,
    startY: margenY + 30,
    margin: { left: margenX },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [150, 150, 150],
    },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      halign: "center",
      cellPadding: 1,
    },
    columnStyles: {
      0: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      const { cell, row, column, section } = data;

      if (section === "head") {
        if (row.index === 1 && column.index !== 0) {
          cell.styles.textOrientation = "up";
          cell.styles.valign = "middle";
          cell.styles.halign = "center";
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
  });

  // Segunda hoja con detalles
  doc.addPage("landscape");
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

  let colIndex = 0;
  let detalleY = yInicio;

  datos.forEach((item) => {
    const columnaX = columnasX[colIndex];

    const alturaTablaEstimacion =
      8 +
      (item.secciones
        ? Object.values(item.secciones).reduce(
            (acc, s) => acc + (s.detalles.length + 1) * 6,
            0
          )
        : 20);

    if (detalleY + alturaTablaEstimacion > doc.internal.pageSize.height - 10) {
      colIndex++;
      detalleY = yInicio;

      if (colIndex > 2) {
        doc.addPage("landscape");
        colIndex = 0;
      }
    }

    doc.setFontSize(7);
    doc.text(item.novedad.toUpperCase(), columnasX[colIndex], detalleY);
    detalleY += 1;

    const detallesData = Object.entries(item.secciones || {}).flatMap(
      ([grupo, contenido]) =>
        contenido.detalles.map((persona, index) => [
          index + 1,
          persona.grado,
          persona.nombre,
          persona.detalle,
        ])
    );

    if (detallesData.length === 0) {
      detalleY += 5;
      return;
    }

    autoTable(doc, {
      head: [["ORD.", "GRADO", "NOMBRES", "LUGAR"]],
      body: detallesData,
      startY: detalleY,
      margin: { left: columnasX[colIndex] },
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

    detalleY = doc.lastAutoTable.finalY + 5;
  });

  // Convertir PDF a Blob y mostrar vista previa
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  mostrarVistaPreviaPDF(pdfUrl, fileName);
};
