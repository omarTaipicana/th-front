import React, { useEffect, useState } from "react";
import "./styles/Register.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import IsLoading from "../../components/shared/isLoading";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useCrud from "../../hooks/useCrud";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const PATH_VARIABLES = "/variables";
  const [variables, getVariables] = useCrud();
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
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
    getVariables(PATH_VARIABLES);
  }, []);

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

    // Expresión regular para validar la contraseña
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

    // Validar contraseña
    if (!passwordRegex.test(data.password)) {
      return dispatch(
        showAlert({
          message:
            "⚠️ La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.",
          alertType: 1,
        })
      );
    }

    // Transformar nombres y apellidos
    const formatName = (name) => {
      return name
        .trim() // Eliminar espacios al inicio y al final
        .replace(/\s+/g, " ") // Reemplazar múltiples espacios internos con uno solo
        .split(" ") // Dividir por palabras
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ) // Capitalizar la primera letra
        .join(" "); // Unir las palabras nuevamente
    };

    const formattedData = {
      ...data,
      firstName: formatName(data.firstName), // Formatear primer nombre
      lastName: formatName(data.lastName), // Formatear apellidos
      email: data.email.trim().toLowerCase(), // Convertir email a minúsculas y eliminar espacios
      frontBaseUrl,
    };

    // Verificar si las contraseñas coinciden
    if (data.password === data.confirmPassword) {
      registerUser(formattedData); // Registrar usuario con los datos formateados
      reset({
        email: "",
        grado: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      dispatch(
        showAlert({
          message: "⚠️ Las contraseñas no coinciden",
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
              <select
                required
                {...register("departamento", {
                  onChange: (e) => {
                    setDepartamentoSeleccionado(e.target.value);
                    setValue("seccion", "");
                  },
                })}
                className="input__form__register"
                defaultValue=""
              >
                <option value="" disabled>
                  -- Seleccione un departamento --
                </option>
                {Array.from(
                  new Set(variables.map((v) => v.departamento).filter(Boolean))
                ).map((dep, i) => (
                  <option key={i} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </label>
            <label className="label__form__register">
              <span className="span__form__register">Sección: </span>
              <select
                required
                {...register("seccion")}
                className="input__form__register"
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
            <label className="label__form__register">
              <span className="span__form__register">Grado: </span>
              <select
                required
                {...register("grado")}
                className="input__form__register"
                defaultValue=""
              >
                <option value="" disabled>
                  -- Seleccione un grado --
                </option>
                {Array.from(
                  new Set(variables.map((v) => v.grado).filter(Boolean))
                ).map((grado, index) => (
                  <option key={index} value={grado}>
                    {grado}
                  </option>
                ))}
              </select>
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
                  src={`../../../${hidePassword ? "show" : "hide"}.png`}
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
                  src={`../../../${hidePasswordVerify ? "show" : "hide"}.png`}
                  alt=""
                />
              </div>
            </label>
          </article>
          <button className="btn__form__register">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
