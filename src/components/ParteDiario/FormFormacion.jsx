import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import "./styles/FormFormacion.css";
import useAuth from "../../hooks/useAuth";
import useCrud from "../../hooks/useCrud";
import IsLoading from "../shared/isLoading";

const FromFrmacion = ({
  setShowFormFormacion,
  formacionEdit,
  setFormacionEdit,
}) => {
  const PATH_FORMACION = "/formacion";

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

  const {
    register,
    handleSubmit,
    reset,
    value,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loggedUser();
  }, []);

  useEffect(() => {
    reset(formacionEdit);
  }, [formacionEdit]);

  const submit = (data) => {
    if (!formacionEdit) {
      postApi(PATH_FORMACION, {
        ...data,
        usuarioRegistro: user.cI,
        usuarioEdicion: user.cI,
      });
    } else {
      updateApi(PATH_FORMACION, formacionEdit.id, {
        ...data,
        usuarioRegistro: user.cI,
        usuarioEdicion: user.cI,
      });
    }
    setFormacionEdit();
    setShowFormFormacion(false);
  };

  return (
    <div>
      {isLoading && <IsLoading />}

      <article className="user_formacion_content">
        <button
          className="close_btn_formacion"
          onClick={() => {
            setShowFormFormacion(false);
            // reset();
          }}
        >
          ❌
        </button>

        <h3>Genere una nueva Formación</h3>

        <form
          onSubmit={handleSubmit(submit)}
          className="form_formacion_content"
        >
          <div className="form_input_content">
            <label className="label_formacion_user">
              <span className="span_formacion_user">Fecha: </span>
              <input
                type="date"
                className="input_formacion_user"
                {...register("fecha")}
                required
              />
            </label>
            <label className="label_formacion_user">
              <span className="span_formacion_user">Hora: </span>
              <input
                type="time"
                className="input_formacion_user"
                {...register("hora")}
                required
              />
            </label>
          </div>
          <button>
            {formacionEdit ? "Editar Formación" : "Crear Formación"}
          </button>
        </form>
      </article>
    </div>
  );
};

export default FromFrmacion;
