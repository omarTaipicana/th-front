import React, { useEffect, useState } from "react";
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

  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;
  const rolTalentoHumano = import.meta.env.VITE_ROL_TALENTO_HUMANO;
  const rolEncargado = import.meta.env.VITE_ROL_SUB_ENCARGADO;
  const [grados, setGrados] = useState({
    grado1: false,
    grado2: false,
    grado3: false,
    grado4: false,
  });

  useEffect(() => {
    if (!user?.role) return;

    const roles = [user.role];

    setGrados({
      grado1: roles.includes(rolAdmin) || user.cI === superAdmin,
      grado2:
        roles.includes(rolAdmin) ||
        user.cI === superAdmin ||
        roles.includes(rolTalentoHumano),
      grado3:
        roles.includes(rolAdmin) ||
        user.cI === superAdmin ||
        roles.includes(rolTalentoHumano) ||
        roles.includes(rolEncargado),
      grado4: !!user,
    });
  }, [user]);

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
        <Link to="/">
          <img
            src="/images/digin.png"
            alt="Logo DIGIN"
            className="logo_navbar"
          />
        </Link>

        <article className="link_content">
          {" "}
          {grados.grado2 && <Link to="/">Home</Link>}
          {grados.grado1 && <Link to="/parte_diario">Parte Diario</Link>}
          {grados.grado2 && (
            <Link to="/servidores">Registro de Servidores</Link>
          )}
          {grados.grado1 && <Link to="/usuarios">Usuarios</Link>}
          {grados.grado1 && <Link to="/orden">Orden</Link>}
          {!token && <Link to="/register">Registrarse</Link>}
          {!token && <Link to="/login">Login</Link>}
        </article>
        <article className="login_content">
          <Link to="/login">
            {token && (
              <img
                className="user__icon"
                src="../../../user.png"
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
