import React, { useEffect, useState } from "react";
import "./styles/ParteDiario.css"
import useAuth from "../hooks/useAuth";
import useCrud from "../hooks/useCrud";

const ParteDiario = () => {
  const [formState, setFormState] = useState({});

  const PATH_SERVIDORES = "/servidores";
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [
    resApi,
    getApi,
    postApi,
    deleteApi,
    updateApi,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
  ] = useCrud();

  useEffect(() => {
    loggedUser();
    getApi(PATH_SERVIDORES);
  }, []);

  const handleInputChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleGuardar = (serv) => {
    const datos = formState[serv.id];
    if (!datos.registro) return;

    const payload = {
      servidorId: serv.id,
      registro: datos.registro,
      detalle: datos.detalle,
    };

    console.log(payload);
  };

  return (
    <div className="partediario_content">
      <h2>Parte Diario</h2>
      <section>
        <span>Despliegue del parte diario</span>
      </section>
      <div className="table_section_parte">
        <table className="servidores_table_parte">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre completo</th>
              <th>Registro</th>
              <th>Detalle</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {resApi
              .filter((serv) => serv?.seccion === user?.seccion)
              .map((serv) => (
                <tr key={serv.id}>
                  <td>{serv.cI}</td>
                  <td>
                    {serv.grado} {serv.nombres} {serv.apellidos}
                  </td>
                  <td>
                    <select
                      value={formState[serv.id]?.registro || ""}
                      onChange={(e) =>
                        handleInputChange(serv.id, "registro", e.target.value)
                      }
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="Franco">Franco</option>
                      <option value="Servicio">Servicio</option>
                      <option value="Presente">Presente</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formState[serv.id]?.detalle || ""}
                      onChange={(e) =>
                        handleInputChange(serv.id, "detalle", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => handleGuardar(serv)}>GUARDAR</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParteDiario;
