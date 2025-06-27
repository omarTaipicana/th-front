import React, { useEffect, useState } from "react";
import "./styles/SelectTurno.css";
import useCrud from "../../hooks/useCrud";
import useAuth from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

const SelectTurno = ({ setShowFormTurno }) => {
  const dispatch = useDispatch();

  const PATH_SERVIDORES = "/servidores";
  const PATH_TURNO = "/turno";
  const PATH_ORDEN = "/orden";
  const PATH_NOVEDADES = "/novedades";

  const [servidores, getServidor] = useCrud();
  const [novedades, getNovedad] = useCrud();
  const [orden, getOrden] = useCrud();
  const [, , , loggedUser, , , , , , , , , , user] = useAuth();
  const [selectedOrden, setSelectedOrden] = useState(null);

  const [
    turno,
    getTurno,
    postTurno,
    deleteTurno,
    updateTurno,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    postTurnoFile,
    newRegFile,
    updateTurnoFile,
    updateRegFile,
  ] = useCrud();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loggedUser();
    getOrden(PATH_ORDEN);
    getServidor(PATH_SERVIDORES);
    getTurno(PATH_TURNO);
    getNovedad(PATH_NOVEDADES);
  }, []);

  const onSubmit = (data) => {
    const body = {
      OrdenId: selectedOrden,
      ServidorPolicialId: data.servidorId,
      seccion: user.seccion,
      usuarioRegistro: user.cI,
      usuarioEdicion: user.cI,
    };

    postTurno(PATH_TURNO, body); // Ejecutar la solicitud
    reset();
  };

  useEffect(() => {
    if (newReg) {
      dispatch(
        showAlert({
          message: `⚠️ Turno Registrado Exitosamente`,
          alertType: 2,
        })
      );
    }
  }, [newReg]);

  useEffect(() => {
    if (newReg) {
      // Si hay una respuesta exitosa, cerrar el formulario
      setShowFormTurno(false);
      setSelectedOrden(null);
    }

    if (error) {
      dispatch(
        showAlert({
          message: `⚠️ ${error.response?.data?.message}` || "Error inesperado",
          alertType: 1,
        })
      );
      setShowFormTurno(false);
    }
  }, [newReg, error]); // Escuchar cambios en 'newReg' y 'error'

  return (
    <div className="turnos_content">
      <button
        className="close_btn_formacion"
        onClick={() => {
          setShowFormTurno(false);
          reset();
        }}
      >
        ❌
      </button>
      <h2>Personal de turno</h2>
      {selectedOrden ? (
        <form className="form_turno" onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="servidor">Seleccionar Servidor</label>
          <select id="servidor" {...register("servidorId", { required: true })}>
            <option value="">Seleccione un servidor</option>
            {servidores
              .filter((servidor) => {
                // Filtrar servidores que pertenecen a la misma sección
                if (servidor.seccion !== user.seccion) return false;

                // Comprobar si el servidor tiene novedades que coincidan con la fecha de la orden seleccionada
                const tieneNovedad = novedades.some((novedad) => {
                  return (
                    novedad.servidorPolicialId === servidor.id &&
                    selectedOrden &&
                    new Date(
                      orden.find((ord) => ord.id === selectedOrden).fecha
                    ) >= new Date(novedad.fechaInicio) &&
                    new Date(
                      orden.find((ord) => ord.id === selectedOrden).fecha
                    ) <= new Date(novedad.fechaFin)
                  );
                });

                // Incluir solo servidores sin novedades en conflicto
                return !tieneNovedad;
              })
              .map((servidor) => (
                <option key={servidor.id} value={servidor.id}>
                  {`${servidor.grado} ${servidor.nombres} ${servidor.apellidos}`}
                </option>
              ))}
          </select>
          {errors.servidorId && <span>Seleccione un servidor</span>}
          <button type="submit">Asignar Turno</button>
        </form>
      ) : (
        <ul className="orden_list">
          {orden
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha
            .map((ord) => {
              // Buscar el turno relacionado con la orden actual
              const turnoRelacionado = turno.find((t) => t.OrdenId === ord.id);

              // Buscar el servidor relacionado con el turno (si existe)
              const servidorRelacionado = servidores.find(
                (s) => turnoRelacionado?.ServidorPolicialId === s.id
              );

              return (
                <li
                  key={ord.id}
                  className={`orden_item ${
                    turnoRelacionado ? "item_verde" : "item_rojo"
                  }`} // Aplicar clase según exista turno
                  onClick={() => setSelectedOrden(ord.id)}
                >
                  <div>{new Date(ord.fecha).toLocaleDateString()}</div>
                  <div>
                    {turnoRelacionado && servidorRelacionado ? (
                      <span>
                        {servidorRelacionado.grado}{" "}
                        {servidorRelacionado.nombres}{" "}
                        {servidorRelacionado.apellidos}
                      </span>
                    ) : (
                      <span>No hay servidor de turno</span>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default SelectTurno;
