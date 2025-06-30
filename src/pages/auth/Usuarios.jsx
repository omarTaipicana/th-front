import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import "./styles/Usuarios.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useForm } from "react-hook-form";
import IsLoading from "../../components/shared/isLoading";
import useCrud from "../../hooks/useCrud";

const Usuarios = () => {
  const [
    registerUser,
    updateUser,
    loginUser,
    loggedUser,
    verifyUser,
    userRegister,
    isLoading,
    error,
    verified,
    sendEmail,
    userResetPassword,
    changePassword,
    userUpdate,
    userLogged,
    setUserLogged,
    getUsers,
    users,
    deleteUser,
    deleteReg,
  ] = useAuth();
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

  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const PATH_VARIABLES = "/variables";
  const [variables, getVariables] = useCrud();
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [userEdit, setUserEdit] = useState();
  const [userDelete, setUserDelete] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepto, setFilterDepto] = useState("");
  const [filterSeccion, setFilterSeccion] = useState("");
  const [filterRol, setFilterRol] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    getUsers();
    getVariables(PATH_VARIABLES);
    loggedUser();
  }, [show, showEdit]);

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
    if (deleteReg) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se eliminó correctamente el usuario  ${deleteReg.firstName}  ${deleteReg.lastName}` ||
            "Error inesperado",

          alertType: 1,
        })
      );
    }
  }, [deleteReg]);

  useEffect(() => {
    if (userUpdate) {
      dispatch(
        showAlert({
          message:
            `⚠️ Se actualizó correctamente al usuario ${userUpdate.firstName} ${userUpdate.lastName}` ||
            "Error inesperado",

          alertType: 3,
        })
      );
    }
  }, [userUpdate]);

  const handleDeleteUser = () => {
    deleteUser(userDelete.id);

    setShow(false);
  };

  const submit = (data) => {
    const body = {
      isAvailable: data.isAvailable === "Sí" ? true : false,
      role: data.role,
      departamento: data.departamento,
      seccion: data.seccion,
    };
    updateUser(body, userEdit.id);
    setShowEdit(false);
  };

  return (
    <div className="users_content">
      {isLoading && <IsLoading />}

      <h2 className="users_list_title"> Usuarios Registrados</h2>
      <section className="filters_container">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, correo, cédula, etc..."
          className="filter_input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="filter_select"
          value={filterDepto}
          onChange={(e) => setFilterDepto(e.target.value)}
        >
          <option value="">Departamento</option>
          {[...new Set(users?.map((u) => u.departamento))].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          className="filter_select"
          value={filterSeccion}
          onChange={(e) => setFilterSeccion(e.target.value)}
        >
          <option value="">Sección</option>
          {[...new Set(users?.map((u) => u.seccion))].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="filter_select"
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
        >
          <option value="">Rol</option>
          {[...new Set(users?.map((u) => u.role))].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          className="filter_clear_btn"
          onClick={() => {
            setSearchTerm("");
            setFilterDepto("");
            setFilterSeccion("");
            setFilterRol("");
          }}
        >
          Limpiar
        </button>
      </section>

      <section className="users_list_content user_mobile">
        <ul className="users_grid">
          {users
            ?.filter((user) => user?.id !== userLogged?.id)
            .filter((user) =>
              `${user.firstName} ${user.lastName} ${user.email} ${user.cI} ${user.cellular}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .filter((user) =>
              filterDepto ? user.departamento === filterDepto : true
            )
            .filter((user) =>
              filterSeccion ? user.seccion === filterSeccion : true
            )
            .filter((user) => (filterRol ? user.role === filterRol : true))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((user) => (
              <li key={user.cI} className="user_card">
                <div className="btn_list_content">
                  <img
                    className="user_icon_btn"
                    src="../../../edit.png"
                    alt="User Icon"
                    onClick={() => {
                      setShowEdit(true);
                      setUserEdit(user);
                      setDepartamentoSeleccionado(user.departamento);
                      reset({
                        isAvailable: user.isAvailable ? "Sí" : "No",
                        role: user.role,
                        departamento: user.departamento,
                        seccion: user.seccion,
                      });
                    }}
                  />
                  <img
                    className="user_icon_btn"
                    src="../../../delete_3.png"
                    alt="User Icon"
                    onClick={() => {
                      setShow(true);
                      setUserDelete(user);
                    }}
                  />
                  <div
                    className={`val_verificado ${
                      user.isVerified ? "verified" : "not_verified"
                    }`}
                  ></div>
                </div>
                <h3 className="user_name">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="user_details">
                  <div className="col">
                    <p>
                      <span className="label">Cédula:</span> {user.cI}
                    </p>
                    <p>
                      <span className="label">Correo:</span> {user.email}
                    </p>
                    <p>
                      <span className="label">Departamento:</span>{" "}
                      {user.departamento}
                    </p>
                    <p>
                      <span className="label">Sección:</span> {user.seccion}
                    </p>

                    <p>
                      <span className="label">Celular:</span> {user.cellular}
                    </p>
                    <p>
                      <span className="label">Rol de Usuario:</span> {user.role}
                    </p>
                    <p>
                      <span className="label">Verificado:</span>{" "}
                      {user.isAvailable ? "Sí" : "No"}
                    </p>
                    <p>
                      <span className="label">Habilitado:</span>{" "}
                      {user.isAvailable ? "Habilitado" : "Deshabilitado"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </section>

      <section className="users_list_content user_desktop">
        <table className="users_table">
          <thead className="table_header">
            <tr>
              <th className="table_cell_header">Acciones</th>
              <th className="table_cell_header">Nombre</th>
              <th className="table_cell_header">Cédula</th>
              <th className="table_cell_header">Correo</th>
              <th className="table_cell_header">Departamento</th>
              <th className="table_cell_header">Sección</th>
              <th className="table_cell_header">Celular</th>
              <th className="table_cell_header">Rol de Usuario</th>
              <th className="table_cell_header">Verificado</th>
              <th className="table_cell_header">Habilitado</th>
            </tr>
          </thead>
          <tbody className="table_body">
            {users
              ?.filter((user) => user?.id !== userLogged?.id)
              .filter((user) =>
                `${user.firstName} ${user.lastName} ${user.email} ${user.cI} ${user.cellular}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .filter((user) =>
                filterDepto ? user.departamento === filterDepto : true
              )
              .filter((user) =>
                filterSeccion ? user.seccion === filterSeccion : true
              )
              .filter((user) => (filterRol ? user.role === filterRol : true))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((user) => (
                <tr key={user.cI} className="table_row">
                  <td className="table_cell actions_column">
                    <img
                      className="user_icon_btn"
                      src="../../../edit.png"
                      alt="Edit Icon"
                      onClick={() => {
                        setShowEdit(true);
                        setUserEdit(user);
                        setDepartamentoSeleccionado(user.departamento);
                        reset({
                          isAvailable: user.isAvailable ? "Sí" : "No",
                          role: user.role,
                          departamento: user.departamento,
                          seccion: user.seccion,
                        });
                      }}
                    />
                    <img
                      className="user_icon_btn"
                      src="../../../delete_3.png"
                      alt="Delete Icon"
                      onClick={() => {
                        setShow(true);
                        setUserDelete(user);
                      }}
                    />
                    <div
                      className={`val_verificado ${
                        user.isVerified ? "verified" : "not_verified"
                      }`}
                    ></div>
                  </td>
                  <td className="table_cell">{`${user.firstName} ${user.lastName}`}</td>
                  <td className="table_cell">{user.cI}</td>
                  <td className="table_cell">{user.email}</td>
                  <td className="table_cell">{user.departamento}</td>
                  <td className="table_cell">{user.seccion}</td>
                  <td className="table_cell">{user.cellular}</td>
                  <td className="table_cell">{user.role}</td>
                  <td className="table_cell">
                    {user.isVerified ? "Sí" : "No"}
                  </td>
                  <td className="table_cell">
                    {user.isAvailable ? "Habilitado" : "Deshabilitado"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {show && (
        <article className="user_delet_content">
          <span>
            ¿Deseas eliminar al usuario/a {userDelete.firstName}{" "}
            {userDelete.lastName}?
          </span>
          <section className="btn_content">
            <button className="btn yes" onClick={handleDeleteUser}>
              Sí
            </button>
            <button
              className="btn no"
              onClick={() => {
                setShow(false);
                setUserDelete();
              }}
            >
              No
            </button>
          </section>
        </article>
      )}
      {showEdit && (
        <article className="user_edit_content">
          <button className="close_btn" onClick={() => setShowEdit(false)}>
            ❌
          </button>
          <span>
            <h3>
              Usted Puede cambiar aqui el Rol del Usuario {userEdit.firstName}{" "}
              {userEdit.lastName} , asi como Habilitarlo o Deshabilitarlo
            </h3>
          </span>
          <article>
            <form onSubmit={handleSubmit(submit)}>
              <div className="form_input_content">
                <label className="label_edit_user">
                  <span className="span_edit_user">Rol de Usuario: </span>
                  <select
                    required
                    {...register("role")}
                    className="input_edit_user"
                  >
                    <option value="Talento-Humano">Talento-Humano</option>
                    <option value="Encargado">Encargado</option>
                    {userLogged.cI === superAdmin && (
                      <option value="Administrador">Administrador</option>
                    )}{" "}
                  </select>
                </label>

                <label className="label_edit_user">
                  <span className="span_edit_user">Departamento: </span>
                  <select
                    required
                    {...register("departamento", {
                      onChange: (e) => {
                        setDepartamentoSeleccionado(e.target.value);
                        setValue("seccion", "");
                      },
                    })}
                    className="input_edit_user"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Seleccione un departamento --
                    </option>
                    {Array.from(
                      new Set(
                        variables.map((v) => v.departamento).filter(Boolean)
                      )
                    ).map((dep, i) => (
                      <option key={i} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label_edit_user">
                  <span className="span_edit_user">Sección: </span>
                  <select
                    required
                    {...register("seccion")}
                    className="input_edit_user"
                    disabled={!departamentoSeleccionado}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Seleccione una sección --
                    </option>
                    {Array.from(
                      new Set(
                        variables
                          .filter(
                            (v) => v.departamento === departamentoSeleccionado
                          )
                          .map((v) => v.seccion)
                          .filter(Boolean)
                      )
                    ).map((sec, i) => (
                      <option key={i} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="label_edit_user">
                  <span className="span_edit_user">Habilitado: </span>
                  <select
                    required
                    {...register("isAvailable")}
                    className="input_edit_user"
                  >
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </label>
              </div>
              <button>Guardar</button>
            </form>
          </article>
        </article>
      )}
    </div>
  );
};

export default Usuarios;
