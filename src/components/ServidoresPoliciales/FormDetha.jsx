import { input } from "framer-motion/client";
import React, { useEffect } from "react";
import "./styles/FormDetha.css";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";

const FormDetha = ({ setShow }) => {
  const PATH_SERVIDORES = "/servidores";
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [, , postServidor, , , error] = useCrud();
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

  const submit = (data) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value?.toString().trim() !== ""
      )
    );
    const body = {
      ...cleanedData,
      usuarioRegistro: user.cI,
      usuarioEdicion: user.cI,
    };
    postServidor(PATH_SERVIDORES, body);
  };

  useEffect(() => {
    loggedUser();
  }, []);

  return (
    <div className="form_detha_content">
      <h2 className="servidores_form_title">
        Formulario de Registro de Servidores policiales
      </h2>
      <button className="close_btn" onClick={() => setShow(false)}>
        ❌
      </button>
      <form onSubmit={handleSubmit(submit)} className="form_servidores">
        <label>
          <span>Cedula:</span>
          <input {...register("cI")} />
        </label>

        <label>
          <span>Nombres:</span>
          <input {...register("nombres")} />
        </label>

        <label>
          <span>Apellidos:</span>
          <input {...register("apellidos")} />
        </label>

        <label>
          <span>Fecha de nacimiento:</span>
          <input {...register("fechaNacimiento")} type="date" />
        </label>

        <label>
          <span>Fecha de Ingreso a la PPNN:</span>
          <input {...register("fechaIngreso")} type="date" />
        </label>

        <label>
          <span>Estado Civil:</span>
          <input {...register("estadoCivil")} />
        </label>

        <label>
          <span>Sexo:</span>
          <input {...register("sexo")} />
        </label>

        <label>
          <span>Etnia:</span>
          <input {...register("etnia")} />
        </label>

        <label>
          <span>Correo:</span>
          <input {...register("correoElectronico")} type="email" />
        </label>

        <label>
          <span>Celular:</span>
          <input {...register("celular")} />
        </label>

        <label>
          <span>Provincia:</span>
          <input {...register("provinciaResidencia")} />
        </label>

        <label>
          <span>Cantón:</span>
          <input {...register("cantonResidencia")} />
        </label>

        <label>
          <span>Dirección:</span>
          <input {...register("direccionResidencia")} />
        </label>

        <label>
          <span>Contacto de Emergencia:</span>
          <input {...register("contactoEmergencia")} />
        </label>

        <label>
          <span>Número Contacto de Emergencia:</span>
          <input {...register("numeroContactoEmergencia")} />
        </label>

        <label>
          <span>Parentesco</span>
          <input {...register("parentesco")} />
        </label>

        <label>
          <span>Discapacidad Registrada en el SIIPNE:</span>
          <input {...register("alertaDiscapacidad")} />
        </label>

        <label>
          <span>Detalle de la discapacidad:</span>
          <input {...register("detalleDiscapacidad")} />
        </label>

        <label>
          <span>Enfermedad catastrófica registrada en el SIIPNE:</span>
          <input {...register("alertaEnfermedadCatastrofica")} />
        </label>

        <label>
          <span>Detalle de la Enfermedad Catastrófica</span>
          <input {...register("detalleEnfermedad")} />
        </label>

        <label>
          <span>Departamento:</span>
          <input {...register("departamento")} />
        </label>

        <label>
          <span>Nomenclatura:</span>
          <input {...register("nomenclatura")} />
        </label>

        <label>
          <span>Cargo:</span>
          <input {...register("cargo")} />
        </label>

        <label>
          <span>Pase DNATH:</span>
          <input {...register("paseDNATH")} />
        </label>

        <label>
          <span>Fecha de Presentacion</span>
          <input {...register("fechaPresentacion")} type="date" />
        </label>

        <label>
          <span>Figura legal de Movimiento:</span>
          <input {...register("figuraLegal")} />
        </label>

        <label>
          <span>No. de Documento:</span>
          <input {...register("numDocumento")} />
        </label>
        
        <label>
          <span>Labora en la Dirección:</span>
          <input {...register("enLaDirección")} />
        </label>

        <button>GUARDAR</button>
      </form>
    </div>
  );
};

export default FormDetha;
