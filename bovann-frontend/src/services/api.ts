import axios from "axios";
import API_CONFIG from "../config/apiConfig";  // ← Ajouter cette ligne

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,  // ← Utiliser la config
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;