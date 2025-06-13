import React, { useState } from "react";
import "./styles/TablaResumenParte.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TablaResumenParte = ({
  parte,
  servidores,
  idFormacion,
  novedades,
  formacionActualFecha,
}) => {
  const [novedadActiva, setNovedadActiva] = useState(null);

  const gruposOcupacionales = {
    directivosSuperiores: ["GRAD", "CRNL", "TCNL", "MAYR"],
    directivosSubalternos: ["CPTN", "TNTE", "SBTE"],
    tecnicosOperativos: [
      "SBOM",
      "SBOP",
      "SBOS",
      "SGOP",
      "SGOS",
      "CBOP",
      "CBOS",
      "POLI",
    ],
  };

  const getGrupo = (grado) => {
    if (gruposOcupacionales.directivosSuperiores.includes(grado))
      return "Directivos Superiores";
    if (gruposOcupacionales.directivosSubalternos.includes(grado))
      return "Directivos Subalternos";
    if (gruposOcupacionales.tecnicosOperativos.includes(grado))
      return "Técnico Operativos";
    return "otros";
  };

  const datosUnificados = [];
  const idsConNovedades = new Set();

  // Fecha actual de la formación
  const formacionActual = parte.find((p) => p.formacionId === idFormacion);
  const fechaFormacion = formacionActual
    ? new Date(formacionActualFecha.fecha)
    : null;

  // Novedades Adicionales
  if (fechaFormacion) {
    novedades.forEach((n) => {
      const fechaInicio = new Date(n.fechaInicio);
      const fechaFin = new Date(n.fechaFin);
      if (
        fechaFormacion >= fechaInicio &&
        fechaFormacion <= fechaFin &&
        n.seccion === formacionActual.seccion
      ) {
        const servidor = servidores.find((s) => s.id === n.servidorPolicialId);
        if (!servidor) return;

        idsConNovedades.add(n.servidorPolicialId);

        const grupo = getGrupo(servidor.grado);
        const clave = `Novedad-${n.novedad}`;

        let entry = datosUnificados.find((e) => e.clave === clave);
        if (!entry) {
          entry = {
            clave,
            novedad: n.novedad,
            resumen: {
              "Directivos Superiores": 0,
              "Directivos Subalternos": 0,
              "Técnico Operativos": 0,
              Total: 0,
            },
            detalles: {
              "Directivos Superiores": [],
              "Directivos Subalternos": [],
              "Técnico Operativos": [],
            },
          };
          datosUnificados.push(entry);
        }

        entry.resumen[grupo]++;
        entry.resumen.Total++;
        entry.detalles[grupo].push({
          nombre: `${servidor.nombres} ${servidor.apellidos}`,
          grado: servidor.grado,
          ci: servidor.cI,
          detalle: n.descripcion,
        });
      }
    });
  }

  // Parte Diario
  parte
    .filter((r) => r.formacionId === idFormacion)
    .forEach((registro) => {
      if (idsConNovedades.has(registro.servidorPolicialId)) return;

      const servidor = servidores.find(
        (s) => s.id === registro.servidorPolicialId
      );
      if (!servidor) return;

      const grupo = getGrupo(servidor.grado);
      const clave = `Parte-${registro.registro}`;

      let entry = datosUnificados.find((e) => e.clave === clave);
      if (!entry) {
        entry = {
          clave,
          novedad: registro.registro,
          resumen: {
            "Directivos Superiores": 0,
            "Directivos Subalternos": 0,
            "Técnico Operativos": 0,
            Total: 0,
          },
          detalles: {
            "Directivos Superiores": [],
            "Directivos Subalternos": [],
            "Técnico Operativos": [],
          },
        };
        datosUnificados.push(entry);
      }

      entry.resumen[grupo]++;
      entry.resumen.Total++;
      entry.detalles[grupo].push({
        nombre: `${servidor.nombres} ${servidor.apellidos}`,
        grado: servidor.grado,
        ci: servidor.cI,
        detalle: registro.detalle,
      });
    });

  // Calcular totales generales
  const totalGeneral = {
    "Directivos Superiores": 0,
    "Directivos Subalternos": 0,
    "Técnico Operativos": 0,
    Total: 0,
  };

  datosUnificados.forEach((item) => {
    totalGeneral["Directivos Superiores"] +=
      item.resumen["Directivos Superiores"];
    totalGeneral["Directivos Subalternos"] +=
      item.resumen["Directivos Subalternos"];
    totalGeneral["Técnico Operativos"] += item.resumen["Técnico Operativos"];
    totalGeneral.Total += item.resumen.Total;
  });

  // Dividir primero Parte y luego Novedades
  const parteDatos = datosUnificados.filter((item) =>
    item.clave.startsWith("Parte-")
  );
  const novedadesDatos = datosUnificados.filter((item) =>
    item.clave.startsWith("Novedad-")
  );

  const datosOrdenados = [...parteDatos, ...novedadesDatos];




  //  genera pdf --------------------------------------------------------------------------------------

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const mitad = pageWidth / 2;

    const fechaTexto = formacionActualFecha
      ? new Date(formacionActualFecha.fecha).toLocaleDateString("es-EC", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

    const horaTexto = "08:00";

    // 🟦 TÍTULOS EN LA MITAD IZQUIERDA
    const yInicio = 10;
    doc.setFontSize(10);
    doc.text("DIRECCIÓN GENERAL DE INVESTIGACIÓN", mitad / 2, yInicio, {
      align: "center",
    });
    doc.text(
      "PARTE ELEVADO A LA UNIDAD DE ADMINISTRACION DEL TALENTO HUMANO",
      mitad / 2,
      yInicio + 6,
      {
        align: "center",
      }
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

    // 🟩 TABLA RESUMEN EN LA MITAD IZQUIERDA
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
      styles: { fontSize: 8 },
    });

    // 🖋 FIRMA
    const firmaY = doc.lastAutoTable.finalY + 20;
    doc.setLineWidth(0.2);
    doc.line(mitad / 2 - 30, firmaY, mitad / 2 + 30, firmaY);
    doc.text("Firma", mitad / 2, firmaY + 5, { align: "center" });

    // 🟨 DETALLES EN LA MITAD DERECHA
    let detalleY = yInicio;
    const columnaX = mitad + 10;

    datosOrdenados.forEach((item) => {
      if (detalleY > 180) {
        doc.addPage("landscape");
        detalleY = yInicio;
      }

      doc.setFontSize(10);
      doc.text(item.novedad.toUpperCase(), columnaX, detalleY);
      detalleY += 6;

const detallesData = Object.entries(item.detalles).flatMap(([grupo, lista]) =>
      lista.map((s, i) => [
        i + 1, // Orden
        s.grado, // Grado
        s.nombre, // Nombre
        s.detalle, // Lugar
      ])
    );

    autoTable(doc, {
      head: [["ORD.", "GRADO", "NOMBRES", "LUGAR"]],
      body: detallesData,
      startY: detalleY,
      margin: { left: columnaX }, // Mantener las tablas exclusivamente en la derecha
      tableWidth: mitad - 20,
      styles: {
        fontSize: 6, // Tamaño reducido
        halign: "left", // Alineación izquierda
        cellPadding: 1, // Espaciado compacto
      },
      theme: "grid", // Líneas divisorias
    });

    detalleY = doc.lastAutoTable.finalY + 10; // Ajustar el espacio
    });

    doc.save("Resumen_Unificado.pdf");
  };






  


  
  return (
    <div className="table_section_reporte">
      <div className="title_table_reporte">Resumen Unificado de Novedades</div>
      <table className="servidores_table_reporte">
        <thead>
          <tr>
            <th>Novedad</th>
            <th>Directivos Superiores</th>
            <th>Directivos Subalternos</th>
            <th>Técnico Operativos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {datosOrdenados.map((item) => (
            <React.Fragment key={item.clave}>
              <tr
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    novedadActiva === item.clave ? "#f2f2f2" : "transparent",
                }}
                onClick={() =>
                  setNovedadActiva(
                    novedadActiva === item.clave ? null : item.clave
                  )
                }
              >
                <td className="left_column">{item.novedad}</td>
                <td>{item.resumen["Directivos Superiores"]}</td>
                <td>{item.resumen["Directivos Subalternos"]}</td>
                <td>{item.resumen["Técnico Operativos"]}</td>
                <td>{item.resumen.Total}</td>
              </tr>

              {novedadActiva === item.clave &&
                Object.entries(item.detalles).map(([grupo, servidores]) =>
                  servidores.length > 0 ? (
                    <tr key={`${item.clave}-${grupo}`}>
                      <td colSpan="5">
                        <strong>{grupo}</strong>
                        <ul style={{ marginTop: "0.5rem" }}>
                          {servidores.map((s, i) => (
                            <li key={i}>
                              {s.grado} - {s.nombre} ({s.ci}) - {s.detalle}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ) : null
                )}
            </React.Fragment>
          ))}

          <tr style={{ fontWeight: "bold", backgroundColor: "#e8e8e8" }}>
            <td>Total General</td>
            <td>{totalGeneral["Directivos Superiores"]}</td>
            <td>{totalGeneral["Directivos Subalternos"]}</td>
            <td>{totalGeneral["Técnico Operativos"]}</td>
            <td>{totalGeneral.Total}</td>
          </tr>
        </tbody>
      </table>

      <button
        className="btn_generar_pdf"
        onClick={generarPDF}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#1e3a8a",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Generar PDF
      </button>
    </div>
  );
};

export default TablaResumenParte;
