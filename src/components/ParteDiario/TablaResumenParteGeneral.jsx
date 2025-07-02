import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "./styles/TablaResumenParteGeneral.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { generarPdfGeneral } from "../../services/generaPdfGeneral";

import useCrud from "../../hooks/useCrud";

const TablaResumenParteGeneral = ({
  user,
  parte,
  servidores,
  idFormacion,
  setIdFormacion,
  novedades,
  formacionActualFecha,
  setFormacionActualFecha,
  faltante,
  updateFormacion,
  verActivo,
}) => {
  dayjs.locale("es");
  const dispatch = useDispatch();
  const PATH_PDF = "/parte_pdf";
  const PATH_FORMACION = "/formacion";

  const [novedadActiva, setNovedadActiva] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState(null);
  const [viewBy, setViewBy] = useState("novedades");
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

  useEffect(() => {
    getPdf(PATH_PDF);
  }, []);

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
    ? new Date(formacionActualFecha?.fecha + "T12:00:00") // medio día local, evita desfase
    : null;

  const prioridadParte = {
    Presente: 1,
    Servicio: 2,
    Franco: 3,
  };

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
    const ultimasNovedades = new Map();

    novedades.forEach((n) => {
      const fechaInicio = new Date(n.fechaInicio + "T12:00:00");
      const fechaFin = new Date(n.fechaFin + "T12:00:00");

      const servidor = servidores.find((s) => s.id === n.servidorPolicialId);
      if (!servidor) return;

      const enDireccion = servidor.enLaDireccion === "No";

      const dentroDeRango =
        fechaFormacion >= fechaInicio &&
        (fechaFormacion <= fechaFin || enDireccion);

      if (dentroDeRango) {
        const servidorId = n.servidorPolicialId;

        if (
          !ultimasNovedades.has(servidorId) ||
          new Date(n.createdAt) >
            new Date(ultimasNovedades.get(servidorId).createdAt)
        ) {
          ultimasNovedades.set(servidorId, n);
        }
      }
    });

    ultimasNovedades.forEach((n) => {
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
  const submitRegPdf = () => {
    const existeRegistro = response.some(
      (registro) =>
        registro?.seccion === "encargado" &&
        registro.formacionId === idFormacion
    );

    if (existeRegistro) {
      dispatch(
        showAlert({
          message:
            "⚠️ Ya se encuentra registrado el parte para esta formación.",
          alertType: 1,
        })
      );
      return;
    }

    const body = {
      seccion: "encargado",
      generado: true,
      usuarioRegistro: user.cI,
      usuarioEdicion: user.cI,
      formacionId: idFormacion,
    };
    postPdf(PATH_PDF, body);
    updateFormacion(PATH_FORMACION, idFormacion, {
      isAvailable: false,
    });
    setIdFormacion();
    setFormacionActualFecha();
  };

  // genera pdf  ------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="table_section_reporte_general">
      <div className="title_table_reporte">PARTE GENERAL DE LA DIRECCION</div>
      {idFormacion && (
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
      )}

      <table className="servidores_table_reporte">
        <thead className="theader_desktop">
          <tr>
            <th>{viewBy === "novedades" ? "Novedad" : "Sección"}</th>
            <th>Directivos Superiores</th>
            <th>Directivos Subalternos</th>
            <th>Técnico Operativos</th>
            <th>Total</th>
          </tr>
        </thead>

        <thead className="theader_mobile">
          <tr>
            <th>{viewBy === "novedades" ? "Novedad" : "Sección"}</th>
            <th>D. Superiores</th>
            <th>D. Subalternos</th>
            <th>Téc. Operativos</th>
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
                    className="novedades_list"
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
                          className="seccion_list"
                        >
                          <td>{seccion}</td>
                          <td>{data.resumen["Directivos Superiores"]}</td>
                          <td>{data.resumen["Directivos Subalternos"]}</td>
                          <td>{data.resumen["Técnico Operativos"]}</td>
                          <td>{data.resumen.Total}</td>
                        </tr>
                        {seccionActiva === seccion &&
                          (() => {
                            // Agrupar detalles por grupo
                            const detallesAgrupados = {
                              "Directivos Superiores": [],
                              "Directivos Subalternos": [],
                              "Técnico Operativos": [],
                            };

                            data.detalles.forEach((detalle) => {
                              // Asumiendo getGrupo está disponible en este contexto o importa
                              const grupo = getGrupo(detalle.grado); // "Directivos Superiores", etc.
                              if (detallesAgrupados[grupo]) {
                                detallesAgrupados[grupo].push(detalle);
                              }
                            });

                            // Ahora mapeamos por grupo con su lista de detalles
                            return Object.entries(detallesAgrupados).map(
                              ([grupo, servidores]) =>
                                servidores.length > 0 ? (
                                  <tr key={`${item.clave}-${seccion}-${grupo}`}>
                                    <td
                                      colSpan="5"
                                      style={{ paddingLeft: "2rem" }}
                                    >
                                      <strong>{grupo}</strong>
                                      <ul style={{ marginTop: "0.5rem" }}>
                                        {servidores.map((s, i) => (
                                          <li key={i}>
                                            {s.grado} - {s.nombre} ({s.ci}) -{" "}
                                            {s.detalle}
                                          </li>
                                        ))}
                                      </ul>
                                    </td>
                                  </tr>
                                ) : null
                            );
                          })()}
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
                        className="seccion_list"
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
                                className="novedades_list"
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
                                (() => {
                                  const detallesAgrupados = {
                                    "Directivos Superiores": [],
                                    "Directivos Subalternos": [],
                                    "Técnico Operativos": [],
                                  };

                                  novedad.detalles.forEach((detalle) => {
                                    const grupo = getGrupo(detalle.grado); // Usa tu función getGrupo
                                    if (detallesAgrupados[grupo]) {
                                      detallesAgrupados[grupo].push(detalle);
                                    }
                                  });

                                  return Object.entries(detallesAgrupados).map(
                                    ([grupo, servidores]) =>
                                      servidores.length > 0 ? (
                                        <tr key={`${claveNovedad}-${grupo}`}>
                                          <td
                                            colSpan="5"
                                            style={{ paddingLeft: "3rem" }}
                                          >
                                            <strong>{grupo}</strong>
                                            <ul style={{ marginTop: "0.5rem" }}>
                                              {servidores.map((s, i) => (
                                                <li key={i}>
                                                  {s.grado} - {s.nombre} ({s.ci}
                                                  ) - {s.detalle}
                                                </li>
                                              ))}
                                            </ul>
                                          </td>
                                        </tr>
                                      ) : null
                                  );
                                })()}
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
      {idFormacion && (
        <article className="btn_content">
          <button
            onClick={() =>
              generarPdfGeneral(datosUnificados, formacionActualFecha, user)
            }
            className="btn_generar_pdf"
          >
            Generar PDF
          </button>

          {!verActivo && faltante === 0 && (
            <button className="btn_generar_pdf" onClick={submitRegPdf}>
              Registrar Formación
            </button>
          )}
        </article>
      )}
    </div>
  );
};

export default TablaResumenParteGeneral;
