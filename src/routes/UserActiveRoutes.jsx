import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const UserActiveRoutes = () => {
  const [, , , loggedUser, , , , , , , , , , user, ,] = useAuth();
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;
  const rolTalHuman = import.meta.env.VITE_ROL_TALENTO_HUMANO;

  useEffect(() => {
    loggedUser();
  }, []);

  if (user) {
    if (
      user?.isAvailable === true ||
      user?.role === rolAdmin ||
      user?.cI === superAdmin
    ) {
      return <Outlet />;
    } else {
      return <Navigate to="/inactive" />;
    }
  }
};

export default UserActiveRoutes;
