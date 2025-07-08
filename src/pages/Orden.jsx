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
  const dispatch = useDispatch();

  const [servidores, getServidor] = useCrud();
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [showFormOrden, setShowFormOrden] = useState(false);
  const [showFormDelete, setShowFormDelete] = useState(false);
  const [showInputPdf, setShowInputPdf] = useState(false);
  const [idUploadPdf, setIdUploadPdf] = useState();
  const [ordenEdit, setOrdenEdit] = useState();
  const [ordenDelete, setOrdenDelete] = useState();
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
    loggedUser();
    getOrden(PATH_ORDEN);
    getServidor(PATH_SERVIDORES);
  }, [showFormOrden, showFormDelete, showInputPdf]);

  const handleDelete = () => {
    deleteApi(PATH_ORDEN, ordenDelete.id);
    setShowFormDelete(false);
    setOrdenDelete();
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
    <div>
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
      </article>
      <section>
        <h2>Orden</h2>
        <button onClick={() => setShowFormOrden(true)}>
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
        <article className="table_wrapper table_ord">
          <table>
            <thead>
              <tr>
                <th>Editar</th>
                <th>Pdf</th>
                <th>Eliminar</th>
                <th>Fecha:</th>
                <th>Numero:</th>
                <th>Frase:</th>
                <th>Santo y Seña:</th>
                <th>Contraseña: </th>
                <th>Jefe de Control:</th>
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
                        />
                      </td>
                      <td>
                        {" "}
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
                      </td>
                      <td>
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

      <section>
        <FormComunicaciones />
      </section>
    </div>
  );
};

export default Orden;
