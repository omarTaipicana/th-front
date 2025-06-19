import { useState } from "react";
import axios from "axios";
import getConfigToken from "../services/getConfigToken";

const useCrud = () => {
  const BASEURL = import.meta.env.VITE_API_URL;
  const [response, setResponse] = useState([]);
  const [newReg, setNewReg] = useState();
  const [newPdf, setNewPdf] = useState()
  const [deleteReg, setDeleteReg] = useState();
  const [updateReg, setUpdateReg] = useState();
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getApi = (path) => {
    setIsLoading(true);
    const url = `${BASEURL}${path}`;
    axios
      .get(url, getConfigToken())
      .then((res) => setResponse(res.data))
      .catch((err) => {
        setError(err);
        // console.log(err);
      })
      .finally(() => setIsLoading(false));
  };

  const postApi = (path, data) => {
    setIsLoading(true);
    const url = `${BASEURL}${path}`;
    axios
      .post(url, data, getConfigToken())
      .then((res) => {
        // console.log(res.data);
        setResponse([...response, res.data]);
        setNewReg(res.data);
      })
      .finally(() => setIsLoading(false))
      .catch((err) => {
        setError(err);
        // console.log(err);
      });
  };

  const deleteApi = (path, id) => {
    setIsLoading(true);
    const url = `${BASEURL}${path}/${id}`;
    axios
      .delete(url, getConfigToken())
      .then((res) => {
        // console.log(res.data);
        setResponse(response.filter((e) => e.id !== id));
        setDeleteReg(res.data);
      })
      .finally(() => setIsLoading(false))
      .catch((err) => {
        setError(err);
        // console.log(err);
      });
  };

  const updateApi = (path, id, data) => {
    setIsLoading(true);
    const url = `${BASEURL}${path}/${id}`;
    axios
      .put(url, data, getConfigToken())
      .then((res) => {
        setResponse(response.map((e) => (e.id === id ? res.data : e)));
        setUpdateReg(res.data);
      })
      .finally(() => setIsLoading(false))
      .catch((err) => {
        setError(err);
        // console.log(err);
      });
  };

  const uploadPdf = (path, id, file) => {
  setIsLoading(true);

  // Crear un objeto FormData y agregar el archivo
  const formData = new FormData();
  formData.append("pdf", file);

  const url = `${BASEURL}${path}/${id}`;

  axios
    .put(url, formData, {
      headers: {
        ...getConfigToken().headers,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      setResponse(response.map((e) => (e.id === id ? res.data : e)));
      setNewPdf(res.data.pdf)
    })
    .finally(() => setIsLoading(false))
    .catch((err) => {
      setError(err);
      console.error(err);
    });
};


  return [
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
    uploadPdf,
    newPdf,
  ];
};

export default useCrud;
