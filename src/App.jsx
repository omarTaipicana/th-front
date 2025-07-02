import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/auth/Login";
import Alert from "./components/shared/Alert";
import Home from "./pages/Home";
import PrincipalHeader from "./components/shared/PrincipalHeader";
import Footer from "./components/shared/Footer";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import ResetPasswordSendEmail from "./pages/auth/ResetPasswordSendEmail";
import ChangePassword from "./pages/auth/ChangePassword";
import ParteDiario from "./pages/ParteDiario";
import ServidoresPoliciales from "./pages/ServidoresPoliciales";
import Usuarios from "./pages/auth/Usuarios";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import AdminProtectedRoutes from "./routes/AdminProtectedRoutes";
import TalentoHumanoProtectedRoutes from "./routes/TalentoHumanoProtectedRoutes";
import InactivePage from "./pages/auth/InactivePage";
import UserActiveRoutes from "./routes/UserActiveRoutes";
import Orden from "./pages/Orden";

const App = () => {
  return (
    <div>
      <PrincipalHeader />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:code" element={<Verify />} />
        <Route path="/reset_password" element={<ResetPasswordSendEmail />} />
        <Route path="/reset_password/:code" element={<ChangePassword />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/inactive" element={<InactivePage />} />

          <Route element={<UserActiveRoutes />}>
            <Route path="/parte_diario" element={<ParteDiario />} />

            <Route element={<TalentoHumanoProtectedRoutes />}>
              <Route path="/" element={<Home />} />
              <Route path="/servidores" element={<ServidoresPoliciales />} />

              <Route element={<AdminProtectedRoutes />}>
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/orden" element={<Orden />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
      <Footer />
      <Alert />
    </div>
  );
};

export default App;
