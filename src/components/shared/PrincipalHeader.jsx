import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PrincipalHeader.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import Alert from "./Alert";
import useAuth from "../../hooks/useAuth";

const PrincipalHeader = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  useEffect(() => {
    if (token) {
      loggedUser();
    }
  }, [token]);

  const handleLogout = () => {
    if (user) {
      dispatch(
        showAlert({
          message: `⚠️ Estimado ${user?.firstName} ${user?.lastName}, no olvides actualizar la información`,
          alertType: 4,
        })
      );
    }
    localStorage.removeItem("token");
    setUserLogged();
    navigate("/");
  };

  return (
    <header className="header_nav">
      <section className="principal__header__section">
        <img src="/images/digin.png" alt="Logo Eduka" className="logo_navbar" />
        <article className="link_content">
          {" "}
          <Link to="/home">Parte Diario</Link>
          {!token && <Link to="/register">Registrarse</Link>}
          {!token && <Link to="/login">Login</Link>}
        </article>
        <article className="login_content">
          <Link to="/login">
            {token && (
              <img
                className="user__icon"
                src="../../../public/user.png"
                alt="User Icon"
              />
            )}
          </Link>

          {token && (
            <button onClick={handleLogout} className="logout__button">
              Salir
            </button>
          )}
        </article>
      </section>
    </header>
  );
};

export default PrincipalHeader;
