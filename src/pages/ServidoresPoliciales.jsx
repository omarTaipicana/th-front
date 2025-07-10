import React, { useEffect, useState, useMemo } from "react";
import "./styles/ServidoresPoliciales.css";
import FormDetha from "../components/ServidoresPoliciales/FormDetha";
import useCrud from "../hooks/useCrud";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";
import useAuth from "../hooks/useAuth";
import IsLoading from "../components/shared/isLoading";
import { useForm } from "react-hook-form";
import FormNovedad from "../components/ServidoresPoliciales/FormNovedad";

const ServidoresPoliciales = () => {
  const PATH_SERVIDORES = "/servidores";
  const dispatch = useDispatch();
  const [servidorPolicialEdit, setServidorPolicialEdit] = useState();
  const [servidorPolicialEditNovedad, setServidorPolicialEditNovedad] =
    useState();
  const [userDelete, setUserDelete] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [showNovedad, setShowNovedad] = useState(false);
  const [show, setShow] = useState(false);
  const [table, setTable] = useState(false);
  const [search, setSearch] = useState("");
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

  const submit = (data) => {
    const file = data?.url?.[0] || null;

    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value?.toString().trim() !== ""
      )
    );

    // Validar y formatear fechas
    ["fechaInicio", "fechaFin"].forEach((key) => {
      const val = cleanedData[key];
      if (!val || isNaN(new Date(val).getTime())) {
        delete cleanedData[key]; // Elimina si no es fecha válida
      } else {
        cleanedData[key] = new Date(val).toISOString().split("T")[0]; // Formato YYYY-MM-DD
      }
    });

    if (!servidorPolicialEdit) {
      postApiFile(
        PATH_SERVIDORES,
        {
          ...cleanedData,
          usuarioRegistro: user.cI,
          usuarioEdicion: user.cI,
        },
        file
      );
    } else {
      updateApiFile(PATH_SERVIDORES, servidorPolicialEdit.id, file, {
        ...cleanedData,
        usuarioEdicion: user.cI,
      });
    }

    setShow(false);
  };

  const handleDeleteUser = () => {
    updateApi(PATH_SERVIDORES, userDelete.id, {
      eliminado: "SI",
    });
    setShowDelete(false);
  };

  useEffect(() => {
    if (updateReg && userDelete) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se eliminó correctamente el usuario ${updateReg.nombres} ${updateReg.apellidos}` ||
            "Error inesperado",
          alertType: 2,
        })
      );
    } else if (updateReg) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se actualizó correctamente la información de ${updateReg.nombres} ${updateReg.apellidos}` ||
            "Error inesperado",
          alertType: 3,
        })
      );
    }
  }, [updateReg]);

  useEffect(() => {
    if (newReg) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se creó correctamente el Registro de ${newReg.nombres} ${newReg.apellidos}` ||
            "Error inesperado",
          alertType: 2,
        })
      );
    }
  }, [newReg]);

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

  const [filters, setFilters] = useState({
    sexo: "",
    departamento: "",
    seccion: "",
    nomenclatura: "",
    cargo: "",
    figuraLegal: "",
    grupo: "",
    novedad: "",
    vigencia: "",
    enLaDireccion: "",
  });

  useEffect(() => {
    getApi(PATH_SERVIDORES);
    loggedUser();
  }, [show, newReg, showNovedad]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilters({
      sexo: "",
      departamento: "",
      seccion: "",
      nomenclatura: "",
      cargo: "",
      figuraLegal: "",
      grupo: "",
      novedad: "",
      vigencia: "",
      enLaDireccion: "",
    });
  };

  const filteredServidores = resApi.filter((serv) => {
    const matchesSearch =
      serv.cI?.toLowerCase().includes(search.toLowerCase()) ||
      serv.nombres?.toLowerCase().includes(search.toLowerCase()) ||
      serv.apellidos?.toLowerCase().includes(search.toLowerCase()) ||
      serv.departamento?.toLowerCase().includes(search.toLowerCase()) ||
      serv.seccion?.toLowerCase().includes(search.toLowerCase()) ||
      serv.nomenclatura?.toLowerCase().includes(search.toLowerCase()) ||
      serv.cargo?.toLowerCase().includes(search.toLowerCase()) ||
      serv.grupoAdmin?.toLowerCase().includes(search.toLowerCase()) ||
      serv.enLaDireccion?.toLowerCase().includes(search.toLowerCase()) ||
      serv.figuraLegal?.toLowerCase().includes(search.toLowerCase());

    const matchesFilters =
      (filters.novedad === "" ||
        serv.novedads?.some((novedad) =>
          novedad.novedad?.toLowerCase().includes(filters.novedad.toLowerCase())
        )) &&
      (filters.sexo === "" || serv.sexo === filters.sexo) &&
      (filters.departamento === "" ||
        serv.departamento === filters.departamento) &&
      (filters.seccion === "" || serv.seccion === filters.seccion) &&
      (filters.nomenclatura === "" ||
        serv.nomenclatura === filters.nomenclatura) &&
      (filters.grupo === "" || serv.grupoAdmin === filters.grupo) &&
      (filters.cargo === "" || serv.cargo === filters.cargo) &&
      (filters.enLaDireccion === "" ||
        serv.enLaDireccion === filters.enLaDireccion) &&
      (filters.figuraLegal === "" || serv.figuraLegal === filters.figuraLegal);

    const hoy = new Date().toISOString().split("T")[0];
    const ultimaNovedad = serv.novedads
      ?.slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const esVigente =
      ultimaNovedad?.fechaFin &&
      new Date(ultimaNovedad.fechaFin).toISOString().split("T")[0] >= hoy;

    const matchesVigencia =
      filters.vigencia === "" ||
      (filters.vigencia === "vigente" && esVigente) ||
      (filters.vigencia === "no_vigente" && !esVigente);

    return matchesSearch && matchesFilters && matchesVigencia;
  });

  // ✅ Opciones únicas para los filtros
  const uniqueOptions = useMemo(() => {
    const getUnique = (key) =>
      [...new Set(resApi.map((item) => item[key]).filter(Boolean))].sort();

    return {
      departamentos: getUnique("departamento"),
      seccions: getUnique("seccion"),
      nomenclaturas: getUnique("nomenclatura"),
      grupos: getUnique("grupoAdmin"),
      cargos: getUnique("cargo"),
      figurasLegales: getUnique("figuraLegal"),
    };
  }, [resApi]);

  return (
    <div>
      {isLoading && <IsLoading />}

      {show && (
        <FormDetha
          setServidorPolicialEdit={setServidorPolicialEdit}
          servidorPolicialEdit={servidorPolicialEdit}
          show={show}
          setShow={setShow}
          submit={submit}
        />
      )}

      <section className="servidores_content">
        <h2 className="servidores_title">
          Servidores Policiales de Planta Central de la Dirección General de
          Investigaciones
        </h2>

        <section className="filter_section">
          <input
            type="text"
            placeholder="🔍 Buscar por cédula, nombre, cargo, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select name="sexo" value={filters.sexo} onChange={handleChange}>
            <option value="">Sexo</option>
            <option value="Hombre">Masculino</option>
            <option value="Mujer">Femenino</option>
          </select>

          <select
            name="departamento"
            value={filters.departamento}
            onChange={handleChange}
          >
            <option value="">Departamento</option>
            {uniqueOptions.departamentos.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <select
            name="nomenclatura"
            value={filters.nomenclatura}
            onChange={handleChange}
          >
            <option value="">Nomenclatura</option>
            {uniqueOptions.nomenclaturas.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            name="seccion"
            value={filters.seccion}
            onChange={handleChange}
          >
            <option value="">Seccion</option>
            {uniqueOptions.seccions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select name="cargo" value={filters.cargo} onChange={handleChange}>
            <option value="">Cargo</option>
            {uniqueOptions.cargos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select name="grupo" value={filters.grupo} onChange={handleChange}>
            <option value="">Grupo Administrativo</option>
            {uniqueOptions.grupos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            name="figuraLegal"
            value={filters.figuraLegal}
            onChange={handleChange}
          >
            <option value="">Figura Legal</option>
            {uniqueOptions.figurasLegales.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            name="vigencia"
            value={filters.vigencia}
            onChange={handleChange}
          >
            <option value="">Vigencia</option>
            <option value="vigente">Vigente</option>
            <option value="no_vigente">No vigente</option>
          </select>

          <select
            name="novedad"
            value={filters.novedad}
            onChange={handleChange}
          >
            <option value="">Todas las Novedades</option>
            {[
              ...new Set(
                resApi
                  .flatMap((serv) => serv.novedads?.map((n) => n.novedad))
                  .filter(Boolean)
              ),
            ].map((novedad, index) => (
              <option key={index} value={novedad}>
                {novedad}
              </option>
            ))}
          </select>

          <select
            name="enLaDireccion"
            value={filters.enLaDireccion}
            onChange={handleChange}
          >
            <option value="">Labora en la Dirección:</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>

          <div className="filter_btn">
            <button onClick={handleClearFilters}>Limpiar</button>
            <button onClick={() => setShow(!show)}>+</button>
            <button onClick={() => setTable(!table)}>{`${
              table ? "Tabla" : "Tarjeta"
            }`}</button>
          </div>
          <div className="number_sp">
            {
              filteredServidores
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .filter((serv) => serv?.eliminado !== "SI").length
            }{" "}
            Servidores Policiales
          </div>
        </section>

        {!table ? (
          <section className="table_section">
            <table className="servidores_table">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th>Novedad</th>
                  <th>Cédula</th>
                  <th>Grado</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Fecha Nacimiento</th>
                  <th>Fecha Ingreso</th>
                  <th>Estado Civil</th>
                  <th>Sexo</th>
                  <th>Etnia</th>
                  <th>Correo</th>
                  <th>Celular</th>
                  <th>Grupo</th>
                  <th>Provincia</th>
                  <th>Cantón</th>
                  <th>Dirección</th>
                  <th>Contacto Emergencia</th>
                  <th>Número Contacto</th>
                  <th>Parentesco</th>
                  <th>Discapacidad</th>
                  <th>Detalle Discapacidad</th>
                  <th>Enfermedad Catastrófica</th>
                  <th>Detalle Enfermedad</th>
                  <th>Departamento</th>
                  <th>Nomenclatura</th>
                  <th>Cargo</th>
                  <th>Pase DNATH</th>
                  <th>Fecha Presentación</th>
                  <th>Figura Legal</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de finalizacion</th>
                  <th>Num Documento</th>
                  <th>Dcoumento</th>
                </tr>
              </thead>
              <tbody>
                {filteredServidores
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .filter((serv) => serv?.eliminado !== "SI")
                  .map((serv) => (
                    <tr
                      className={`val_novedad_vigente  ${
                        serv.fechaFin &&
                        new Date(serv.fechaFin).setHours(0, 0, 0, 0) <
                          new Date().setHours(0, 0, 0, 0)
                          ? "novedad_vencida"
                          : ""
                      }   ${(() => {
                        const ultimaNovedad = serv.novedads
                          ?.slice()
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          )[0];

                        if (!ultimaNovedad) return "";

                        const hoy = new Date().toISOString().split("T")[0];

                        const fechaFin = ultimaNovedad.fechaFin
                          ? new Date(ultimaNovedad.fechaFin)
                              .toISOString()
                              .split("T")[0]
                          : null;

                        const fechaInicio = ultimaNovedad.fechaInicio
                          ? new Date(ultimaNovedad.fechaInicio)
                              .toISOString()
                              .split("T")[0]
                          : null;

                        if (fechaFin) {
                          return fechaFin >= hoy ? "vigente" : "no_vigente";
                        }

                        if (!fechaFin && fechaInicio) {
                          return fechaInicio <= hoy ? "vigente" : "";
                        }

                        return "";
                      })()}`}
                      key={serv.cI}
                    >
                      <td>
                        <img
                          className="user_icon_btn"
                          src="../../../edit.png"
                          alt="Editar"
                          onClick={() => {
                            setShow(true);
                            setServidorPolicialEdit(serv);
                          }}
                        />
                        <img
                          className="user_icon_btn"
                          src="../../../delete_3.png"
                          alt="Eliminar"
                          onClick={() => {
                            setShowDelete(true);
                            setUserDelete(serv);
                          }}
                        />
                        <img
                          className="user_icon_btn"
                          src="../../../add2.png"
                          alt="Novedad"
                          onClick={() => {
                            setShowNovedad(true);
                            setServidorPolicialEditNovedad(serv);
                          }}
                        />
                      </td>
                      <td>{serv.novedads?.map((n) => n.novedad).join(", ")}</td>
                      <td>{serv.cI}</td>
                      <td>{serv.grado}</td>
                      <td>{serv.nombres}</td>
                      <td>{serv.apellidos}</td>
                      <td>{serv.fechaNacimiento}</td>
                      <td>{serv.fechaIngreso}</td>
                      <td>{serv.estadoCivil}</td>
                      <td>{serv.sexo}</td>
                      <td>{serv.etnia}</td>
                      <td>{serv.correoElectronico}</td>
                      <td>{serv.celular}</td>
                      <td>{serv.grupoAdmin}</td>
                      <td>{serv.provinciaResidencia}</td>
                      <td>{serv.cantonResidencia}</td>
                      <td>{serv.direccionResidencia}</td>
                      <td>{serv.contactoEmergencia}</td>
                      <td>{serv.numeroContactoEmergencia}</td>
                      <td>{serv.parentesco}</td>
                      <td>{serv.alertaDiscapacidad}</td>
                      <td>{serv.detalleDiscapacidad}</td>
                      <td>{serv.alertaEnfermedadCatastrofica}</td>
                      <td>{serv.detalleEnfermedad}</td>
                      <td>{serv.departamento}</td>
                      <td>{serv.nomenclatura}</td>
                      <td>{serv.cargo}</td>
                      <td>{serv.paseDNATH}</td>
                      <td>{serv.fechaPresentacion}</td>
                      <td>{serv.figuraLegal}</td>
                      <td>{serv.fechaInicio}</td>
                      <td>{serv.fechaFin}</td>
                      <td>{serv.numDocumento}</td>
                      <td>
                        {serv.url ? (
                          <a
                            href={serv.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              className="user_icon_btn"
                              src="../../../vista.png"
                              alt="Ver documento"
                              title="Ver documento"
                            />
                          </a>
                        ) : (
                          "Sin documento"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        ) : (
          <section className="cards_section">
            <ul className="cards_container">
              {filteredServidores
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .filter((serv) => serv?.eliminado !== "SI")
                .map((serv) => (
                  <li key={serv.cI} className="card">
                    <div className="btn_list_content_sp">
                      <img
                        className="user_icon_btn"
                        src="../../../edit.png"
                        alt="User Icon"
                        onClick={() => {
                          setShow(true);
                          setServidorPolicialEdit(serv);
                        }}
                      />
                      <img
                        className="user_icon_btn"
                        src="../../../delete_3.png"
                        alt="User Icon"
                        onClick={() => {
                          setShowDelete(true);
                          setUserDelete(serv);
                        }}
                      />

                      <img
                        className="user_icon_btn"
                        src="../../../add2.png"
                        alt="User Icon"
                        onClick={() => {
                          setShowNovedad(true);
                          setServidorPolicialEditNovedad(serv);
                        }}
                      />
                    </div>

                    <div className="btn_list_content_sp_add">
                      <div
                        className={`val_novedad_vigente ${(() => {
                          const ultimaNovedad = serv.novedads
                            ?.slice()
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                            )[0];

                          if (!ultimaNovedad?.fechaFin) {
                            return "";
                          }

                          const hoyStr = new Date().toISOString().split("T")[0];
                          const fechaFinStr = new Date(ultimaNovedad.fechaFin)
                            .toISOString()
                            .split("T")[0];

                          const clase =
                            fechaFinStr >= hoyStr ? "vigente" : "no_vigente";
                          return clase;
                        })()}`}
                      ></div>
                    </div>
                    <p>
                      <span className="label">Cédula:</span> {serv.cI}
                    </p>
                    <p>
                      <span className="label">Nombres y Apellidos:</span>{" "}
                      {serv.nombres} {serv.apellidos}
                    </p>
                    <p>
                      <span className="label">Departamento:</span>{" "}
                      {serv.departamento}
                    </p>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {showDelete && (
          <article className="user_delet_content">
            <span>
              ¿Deseas eliminar al usuario/a {userDelete?.nombres}{" "}
              {userDelete.apellidos}?
            </span>
            <section className="btn_content">
              <button className="btn yes" onClick={handleDeleteUser}>
                Sí
              </button>
              <button
                className="btn no"
                onClick={() => {
                  setShowDelete(false);
                  setUserDelete();
                }}
              >
                No
              </button>
            </section>
          </article>
        )}

        {showNovedad && (
          <FormNovedad
            servidorPolicialEditNovedad={servidorPolicialEditNovedad}
            setShowNovedad={setShowNovedad}
          />
        )}
      </section>
    </div>
  );
};

export default ServidoresPoliciales;
