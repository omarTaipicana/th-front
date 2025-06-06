import { input } from "framer-motion/client";
import React, { useEffect } from "react";
import "./styles/FormDetha.css";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";

const FormDetha = ({ setShow, userEdit, setUserEdit, submit }) => {
  const PATH_SERVIDORES = "/servidores";
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [
    servP,
    getApi,
    postServidor,
    deleteApi,
    updateServidor,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
  ] = useCrud();

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
    loggedUser();
  }, []);

  useEffect(() => {
    reset(userEdit);
  }, [userEdit]);

  return (
    <div className="form_detha_content">
      <h2 className="servidores_form_title">
        Formulario de Registro de Servidores policiales
      </h2>
      <button
        className="close_btn"
        onClick={() => {
          setShow(false);
          setUserEdit();
          reset();
        }}
      >
        ❌
      </button>
      <form onSubmit={handleSubmit(submit)} className="form_servidores">
        <label>
          <span>Cedula:</span>
          <input {...register("cI")} required />
        </label>

        <label>
          <span>Nombres:</span>
          <input {...register("nombres")} required />
        </label>

        <label>
          <span>Apellidos:</span>
          <input {...register("apellidos")} required />
        </label>

        <label>
          <span>Fecha de nacimiento:</span>
          <input {...register("fechaNacimiento")} required type="date" />
        </label>

        <label>
          <span>Fecha de Ingreso a la PPNN:</span>
          <input {...register("fechaIngreso")} required type="date" />
        </label>

        <label>
          <span>Estado Civil:</span>
          <input {...register("estadoCivil")} required />
        </label>

        <label>
          <span>Sexo:</span>
          <input {...register("sexo")} required />
        </label>

        <label>
          <span>Etnia:</span>
          <input {...register("etnia")} required />
        </label>

        <label>
          <span>Correo:</span>
          <input {...register("correoElectronico")} required type="email" />
        </label>

        <label>
          <span>Celular:</span>
          <input {...register("celular")} required />
        </label>

        <label>
          <span>Provincia:</span>
          <input {...register("provinciaResidencia")} required />
        </label>

        <label>
          <span>Cantón:</span>
          <input {...register("cantonResidencia")} required />
        </label>

        <label>
          <span>Dirección:</span>
          <input {...register("direccionResidencia")} required />
        </label>

        <label>
          <span>Contacto de Emergencia:</span>
          <input {...register("contactoEmergencia")} required />
        </label>

        <label>
          <span>Número Contacto de Emergencia:</span>
          <input {...register("numeroContactoEmergencia")} required />
        </label>

        <label>
          <span>Parentesco</span>
          <input {...register("parentesco")} required />
        </label>

        <label>
          <span>Discapacidad Registrada en el SIIPNE:</span>
          <input {...register("alertaDiscapacidad")} required />
        </label>

        <label>
          <span>Detalle de la discapacidad:</span>
          <input {...register("detalleDiscapacidad")} />
        </label>

        <label>
          <span>Enfermedad registrada en el SIIPNE:</span>
          <input {...register("alertaEnfermedadCatastrofica")} required />
        </label>

        <label>
          <span>Detalle de la Enfermedad Catastrófica</span>
          <input {...register("detalleEnfermedad")} />
        </label>

        <label>
          <span>Departamento:</span>
          <input {...register("departamento")} required />
        </label>

        <label>
          <span>Nomenclatura:</span>
          <input {...register("nomenclatura")} required />
        </label>

        <label>
          <span>Cargo:</span>
          <input {...register("cargo")} required />
        </label>

        <label>
          <span>Pase DNATH:</span>
          <input {...register("paseDNATH")} required />
        </label>

        <label>
          <span>Fecha de Presentacion</span>
          <input {...register("fechaPresentacion")} required type="date" />
        </label>

        <label>
          <span>Figura legal de Movimiento:</span>
          <input {...register("figuraLegal")} required />
        </label>

        <label>
          <span>No. de Documento:</span>
          <input {...register("numDocumento")} required />
        </label>

        <label>
          <span>Labora en la Dirección:</span>
          <input {...register("enLaDirección")} required />
        </label>

        <button>{userEdit ? "EDITAR" : "GUARDAR"}</button>
      </form>
    </div>
  );
};

export default FormDetha;
