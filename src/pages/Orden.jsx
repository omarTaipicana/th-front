import React, { useEffect, useState } from "react";
import useCrud from "../hooks/useCrud";
import { useForm } from "react-hook-form";
import "./styles/Orden.css";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";

const Orden = () => {
  const PATH_ORDEN = "/orden";
  const PATH_SERVIDORES = "/servidores";
  const dispatch = useDispatch();

  const [servidores, getServidor] = useCrud();
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [filteredServidores, setFilteredServidores] = useState([]);
  const [selectedServidor, setSelectedServidor] = useState(null);

  const [
    response,
    getApi,
    postApi,
    deleteApi,
    updateApi,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    postApiFile,
    newRegFile,
    updateApiFile,
    updateRegFile,
  ] = useCrud();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loggedUser();
    getApi(PATH_ORDEN);
    getServidor(PATH_SERVIDORES);
  }, []);

  const calculateDayOfYear = (dateString) => {
    const date = new Date(dateString);
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff =
      date -
      startOfYear +
      (startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = servidores.filter(
      (servidor) =>
        servidor.nombres.toLowerCase().includes(searchValue) ||
        servidor.apellidos.toLowerCase().includes(searchValue) ||
        servidor.grado.toLowerCase().includes(searchValue)
    );
    setFilteredServidores(filtered);
  };

  const handleServidorSelect = (servidor) => {
    setSelectedServidor(servidor);
    setValue(
      "jefeControl",
      `${servidor.grado} ${servidor.nombres} ${servidor.apellidos}`
    );
    setFilteredServidores([]); // Cierra el desplegable
  };

  const onSubmit = (data) => {
    const numOrden = calculateDayOfYear(data.fecha);

    // Validar si ya existe una orden con la misma fecha
    const ordenExistente = response?.find(
      (orden) => orden.fecha === data.fecha
    );
    if (ordenExistente) {
      dispatch(
        showAlert({
          message: `⚠️ Ya existe una orden registrada para la fecha ${data.fecha}.`,
          alertType: 1,
        })
      );
      return; // Detener la ejecución si ya existe una orden con esa fecha
    }

    const body = {
      ...data,
      usuarioRegistro: user.cI,
      usuarioEdicion: user.cI,
      jefeControl: selectedServidor?.cI,
      numOrden,
    };

    postApi(PATH_ORDEN, body);

    reset();
  };

  return (
    <div className="orden_content">
      <h2>Orden</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="fecha">Fecha</label>
          <input
            type="date"
            id="fecha"
            {...register("fecha", { required: "La fecha es obligatoria" })}
          />
          {errors.fecha && <span>{errors.fecha.message}</span>}
        </div>
        <div>
          <label htmlFor="jefeControl">Jefe de Control</label>
          <input
            type="text"
            id="jefeControl"
            {...register("jefeControl", {
              required: "El jefe de control es obligatorio",
            })}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          {errors.jefeControl && <span>{errors.jefeControl.message}</span>}
          {filteredServidores.length > 0 && (
            <ul className="servidores-dropdown">
              {filteredServidores.map((servidor) => (
                <li
                  key={servidor.id}
                  onClick={() => handleServidorSelect(servidor)}
                >
                  {`${servidor.grado} ${servidor.nombres} ${servidor.apellidos}`}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="frase">Frase</label>
          <input
            type="text"
            id="frase"
            {...register("frase", { required: "La frase es obligatoria" })}
          />
          {errors.frase && <span>{errors.frase.message}</span>}
        </div>
        <div>
          <label htmlFor="santoSeña">Santo Seña</label>
          <input
            type="text"
            id="santosenia"
            {...register("santoSeña", {
              required: "El santo seña es obligatorio",
            })}
          />
          {errors.santosenia && <span>{errors.santosenia.message}</span>}
        </div>
        <div>
          <label htmlFor="contraseña">Contraseña</label>
          <input
            type="number"
            id="contrasena"
            {...register("contraseña", {
              required: "La contraseña es obligatoria",
            })}
          />
          {errors.contrasena && <span>{errors.contrasena.message}</span>}
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Orden;
