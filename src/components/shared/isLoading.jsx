import React from "react";
import "./styles/IsLoading.css";

const IsLoading = () => {
  return (
    <div className="isLoading">
      <img className="img__loading" src="../../../../cargando.gif" alt="" />
      <span className="text__loading">  Cargando...</span>
    </div>
  );
};

export default IsLoading;
