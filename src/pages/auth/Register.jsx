import React, { useEffect, useState } from "react";
import "./styles/Register.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import IsLoading from "../../components/shared/isLoading";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hidePassword, setHidePassword] = useState(true);
  const [hidePasswordVerify, setHidePasswordVerify] = useState(true);
  const [
    registerUser,
    updateUser,
    loginUser,
    loggedUser,
    verifyUser,
    userRegister,
    isLoading,
    error,
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
    if (userRegister) {
      dispatch(
        showAlert({
          message: `⚠️ Usuario Registrado, revise su correo electrónico`,
          alertType: 2,
        })
      );
      navigate("/login");
    }
  }, [userRegister]);

  const submit = (data) => {
    const frontBaseUrl = `${location.protocol}//${location.host}/#/verify`;

    const body = {
      ...data,
      frontBaseUrl,
    };

    if (data.password === data.confirmPassword) {
      registerUser(body);
      reset({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      dispatch(
        showAlert({
          message: "   ⚠️Las contraseñas no coinciden",
          alertType: 1,
        })
      );
    }
  };

  return (
    <div>
      {isLoading && <IsLoading />}
      <div className="contenedor_register">
        <form className="form__register" onSubmit={handleSubmit(submit)}>
          <h2 className="register__title">CREA TU CUENTA TH-DIGIN</h2>
          <article className="form_content">
            {" "}
            <section className="form_seccion">
              <label className="label__form__register">
                <span className="span__form__register">Nombres: </span>
                <input
                  required
                  {...register("firstName")}
                  className="input__form__register"
                  type="text"
                />
              </label>
              <label className="label__form__register">
                <span className="span__form__register">Apellidos: </span>
                <input
                  required
                  {...register("lastName")}
                  className="input__form__register"
                  type="text"
                />
              </label>
              <label className="label__form__register">
                <span className="span__form__register">Email: </span>
                <input
                  required
                  {...register("email")}
                  className="input__form__register"
                  type="text"
                />
              </label>

              <label className="label__form__register">
                <span className="span__form__register">Contraseña: </span>
                <div className="input__form__register">
                  <input
                    className="input__password"
                    required
                    {...register("password")}
                    type={hidePassword ? "password" : "text"}
                  />{" "}
                  <img
                    className="img__show"
                    onClick={() => setHidePassword(!hidePassword)}
                    src={`../../../${
                      hidePassword ? "show" : "hide"
                    }.png`}
                    alt=""
                  />
                </div>
              </label>

              <label className="label__form__register">
                <span className="span__form__register">
                  {" "}
                  Verifica tu Contraseña:{" "}
                </span>
                <div className="input__form__register">
                  <input
                    className="input__password"
                    required
                    {...register("confirmPassword")}
                    type={hidePasswordVerify ? "password" : "text"}
                  />{" "}
                  <img
                    className="img__show"
                    onClick={() => setHidePasswordVerify(!hidePasswordVerify)}
                    src={`../../../${
                      hidePasswordVerify ? "show" : "hide"
                    }.png`}
                    alt=""
                  />
                </div>
              </label>
            </section>
            <section className="form_seccion">
              <label className="label__form__register">
                <span className="span__form__register">Cedula: </span>
                <input
                  required
                  {...register("cI")}
                  className="input__form__register"
                  type="text"
                />
              </label>
              <label className="label__form__register">
                <span className="span__form__register">Celular: </span>
                <input
                  required
                  {...register("cellular")}
                  className="input__form__register"
                  type="text"
                />
              </label>
              <label className="label__form__register">
                <span className="span__form__register">
                  Fecha de nacimiento :{" "}
                </span>
                <input
                  required
                  {...register("dateBirth")}
                  className="input__form__register"
                  type="date"
                />
              </label>

              <label className="label__form__register">
                <span className="span__form__register">Departamento: </span>
                <input
                  required
                  {...register("departamento")}
                  className="input__form__register"
                  type="text"
                />
              </label>

              <label className="label__form__register">
                <span className="span__form__register">Sección: </span>
                <input
                  required
                  {...register("seccion")}
                  className="input__form__register"
                  type="text"
                />
              </label>
            </section>
          </article>
          <button className="btn__form__register">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
