import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const loginUser = (data) => {
  return axios.post(`${API_URL}/login/`, data);
};

export const registerUser = (data) => {
  return axios.post(`${API_URL}/register/`, data);
};

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh_token");

  if (!refresh) {
    throw new Error("No refresh token");
  }

  const response = await axios.post(`${API_URL}/token/refresh/`, {
    refresh: refresh,
  });

  localStorage.setItem("access_token", response.data.access);

  return response.data.access;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("access_token");

  try {
    const res = await axios.get(`${API_URL}/user/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;

  } catch (error) {

    if (error.response?.status === 401) {

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/";

    }

    throw error;
  }
};

export const getMedecins = async () => {
  const res = await axios.get(`${API_URL}/medecins/`);
  return res.data;
};

export const getCreneaux = async (medecinId, date) => {
  const res = await axios.get(`${API_URL}/rdv/creneaux/`, {
    params: {
      medecin_id: medecinId,
      date: date,
    },
  });

  return res.data;
};

export const createRdv = async (data) => {
  const token = localStorage.getItem("access_token");

  const res = await axios.post(`${API_URL}/rdv/create/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getMesRdvs = async () => {
  const token = localStorage.getItem("access_token");

  const res = await axios.get(`${API_URL}/rdv/list/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const deleteRdv = async (Id_RDV) => {
  const token = localStorage.getItem("access_token");

  const res = await axios.delete(
    `${API_URL}/rdv/delete/${Id_RDV}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const reportRdv = async (Id_RDV, data) => {
  const token = localStorage.getItem("access_token");

  const res = await axios.put(
    `${API_URL}/rdv/report/${Id_RDV}/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};