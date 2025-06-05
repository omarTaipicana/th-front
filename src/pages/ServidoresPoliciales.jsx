import React, { useEffect } from "react";
import "./styles/ServidoresPoliciales.css";
import { useState } from "react";
import FormDetha from "../components/ServidoresPoliciales/FormDetha";
import useCrud from "../hooks/useCrud";

const ServidoresPoliciales = () => {
  const PATH_SERVIDORES = "/servidores";

  const [show, setShow] = useState(false);
  const [servP, getServidor] = useCrud();

  useEffect(() => {
    getServidor(PATH_SERVIDORES);
  }, []);

  return (
    <div>
      {show && <FormDetha setShow={setShow} />}
      <section className="servidores_content">
        <h2 className="servidores_title">
          Servidores Policiales de Planta Central de la Dirección General de
          Investigaciones
        </h2>
        <section>
          <article>
            <button onClick={() => setShow(!show)}>+</button>
          </article>
        </section>
        <section className="cards_section">
          <ul className="cards_container">
            {servP.map((serv) => (
              <li key={serv.cI} className="card">
                <p>
                  <span className="label">Cédula:</span> {serv.cI}
                </p>
                <p>
                  <span className="label">Nombres y Apellidos:</span>{" "}
                  {serv.nombres} {serv.apellidos}
                </p>
                <p>
                  <span className="label">Departamento:</span>{" "}
                  {serv.departamento}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </div>
  );
};

export default ServidoresPoliciales;
