import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./styles/FormOrden.css";
import useCrud from "../../hooks/useCrud";
import useAuth from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

const FormOrden = ({
  servidores,
  setShowFormOrden,
  ordenEdit,
  setOrdenEdit,
}) => {
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [selectedServidor, setSelectedServidor] = useState(null);
  const [filteredServidores, setFilteredServidores] = useState([]);
  const [servidorP, getServidorP] = useCrud();
  const PATH_ORDEN = "/orden";
  const PATH_SERVIDORES = "/servidores";

  const dispatch = useDispatch();

  useEffect(() => {
    loggedUser();
    getOrden(PATH_ORDEN);
    getServidorP(PATH_SERVIDORES);
  }, []);

  const [
    orden,
    getOrden,
    postOrden,
    deleteApi,
    updateApi,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    postOrdenFile,
    newRegFile,
    updateOrdenFile,
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
    if (ordenEdit) {
      const servidor = servidorP.find(
        (srv) => srv.cI === ordenEdit.jefeControl
      );

      reset({
        ...ordenEdit,
        jefeControl: servidor
          ? `${servidor.grado} ${servidor.nombres} ${servidor.apellidos}`
          : "",
      });
    } else {
      reset({
        fecha: "",
        jefeControl: "",
        frase: "",
        santoSena: "",
        contrasena: "",
      });
    }
  }, [ordenEdit, servidorP, reset]);

  useEffect(() => {
    if (newRegFile) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se generó la orden número ${newRegFile.numOrden} de fecha: ${newRegFile.fecha}` ||
            "Error inesperado",

          alertType: 2,
        })
      );
      setShowFormOrden(false);
    }
  }, [newRegFile]);

  useEffect(() => {
    if (updateRegFile) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se actualizó la orden número ${updateRegFile.numOrden} de fecha: ${updateRegFile.fecha}` ||
            "Error inesperado",

          alertType: 2,
        })
      );
      setShowFormOrden(false);
    }
  }, [updateRegFile]);

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
    setFilteredServidores([]);
  };

  const calculateDayOfYear = (dateString) => {
    const date = new Date(dateString);
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff =
      date -
      startOfYear +
      (startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const onSubmit = (data) => {
    const numOrden = calculateDayOfYear(data.fecha);
    const file = data?.urlDoc?.[0] || null;

    if (!ordenEdit) {
      const ordenExistente = orden?.find((orden) => orden.fecha === data.fecha);
      if (ordenExistente) {
        dispatch(
          showAlert({
            message: `⚠️ Ya existe una orden registrada para la fecha ${data.fecha}.`,
            alertType: 1,
          })
        );
        return;
      }

      postOrdenFile(
        PATH_ORDEN,
        {
          ...data,
          usuarioRegistro: user.cI,
          usuarioEdicion: user.cI,
          jefeControl: selectedServidor?.cI,
          numOrden,
        },
        file
      );
    } else {
      const servidor = servidorP.find(
        (srv) => srv.cI === ordenEdit?.jefeControl
      );

      updateOrdenFile(PATH_ORDEN, ordenEdit.id, file, {
        ...data,
        usuarioEdicion: user.cI,
        jefeControl: selectedServidor ? selectedServidor?.cI : servidor.cI,
        numOrden,
      });
    }
    setOrdenEdit();
    reset({
      fecha: "",
      jefeControl: "",
      frase: "",
      santoSena: "",
      contrasena: "",
    });
  };

  return (
    <div>
      {" "}
      <div className="orden_content">
        <h2>Registro de ordenes</h2>

        <button
          className="close_btn"
          onClick={() => {
            setShowFormOrden(false);
            setOrdenEdit();
            reset({
              fecha: "",
              jefeControl: "",
              frase: "",
              santoSena: "",
              contrasena: "",
            });
          }}
        >
          ❌
        </button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="fecha">Fecha</label>
            <input type="date" id="fecha" required {...register("fecha")} />
            {errors.fecha && <span>{errors.fecha.message}</span>}
          </div>
          <div>
            <label htmlFor="jefeControl">Jefe de Control</label>
            <input
              type="text"
              id="jefeControl"
              {...register("jefeControl")}
              required
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
            <input type="text" id="frase" required {...register("frase")} />
            {errors.frase && <span>{errors.frase.message}</span>}
          </div>
          <div>
            <label htmlFor="santoSeña">Santo Seña</label>
            <input
              type="text"
              id="santosenia"
              required
              {...register("santoSena")}
            />
            {errors.santosenia && <span>{errors.santosenia.message}</span>}
          </div>
          <div>
            <label htmlFor="contraseña">Contraseña</label>
            <input
              type="number"
              id="contrasena"
              required
              {...register("contrasena")}
            />
            {errors.contrasena && <span>{errors.contrasena.message}</span>}
          </div>
          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default FormOrden;
