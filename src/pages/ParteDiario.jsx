import React, { useEffect, useState } from "react";
import "./styles/Parte.css";
import useAuth from "../hooks/useAuth";
import useCrud from "../hooks/useCrud";
import FormFormacion from "../components/ParteDiario/FormFormacion";
import IsLoading from "../components/shared/isLoading";
import TablaResumenParte from "../components/ParteDiario/TablaResumenParte";



const ParteDiario = () => {
  const [formState, setFormState] = useState({});
  const [showFormFormacion, setShowFormFormacion] = useState(false);
  const [showDeleteFormacion, setShowDeleteFormacion] = useState(false);
  const [formacionEdit, setFormacionEdit] = useState();
  const [formacionDelete, setFormacionDelete] = useState();
  const [formacionActiva, setFormacionActiva] = useState(false);
  const [formacionActual, setFormacionActual] = useState();
  const [idFormacion, setIdFormacion] = useState();
  const [editandoId, setEditandoId] = useState(null);

  const PATH_SERVIDORES = "/servidores";
  const PATH_NOVEDADES = "/novedades";
  const PATH_FORMACION = "/formacion";
  const PATH_PARTE = "/parte_diario";

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [resApi, getApi, , , , , isLoading, , ,] = useCrud();
  const [novedades, getNovedades, , deleteNovedades, , , , , ,] = useCrud();

  const [
    formacion,
    getFormacion,
    postFormacion,
    deleteFormacion,
    updateFormacion,
    ,
    ,
    newFormacion,
    ,
  ] = useCrud();

  const [
    parte,
    getParte,
    postParte,
    deleteParte,
    updateParte,
    error,
    ,
    newReg,
    deleteReg,
    updateReg,
  ] = useCrud();

  useEffect(() => {
    loggedUser();
    getApi(PATH_SERVIDORES);
    getFormacion(PATH_FORMACION);
    getParte(PATH_PARTE);
    getNovedades(PATH_NOVEDADES);
  }, [showFormFormacion, newFormacion]);

  useEffect(() => {
    const hayFormacionActiva = formacion.some((form) => form.isAvailable);
    setFormacionActiva(hayFormacionActiva);
  }, [formacion]);

  const handleInputChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const submitFormacion = (data) => {
    if (!formacionEdit) {
      postFormacion(PATH_FORMACION, {
        ...data,
        usuarioRegistro: user.cI,
        usuarioEdicion: user.cI,
      });
    } else {
      updateFormacion(PATH_FORMACION, formacionEdit.id, {
        ...data,
        usuarioRegistro: user.cI,
        usuarioEdicion: user.cI,
      });
    }
    setFormacionEdit();
    setShowFormFormacion(false);
  };

  const handleGuardar = (serv) => {
    const datos = formState[serv.id];
    if (!datos?.registro) return;

    const payload = {
      servidorPolicialId: serv.id,
      formacionId: idFormacion,
      registro: datos.registro,
      detalle: datos.detalle,
      seccion: user.seccion,
      usuarioRegistro: user.cI,
      usuarioEdicion: user.cI,
    };

    postParte(PATH_PARTE, payload);
  };

  const handleEditParte = (serv, parteId) => {
    const parteExistente = parte.find(
      (p) => p.formacionId === idFormacion && p.servidorPolicialId === serv.id
    );

    if (!parteExistente) return;

    setFormState((prev) => ({
      ...prev,
      [serv.id]: {
        registro: parteExistente.registro,
        detalle: parteExistente.detalle,
      },
    }));

    setEditandoId(serv.id); // <--- Activamos la edición
  };

  const handleDeleteFormacion = () => {
    deleteFormacion(PATH_FORMACION, formacionDelete.id);
    setShowDeleteFormacion();
  };

  const handleGuardarEdicion = (serv, parteId) => {
    const datos = formState[serv.id];
    if (!datos?.registro) return;

    const payload = {
      registro: datos.registro,
      detalle: datos.detalle,
      usuarioEdicion: user.cI,
    };

    updateParte(PATH_PARTE, parteId, payload);
    setEditandoId(null); // <--- Salimos del modo edición
  };

  return (
    <div className="partediario_content">
      {isLoading && <IsLoading />}

      <h2 className="parte_diario_title">
        Parte Diario de Novedades de Planta Central de la Dirección General de
        Investigaciones
      </h2>
      <section>
        {showFormFormacion && (
          <FormFormacion
            setShowFormFormacion={setShowFormFormacion}
            formacionEdit={formacionEdit}
            submitFormacion={submitFormacion}
          />
        )}
      </section>

      {showDeleteFormacion && (
        <article className="user_delet_content">
          <span>
            ¿Deseas eliminar la formacion de la fecha {formacionDelete.fecha} y
            hora {formacionDelete.hora} ?
          </span>

          <section className="btn_content">
            <button className="btn yes" onClick={handleDeleteFormacion}>
              Sí
            </button>
            <button
              className="btn no"
              onClick={() => {
                setShowDeleteFormacion(false);
                setFormacionDelete();
              }}
            >
              No
            </button>
          </section>
        </article>
      )}

      {formacionActiva && (
        <article className="formacion_activa_container">
          {[...formacion]
            .sort((a, b) => {
              const dateA = new Date(`${a.fecha}T${a.hora}`);
              const dateB = new Date(`${b.fecha}T${b.hora}`);
              return dateB - dateA;
            })
            .filter((form) => form.isAvailable)
            .map((form) => {
              const usuario = resApi.find(
                (serv) => serv?.cI === form?.usuarioRegistro
              );

              return (
                <section
                  onClick={() => {
                    setIdFormacion(form.id);
                    setFormacionActual(form);
                  }}
                  className="formacion_item"
                  key={form.id}
                >
                  <div>
                    Anexarse a la formación de la fecha{" "}
                    <strong>{form.fecha}</strong> y hora{" "}
                    <strong>{form.hora}</strong> creado por el encargado{" "}
                    {usuario?.grado} {usuario?.nombres} {usuario?.apellidos}
                  </div>
                </section>
              );
            })}
        </article>
      )}

      <article className="partediario_seccion_content">
        <section className="table_section_parte">
          <h3 className="title_table_parte">
            {
              resApi.filter(
                (serv) =>
                  serv?.seccion === user?.seccion &&
                  serv?.enLaDireccion === "Si"
              ).length
            }{" "}
            SERVIDORES POLICIALES POR REGISTRAR
          </h3>
          <div>
            <table className="servidores_table_parte">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Registro</th>
                  <th>Detalle</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {resApi
                  .filter((serv) => {
                    const tieneNovedadActiva = novedades.some((n) => {
                      const fechaFormacion = new Date(formacionActual?.fecha);
                      const inicio = new Date(n.fechaInicio);
                      const fin = new Date(n.fechaFin);

                      return (
                        n.servidorPolicialId === serv.id &&
                        n.seccion === user?.seccion &&
                        fechaFormacion >= inicio &&
                        fechaFormacion <= fin
                      );
                    });

                    return (
                      serv?.seccion === user?.seccion &&
                      serv?.enLaDireccion === "Si" &&
                      !tieneNovedadActiva
                    );
                  })
                  .map((serv) => (
                    <tr key={serv.id}>
                      <td>
                        {serv.grado} {serv.nombres} {serv.apellidos}
                      </td>
                      <td>
                        <select
                          disabled={!idFormacion}
                          value={formState[serv.id]?.registro || ""}
                          onChange={(e) =>
                            handleInputChange(
                              serv.id,
                              "registro",
                              e.target.value
                            )
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
                          disabled={!idFormacion}
                          type="text"
                          value={formState[serv.id]?.detalle || ""}
                          onChange={(e) =>
                            handleInputChange(
                              serv.id,
                              "detalle",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        {(() => {
                          const parteExistente = parte.find(
                            (p) =>
                              p.formacionId === idFormacion &&
                              p.servidorPolicialId === serv.id
                          );

                          const yaRegistrado = !!parteExistente;

                          if (yaRegistrado) {
                            const esEditando = editandoId === serv.id;

                            return esEditando ? (
                              <button
                                onClick={() =>
                                  handleGuardarEdicion(serv, parteExistente.id)
                                }
                                className="guardar_btn"
                              >
                                GUARDAR
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleEditParte(serv, parteExistente.id)
                                }
                                className="guardar_btn editar_btn"
                              >
                                EDITAR
                              </button>
                            );
                          } else {
                            return (
                              <button
                                onClick={() => handleGuardar(serv)}
                                disabled={!idFormacion}
                                className={`guardar_btn ${
                                  idFormacion ? "guardar_btn" : "btn_blank"
                                }`}
                              >
                                {idFormacion ? "GUARDAR" : ""}
                              </button>
                            );
                          }
                        })()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="reporte_content">
          <TablaResumenParte
            parte={parte}
            servidores={resApi}
            idFormacion={idFormacion}
            novedades={novedades}
            formacionActualFecha={formacionActual}
          />
        </section>

        <section className="registros_content">
          <h2>registros parte</h2>
        </section>

        <section className="formacion_content">
          <button onClick={() => setShowFormFormacion(true)}>
            Generar una nueva formacion
          </button>
          <article className="formacion_container">
            {[...formacion]
              .sort((a, b) => {
                const dateA = new Date(`${a.fecha}T${a.hora}`);
                const dateB = new Date(`${b.fecha}T${b.hora}`);
                return dateB - dateA;
              })
              .filter((form) => form?.usuarioRegistro === user?.cI)
              .map((form) => (
                <section
                  className={`formacion_item ${
                    !form.isAvailable ? "formacion_inactiva" : ""
                  }`}
                  key={form.id}
                >
                  <div>
                    Formación de la fecha <strong>{form.fecha}</strong> y hora{" "}
                    <strong>{form.hora}</strong>
                  </div>
                  {form.isAvailable && (
                    <div>
                      <img
                        className="user_icon_btn"
                        src="../../../edit.png"
                        alt="Editar"
                        onClick={() => {
                          setFormacionEdit(form);
                          setShowFormFormacion(true);
                        }}
                      />
                      <img
                        className="user_icon_btn"
                        src="../../../delete_3.png"
                        alt="Eliminar"
                        onClick={() => {
                          setFormacionDelete(form);
                          setShowDeleteFormacion(true);
                        }}
                      />
                    </div>
                  )}
                </section>
              ))}
          </article>
        </section>
      </article>
    </div>
  );
};

export default ParteDiario;
