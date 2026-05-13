import axios from "axios"


const API = axios.create({
    baseURL: "http://localhost:8000"
})


export const loginUser = async (data) => {

    return await API.post(
        "/api/login/",
        data
    )
}


export const registerUser = async (data) => {

    return await API.post(
        "/api/register/",
        data
    )
}


export const getCurrentUser = async () => {
  const token = localStorage.getItem("access_token");

  const res = await axios.get("http://localhost:8000/api/user/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};