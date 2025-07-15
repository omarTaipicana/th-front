import React from "react";
import "./styles/FormComunicaciones.css";
import { useForm } from "react-hook-form";

const FormComunicaciones = ({ setShowFormComunicaciones }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  return (
    <div>
      <section className="comunicados_content">
        <h2>Registro de ordenes</h2>

        <button
          className="close_btn"
          onClick={() => {
            setShowFormComunicaciones(false);
          }}
        >
          ❌
        </button>
        <form>



          <div>
            <label htmlFor="frase">Frase</label>
            <input type="text" id="frase" required {...register("frase")} />
            <textarea name="" id=""></textarea>

          </div>
          <div>
            <label htmlFor="fecha">Fecha de Inicio</label>
            <input
              type="date"
              id="fecha"
              required
              {...register("fechaInicio")}
            />
          </div>
          <div>
            <label htmlFor="fecha">Fecha de Finalización</label>
            <input type="date" id="fecha" required {...register("fechaFin")} />
          </div>

          <button type="submit">Registrar</button>
        </form>
      </section>
    </div>
  );
};

export default FormComunicaciones;
