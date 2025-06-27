import React from "react";
import "./styles/InactivePage.css";

const InactivePage = () => {
  return (
    <div>
      <section className="inactive__content">
        <h3 className="inactive__title">Acceso Restringido</h3>
        <span className="inactive__message">
          Su cuenta ha sido deshabilitada temporalmente. Para restablecer el
          acceso, por favor póngase en contacto con el administrador del
          sistema.
        </span>
      </section>
    </div>
  );
};

export default InactivePage;
