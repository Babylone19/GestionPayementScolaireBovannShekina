import axios from "axios";

// TOUJOURS utiliser localhost depuis le navigateur
const BASE_URL = "http://195.26.241.68:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;