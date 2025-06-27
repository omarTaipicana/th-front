import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import FormFormacion from "../../components/ParteDiario/FormFormacion";

import "./styles/ResumenGeneral.css";
import useCrud from "../../hooks/useCrud";
import TablaResumenParteGeneral from "./TablaResumenParteGeneral";
import InputPdf from "./InputPdf";

const ResumenGeneral = ({
  setShowEncargado,
  setShowFormFormacion,
  showFormFormacion,
  setShowDeleteFormacion,
  showDeleteFormacion,
  parte,
  servidores,
  novedades,
  setNewPdf,
  clouseFormacion,
}) => {
  const PATH_FORMACION = "/formacion";
  const PATH_SERVIDORES = "/servidores";
  const PATH_VARIABLES = "/variables";
  const PATH_PDF = "/parte_pdf";

  const [formacionDelete, setFormacionDelete] = useState();
  const [formacionEdit, setFormacionEdit] = useState();
  const [formacionActiva, setFormacionActiva] = useState(false);
  const [idFormacion, setIdFormacion] = useState();
  const [formacionActualFecha, setFormacionActualFecha] = useState();
  const [recargar, setRecargar] = useState(false);
  const [verActivo, setVerActivo] = useState(false);
  const [showInputPdf, setShowInputPdf] = useState(false);
  const [idUploadPdf, setIdUploadPdf] = useState();

  const [faltante, setFaltante] = useState();
  const [filter, setFilter] = useState("");

  const [resApi, getApi, , , , , isLoading, , ,] = useCrud();
  const [variables, getVariables] = useCrud();
  const [pdfData, getPdf] = useCrud();

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
    updateFormReg,
  ] = useCrud();

  useEffect(() => {
    loggedUser();
    getFormacion(PATH_FORMACION);
    getApi(PATH_SERVIDORES);
    getVariables(PATH_VARIABLES);
    getPdf(PATH_PDF);
  }, [showFormFormacion, updateFormReg, idUploadPdf, showInputPdf, recargar]);

  useEffect(() => {
    const hayFormacionActiva = formacion.some((form) => form.isAvailable);
    setFormacionActiva(hayFormacionActiva);
  }, [formacion]);

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

  const filteredFormacion = [...formacion]
    .sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora}`);
      return dateB - dateA;
    })
    .filter((form) => form?.usuarioRegistro === user?.cI)
    .filter((form) => {
      if (filter === "morning") {
        const hour = parseInt(form.hora.slice(0, 2), 10);
        return hour >= 7 && hour < 9;
      } else if (filter === "others") {
        const hour = parseInt(form.hora.slice(0, 2), 10);
        return hour < 7 || hour >= 9;
      }
      return true; // Mostrar todos si no hay filtro seleccionado
    });

  useEffect(() => {
    const countFaltante = [
      ...new Set(variables.map((variable) => variable.seccion)),
    ]
      .filter(Boolean)
      .filter(
        (seccion) =>
          !pdfData.some(
            (pdf) => pdf.seccion === seccion && pdf.formacionId === idFormacion
          )
      ).length;

    setFaltante(countFaltante);
  }, [variables, pdfData, idFormacion]);

  return (
    <section className="formacion_content">
      <section className="formacion_encargado_content">
        <button
          className="close_btn_formacion"
          onClick={() => {
            setShowEncargado(false);
            clouseFormacion();

            // reset();
          }}
        >
          ❌
        </button>

        <h2 className="parte_diario_title">
          PARTE GENERAL DE LA DIRECCIÓN GENERAL DE INVESTIGACIONES
        </h2>

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
                      setFormacionActualFecha(form);
                      setRecargar(!recargar);
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

        <section className="formacion_encargado_info_content">
          <section className="formacion_list_content">
            <button
              className="btn_encargado_opcion"
              onClick={() => setShowFormFormacion(true)}
            >
              Generar una nueva formación
            </button>

            <div className="formacion_filter">
              <select
                id="filterSelect"
                className="formacion_select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="morning">De las 08H00</option>
                <option value="others">Otros</option>
              </select>
            </div>
            <article className="formacion_list">
              {filteredFormacion.map((form) => {
                const matchedPdf = pdfData.find(
                  (pdf) => pdf.formacionId === form.id
                );

                return (
                  <section
                    className={`formacion_item ${
                      !form.isAvailable ? "formacion_inactiva" : ""
                    } ${
                      form.id === idFormacion ? "formacion_resaltada" : ""
                    }   ${!matchedPdf?.pdf && !form.isAvailable && "sin_pdf_color"}`} 
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

                    {!form.isAvailable && matchedPdf && (
                      <div>
                        {matchedPdf?.pdf ? (
                          <a
                            className="registros_btn"
                            href={matchedPdf.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              className="registros_icon"
                              src="../../../vista.png"
                              alt="Vista"
                            />
                          </a>
                        ) : (
                          <button
                            className="registros_btn"
                            onClick={() => {
                              setShowInputPdf(true);
                              setIdUploadPdf(matchedPdf.id);
                            }}
                          >
                            <img
                              className="registros_icon"
                              src="../../../subir.png"
                              alt="Subir"
                            />
                          </button>
                        )}
                        <button className="registros_btn">
                          <img
                            className="registros_icon"
                            src="../../../cargar.png"
                            alt="Ver"
                            onClick={() => {
                              setIdFormacion(form.id);
                              setFormacionActualFecha(form);
                              setVerActivo(true);
                            }}
                          />
                        </button>
                      </div>
                    )}
                  </section>
                );
              })}
            </article>
            {showInputPdf && (
              <InputPdf
                setShowInputPdf={setShowInputPdf}
                idUploadPdf={idUploadPdf}
              />
            )}
          </section>

          <article className="tabla_general">
            <TablaResumenParteGeneral
              user={user}
              parte={parte}
              servidores={servidores}
              idFormacion={idFormacion}
              setIdFormacion={setIdFormacion}
              novedades={novedades}
              formacionActualFecha={formacionActualFecha}
              setFormacionActualFecha={setFormacionActualFecha}
              setNewPdf={setNewPdf}
              faltante={faltante}
              updateFormacion={updateFormacion}
              verActivo={verActivo}
            />
          </article>

          <article className="lista_completos">
            <h2>SECCIONES REGISTRADAS</h2>
            {!idFormacion ? (
              <p className="selecciona_formacion">
                Selecciona una formación Activa
              </p>
            ) : (
              <>
                <p
                  className={`faltan_text ${
                    faltante === 0 && "faltante_en_cero"
                  }`}
                >
                  {" "}
                  {faltante === 0
                    ? "SECCIONES COMPLETAS"
                    : `Faltan: ${faltante}`}
                </p>
                <article className="secciones_list">
                  {[...new Set(variables.map((variable) => variable.seccion))]
                    .filter(Boolean)
                    .map((seccion, index) => {
                      const exists = pdfData.some(
                        (pdf) =>
                          pdf.seccion === seccion &&
                          pdf.formacionId === idFormacion
                      );
                      return (
                        <div
                          key={index}
                          className={`seccion_item ${
                            exists ? "completed" : "missing"
                          }`}
                        >
                          {seccion}
                        </div>
                      );
                    })}
                </article>
              </>
            )}
          </article>
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
