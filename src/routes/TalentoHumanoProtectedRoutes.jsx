import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const TalentoHumanoProtectedRoutes = () => {
  const [, , , loggedUser, , , , , , , , , , user, ,] = useAuth();
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;
  const rolTalHuman = import.meta.env.VITE_ROL_TALENTO_HUMANO;

  useEffect(() => {
    loggedUser();
  }, []);

  if (user) {
    if (
      user?.role === rolAdmin ||
      user?.role === rolTalHuman ||
      user?.cI === superAdmin
    ) {
      return <Outlet />;
    } else {
      return <Navigate to="/parte_diario" />;
    }
  }
};

export default TalentoHumanoProtectedRoutes;
