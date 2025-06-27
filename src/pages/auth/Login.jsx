import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import IsLoading from "../../components/shared/isLoading";

const Login = () => {
  const token = localStorage.getItem("token");

  const [prevUser, setPrevUser] = useState(null);
  const [isNewLogin, setIsNewLogin] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hidePassword, setHidePassword] = useState(true);

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

  const handleLogout = () => {
    if (userLogged) {
      dispatch(
        showAlert({
          message: `⚠️ Estimado ${userLogged?.firstName} ${userLogged?.lastName}, no olvides actualizar la información`,
          alertType: 4,
        })
      );
    }
    localStorage.removeItem("token");
    setUserLogged();
    reset({
      email: "",
      password: "",
    });
    navigate("/");
  };

  useEffect(() => {
    if (error) {
      const message = error.response?.data?.message ?? "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        })
      );
    }
  }, [error]);

  useEffect(() => {
    if (userLogged && prevUser === null && isNewLogin) {
      dispatch(
        showAlert({
          message: `⚠️ Bienvenido ${userLogged?.firstName} ${userLogged?.lastName} a tu App Web Parte Diario de la DIGIN`,
          alertType: 2,
        })
      );
      setPrevUser(userLogged);
      setIsNewLogin(false);
      navigate("/");
    }
  }, [userLogged, prevUser, isNewLogin, dispatch]);

  const submit = (data) => {
    loginUser(data);
    setIsNewLogin(true);
  };

  return (
    <div className="contenedor_login">
      {isLoading && <IsLoading />}

      <section>
        {userLogged ? (
          <div className="user_loggued">
            <ul>
              <h3 className="user_loggued_title">
                Sr usuario se encuentra logueado en la siguiente cuenta
              </h3>
              <li className="user_loggued_li">
                <span className="user_loggued_span">Usuario: </span>
                <span className="user_loggued_span">{userLogged.cI}</span>
              </li>

              <li className="user_loggued_li">
                <span className="user_loggued_span">Nombres: </span>
                <span className="user_loggued_span">
                  {userLogged.firstName}
                </span>
              </li>

              <li className="user_loggued_li">
                <span className="user_loggued_span">Apellidos: </span>
                <span className="user_loggued_span">{userLogged.lastName}</span>
              </li>
            </ul>
            <button onClick={handleLogout} className="logout__button">
              Salir
            </button>
          </div>
        ) : (
          <div className="content_background">
            <section>
              <h2 className="login__title">Iniciar Sesión</h2>
              <form className="form__login" onSubmit={handleSubmit(submit)}>
                <label className="label__form__login">
                  <span className="span__form__login">Email: </span>
                  <input
                    required
                    {...register("email")}
                    className="input__form__login"
                    type="text"
                  />
                </label>

                <label className="label__form__login">
                  <span className="span__form__login">Contraseña: </span>
                  <div className="input__form__login__password">
                    <input
                      className="input__form__login__password"
                      required
                      {...register("password")}
                      type={hidePassword ? "password" : "text"}
                    />{" "}
                    <div>
                      <img
                        className="img__show"
                        onClick={() => setHidePassword(!hidePassword)}
                        src={`../../../${
                          hidePassword ? "show" : "hide"
                        }.png`}
                        alt=""
                      />
                    </div>
                  </div>
                </label>
                <Link to="/reset_password">Olvido su contraseña</Link>

                <button className="btn__form__login">INICIAR</button>
              </form>
            </section>
          </div>
        )}
      </section>
    </div>
  );
};

export default Login;
