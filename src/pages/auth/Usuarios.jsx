import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import "./styles/Usuarios.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useForm } from "react-hook-form";

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

  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [userEdit, setUserEdit] = useState();
  const [userDelete, setUserDelete] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    getUsers();
    loggedUser();
  }, [show, showEdit]);

  const handleDeleteUser = () => {
    deleteUser(userDelete.id);
    dispatch(
      showAlert({
        message: "⚠️ Se elimino correctamente",
        alertType: 2,
      })
    );
    setShow(false);
  };

  const submit = (data) => {
    const body = {
      isAvailable: data.isAvailable === "Sí" ? true : false,
      role: data.role,
    };
    updateUser(body, userEdit.id);
    setShowEdit(false);
  };

  return (
    <div>
      <h2 className="users_list_title"> Usuarios Registrados</h2>
      <section>
        <span>Filtros</span>
      </section>
      <section className="users_list_content">
        <ul className="users_grid">
          {users
            ?.filter((user) => user?.id !== userLogged?.id)
            .map((user) => (
              <li key={user.cI} className="user_card">
                <div className="btn_list_content">
                  <div
                    className={`val_verificado ${
                      user.isVerified ? "verified" : "not_verified"
                    }`}
                  ></div>
                  <img
                    className="user_icon_btn"
                    src="../../../edit.png"
                    alt="User Icon"
                    onClick={() => {
                      setShowEdit(true);
                      setUserEdit(user);
                      reset({
                        isAvailable: user.isAvailable ? "Sí" : "No",
                        role: user.role,
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
            <button className="btn no" onClick={() => setShow(false)}>
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
                <label className="label_edit_user">
                  <span className="span_edit_user">Rol de Usuario: </span>
                  <select
                    required
                    {...register("role")}
                    className="input_edit_user"
                  >
                    <option value="Talento Humano">Talento Humano</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Encargado">Encargado</option>
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
