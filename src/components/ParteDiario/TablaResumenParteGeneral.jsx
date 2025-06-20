import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "./styles/TablaResumenParteGeneral.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useCrud from "../../hooks/useCrud";

const TablaResumenParteGeneral = ({  parte,
  servidores,
  idFormacion,
  novedades,
  formacionActualFecha,
  user,
  setNewPdf,}) => {
  dayjs.locale("es");
  const dispatch = useDispatch();
  const PATH_PDF = "/parte_pdf";

  const [novedadActiva, setNovedadActiva] = useState(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [completMessage, setCompletMessage] = useState();
  const [
    response,
    getPdf,
    postPdf,
    deletePdf,
    updatePdf,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
  ] = useCrud();

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
    ? new Date(formacionActualFecha?.fecha)
    : null;

  // Novedades Adicionales
  if (fechaFormacion) {
    novedades.forEach((n) => {
      const fechaInicio = new Date(n.fechaInicio);
      const fechaFin = new Date(n.fechaFin);
      if (
        fechaFormacion >= fechaInicio &&
        fechaFormacion <= fechaFin &&
        n.seccion === user?.seccion
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
    .filter(
      (r) =>
        r.formacionId === idFormacion 
    )
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

  useEffect(() => {
    const totalServidores = servidores.filter(
      (serv) => serv?.seccion === user?.seccion && serv?.enLaDireccion === "Si"
    ).length;

    if (totalGeneral.Total === totalServidores) {
      setIsButtonEnabled(true);
      setCompletMessage(""); // Limpia el mensaje si los valores son iguales
    } else {
      setIsButtonEnabled(false);
      setCompletMessage(
        `Faltan ${
          totalServidores - totalGeneral.Total
        } servidores para completar.`
      );
    }

    getPdf(PATH_PDF);
  }, [totalGeneral.Total, servidores, user, setCompletMessage]);

  const existeRegistro = response.some(
    (registro) =>
      registro?.seccion === user?.seccion &&
      registro?.formacionId === idFormacion
  );

  const handleClick = () => {
    // Verifica si `ifFormacion` existe
    if (!idFormacion) {
      dispatch(
        showAlert({
          message: "⚠️ Seleccione primero una formación.",
          alertType: 1,
        })
      );
      return; // Detiene la ejecución si no hay formación seleccionada
    }

    const existeRegistro = response.some(
      (registro) =>
        registro.seccion === user.seccion &&
        registro.formacionId === idFormacion
    );

    if (existeRegistro) {
      generarPDF();
      // Si ya existe un registro con la misma sección y formaciónId
      dispatch(
        showAlert({
          message:
            "⚠️ Ya se encuentra registrado el parte para esta formación.",
          alertType: 1,
        })
      );
      return;
    }

    // Si `ifFormacion` existe, continúa con la lógica normal
    if (isButtonEnabled) {
      const body = {
        seccion: user.seccion,
        generado: true,
        usuarioRegistro: user.cI,
        usuarioEdicion: user.cI,
        formacionId: idFormacion,
      };
      postPdf(PATH_PDF, body);

      generarPDF(); // Genera el PDF si los valores coinciden
    } else {
      dispatch(
        showAlert({
          message: `⚠️ ${completMessage}`,
          alertType: 1,
        })
      );
    }
  };

  useEffect(() => {
    if (newReg) {
      dispatch(
        showAlert({
          message: `⚠️ Se registro correctamente el parte para esta formación`,
          alertType: 2,
        })
      );
      setNewPdf(newReg);
    }
  }, [newReg]);

  //  genera pdf --------------------------------------------------------------------------------------

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const mitad = pageWidth / 2;

    // const fechaTexto = formacionActualFecha
    //   ? new Date(`${formacionActualFecha.fecha}T05:00:00Z`).toLocaleDateString(
    //       "es-EC",
    //       {
    //         day: "2-digit",
    //         month: "long",
    //         year: "numeric",
    //       }
    //     )
    //   : "";

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
      styles: {
        fontSize: 8,
        lineWidth: 0.3, // Grosor de línea para las celdas
        lineColor: [150, 150, 150], // Color negro para las líneas
        textColor: [0, 0, 0], // Texto negro para las celdas
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
        fillColor: [0, 51, 102], // Azul (puedes cambiar estos valores para otro tono)
        textColor: [255, 255, 255], // Blanco para el texto del encabezado
        fontStyle: "bold", // Negrita para el texto del encabezado
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

    // 🖋 FIRMA
    const firmaY = doc.lastAutoTable.finalY + 30; // Más espacio encima para firmar

    // Línea de firma más corta
    const lineLength = 80; // Longitud de la línea de firma
    doc.setLineWidth(0.2);
    doc.line(
      mitad / 2 - lineLength / 2, // Inicio de la línea
      firmaY, // Altura
      mitad / 2 + lineLength / 2, // Fin de la línea
      firmaY
    );

    const fullName = `${
      user.grado
    } ${user.lastName.toUpperCase()} ${user.firstName.toUpperCase()}`;

    const ccText = `CC: ${user.cI}`;

    doc.text(fullName, mitad / 2, firmaY + 5, { align: "center" });
    doc.text(ccText, mitad / 2, firmaY + 10, { align: "center" });

    // 🟨 DETALLES EN LA MITAD DERECHA
    let detalleY = yInicio;
    const columnaX = mitad + 10;

    datosOrdenados.forEach((item) => {
      if (detalleY > 180) {
        doc.addPage("landscape");
        detalleY = yInicio;
      }

      doc.setFontSize(7);
      doc.text(item.novedad.toUpperCase(), columnaX, detalleY);
      detalleY += 1;

      const detallesData = Object.entries(item.detalles).flatMap(
        ([grupo, lista]) =>
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
          fontSize: 5, // Tamaño reducido
          halign: "left", // Alineación izquierda
          cellPadding: 1, // Espaciado compacto
          textColor: [0, 0, 0], // Texto negro para las celdas
        },
        headStyles: {
          halign: "center",
          lineWidth: 0.3,
          lineColor: [150, 150, 150],
          fillColor: [0, 51, 102], // Azul (puedes cambiar estos valores para otro tono)
          textColor: [255, 255, 255], // Blanco para el texto del encabezado
          fontStyle: "bold", // Negrita para el texto del encabezado
        },
        theme: "grid", // Líneas divisorias
      });

      detalleY = doc.lastAutoTable.finalY + 5; // Ajustar el espacio
    });

    const fileName = `${user.seccion} - ${formacionActualFecha.fecha} - ${horaTexto} - ${fullName}.pdf`;

    doc.save(fileName);
  };

  return (
    <div className="table_section_reporte_general">
      <div className="title_table_reporte">PARTE GENERAL DE LA DIRECCION</div>
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
              <tr className="novedades_list"
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
        onClick={handleClick}
        disabled={!isButtonEnabled && !completMessage}
      >
        {existeRegistro ? "Generar Pdf" : "Registrar Parte"}
      </button>
    </div>
  );
};


export default TablaResumenParteGeneral