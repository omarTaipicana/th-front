import React, { useEffect, useState } from "react";
import useCrud from "../hooks/useCrud";
import { useForm } from "react-hook-form";
import "./styles/Orden.css";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";
import FormOrden from "../components/Orden/FormOrden";
import FormComunicaciones from "../components/Orden/FormComunicaciones";
import OrdenInputPdf from "../components/Orden/OrdenInputPdf";

const Orden = () => {
  const PATH_ORDEN = "/orden";
  const PATH_SERVIDORES = "/servidores";
  const PATH_FORMACION = "/formacion";
  const PATH_COMUNICADOS = "/comunicados";

  const dispatch = useDispatch();

  const [servidores, getServidor] = useCrud();
  const [formacion, getFormacion] = useCrud();
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [showFormOrden, setShowFormOrden] = useState(false);
  const [showFormComunicaciones, setShowFormComunicaciones] = useState(false);
  const [showFormDelete, setShowFormDelete] = useState(false);
  const [showFormDeleteCom, setShowFormDeleteCom] = useState(false);
  const [hoveredComunicado, setHoveredComunicado] = useState(null);
  const [showInputPdf, setShowInputPdf] = useState(false);
  const [idUploadPdf, setIdUploadPdf] = useState();
  const [ordenEdit, setOrdenEdit] = useState();
  const [comunicadoEdit, setComunicadoEdit] = useState();
  const [ordenDelete, setOrdenDelete] = useState();
  const [comunicadoDelete, setComunicadoDelete] = useState();
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

  const [
    comunicados,
    getComunicados,
    postComunicados,
    deleteComunicado,
    updateComunicado,
    ,
    ,
    ,
    deleteRegComunicado,
    updateRegComunicado,
    postComunicadosFile,
    newRegFileComunicado,
    updateComunicadosFile,
    updateRegFileComunicado,
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
    getOrden(PATH_ORDEN);
    getServidor(PATH_SERVIDORES);
    getFormacion(PATH_FORMACION);
    getComunicados(PATH_COMUNICADOS);
  }, [showFormOrden, showFormDelete, showInputPdf, showFormComunicaciones]);

  const handleDelete = () => {
    deleteApi(PATH_ORDEN, ordenDelete.id);
    setShowFormDelete(false);
    setOrdenDelete();
  };

  const handleDeleteCom = () => {
    deleteComunicado(PATH_COMUNICADOS, comunicadoEdit.id);
    setShowFormDeleteCom(false);
    setComunicadoDelete();
  };

  useEffect(() => {
    if (deleteReg) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se eliminó correctamente la orden número ${deleteReg.orden} ` ||
            "Error inesperado",

          alertType: 3,
        })
      );
    }
  }, [deleteReg]);

  return (
    <div className="orden_cuerpo_content">
      <article>
        {showFormDelete && (
          <article className="user_delet_content">
            <span>¿Deseas eliminar la orden {ordenDelete.numOrden} ?</span>
            <section className="btn_content">
              <button onClick={handleDelete} className="btn yes">
                Sí
              </button>
              <button
                className="btn no"
                onClick={() => {
                  setShowFormDelete(false);
                  setOrdenDelete();
                }}
              >
                No
              </button>
            </section>
          </article>
        )}

        {showFormDeleteCom && (
          <article className="user_delet_content">
            <span>¿Deseas eliminar el comunicado ?</span>
            <section className="btn_content">
              <button onClick={handleDeleteCom} className="btn yes">
                Sí
              </button>
              <button
                className="btn no"
                onClick={() => {
                  setShowFormDeleteCom(false);
                  setComunicadoDelete();
                }}
              >
                No
              </button>
            </section>
          </article>
        )}
      </article>
      <section className="table_orden_content">
        <h2 className="orden_title">Orden del Cuerpo</h2>
        <button
          className="orden_btn"
          onClick={() => {
            setShowFormOrden(true);
            setShowFormComunicaciones(false);
          }}
        >
          Crear nueva Orden
        </button>
        {showFormOrden && (
          <FormOrden
            servidores={servidores}
            setShowFormOrden={setShowFormOrden}
            ordenEdit={ordenEdit}
            setOrdenEdit={setOrdenEdit}
          />
        )}
        <article className="table_wrapper_orden table_ord">
          <table>
            <thead>
              <tr>
                <th>Acción</th>
                <th>Fecha:</th>
                <th>Numero:</th>
                <th>Frase:</th>
                <th>Santo y Seña:</th>
                <th>Contraseña: </th>
                <th>Jefe de Control:</th>
                <th>Generar:</th>
              </tr>
            </thead>
            <tbody>
              {[...orden]
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // más reciente primero
                .map((ord) => {
                  const servidor = servidores.find(
                    (srv) => srv.cI === ord.jefeControl
                  );

                  return (
                    <tr key={ord.id}>
                      <td>
                        <img
                          className="user_icon_btn"
                          src="../../../edit.png"
                          alt="Editar"
                          onClick={() => {
                            setOrdenEdit(ord);
                            setShowFormOrden(true);
                          }}
                        />{" "}
                        <a
                          href={ord.urlOrden || "#"} // Si no hay URL, desactiva el enlace
                          target={ord.urlOrden ? "_blank" : undefined} // Solo abre en una nueva pestaña si hay archivo
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!ord.urlOrden) {
                              e.preventDefault();
                              setShowInputPdf(true);
                              setIdUploadPdf(ord.id);
                            }
                          }}
                        >
                          <img
                            className="user_icon_btn"
                            src={`../../../${
                              ord.urlOrden ? "vista" : "new"
                            }.png`}
                            alt={
                              ord.urlOrden ? "Abrir Documento" : "Subir Archivo"
                            }
                          />
                        </a>
                        <img
                          className="user_icon_btn"
                          src="../../../delete_3.png"
                          alt="Eliminar"
                          onClick={() => {
                            setShowFormDelete(true);
                            setOrdenDelete(ord);
                          }}
                        />
                      </td>
                      <td>{ord.fecha}</td>
                      <td>{ord.numOrden}</td>
                      <td>{ord.frase}</td>
                      <td>{ord.santoSena}</td>
                      <td>{ord.contrasena}</td>
                      <td>
                        {servidor
                          ? `${servidor.grado} ${servidor.nombres} ${servidor.apellidos}`
                          : "No asignado"}
                      </td>
                      <td>
                        <img
                          className="user_icon_btn"
                          src="../../../pdf.png"
                          alt="Editar"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </article>
      </section>

      {showInputPdf && (
        <OrdenInputPdf
          setShowInputPdf={setShowInputPdf}
          idUploadPdf={idUploadPdf}
        />
      )}

      <section className="comunicaciones_orden_content">
        <h2 className="comunicados_title">Comunicados</h2>
        <button
          className="comunicados_btn"
          onClick={() => {
            setShowFormComunicaciones(true);
            setShowFormOrden(false);
          }}
        >
          Generar Comunicados
        </button>
        {showFormComunicaciones && (
          <FormComunicaciones
            setShowFormComunicaciones={setShowFormComunicaciones}
            comunicadoEdit={comunicadoEdit}
            setComunicadoEdit={setComunicadoEdit}
          />
        )}

        <article className="table_wrapper_orden ">
          <table className="table_comunicados">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Fecha de Inicio:</th>
                <th>Fecha de Finalizacion:</th>
                <th>Comunicado:</th>
              </tr>
            </thead>
            <tbody>
              {[...comunicados]
                .sort(
                  (a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)
                )
                .map((com) => {
                  return (
                    <React.Fragment key={com.id}>
                      <tr
                        onMouseEnter={() => setHoveredComunicado(com)}
                        onMouseLeave={() => setHoveredComunicado(null)}
                      >
                        <td>
                          <img
                            className="user_icon_btn"
                            src="../../../edit.png"
                            alt="Editar"
                            onClick={() => {
                              setComunicadoEdit(com);
                              setShowFormComunicaciones(true);
                            }}
                          />
                          <a
                            href={com.urlFile || "#"}
                            target={com.urlFile ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!com.urlFile) {
                                e.preventDefault();
                                setShowInputPdf(true);
                                setIdUploadPdf(com.id);
                              }
                            }}
                          >
                            <img
                              className="user_icon_btn"
                              src={`../../../${
                                com.urlFile ? "vista" : "new"
                              }.png`}
                              alt={
                                com.urlFile
                                  ? "Abrir Documento"
                                  : "Subir Archivo"
                              }
                            />
                          </a>
                          <img
                            className="user_icon_btn"
                            src="../../../delete_3.png"
                            alt="Eliminar"
                            onClick={() => {
                              setShowFormDeleteCom(true);
                              setComunicadoEdit(com);
                            }}
                          />
                        </td>
                        <td>{com.fechaInicio}</td>
                        <td>{com.fechaFin}</td>
                        <td>{com.comunicado}</td>
                      </tr>

                      {hoveredComunicado?.id === com.id && (
                        <tr className="hover_content_row">
                          <td colSpan="4">
                            <div className="hover_content_box">
                              {com.comunicado}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </article>
      </section>

      {/* <section className="formaciones_orden_content">
        <article className="formacion_list">
          {formacion.map((form) => {
            return (
              <section className="formacion_item" key={form.id}>
                <div>
                  Formación de la fecha <strong>{form.fecha}</strong> y hora{" "}
                  <strong>{form.hora}</strong>
                </div>
              </section>
            );
          })}
        </article>
      </section> */}
    </div>
  );
};

export default Orden;
