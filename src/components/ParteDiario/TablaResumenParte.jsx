import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "./styles/TablaResumenParte.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

import { generarPdfSeccion } from "../../services/generarPdfSeccion";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useCrud from "../../hooks/useCrud";

const TablaResumenParte = ({
  parte,
  servidores,
  idFormacion,
  novedades,
  formacionActualFecha,
  user,
  setNewPdf,
}) => {
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
    ? new Date(formacionActualFecha?.fecha + "T12:00:00") // medio día local, evita desfase
    : null;

  const horaFormacion = formacionActualFecha?.hora || ""; // Ej: "08:30"

  // Novedades Adicionales
if (fechaFormacion) {
  const ultimasNovedades = new Map();

  novedades.forEach((n) => {
    const fechaInicio = new Date(n.fechaInicio + "T12:00:00");
    const fechaFin = n.fechaFin
      ? new Date(n.fechaFin + "T12:00:00")
      : new Date(8640000000000000); // ~+275760-09-13

    const horaInicio = n.horaInicio;
    const horaFin = n.horaFin;

    const servidor = servidores.find((s) => s.id === n.servidorPolicialId);
    if (!servidor) return;

    const estaEnRangoFecha =
      n.seccion === user?.seccion &&
      fechaFormacion >= fechaInicio &&
      (fechaFormacion <= fechaFin || servidor.enLaDireccion === "No");


    const dentroDeHora =
      horaInicio && horaFin && horaFormacion
        ? horaFormacion >= horaInicio &&
          horaFormacion <= horaFin
        : true; // Si no hay horas, se considera válido


    // --- Validación completa ---
    if (estaEnRangoFecha && dentroDeHora) {
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
    });
  }

  // Parte Diario

  const prioridadParte = {
    "Parte-Presente": 1,
    "Parte-Servicio": 2,
    "Parte-Franco": 3,
  };
  parte
    .filter((r) => r.formacionId === idFormacion && r.seccion === user?.seccion)
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
        datosUnificados?.push(entry);
      }

      entry.resumen[grupo]++;
      entry.resumen.Total++;
      entry.detalles[grupo]?.push({
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

  parteDatos.sort((a, b) => {
    const prioridadA = prioridadParte[a.clave] || 99; // si no está, prioridad baja
    const prioridadB = prioridadParte[b.clave] || 99;
    return prioridadA - prioridadB;
  });

  const datosOrdenados = [...parteDatos, ...novedadesDatos];

  useEffect(() => {
    const totalServidores = servidores.filter(
      (serv) => serv?.seccion === user?.seccion
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
      generarPdfSeccion(
        datosOrdenados,
        totalGeneral,
        formacionActualFecha,
        user
      );

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

      generarPdfSeccion(
        datosOrdenados,
        totalGeneral,
        formacionActualFecha,
        user
      );
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

  return (
    <div className="table_section_reporte">
      <div className="title_table_reporte">Resumen Unificado de Novedades</div>
      <table className="servidores_table_reporte">
        <thead className="theader_desktop">
          <tr>
            <th>Novedad</th>
            <th>Directivos Superiores</th>
            <th>Directivos Subalternos</th>
            <th>Técnico Operativos</th>
            <th>Total</th>
          </tr>
        </thead>

        <thead className="theader_mobile">
          <tr>
            <th>Novedad</th>
            <th>D. Superiores</th>
            <th>D. Subalternos</th>
            <th>Téc. Operativos</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {datosOrdenados.map((item) => (
            <React.Fragment key={item.clave}>
              <tr
                className="novedades_list"
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
        <button
          className="btn_generar_pdf"
          onClick={handleClick}
          disabled={!isButtonEnabled && !completMessage}
        >
          {existeRegistro ? "Generar Pdf" : "Registrar Parte"}
        </button>
      )}
    </div>
  );
};

export default TablaResumenParte;
