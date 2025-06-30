import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PrincipalHeader.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

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
  }, [user, token]);

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

  // Cierra el menú si se hace clic fuera de él
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setMenuOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <header className="header_nav">
      <section className="principal__header__section">
        <Link className="logo_home" to="/">
          <img
            src="/images/digin.png"
            alt="Logo DIGIN"
            className="logo_navbar"
          />
        </Link>

        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`link_content ${menuOpen ? "menu_open" : ""}`}
          ref={menuRef}
        >
          {grados.grado2 && token && (
            <Link onClick={() => setMenuOpen(false)} to="/">
              Home
            </Link>
          )}
          {grados.grado1 && token && (
            <Link onClick={() => setMenuOpen(false)} to="/parte_diario">
              Parte Diario
            </Link>
          )}
          {grados.grado2 && token && (
            <Link onClick={() => setMenuOpen(false)} to="/servidores">
              Registro de Servidores
            </Link>
          )}
          {grados.grado1 && token && (
            <Link onClick={() => setMenuOpen(false)} to="/usuarios">
              Usuarios
            </Link>
          )}
          {grados.grado1 && token && (
            <Link onClick={() => setMenuOpen(false)} to="/orden">
              Orden
            </Link>
          )}
          {!token && (
            <Link onClick={() => setMenuOpen(false)} to="/register">
              Registrarse
            </Link>
          )}
          {!token && (
            <Link onClick={() => setMenuOpen(false)} to="/login">
              Login
            </Link>
          )}
        </nav>

        <div className="login_content">
          {token && (
            <>
              <Link to="/login">
                <img
                  className="user__icon"
                  src="../../../user.png"
                  alt="User Icon"
                />
              </Link>
              <button onClick={handleLogout} className="logout__button">
                Salir
              </button>
            </>
          )}
        </div>
      </section>
    </header>
  );
};

export default PrincipalHeader;
