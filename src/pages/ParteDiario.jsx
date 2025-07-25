import React, { useEffect, useState } from "react";
import "./styles/Parte.css";
import useAuth from "../hooks/useAuth";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import TablaResumenParte from "../components/ParteDiario/TablaResumenParte";
import InputPdf from "../components/ParteDiario/InputPdf";
import ResumenGeneral from "../components/ParteDiario/ResumenGeneral";
import SelectTurno from "../components/ParteDiario/SelectTurno";

const ParteDiario = () => {
  const [formState, setFormState] = useState({});
  const [showInputPdf, setShowInputPdf] = useState(false);
  const [showEncargado, setShowEncargado] = useState(false);
  const [showFormFormacion, setShowFormFormacion] = useState(false);
  const [showFormTurno, setShowFormTurno] = useState(false);
  const [showDeleteFormacion, setShowDeleteFormacion] = useState(false);
  const [formacionActiva, setFormacionActiva] = useState(false);
  const [formacionActual, setFormacionActual] = useState();
  const [idUploadPdf, setIdUploadPdf] = useState();
  const [idFormacion, setIdFormacion] = useState();
  const [editandoId, setEditandoId] = useState(null);
  const [newPdf, setNewPdf] = useState();
  const [edictionActiva, setEdictionActiva] = useState(false);
  const [filter, setFilter] = useState("");

  const PATH_SERVIDORES = "/servidores";
  const PATH_NOVEDADES = "/novedades";
  const PATH_PARTE = "/parte_diario";
  const PATH_FORMACION = "/formacion";
  const PATH_PDF = "/parte_pdf";

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [novedades, getNovedades, , deleteNovedades, , , , , ,] = useCrud();
  const [servidores, getServidores, , , , , isLoading, , ,] = useCrud();
  const [pdfData, getPdf] = useCrud();
  const token = localStorage.getItem("token");

  const grados = [
    "GRAD",
    "CRNL",
    "TCNL",
    "MAYR",
    "CPTN",
    "TNTE",
    "SBTE",
    "SBOM",
    "SBOP",
    "SBOS",
    "SGOP",
    "SGOS",
    "CBOP",
    "CBOS",
    "POLI",
  ];
  const servidoresFilter = servidores
    .filter((item) => item.eliminado === "No")
    .sort((a, b) => {
      const indexA = grados.indexOf(a.grado);
      const indexB = grados.indexOf(b.grado);

      if (indexA === indexB) {
        return new Date(a.fechaIngreso) - new Date(b.fechaIngreso); // más antiguo primero
      }

      return indexA - indexB;
    });

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
    isLoading2,
    newReg,
    deleteReg,
    updateReg,
  ] = useCrud();

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;

      const success = await loggedUser();

      if (!success) {
        console.log("❌ Token inválido, removido");
        localStorage.removeItem("token");
        setUserLogged(null);
      }
    };
    checkToken();
  }, [token]);

  useEffect(() => {
    getServidores(PATH_SERVIDORES);
    getParte(PATH_PARTE);
    getNovedades(PATH_NOVEDADES);
    getPdf(PATH_PDF);
    getFormacion(PATH_FORMACION);
  }, [
    newFormacion,
    newPdf,
    newPdf,
    showInputPdf,
    showDeleteFormacion,
    showFormFormacion,
  ]);

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
    setFormState((prevState) => ({
      ...prevState,
      [serv.id]: { ...prevState[serv.id], detalle: "" },
    }));
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

  const handleGuardarEdicion = (serv, parteId) => {
    const datos = formState[serv.id];
    if (!datos?.registro) return;

    const payload = {
      registro: datos.registro,
      detalle: datos.detalle,
      usuarioEdicion: user.cI,
    };

    updateParte(PATH_PARTE, parteId, payload);
    setFormState((prevState) => ({
      ...prevState,
      [serv.id]: { ...prevState[serv.id], detalle: "" },
    }));
    setEditandoId(null);
  };

  const clouseFormacion = () => {
    setIdFormacion();
    setFormacionActual();
    setEdictionActiva();
  };

  const filteredData = pdfData
    .filter((formPdf) => formPdf?.seccion === user?.seccion)
    .filter((formPdf) => {
      if (filter === "morning") {
        const hour = parseInt(formPdf?.formacion?.hora.slice(0, 2), 10);
        return hour >= 7 && hour < 9;
      } else if (filter === "others") {
        const hour = parseInt(formPdf?.formacion?.hora.slice(0, 2), 10);
        return hour < 7 || hour >= 9;
      }
      return true; // Mostrar todos si no hay filtro seleccionado
    });

  return (
    <div className="partediario_content">
      {isLoading && <IsLoading />}
      <button
        onClick={() => {
          setShowEncargado(true);
        }}
        className="btn_show encargado"
      >
        ENCARGADO GENERAL
      </button>
      <button onClick={() => setShowFormTurno(true)} className="btn_show turno">
        PERSONAL DE TURNO
      </button>

      <h2 className="parte_diario_title  mobile_hide">
        Parte Diario de Novedades de Planta Central de la Dirección General de
        Investigaciones
      </h2>

      {showFormTurno && <SelectTurno setShowFormTurno={setShowFormTurno} />}
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
              const usuario = servidores.find(
                (serv) => serv?.cI === form?.usuarioRegistro
              );

              return (
                <section
                  onClick={() => {
                    setIdFormacion(form.id);
                    setFormacionActual(form);
                    setEdictionActiva(true);
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
        {isLoading2 && <IsLoading />}

        <section className="table_section_parte">
          <h3 className="title_table_parte">
            {
              servidoresFilter.filter((serv) => serv?.seccion === user?.seccion)
                .length
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
                {servidoresFilter
                  .filter((serv) => {
                    const tieneNovedadActiva =
                      formacionActual &&
                      novedades.some((n) => {
                        const fechaFormacion = new Date(formacionActual.fecha);
                        const inicio = new Date(n.fechaInicio);
                        const fin = n.fechaFin
                          ? new Date(n.fechaFin)
                          : new Date(8640000000000000); // Fecha máxima posible (infinita)

                        const mismoServidor = n.servidorPolicialId === serv.id;
                        const mismaSeccion = n.seccion === user?.seccion;

                        if (!mismoServidor || !mismaSeccion) return false;

                        if (serv.enLaDireccion === "No") {
                          return true;
                        }

                        return (
                          fechaFormacion >= inicio && fechaFormacion <= fin
                        );
                      });

                    return (
                      serv?.seccion === user?.seccion && !tieneNovedadActiva
                    );
                  })

                  .map((serv) => (
                    <tr key={serv.id}>
                      <td>
                        {serv.grado} {serv.nombres} {serv.apellidos}
                      </td>
                      <td>
                        <select
                          disabled={!edictionActiva}
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
                          <option value="Presente">Presente</option>
                          <option value="Franco">Franco</option>
                          <option value="Servicio">Servicio</option>
                          <option value="Ausencia Injustificada">
                            Ausencia Injustificada
                          </option>
                        </select>
                      </td>
                      <td>
                        <input
                          disabled={!edictionActiva}
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

                          if (yaRegistrado && edictionActiva) {
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
                                disabled={!edictionActiva}
                                className={`guardar_btn ${
                                  edictionActiva ? "guardar_btn" : "btn_blank"
                                }`}
                              >
                                {edictionActiva ? "GUARDAR" : ""}
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
            user={user}
            parte={parte}
            servidores={servidoresFilter}
            idFormacion={idFormacion}
            novedades={novedades}
            formacionActualFecha={formacionActual}
            setNewPdf={setNewPdf}
          />
        </section>

        <section className="registros_content">
          <h2 className="registros_title">Registro de Partes</h2>
          <div className="registros_filter">
            <select
              id="filterSelect"
              className="registros_select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="morning">De las 08H00</option>
              <option value="others">Otros</option>
            </select>
          </div>
          <article className="registros_list">
            {filteredData.map((formPdf) => (
              <section
                className={`registros_card ${!formPdf.pdf && "sin_pdf_color"}`}
                key={formPdf.id}
              >
                <div className="registros_card_body">
                  <span className="registros_date">
                    {formPdf?.formacion?.fecha}
                  </span>
                  <span className="registros_date"> / </span>
                  <span className="registros_time">
                    {formPdf?.formacion?.hora.slice(0, 5)}
                  </span>
                </div>
                <div className="registros_card_actions">
                  {formPdf.pdf ? (
                    <a
                      className="registros_btn"
                      href={formPdf.pdf}
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
                        setIdUploadPdf(formPdf.id);
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
                      alt="Eliminar"
                      onClick={() => {
                        setIdFormacion(formPdf.formacionId);
                        setFormacionActual(formPdf.formacion);
                        setEdictionActiva(false);
                      }}
                    />
                  </button>
                </div>
              </section>
            ))}
          </article>
          {showInputPdf && (
            <InputPdf
              setShowInputPdf={setShowInputPdf}
              idUploadPdf={idUploadPdf}
            />
          )}
        </section>

        {showEncargado && (
          <ResumenGeneral
            setShowEncargado={setShowEncargado}
            setShowFormFormacion={setShowFormFormacion}
            showFormFormacion={showFormFormacion}
            setShowDeleteFormacion={setShowDeleteFormacion}
            showDeleteFormacion={showDeleteFormacion}
            user={user}
            parte={parte}
            servidores={servidoresFilter}
            novedades={novedades}
            setNewPdf={setNewPdf}
            clouseFormacion={clouseFormacion}
          />
        )}
      </article>
    </div>
  );
};

export default ParteDiario;
