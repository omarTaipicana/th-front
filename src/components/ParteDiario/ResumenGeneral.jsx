import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import FormFormacion from "../../components/ParteDiario/FormFormacion";

import "./styles/ResumenGeneral.css";
import useCrud from "../../hooks/useCrud";
import TablaResumenParteGeneral from "./TablaResumenParteGeneral";

const ResumenGeneral = ({
  setShowEncargado,
  setShowFormFormacion,
  showFormFormacion,
  setShowDeleteFormacion,
  showDeleteFormacion,
  parte,
  servidores,
  idFormacion,
  novedades,
  formacionActualFecha,

  setNewPdf,
}) => {
  const PATH_FORMACION = "/formacion";

  const [formacionDelete, setFormacionDelete] = useState();
  const [formacionEdit, setFormacionEdit] = useState();

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
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

  useEffect(() => {
    loggedUser();
    getFormacion(PATH_FORMACION);
  }, [showFormFormacion]);

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

  const handleDeleteFormacion = () => {
    deleteFormacion(PATH_FORMACION, formacionDelete.id);
    setShowDeleteFormacion();
  };

  return (
    <section className="formacion_content">
      <section className="formacion_encargado_content">
        <button
          className="close_btn_formacion"
          onClick={() => {
            setShowEncargado(false);
            // reset();
          }}
        >
          ❌
        </button>

        <h2 className="parte_diario_title">
          PARTE GENERAL DE LA DIRECCIÓN GENERAL DE INVESTIGACIONES
        </h2>

        <section className="formacion_encargado_info_content">
          <section className="formacion_list_content">
            <button
              className="btn_encargado_opcion"
              onClick={() => setShowFormFormacion(true)}
            >
              Generar una nueva formacion
            </button>
            <article className="formacion_list">
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

          <article className="tabla_general">
            <TablaResumenParteGeneral
              user={user}
              parte={parte}
              servidores={servidores}
              idFormacion={idFormacion}
              novedades={novedades}
              formacionActualFecha={formacionActualFecha}
              setNewPdf={setNewPdf}
            />
          </article>

          <article className="lista_completos">LISTA DE COMPLETADOS</article>
        </section>

        <section className="hide-show">
          {showFormFormacion && (
            <FormFormacion
              setShowFormFormacion={setShowFormFormacion}
              formacionEdit={formacionEdit}
              submitFormacion={submitFormacion}
            />
          )}
          {showDeleteFormacion && (
            <article className="user_delet_content">
              <span>
                ¿Deseas eliminar la formacion de la fecha{" "}
                {formacionDelete.fecha} y hora {formacionDelete.hora} ?
              </span>

              <section className="btn_content">
                <button
                  className="btn_encargado_opcion btn yes"
                  onClick={handleDeleteFormacion}
                >
                  Sí
                </button>
                <button
                  className=" btn_encargado_opcion btn no"
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
        </section>
      </section>
    </section>
  );
};

export default ResumenGeneral;
