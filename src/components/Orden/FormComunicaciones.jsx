import React, { useEffect } from "react";
import "./styles/FormComunicaciones.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import useCrud from "../../hooks/useCrud";
import IsLoading from "../shared/isLoading";

const FormComunicaciones = ({
  setShowFormComunicaciones,
  comunicadoEdit,
  setComunicadoEdit,
}) => {
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const PATH_COMUNICADOS = "/comunicados";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [
    comunicado,
    getComunicado,
    postComunicado,
    deleteApi,
    updateApi,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    postComunicadoFile,
    newRegFile,
    updateComunicadoFile,
    updateRegFile,
  ] = useCrud();

  useEffect(() => {
    loggedUser();
  }, []);

  useEffect(() => {
    if (comunicadoEdit) {
      reset(comunicadoEdit);
    }
    if (comunicadoEdit && updateRegFile) {
      setShowFormComunicaciones(false);
      setComunicadoEdit();
    }

    if (newRegFile) {
      setShowFormComunicaciones(false);
      setComunicadoEdit();
    }
  }, [comunicadoEdit, updateRegFile, newRegFile]);

  const sumbit = (data) => {
    const file = data?.urlFile?.[0] || null;

    if (!comunicadoEdit) {
      postComunicadoFile(
        PATH_COMUNICADOS,
        {
          ...data,
          usuarioRegistro: user.cI,
          usuarioEdicion: user.cI,
        },
        file
      );
    } else {
      updateComunicadoFile(
        PATH_COMUNICADOS,
        comunicadoEdit.id,
        file,
        {
          ...data,
          usuarioEdicion: user.cI,
        },
        file
      );
    }

    reset();
  };

  return (
    <div>
      {isLoading && <IsLoading />}
      <section className="comunicados_content">
        <h2>Registro de Comunicados</h2>

        <button
          className="close_btn"
          onClick={() => {
            setShowFormComunicaciones(false);
            setComunicadoEdit();
            reset();
          }}
        >
          ❌
        </button>
        <form onSubmit={handleSubmit(sumbit)}>
          <div>
            <label htmlFor="fechaInicio">Fecha de Inicio</label>
            <input
              type="date"
              id="fechaInicio"
              required
              {...register("fechaInicio")}
            />
          </div>
          <div>
            <label htmlFor="fechaFin">Fecha de Finalización</label>
            <input
              type="date"
              id="fechaFin"
              required
              {...register("fechaFin")}
            />
          </div>

          <label>
            <span>Documento Pdf: </span>
            <input
              type="file"
              accept="application/pdf"
              {...register("urlFile")}
            />
          </label>

          <div>
            <label htmlFor="comunicado">Comunicado</label>
            <textarea
              type="text"
              id="comunicado"
              required
              {...register("comunicado")}
            ></textarea>
          </div>

          <button type="submit">Registrar</button>
        </form>
      </section>
    </div>
  );
};

export default FormComunicaciones;
