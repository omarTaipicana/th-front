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


export const generarPdfSeccion = (
  datosOrdenados,
  totalGeneral,
  formacionActualFecha,
  user
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const mitad = pageWidth / 2;

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

  const yInicio = 10;
  doc.setFontSize(10);
  doc.text("DIRECCIÓN GENERAL DE INVESTIGACIÓN", mitad / 2, yInicio, {
    align: "center",
  });
  doc.text(
    "PARTE ELEVADO A LA UNIDAD DE ADMINISTRACION DEL TALENTO HUMANO",
    mitad / 2,
    yInicio + 6,
    { align: "center" }
  );
  doc.text("SECCIÓN DE TALENTO HUMANO DE LA DGIN", mitad / 2, yInicio + 12, {
    align: "center",
  });
  doc.text(
    `Quito, ${fechaTexto} - hora ${horaTexto}`,
    mitad / 2,
    yInicio + 20,
    {
      align: "center",
    }
  );

  const resumenData = datosOrdenados.map((item) => [
    item.novedad,
    item.resumen["Directivos Superiores"],
    item.resumen["Directivos Subalternos"],
    item.resumen["Técnico Operativos"],
    item.resumen.Total,
  ]);

  resumenData.push([
    "Total General",
    totalGeneral["Directivos Superiores"],
    totalGeneral["Directivos Subalternos"],
    totalGeneral["Técnico Operativos"],
    totalGeneral.Total,
  ]);

  autoTable(doc, {
    head: [
      [
        "Novedad",
        "Directivos Superiores",
        "Directivos Subalternos",
        "Técnico Operativos",
        "Total",
      ],
    ],
    body: resumenData,
    startY: yInicio + 28,
    startX: 10,
    tableWidth: mitad - 20,
    styles: {
      fontSize: 8,
      lineWidth: 0.3,
      lineColor: [150, 150, 150],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
    headStyles: {
      halign: "center",
      lineWidth: 0.3,
      lineColor: [150, 150, 150],
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    didParseCell: function (data) {
      const { row, column, cell, table } = data;
      if (row.index === table.body.length - 1) {
        cell.styles.fontStyle = "bold";
        cell.styles.fillColor = [180, 180, 180];
        if (column.index === 0) {
          cell.styles.halign = "left";
        } else {
          cell.styles.halign = "center";
        }
      }
    },
  });

  const firmaY = doc.lastAutoTable.finalY + 30;
  const lineLength = 80;
  doc.setLineWidth(0.2);
  doc.line(
    mitad / 2 - lineLength / 2,
    firmaY,
    mitad / 2 + lineLength / 2,
    firmaY
  );

  const fullName = `${
    user.grado
  } ${user.lastName.toUpperCase()} ${user.firstName.toUpperCase()}`;
  const ccText = `CC: ${user.cI}`;

  doc.text(fullName, mitad / 2, firmaY + 5, { align: "center" });
  doc.text(ccText, mitad / 2, firmaY + 10, { align: "center" });

  let detalleY = yInicio;
  const columnaX = mitad + 10;

  datosOrdenados.forEach((item) => {
    if (detalleY > 180) {
      doc.addPage("landscape");
      detalleY = yInicio;
    }

    doc.setFontSize(7);
    doc.text(item.novedad.toUpperCase(), columnaX, detalleY);
    detalleY += 3;

    let orden = 1;
    const detallesData = Object.entries(item.detalles).flatMap(
      ([grupo, lista]) =>
        lista.map((s) => {
          const row = [orden, s.grado, s.nombre, s.detalle];
          orden++;
          return row;
        })
    );

    autoTable(doc, {
      head: [["ORD.", "GRADO", "NOMBRES", "LUGAR"]],
      body: detallesData,
      startY: detalleY,
      margin: { left: columnaX },
      tableWidth: mitad - 20,
      styles: {
        fontSize: 5,
        halign: "left",
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

  const fileName = `${user.seccion} - ${formacionActualFecha.fecha} - ${horaTexto} - ${fullName}.pdf`;

  // Generar Blob y URL para vista previa
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  mostrarVistaPreviaPDF(pdfUrl, fileName);
};
