import React, { useState } from "react";
import "./styles/TablaResumenParte.css"

const TablaResumenParte = ({ parte, servidores, idFormacion }) => {
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

  const generarResumenParte = (parte, servidores, idFormacion) => {
    const resumen = {};

    parte
      .filter((registro) => registro.formacionId === idFormacion)
      .forEach((registro) => {
        const servidor = servidores.find(
          (s) => s.id === registro.servidorPolicialId
        );
        if (!servidor) return;

        const grado = servidor.grado;
        let grupo = "otros";

        if (gruposOcupacionales.directivosSuperiores.includes(grado)) {
          grupo = "Directivos Superiores";
        } else if (gruposOcupacionales.directivosSubalternos.includes(grado)) {
          grupo = "Directivos Subalternos";
        } else if (gruposOcupacionales.tecnicosOperativos.includes(grado)) {
          grupo = "Técnico Operativos";
        }

        if (!resumen[registro.registro]) {
          resumen[registro.registro] = {
            "Directivos Superiores": 0,
            "Directivos Subalternos": 0,
            "Técnico Operativos": 0,
            Total: 0,
          };
        }

        resumen[registro.registro][grupo]++;
        resumen[registro.registro].Total++;
      });

    return resumen;
  };

  const agrupados = {};
  parte
    .filter((registro) => registro.formacionId === idFormacion)
    .forEach((registro) => {
      const servidor = servidores.find(
        (s) => s.id === registro.servidorPolicialId
      );
      if (!servidor) return;

      const grado = servidor.grado;
      let grupo = "otros";

      if (gruposOcupacionales.directivosSuperiores.includes(grado)) {
        grupo = "Directivos Superiores";
      } else if (gruposOcupacionales.directivosSubalternos.includes(grado)) {
        grupo = "Directivos Subalternos";
      } else if (gruposOcupacionales.tecnicosOperativos.includes(grado)) {
        grupo = "Técnico Operativos";
      }

      if (!agrupados[registro.registro]) agrupados[registro.registro] = {};
      if (!agrupados[registro.registro][grupo])
        agrupados[registro.registro][grupo] = [];

      agrupados[registro.registro][grupo].push({
        nombre: `${servidor.nombres} ${servidor.apellidos}`,
        grado,
        ci: servidor.cI,
        detalle: registro.detalle,
      });
    });

  const resumen = generarResumenParte(parte, servidores, idFormacion);
  const registros = Object.keys(resumen);

  return (
    <div className="table_section_reporte">
      <div className="title_table_reporte">Resumen del Parte Diario</div>
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
          {registros.map((nov) => (
            <React.Fragment key={nov}>
              <tr
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    novedadActiva === nov ? "#f2f2f2" : "transparent",
                }}
                onClick={() =>
                  setNovedadActiva(novedadActiva === nov ? null : nov)
                }
              >
                <td>{nov}</td>
                <td>{resumen[nov]["Directivos Superiores"]}</td>
                <td>{resumen[nov]["Directivos Subalternos"]}</td>
                <td>{resumen[nov]["Técnico Operativos"]}</td>
                <td>{resumen[nov].Total}</td>
              </tr>

              {novedadActiva === nov &&
                Object.entries(agrupados[nov] || {}).map(
                  ([grupo, servidores]) => (
                    <tr key={`${nov}-${grupo}`}>
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
                  )
                )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaResumenParte;
