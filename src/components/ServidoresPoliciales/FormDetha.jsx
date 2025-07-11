import { input } from "framer-motion/client";
import React, { useEffect, useState } from "react";
import "./styles/FormDetha.css";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";

const FormDetha = ({
  setShow,
  show,
  servidorPolicialEdit,
  setServidorPolicialEdit,
  submit,
}) => {
  const PATH_SERVIDORES = "/servidores";
  const PATH_VARIABLES = "/variables";
  const PATH_SENPLADES = "/senplades";

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState();
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [nomenclaturaSeleccionada, setNomenclaturaSeleccionada] = useState("");

  const [variables, getVariables] = useCrud();
  const [senplades, getSenplades] = useCrud();

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
    getVariables(PATH_VARIABLES);
    getSenplades(PATH_SENPLADES);
  }, []);

useEffect(() => {
  if (
    servidorPolicialEdit &&
    variables.length > 0 &&
    senplades.length > 0
  ) {
    setProvinciaSeleccionada(servidorPolicialEdit.provinciaResidencia);
    setDepartamentoSeleccionado(servidorPolicialEdit.departamento);
    setSeccionSeleccionada(servidorPolicialEdit.seccion);
    setNomenclaturaSeleccionada(servidorPolicialEdit.nomenclatura);

    reset(servidorPolicialEdit);

    setTimeout(() => {
      setValue("cargo", servidorPolicialEdit.cargo);
    }, 0);
  }
}, [servidorPolicialEdit, variables, senplades, reset, setValue]);




  const alertaDiscapacidad = watch("alertaDiscapacidad");
  const alertaEnfermedadCatastrofica = watch("alertaEnfermedadCatastrofica");

  return (
    <div className="form_detha_content">
      <h2 className="servidores_form_title">
        Formulario de Registro de Servidores policiales
      </h2>
      <button
        className="close_btn"
        onClick={() => {
          setShow(false);
          setServidorPolicialEdit();
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
          <span>Grado: </span>
          <select required {...register("grado")} defaultValue="">
            <option value="" disabled>
              -- Seleccione un grado --
            </option>
            {Array.from(
              new Set(variables.map((v) => v.grado).filter(Boolean))
            ).map((grado, index) => (
              <option key={index} value={grado}>
                {grado}
              </option>
            ))}
          </select>
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
          <span>Estado Civil: </span>
          <select required {...register("estadoCivil")} defaultValue="">
            <option value="" disabled>
              -- Seleccione un estadoCivil --
            </option>
            {Array.from(
              new Set(variables.map((v) => v.estadoCivil).filter(Boolean))
            ).map((estadoCivil, index) => (
              <option key={index} value={estadoCivil}>
                {estadoCivil}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sexo: </span>
          <select required {...register("sexo")} defaultValue="">
            <option value="" disabled>
              -- Seleccione un sexo --
            </option>
            {Array.from(
              new Set(variables.map((v) => v.sexo).filter(Boolean))
            ).map((sexo, index) => (
              <option key={index} value={sexo}>
                {sexo}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Etnia: </span>
          <select required {...register("etnia")} defaultValue="">
            <option value="" disabled>
              -- Seleccione un etnia --
            </option>
            {Array.from(
              new Set(variables.map((v) => v.etnia).filter(Boolean))
            ).map((etnia, index) => (
              <option key={index} value={etnia}>
                {etnia}
              </option>
            ))}
          </select>
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
          <span>Provincia de Residencia: </span>
          <select
            required
            {...register("provinciaResidencia", {
              onChange: (e) => {
                setProvinciaSeleccionada(e.target.value);
                setValue("seccion", "");
              },
            })}
            defaultValue=""
          >
            <option value="" disabled>
              -- Seleccione una Provincia --
            </option>
            {Array.from(
              new Set(senplades.map((v) => v.provincia).filter(Boolean))
            ).map((prov, i) => (
              <option key={i} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Canton de Residencia: </span>
          <select
            required
            {...register("cantonResidencia")}
            disabled={!provinciaSeleccionada}
            defaultValue=""
          >
            <option value="" disabled>
              -- Seleccione un Cantón --
            </option>
            {Array.from(
              new Set(
                senplades
                  .filter((v) => v.provincia === provinciaSeleccionada)
                  .map((v) => v.canton)
                  .filter(Boolean)
              )
            ).map((canton, i) => (
              <option key={i} value={canton}>
                {canton}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Dirección:</span>
          <input {...register("direccionResidencia")} required />
        </label>

        <label>
          <span>Nombres de Contacto de Emergencia:</span>
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
          <select {...register("alertaDiscapacidad")} defaultValue="" required>
            <option value="" disabled>
              -- Seleccione una opción --
            </option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </label>

        {alertaDiscapacidad === "Si" && (
          <label>
            <span>Detalle de la discapacidad:</span>
            <input {...register("detalleDiscapacidad")} required />
          </label>
        )}

        <label>
          <span>Enfermedad registrada en el SIIPNE:</span>
          <select
            {...register("alertaEnfermedadCatastrofica")}
            defaultValue=""
            required
          >
            <option value="" disabled>
              -- Seleccione una opción --
            </option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </label>

        {alertaEnfermedadCatastrofica === "Si" && (
          <label>
            <span>Detalle de la Enfermedad Catastrófica</span>
            <input {...register("detalleEnfermedad")} />
          </label>
        )}
        <label>
          <span>Grupo Administrativo:</span>

          <select {...register("grupoAdmin")} defaultValue="" required>
            <option value="" disabled>
              -- Seleccione una opción --
            </option>
            <option value="Grupo 01">Grupo 01</option>
            <option value="Grupo 02">Grupo 02</option>
            <option value="Grupo 03">Grupo 03</option>
            <option value="Grupo 04">Grupo 04</option>
          </select>
        </label>

        <label>
          <span>Figura Legal: </span>
          <select required {...register("figuraLegal")} defaultValue="">
            <option value="" disabled>
              -- Seleccione una figuraLegal --
            </option>
            {Array.from(
              new Set(variables.map((v) => v.figuraLegal).filter(Boolean))
            ).map((figuraLegal, index) => (
              <option key={index} value={figuraLegal}>
                {figuraLegal}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Fecha de Inicio</span>
          <input {...register("fechaInicio")} required type="date" />
        </label>

        <label>
          <span>Fecha de Finalización</span>
          <input {...register("fechaFin")} type="date" />
        </label>

        <label>
          <span>Documento: </span>
          <input type="file" accept="application/pdf" {...register("url")} />
        </label>

        <label>
          <span>Departamento: </span>
          <select
            required
            {...register("departamento", {
              onChange: (e) => {
                setDepartamentoSeleccionado(e.target.value);
                setValue("seccion", "");
              },
            })}
            defaultValue=""
          >
            <option value="" disabled>
              -- Seleccione un departamento --
            </option>
            {Array.from(
              new Set(variables.map((v) => v.departamento).filter(Boolean))
            ).map((dep, i) => (
              <option key={i} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sección: </span>
          <select
            required
            {...register("seccion", {
              onChange: (e) => {
                setSeccionSeleccionada(e.target.value);
                setValue("nomenclatura", "");
              },
            })}
            disabled={!departamentoSeleccionado}
            defaultValue=""
          >
            <option value="" disabled>
              -- Seleccione una sección --
            </option>
            {Array.from(
              new Set(
                variables
                  .filter((v) => v.departamento === departamentoSeleccionado)
                  .map((v) => v.seccion)
                  .filter(Boolean)
              )
            ).map((sec, i) => (
              <option key={i} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Nomenclatura: </span>
          <select
            required
            {...register("nomenclatura", {
              onChange: (e) => {
                setNomenclaturaSeleccionada(e.target.value);
                setValue("cargo", "");
              },
            })}
            disabled={!seccionSeleccionada}
            defaultValue=""
          >
            <option value="" disabled>
              -- Seleccione una nomenclatura --
            </option>
            {Array.from(
              new Set(
                variables
                  .filter((v) => v.seccion === seccionSeleccionada)
                  .map((v) => v.nomenclatura)
                  .filter(Boolean)
              )
            ).map((nomen, i) => (
              <option key={i} value={nomen}>
                {nomen}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Cargo: </span>
          <select
            required
            {...register("cargo")}
            disabled={!nomenclaturaSeleccionada}
            defaultValue=""
          >
            <option value="" disabled>
              -- Seleccione un cargo --
            </option>
            {Array.from(
              new Set(
                variables
                  .filter((v) => v.nomenclatura === nomenclaturaSeleccionada)
                  .map((v) => v.cargo)
                  .filter(Boolean)
              )
            ).map((cargo, i) => (
              <option key={i} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Fecha de Presentacion</span>
          <input {...register("fechaPresentacion")} required type="date" />
        </label>

        <label>
          <span>No. de Documento:</span>
          <input {...register("numDocumento")} required />
        </label>

        <label>
          <span>Labora en la Dirección:</span>

          <select {...register("enLaDireccion")} defaultValue="" required>
            <option value="" disabled>
              -- Seleccione una opción --
            </option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </label>

        <label>
          <span>Pase DNATH:</span>
          <input {...register("paseDNATH")} required />
        </label>

        <button>{servidorPolicialEdit ? "EDITAR" : "GUARDAR"}</button>
      </form>
    </div>
  );
};

export default FormDetha;
