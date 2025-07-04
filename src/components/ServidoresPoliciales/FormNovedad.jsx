import React, { useEffect, useRef, useState } from "react";
import "./styles/FormNovedad.css";
import useAuth from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import useCrud from "../../hooks/useCrud";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import IsLoading from "../shared/isLoading";

const FormNovedad = ({ servidorPolicialEditNovedad, setShowNovedad }) => {
  const [novedadDelete, setNovedadDelete] = useState();
  const [showDeleteNovedad, setShowDeleteNovedad] = useState(false);
  const [novedadEdit, setNovedadEdit] = useState();

  const PATH_NOVEDADES = "/novedades";
  const PATH_VARIABLES = "/variables";

  const dispatch = useDispatch();
  const formRef = useRef(null);

  const [variables, getVariables] = useCrud();
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
    postApiFile,
    newRegFile,
    updateApiFile,
    updateRegFile,
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
    getApi(PATH_NOVEDADES);
    getVariables(PATH_VARIABLES);
  }, []);

  useEffect(() => {
    if (novedadEdit && variables.length > 0) {
      reset(novedadEdit);
    }
  }, [novedadEdit, variables, reset]);

  useEffect(() => {
    if (error) {
      dispatch(
        showAlert({
          message: `⚠️ ${error.response?.data?.message}` || "Error inesperado",
          alertType: 1,
        })
      );
    }
  }, [error]);

  useEffect(() => {
    if (newRegFile) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se creo correctamente la novedad  ${newRegFile.novedad}` ||
            "Error inesperado",

          alertType: 2,
        })
      );
    }
  }, [newRegFile]);

  useEffect(() => {
    if (updateRegFile) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se actualizó correctamente la novedad  ${updateRegFile.novedad}` ||
            "Error inesperado",

          alertType: 3,
        })
      );
    }
  }, [updateRegFile]);

  useEffect(() => {
    if (deleteReg) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se eliminó correctamente la novedad  ${deleteReg.novedad}` ||
            "Error inesperado",

          alertType: 1,
        })
      );
    }
  }, [deleteReg]);

  const submitNovedad = (data) => {
    const file = data?.urlDoc?.[0] || null;

    if (!novedadEdit) {
      postApiFile(
        PATH_NOVEDADES,
        {
          ...data,
          usuarioRegistro: user.cI,
          usuarioEdicion: user.cI,
          seccion: servidorPolicialEditNovedad.seccion,
          servidorPolicialId: servidorPolicialEditNovedad.id,
        },
        file
      );
    } else {
      updateApiFile(PATH_NOVEDADES, novedadEdit.id, file, {
        ...data,
        usuarioEdicion: user.cI,
      });
    }
    reset({
      novedad: "",
    });
    setNovedadEdit();
  };

  const handleDeleteNovedad = () => {
    deleteApi(PATH_NOVEDADES, novedadDelete.id);
    setShowDeleteNovedad(false);
  };

  const ultimaNovedad = resApi
    .filter((nov) => nov.servidorPolicialId === servidorPolicialEditNovedad.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const validacionActivo =
    ultimaNovedad?.fechaFin &&
    (() => {
      const hoyStr = new Date().toISOString().split("T")[0];
      const fechaFinStr = new Date(ultimaNovedad.fechaFin)
        .toISOString()
        .split("T")[0];

      return fechaFinStr >= hoyStr ? true : false;
    })();

  return (
    <div>
      {isLoading && <IsLoading />}
      <article className="user_novedades_content">
        <div className="number_novedad_content">
          <div className="number_novedad">
            {
              resApi.filter(
                (nov) =>
                  nov.servidorPolicialId === servidorPolicialEditNovedad.id
              ).length
            }{" "}
            Registro
            {resApi.filter(
              (nov) => nov.servidorPolicialId === servidorPolicialEditNovedad.id
            ).length > 1
              ? "s"
              : ""}{" "}
            de Novedad
          </div>
        </div>

        <button
          className="close_btn"
          onClick={() => {
            setShowNovedad(false);
            reset();
          }}
        >
          ❌
        </button>
        <span ref={formRef}>
          <h3>
            {`Registre la Novedad ${
              servidorPolicialEditNovedad.sexo === "Hombre" ? "del" : "de la"
            } Servidor${
              servidorPolicialEditNovedad.sexo === "Hombre" ? "" : "a"
            } Policial `}
            {servidorPolicialEditNovedad.nombres}{" "}
            {servidorPolicialEditNovedad.apellidos}
          </h3>
        </span>
        <form
          onSubmit={handleSubmit(submitNovedad)}
          className="form_novedades_content"
        >
            <label className="label_novedades_user">
              <span className="span_novedades_user">Novedad: </span>
              <select
                className="input_novedades_user"
                required
                {...register("novedad")}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Seleccione un novedad --
                </option>
                {Array.from(
                  new Set(variables.map((v) => v.novedad).filter(Boolean))
                ).map((novedad, index) => (
                  <option key={index} value={novedad}>
                    {novedad}
                  </option>
                ))}
              </select>
            </label>

            <label className="label_novedades_user">
              <span className="span_novedades_user">Descripción: </span>
              <input
                type="text"
                className="input_novedades_user"
                {...register("descripcion")}
                required
              />
            </label>

            <label className="label_novedades_user">
              <span className="span_novedades_user">Tipo de Documento: </span>
              <select
                className="input_novedades_user"
                required
                {...register("tipoDocumento")}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Seleccione un tipo de Documento --
                </option>
                {Array.from(
                  new Set(variables.map((v) => v.tipoDocumento).filter(Boolean))
                ).map((tipoDocumento, index) => (
                  <option key={index} value={tipoDocumento}>
                    {tipoDocumento}
                  </option>
                ))}
              </select>
            </label>

            <label className="label_novedades_user">
              <span className="span_novedades_user">Número de Documento: </span>
              <input
                type="text"
                className="input_novedades_user"
                {...register("numDocumento")}
                required
              />
            </label>

            <label className="label_novedades_user">
              <span className="span_novedades_user">Fecha del Documento: </span>
              <input
                type="date"
                className={`input_novedades_user ${
                  errors.fechaDocumento ? "input_error" : ""
                }`}
                {...register("fechaDocumento", {
                  required: "La fecha del documento es obligatoria",
                  validate: (value) =>
                    !watch("fechaInicio") ||
                    new Date(value) <= new Date(watch("fechaInicio")) ||
                    "La Fecha del Documento no puede ser mayor a la Fecha de Inicio",
                })}
              />
              {errors.fechaDocumento && (
                <p className="error_message">{errors.fechaDocumento.message}</p>
              )}
            </label>

            <label className="label_novedades_user">
              <span className="span_novedades_user">Fecha de Inicio: </span>
              <input
                type="date"
                className={`input_novedades_user ${
                  errors.fechaInicio ? "input_error" : ""
                }`}
                {...register("fechaInicio", {
                  required: "La fecha de inicio es obligatoria",
                  validate: (value) =>
                    ((!watch("fechaFin") ||
                      new Date(value) <= new Date(watch("fechaFin"))) &&
                      (!watch("fechaDocumento") ||
                        new Date(value) >=
                          new Date(watch("fechaDocumento")))) ||
                    "La Fecha de Inicio debe estar entre la Fecha del Documento y la Fecha de Finalización",
                })}
              />
              {errors.fechaInicio && (
                <p className="error_message">{errors.fechaInicio.message}</p>
              )}
            </label>

            <label className="label_novedades_user">
              <span className="span_novedades_user">
                Fecha de Finalización:{" "}
              </span>
              <input
                type="date"
                className={`input_novedades_user ${
                  errors.fechaFin ? "input_error" : ""
                }`}
                {...register("fechaFin", {
                  required: "La fecha de finalización es obligatoria",
                  validate: (value) =>
                    !watch("fechaInicio") ||
                    new Date(value) >= new Date(watch("fechaInicio")) ||
                    "La Fecha de Finalización no puede ser menor a la Fecha de Inicio",
                })}
              />
              {errors.fechaFin && (
                <p className="error_message">{errors.fechaFin.message}</p>
              )}
            </label>

            <label className="label_novedades_user">
              <span className="span_novedades_user">Documento: </span>
              <input
                type="file"
                accept="application/pdf"
                className="input_novedades_user"
                {...register("urlDoc")}
              />
            </label>
      
          <button>{novedadEdit ? "Editar" : "Guardar"}</button>
        </form>

        {showDeleteNovedad && (
          <article className="user_delet_content">
            <span>¿Deseas eliminar la novedad {novedadDelete.novedad} ?</span>
            <section className="btn_content">
              <button className="btn yes" onClick={handleDeleteNovedad}>
                Sí
              </button>
              <button
                className="btn no"
                onClick={() => {
                  setShowDeleteNovedad(false);
                  setNovedadDelete();
                }}
              >
                No
              </button>
            </section>
          </article>
        )}

        <section className="table_wrapper">
          <table>
            <thead>
              <tr>
                <th>Novedad</th>
                <th>Descripción</th>
                <th>Tipo de Documento</th>
                <th>Número de Documento</th>
                <th>Fecha de Documento</th>
                <th>Fecha de Inicio</th>
                <th>Fecha de Finalización</th>
                <th>Documento</th>
                <th>Editar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {resApi
                .filter(
                  (nov) =>
                    nov.servidorPolicialId === servidorPolicialEditNovedad.id
                )
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Orden descendente
                .map((nov) => (
                  <tr
                    className={
                      nov?.fechaFin &&
                      (() => {
                        const hoyStr = new Date().toISOString().split("T")[0]; // Ej: "2025-06-09"
                        const fechaFinStr = new Date(nov.fechaFin)
                          .toISOString()
                          .split("T")[0];

                        return fechaFinStr >= hoyStr ? "activo" : "no_activo";
                      })()
                    }
                    key={nov.id}
                  >
                    <td data-label="Novedad">{nov.novedad}</td>
                    <td data-label="Descripción">{nov.descripcion}</td>
                    <td data-label="Tipo de Documento">{nov.tipoDocumento}</td>
                    <td data-label="Número de Documento">{nov.numDocumento}</td>
                    <td data-label="Fecha de Documento">
                      {nov.fechaDocumento}
                    </td>
                    <td data-label="Fecha de Inicio">{nov.fechaInicio}</td>
                    <td data-label="Fecha de Finalización">{nov.fechaFin}</td>
                    <td
                      className={nov.urlDoc ? "" : "archivo_faltante"} // Clase condicional
                    >
                      <a
                        href={nov.urlDoc || "#"} // Si no hay URL, desactiva el enlace
                        target={nov.urlDoc ? "_blank" : undefined} // Solo abre en una nueva pestaña si hay archivo
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!nov.urlDoc) {
                            e.preventDefault(); // Previene la acción si no hay URL
                            alert(
                              "Debe subir el archivo para habilitar esta opción."
                            );
                          }
                        }}
                      >
                        <img
                          className="user_icon_btn"
                          src={`../../../${nov.urlDoc ? "vista" : "up"}.png`}
                          alt={nov.urlDoc ? "Abrir Documento" : "Subir Archivo"}
                        />
                      </a>
                    </td>

                    <td>
                      <img
                        className="user_icon_btn"
                        src="../../../edit.png"
                        alt="Editar"
                        onClick={() => {
                          setNovedadEdit(nov);
                          setTimeout(() => {
                            formRef.current?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }, 100);
                        }}
                      />
                    </td>
                    <td>
                      <img
                        className="user_icon_btn"
                        src="../../../delete_3.png"
                        alt="Eliminar"
                        onClick={() => {
                          setShowDeleteNovedad(true);
                          setNovedadDelete(nov);
                        }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </article>
    </div>
  );
};

export default FormNovedad;
