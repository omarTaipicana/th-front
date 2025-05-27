import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = () => {
  if (localStorage.getItem("token")) {
    return <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
};

export default ProtectedRoutes;
