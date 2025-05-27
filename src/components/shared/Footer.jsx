import React from "react";
import { useLocation } from "react-router-dom";
import "./styles/Footer.css";

const Footer = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const currentPage = location.pathname.split("/")[1];

  return (
    <div>
      <section>
        <ul className="ul_footer">
          <li className="li_footer">
            <a
              href="mailto:dgintalentohumano@gmail.com"
              className="link_footer"
            >
              <img
                className="img_footer"
                src="../../../mensaje.png"
                alt="Correo"
              />
              <span className="span_footer">dgintalentohumano@gmail.com</span>
            </a>
          </li>
          <li className="li_footer">
            <a
              href="https://maps.app.goo.gl/aspma84bEDizRYhx9"
              target="_blank"
              rel="noopener noreferrer"
              className="link_footer"
            >
              <img
                className="img_footer"
                src="../../../location.png"
                alt="Ubicación"
              />
              <span className="span_footer">
                Arteta Calixto y Mariana de Jesús
              </span>
            </a>
          </li>
          <li className="li_footer">
            <span className="span_footer">
              Desarrollado por: Cbop. Omar Taipicaña
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Footer;
