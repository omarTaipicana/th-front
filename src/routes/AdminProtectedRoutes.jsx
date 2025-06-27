import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AdminProtectedRoutes = () => {
  const [, , , loggedUser, , , , , , , , , , user, ,] = useAuth();
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;


  useEffect(() => {
    loggedUser();
  }, []);

  if (user) {
    if (user?.role === rolAdmin || user?.cI === superAdmin) {
      return <Outlet />;
    } else {
      return <Navigate to="/parte_diario" />;
    }
  }
};

export default AdminProtectedRoutes;
