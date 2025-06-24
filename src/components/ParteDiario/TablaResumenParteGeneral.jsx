import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "./styles/TablaResumenParteGeneral.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

import useCrud from "../../hooks/useCrud";

const TablaResumenParteGeneral = ({
  user,
  parte,
  servidores,
  idFormacion,
  novedades,
  formacionActualFecha,
}) => {
  dayjs.locale("es");
  const dispatch = useDispatch();
  const PATH_PDF = "/parte_pdf";

  const [novedadActiva, setNovedadActiva] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState(null);
  const [viewBy, setViewBy] = useState("novedades"); // 'novedades' o 'secciones'

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

  const fechaFormacion = formacionActualFecha
    ? new Date(formacionActualFecha?.fecha)
    : null;

  const prioridadParte = {
    Presente: 1,
    Servicio: 2,
    Franco: 3,
  };

  // Ordenar la lista de "Parte" antes de procesarla
  parte
    .filter((r) => r.formacionId === idFormacion)
    .sort((a, b) => {
      const prioridadA = prioridadParte[a.registro] || 99; // Asignar una prioridad baja si no coincide
      const prioridadB = prioridadParte[b.registro] || 99;
      return prioridadA - prioridadB;
    })
    .forEach((registro) => {
      const servidor = servidores.find(
        (s) => s.id === registro.servidorPolicialId
      );
      if (!servidor) return;

      const grupo = getGrupo(servidor.grado);
      const clave = `Parte-${registro.registro}`;
      const seccion = registro.seccion || "Sin sección";

      let entry = datosUnificados.find((e) => e.clave === clave);
      if (!entry) {
        entry = {
          clave,
          novedad: registro.registro,
          secciones: {},
        };
        datosUnificados.push(entry);
      }

      if (!entry.secciones[seccion]) {
        entry.secciones[seccion] = {
          resumen: {
            "Directivos Superiores": 0,
            "Directivos Subalternos": 0,
            "Técnico Operativos": 0,
            Total: 0,
          },
          detalles: [],
        };
      }

      const resumenSeccion = entry.secciones[seccion].resumen;
      resumenSeccion[grupo]++;
      resumenSeccion.Total++;

      entry.secciones[seccion].detalles.push({
        nombre: `${servidor.nombres} ${servidor.apellidos}`,
        grado: servidor.grado,
        ci: servidor.cI,
        detalle: registro.detalle,
      });
    });

  if (fechaFormacion) {
    novedades.forEach((n) => {
      const fechaInicio = new Date(n.fechaInicio);
      const fechaFin = new Date(n.fechaFin);
      if (fechaFormacion >= fechaInicio && fechaFormacion <= fechaFin) {
        const servidor = servidores.find((s) => s.id === n.servidorPolicialId);
        if (!servidor) return;

        const grupo = getGrupo(servidor.grado);
        const clave = `Novedad-${n.novedad}`;
        const seccion = n.seccion || "Sin sección";

        let entry = datosUnificados.find((e) => e.clave === clave);
        if (!entry) {
          entry = {
            clave,
            novedad: n.novedad,
            secciones: {},
          };
          datosUnificados.push(entry);
        }

        if (!entry.secciones[seccion]) {
          entry.secciones[seccion] = {
            resumen: {
              "Directivos Superiores": 0,
              "Directivos Subalternos": 0,
              "Técnico Operativos": 0,
              Total: 0,
            },
            detalles: [],
          };
        }

        const resumenSeccion = entry.secciones[seccion].resumen;
        resumenSeccion[grupo]++;
        resumenSeccion.Total++;

        entry.secciones[seccion].detalles.push({
          nombre: `${servidor.nombres} ${servidor.apellidos}`,
          grado: servidor.grado,
          ci: servidor.cI,
          detalle: n.descripcion,
        });
      }
    });
  }

  const toggleNovedad = (clave) => {
    setNovedadActiva((prev) => (prev === clave ? null : clave));
    // setSeccionActiva(null);
  };

  const toggleSeccion = (seccion) => {
    setSeccionActiva((prev) => (prev === seccion ? null : seccion));
  };

  // Calcular totales generales para todas las novedades y secciones
  const totalGeneral = {
    "Directivos Superiores": 0,
    "Directivos Subalternos": 0,
    "Técnico Operativos": 0,
    Total: 0,
  };

  datosUnificados.forEach((item) => {
    Object.values(item.secciones).forEach((sec) => {
      totalGeneral["Directivos Superiores"] +=
        sec.resumen["Directivos Superiores"];
      totalGeneral["Directivos Subalternos"] +=
        sec.resumen["Directivos Subalternos"];
      totalGeneral["Técnico Operativos"] += sec.resumen["Técnico Operativos"];
      totalGeneral.Total += sec.resumen.Total;
    });
  });

  // genera pdf  ------------------------------------------------------------------------------------------------------------------------------

  const generarPDFPrimeraHoja = (datos) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const margenX = 10;
  const margenY = 10;

  if (!Array.isArray(datos)) {
    console.error("Error: 'datos' no es un arreglo.", datos);
    return;
  }

  // Encabezado de la hoja
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
          colSpan: datos.length + 1, // +1 para incluir subtotales
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
            // texto vertical se aplicará en didParseCell para mejor compatibilidad
          },
        })),
        { content: "Subtotal", styles: { halign: "center" } }, // Subtotal columna
      ]),
    ],
  ];

  // Construir cuerpo de la tabla
  const body = [];
  const totalesPorColumna = Array(
    datos.length * grupos.length + grupos.length + 1
  ).fill(0);

  const secciones = Array.from(
    new Set(
      datos.flatMap((item) => Object.keys(item.secciones))
    )
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

        // Índice correcto en array totales
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

  // Fila de totales
  const filaTotales = ["Totales"];
  totalesPorColumna.forEach((total) => filaTotales.push(total));
  body.push(filaTotales);

  // Generar la tabla con estilos y texto vertical encabezados menos fila 0 de grupos
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
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 50 },
    },
    didParseCell: (data) => {
      const { cell, row, column, section } = data;

      if (section === "head") {
        // Segunda fila (index 1) poner texto vertical excepto columna 0 (SECCIONES)
        if (row.index === 1 && column.index !== 0) {
          cell.styles.textOrientation = "up";
          cell.styles.valign = "middle";
          cell.styles.halign = "center";
        }
      }

      if (section === "body") {
        const isTotalRow = row.index === body.length - 1;
        // Columna subtotal: cada (datos.length + 1) en base a columnas (excepto columna 0)
        const isSubtotalCol = (column.index - 1) % (datos.length + 1) === datos.length;

        if (isTotalRow) {
          cell.styles.fillColor = [204, 229, 255]; // azul claro para totaes
          cell.styles.fontStyle = "bold";
        } else if (isSubtotalCol) {
          cell.styles.fillColor = [255, 229, 204]; // naranja claro para subtotales
        }
      }
    },
  });

  // Guardar el archivo
  const fileName = `Parte_General_${fechaTexto}_${horaTexto}.pdf`;
  doc.save(fileName);
};








  // genera pdf  ------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="table_section_reporte_general">
      <div className="title_table_reporte">PARTE GENERAL DE LA DIRECCION</div>

      <button
        onClick={() => {
          setViewBy((prev) =>
            prev === "novedades" ? "secciones" : "novedades"
          );
          setNovedadActiva(null);
          setSeccionActiva(null);
        }}
        className="btn_generar_pdf"
      >
        Ver por {viewBy === "novedades" ? "Secciones" : "Novedades"}
      </button>

      <table className="servidores_table_reporte">
        <thead>
          <tr>
            <th>{viewBy === "novedades" ? "Novedad" : "Sección"}</th>
            <th>Directivos Superiores</th>
            <th>Directivos Subalternos</th>
            <th>Técnico Operativos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {viewBy === "novedades" &&
            datosUnificados.map((item) => {
              // Totales agregados de todas las secciones para esta novedad
              const totalDirectivosSuperiores = Object.values(
                item.secciones
              ).reduce(
                (acc, val) => acc + val.resumen["Directivos Superiores"],
                0
              );
              const totalDirectivosSubalternos = Object.values(
                item.secciones
              ).reduce(
                (acc, val) => acc + val.resumen["Directivos Subalternos"],
                0
              );
              const totalTecnicosOperativos = Object.values(
                item.secciones
              ).reduce(
                (acc, val) => acc + val.resumen["Técnico Operativos"],
                0
              );
              const totalGeneralItem = Object.values(item.secciones).reduce(
                (acc, val) => acc + val.resumen.Total,
                0
              );

              return (
                <React.Fragment key={item.clave}>
                  <tr
                    onClick={() => toggleNovedad(item.clave)}
                    style={{
                      backgroundColor:
                        novedadActiva === item.clave
                          ? "#f2f2f2"
                          : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <td>{item.novedad}</td>
                    <td>{totalDirectivosSuperiores}</td>
                    <td>{totalDirectivosSubalternos}</td>
                    <td>{totalTecnicosOperativos}</td>
                    <td>{totalGeneralItem}</td>
                  </tr>
                  {novedadActiva === item.clave &&
                    Object.entries(item.secciones).map(([seccion, data]) => (
                      <React.Fragment key={seccion}>
                        <tr
                          onClick={() => toggleSeccion(seccion)}
                          style={{
                            fontWeight: "bold",
                            backgroundColor:
                              seccionActiva === seccion ? "#f8f8f8" : "#e8e8e8",
                            cursor: "pointer",
                          }}
                        >
                          <td>{seccion}</td>
                          <td>{data.resumen["Directivos Superiores"]}</td>
                          <td>{data.resumen["Directivos Subalternos"]}</td>
                          <td>{data.resumen["Técnico Operativos"]}</td>
                          <td>{data.resumen.Total}</td>
                        </tr>
                        {seccionActiva === seccion &&
                          data.detalles.map((detalle, idx) => (
                            <tr key={idx}>
                              <td colSpan="5">
                                {detalle.grado} - {detalle.nombre} ({detalle.ci}
                                ) - {detalle.detalle}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              );
            })}

          {viewBy === "secciones" && (
            <>
              {(() => {
                const agrupadoPorSeccion = {};

                datosUnificados.forEach((item) => {
                  Object.entries(item.secciones).forEach(([seccion, data]) => {
                    if (!agrupadoPorSeccion[seccion]) {
                      agrupadoPorSeccion[seccion] = {
                        resumen: {
                          "Directivos Superiores": 0,
                          "Directivos Subalternos": 0,
                          "Técnico Operativos": 0,
                          Total: 0,
                        },
                        novedades: {},
                      };
                    }

                    // Sumar resumen de esta seccion a la agrupada
                    agrupadoPorSeccion[seccion].resumen[
                      "Directivos Superiores"
                    ] += data.resumen["Directivos Superiores"];
                    agrupadoPorSeccion[seccion].resumen[
                      "Directivos Subalternos"
                    ] += data.resumen["Directivos Subalternos"];
                    agrupadoPorSeccion[seccion].resumen["Técnico Operativos"] +=
                      data.resumen["Técnico Operativos"];
                    agrupadoPorSeccion[seccion].resumen.Total +=
                      data.resumen.Total;

                    // Guardar novedades dentro de la seccion
                    agrupadoPorSeccion[seccion].novedades[item.clave] = {
                      novedad: item.novedad,
                      resumen: data.resumen,
                      detalles: data.detalles,
                    };
                  });
                });

                return Object.entries(agrupadoPorSeccion).map(
                  ([seccion, datos]) => (
                    <React.Fragment key={seccion}>
                      <tr
                        onClick={() => toggleSeccion(seccion)}
                        style={{
                          fontWeight: "bold",
                          backgroundColor:
                            seccionActiva === seccion ? "#f8f8f8" : "#e8e8e8",
                          cursor: "pointer",
                        }}
                      >
                        <td>{seccion}</td>
                        <td>{datos.resumen["Directivos Superiores"]}</td>
                        <td>{datos.resumen["Directivos Subalternos"]}</td>
                        <td>{datos.resumen["Técnico Operativos"]}</td>
                        <td>{datos.resumen.Total}</td>
                      </tr>

                      {seccionActiva === seccion &&
                        Object.entries(datos.novedades).map(
                          ([claveNovedad, novedad]) => (
                            <React.Fragment key={claveNovedad}>
                              <tr
                                onClick={() => toggleNovedad(claveNovedad)}
                                style={{
                                  fontWeight: "normal",
                                  backgroundColor:
                                    novedadActiva === claveNovedad
                                      ? "#f2f2f2"
                                      : "transparent",
                                  cursor: "pointer",
                                }}
                              >
                                <td style={{ paddingLeft: "1.5rem" }}>
                                  {novedad.novedad}
                                </td>
                                <td>
                                  {novedad.resumen["Directivos Superiores"]}
                                </td>
                                <td>
                                  {novedad.resumen["Directivos Subalternos"]}
                                </td>
                                <td>{novedad.resumen["Técnico Operativos"]}</td>
                                <td>{novedad.resumen.Total}</td>
                              </tr>

                              {novedadActiva === claveNovedad &&
                                novedad.detalles.map((detalle, idx) => (
                                  <tr key={idx}>
                                    <td
                                      colSpan="5"
                                      style={{ paddingLeft: "3rem" }}
                                    >
                                      {detalle.grado} - {detalle.nombre} (
                                      {detalle.ci}) - {detalle.detalle}
                                    </td>
                                  </tr>
                                ))}
                            </React.Fragment>
                          )
                        )}
                    </React.Fragment>
                  )
                );
              })()}
            </>
          )}
          <tr
            style={{
              fontWeight: "bold",
              borderTop: "2px solid black",
              backgroundColor: "#d9d9d9",
            }}
          >
            <td>Total General</td>
            <td>{totalGeneral["Directivos Superiores"]}</td>
            <td>{totalGeneral["Directivos Subalternos"]}</td>
            <td>{totalGeneral["Técnico Operativos"]}</td>
            <td>{totalGeneral.Total}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => generarPDFPrimeraHoja(datosUnificados)}>
        Generar
      </button>
    </div>
  );
};

export default TablaResumenParteGeneral;
