import React, { useEffect, useState, useMemo } from "react";
import "./styles/ServidoresPoliciales.css";
import FormDetha from "../components/ServidoresPoliciales/FormDetha";
import useCrud from "../hooks/useCrud";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";
import useAuth from "../hooks/useAuth";
import IsLoading from "../components/shared/isLoading";

const ServidoresPoliciales = () => {
  const PATH_SERVIDORES = "/servidores";
  const dispatch = useDispatch();
  const [userEdit, setUserEdit] = useState();
  const [userDelete, setUserDelete] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const [
    servP,
    getServidor,
    postServidor,
    deleteApi,
    updateServidor,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
  ] = useCrud();

  const submit = (data) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value?.toString().trim() !== ""
      )
    );

    if (!userEdit) {
      postServidor(PATH_SERVIDORES, {
        ...cleanedData,
        usuarioRegistro: user.cI,
        usuarioEdicion: user.cI,
      });

          console.log({
        ...cleanedData,
        usuarioRegistro: user.cI,
        usuarioEdicion: user.cI,
      })


    } else {
      updateServidor(PATH_SERVIDORES, userEdit.id, {
        ...cleanedData,
        usuarioEdicion: user.cI,
      });
    }

    // setShow(false);
  };

  useEffect(() => {
    if (updateReg) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se actualizó correctamente la informacion de ${updateReg.nombres} ${updateReg.apellidos}` ||
            "Error inesperado",
          alertType: 2,
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
  console.log(error)

  const [filters, setFilters] = useState({
    sexo: "",
    departamento: "",
    nomenclatura: "",
    cargo: "",
    figuraLegal: "",
  });

  useEffect(() => {
    getServidor(PATH_SERVIDORES);
    loggedUser();
  }, [show]);

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
      nomenclatura: "",
      cargo: "",
      figuraLegal: "",
    });
  };

  const filteredServidores = servP.filter((serv) => {
    const matchesSearch =
      serv.cI?.toLowerCase().includes(search.toLowerCase()) ||
      serv.nombres?.toLowerCase().includes(search.toLowerCase()) ||
      serv.apellidos?.toLowerCase().includes(search.toLowerCase()) ||
      serv.departamento?.toLowerCase().includes(search.toLowerCase()) ||
      serv.nomenclatura?.toLowerCase().includes(search.toLowerCase()) ||
      serv.cargo?.toLowerCase().includes(search.toLowerCase()) ||
      serv.figuraLegal?.toLowerCase().includes(search.toLowerCase());

    const matchesFilters =
      (filters.sexo === "" || serv.sexo === filters.sexo) &&
      (filters.departamento === "" ||
        serv.departamento === filters.departamento) &&
      (filters.nomenclatura === "" ||
        serv.nomenclatura === filters.nomenclatura) &&
      (filters.cargo === "" || serv.cargo === filters.cargo) &&
      (filters.figuraLegal === "" || serv.figuraLegal === filters.figuraLegal);

    return matchesSearch && matchesFilters;
  });

  // ✅ Opciones únicas para los filtros
  const uniqueOptions = useMemo(() => {
    const getUnique = (key) =>
      [...new Set(servP.map((item) => item[key]).filter(Boolean))].sort();

    return {
      departamentos: getUnique("departamento"),
      nomenclaturas: getUnique("nomenclatura"),
      cargos: getUnique("cargo"),
      figurasLegales: getUnique("figuraLegal"),
    };
  }, [servP]);

  return (
    <div>
      {isLoading && <IsLoading />}

      {show && (
        <FormDetha
          setUserEdit={setUserEdit}
          userEdit={userEdit}
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
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
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

          <select name="cargo" value={filters.cargo} onChange={handleChange}>
            <option value="">Cargo</option>
            {uniqueOptions.cargos.map((c) => (
              <option key={c} value={c}>
                {c}
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

          <button onClick={handleClearFilters}>Limpiar</button>
          <button onClick={() => setShow(!show)}>+</button>
        </section>

        <section className="cards_section">
          <ul className="cards_container">
            {filteredServidores.map((serv) => (
              <li key={serv.cI} className="card">
                <div className="btn_list_content_sp">
                  <img
                    className="user_icon_btn"
                    src="../../../edit.png"
                    alt="User Icon"
                    onClick={() => {
                      setShow(true);
                      setUserEdit(serv);
                      // reset({
                      //   isAvailable: user.isAvailable ? "Sí" : "No",
                      //   role: user.role,
                      // });
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
                  <div
                    className={`val_verificado ${
                      true ? "verified" : "not_verified"
                    }`}
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
      </section>
    </div>
  );
};

export default ServidoresPoliciales;
