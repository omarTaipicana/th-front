import React, { useEffect, useState, useMemo } from "react";
import "./styles/ServidoresPoliciales.css";
import FormDetha from "../components/ServidoresPoliciales/FormDetha";
import useCrud from "../hooks/useCrud";

const ServidoresPoliciales = () => {
  const PATH_SERVIDORES = "/servidores";
  const [showEdit, setShowEdit] = useState(false);
  const [userEdit, setUserEdit] = useState();
  const [userDelete, setUserDelete] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [show, setShow] = useState(false);
  const [servP, getServidor] = useCrud();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    sexo: "",
    departamento: "",
    nomenclatura: "",
    cargo: "",
    figuraLegal: "",
  });

  useEffect(() => {
    getServidor(PATH_SERVIDORES);
  }, []);

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
      {show && <FormDetha setShow={setShow} />}

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
                      setShowEdit(true);
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
