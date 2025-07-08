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
  const PATH_SERVIDORES = "/servidores";

  const dispatch = useDispatch();
  const formRef = useRef(null);

  const [variables, getVariables] = useCrud();
  const [servidores, getServidor] = useCrud();

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
    getServidor(PATH_SERVIDORES);
  }, []);

  // 1. Calcular fechaFin al cambiar fechaInicio y numDias
  useEffect(() => {
    const fechaInicio = watch("fechaInicio");
    const numDias = parseInt(watch("numDias"), 10);

    if (fechaInicio && !isNaN(numDias)) {
      const inicio = new Date(fechaInicio);
      // Restamos 1 día porque si del 7 al 7 es un día, sumar 0 debe dar el mismo día
      inicio.setDate(inicio.getDate() + (numDias - 1));
      const fechaFinCalculada = inicio.toISOString().split("T")[0];
      setValue("fechaFin", fechaFinCalculada);
    }
  }, [watch("fechaInicio"), watch("numDias")]);

  // 2. Calcular numDias al cambiar fechaInicio y fechaFin
  useEffect(() => {
    const fechaInicio = watch("fechaInicio");
    const fechaFin = watch("fechaFin");

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diferenciaMs = fin - inicio;

      if (diferenciaMs >= 0) {
        // Sumamos 1 para que del 7 al 7 sea 1 día
        const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;
        setValue("numDias", dias.toString());
      }
    }
  }, [watch("fechaInicio"), watch("fechaFin")]);

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

    const cleanedData = { ...data };

    // Campos de fecha
    ["fechaInicio", "fechaFin", "fechaDocumento"].forEach((key) => {
      const val = data[key];
      if (!val || isNaN(new Date(val).getTime())) {
        // Si no es fecha válida, elimínala del objeto
        delete cleanedData[key];
      } else {
        // Opcional: formatear a 'YYYY-MM-DD' para Postgres
        cleanedData[key] = new Date(val).toISOString().split("T")[0];
      }
    });

    // Campos de hora
    ["horaInicio", "horaFin"].forEach((key) => {
      const val = data[key];
      // Regex para formato HH:mm (24h)
      const horaValida = /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
      if (!val || !horaValida) {
        delete cleanedData[key];
      }
    });

    if (!novedadEdit) {
      postApiFile(
        PATH_NOVEDADES,
        {
          ...cleanedData,
          usuarioRegistro: user.cI,
          usuarioEdicion: user.cI,
          seccion: servidorPolicialEditNovedad.seccion,
          servidorPolicialId: servidorPolicialEditNovedad.id,
        },
        file
      );
    } else {
      updateApiFile(PATH_NOVEDADES, novedadEdit.id, file, {
        ...cleanedData,
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

  const capitalizar = (texto) => {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .split(" ")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };

  const novedadSeleccionada = watch("novedad");
  const mostrarHoras =
    novedadSeleccionada?.substring(0, 7).toLowerCase() === "permiso";

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
            {capitalizar(servidorPolicialEditNovedad.grado)}{" "}
            {capitalizar(servidorPolicialEditNovedad.nombres)}{" "}
            {capitalizar(servidorPolicialEditNovedad.apellidos)}
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
                      new Date(value) >= new Date(watch("fechaDocumento")))) ||
                  "La Fecha de Inicio debe estar entre la Fecha del Documento y la Fecha de Finalización",
              })}
            />
            {errors.fechaInicio && (
              <p className="error_message">{errors.fechaInicio.message}</p>
            )}
          </label>

          {!mostrarHoras && (
            <>
              {" "}
              <label className="label_novedades_user">
                <span className="span_novedades_user">Número de días: </span>
                <input
                  type="number"
                  className="input_novedades_user"
                  {...register("numDias")}
                />
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
                    validate: (value) => {
                      if (!value) return true; // permite valor en blanco
                      const inicio = new Date(watch("fechaInicio"));
                      const fin = new Date(value);
                      return (
                        fin >= inicio ||
                        "La Fecha de Finalización no puede ser menor a la Fecha de Inicio"
                      );
                    },
                  })}
                />
                {errors.fechaFin && (
                  <p className="error_message">{errors.fechaFin.message}</p>
                )}
              </label>
            </>
          )}

          {mostrarHoras && (
            <>
              <label className="label_novedades_user">
                <span className="span_novedades_user">Hora de Inicio </span>
                <input
                  type="time"
                  className="input_novedades_user"
                  {...register("horaInicio")}
                  required
                />
              </label>

              <label className="label_novedades_user">
                <span className="span_novedades_user">
                  Hora de Finalización
                </span>
                <input
                  type="time"
                  className={`input_novedades_user ${
                    errors.horaFin ? "input_error" : ""
                  }`}
                  {...register("horaFin", {
                    required: "La hora de finalización es obligatoria",
                    validate: (value) => {
                      const horaInicio = watch("horaInicio");
                      if (!horaInicio || !value) return true;
                      return (
                        value >= horaInicio ||
                        "La Hora de Finalización no puede ser menor a la de Inicio"
                      );
                    },
                  })}
                />
                {errors.horaFin && (
                  <p className="error_message">{errors.horaFin.message}</p>
                )}
              </label>
            </>
          )}

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
                <th>Documento</th>
                <th>Editar</th>
                <th>Eliminar</th>
                <th>Novedad</th>
                <th>Descripción</th>
                <th>Tipo de Documento</th>
                <th>Número de Documento</th>
                <th>Tiempo</th>
                <th>Fecha de Documento</th>
                <th>Fecha de Inicio</th>
                <th>Fecha de Finalización</th>
                <th>Hora de Inicio</th>
                <th>Hora de Finalización</th>
                <th>Usuario de Registro</th>
                <th>Usuario de Edición</th>
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
                    className={(() => {
                      const hoyStr = new Date().toISOString().split("T")[0];

                      // Si no hay fechaFin, se considera "activo"
                      if (!nov?.fechaFin) return "activo";

                      const fechaFinStr = new Date(nov.fechaFin)
                        .toISOString()
                        .split("T")[0];

                      return fechaFinStr >= hoyStr ? "activo" : "no_activo";
                    })()}
                    key={nov.id}
                  >
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
                    <td data-label="Novedad">{nov.novedad}</td>
                    <td data-label="Descripción">{nov.descripcion}</td>
                    <td data-label="Tipo de Documento">{nov.tipoDocumento}</td>
                    <td data-label="Número de Documento">{nov.numDocumento}</td>
                    <td data-label="Tiempo">
                      {(() => {
                        const { horaInicio, horaFin, fechaInicio, fechaFin } =
                          nov;

                        // Función para calcular diferencia en horas y minutos entre dos horas 'HH:mm'
                        const diferenciaHorasMinutos = (hInicio, hFin) => {
                          if (!hInicio || !hFin) return null;
                          const [hiH, hiM] = hInicio.split(":").map(Number);
                          const [hfH, hfM] = hFin.split(":").map(Number);

                          let inicio = hiH * 60 + hiM;
                          let fin = hfH * 60 + hfM;

                          let diffMinutos = fin - inicio;
                          if (diffMinutos < 0) diffMinutos += 24 * 60; // si horaFin es pasada la medianoche

                          const horas = Math.floor(diffMinutos / 60);
                          const minutos = diffMinutos % 60;

                          return `${horas}h ${minutos}m`;
                        };

                        if (horaInicio && horaFin) {
                          const diffHM = diferenciaHorasMinutos(
                            horaInicio,
                            horaFin
                          );
                          return diffHM !== null ? diffHM : "Sin dato";
                        } else if (fechaInicio && fechaFin) {
                          const inicio = new Date(fechaInicio);
                          const fin = new Date(fechaFin);
                          const diffDias =
                            Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) +
                            1;

                          return diffDias > 0 ? `${diffDias} días` : "Sin dato";
                        } else {
                          return <span className="sin_dato">Sin dato</span>;
                        }
                      })()}
                    </td>
                    <td data-label="Fecha de Documento">
                      {nov.fechaDocumento}
                    </td>
                    <td data-label="Fecha de Inicio">{nov.fechaInicio}</td>
                    <td data-label="Fecha de Finalización">
                      {nov.fechaFin ? (
                        nov.fechaFin
                      ) : !nov.novedad?.toLowerCase().startsWith("permiso") ? (
                        <span className="sin_dato">🛑 Sin fecha</span>
                      ) : (
                        "Sin fecha"
                      )}
                    </td>
                    <td data-label="Fecha de Inicio">{nov.horaInicio}</td>

                    <td data-label="Fecha de Inicio">{nov.horaInicio}</td>
                    <td data-label="Usuario de Registro">
                      {(() => {
                        const servidor = servidores.find(
                          (srv) => srv.cI === nov.usuarioRegistro
                        );
                        return servidor
                          ? `${servidor.grado} ${servidor.nombres} ${servidor.apellidos}`
                          : nov.userRegistro || "Desconocido";
                      })()}
                    </td>
                    <td data-label="Usuario de Edicion">
                      {(() => {
                        const servidor = servidores.find(
                          (srv) => srv.cI === nov.usuarioEdicion
                        );
                        return servidor
                          ? `${servidor.grado} ${servidor.nombres} ${servidor.apellidos}`
                          : nov.userRegistro || "Desconocido";
                      })()}
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
