import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import IsLoading from "../shared/isLoading";
import useCrud from "../../hooks/useCrud";
import "./styles/InputPdf.css";

const InputPdf = ({ setShowInputPdf, idUploadPdf }) => {
  const PATH_PDF = "/parte_pdf";

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

  const [
    response,
    getApi,
    postApi,
    deleteApi,
    updateApi,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    postApiFile,
    newRegFile,
    updateApiFile,
    updateRegFile,
  ] = useCrud();

  useEffect(() => {
    if (updateRegFile) {
      setShowInputPdf(false);
    }
  }, [updateRegFile]);

  const submit = (data) => {
    const file = data.pdf[0];
    updateApiFile(PATH_PDF, idUploadPdf, file);

    reset();
  };

  return (
    <div className="input_pdf_content">
      {isLoading && <IsLoading />}

      <article className="user_input_pdf_content">
        <button
          className="close_btn_input_pdf"
          onClick={() => {
            setShowInputPdf(false);
            reset();
          }}
        >
          ❌
        </button>

        <h3>Registre el Parte de la Formación </h3>

        <form
          onSubmit={handleSubmit(submit)}
          className="form_input_pdf_content"
        >
          <div className="form_input_content">
            <label className="label_input_pdf_user">
              <span className="span_input_pdf_user">
                Suba el Parte Firmado:{" "}
              </span>
              <input
                type="file" // Tipo de input para subir archivos
                accept="application/pdf" // Solo acepta archivos PDF
                className="input_input_pdf_user"
                {...register("pdf")}
                required
              />
            </label>
          </div>
          <button>Guardar</button>
        </form>
      </article>
    </div>
  );
};

export default InputPdf;
