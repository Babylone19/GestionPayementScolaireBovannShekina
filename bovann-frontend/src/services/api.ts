import axios from "axios";

// TOUJOURS utiliser localhost depuis le navigateur
const BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;