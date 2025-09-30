import axios from "axios";

// En développement : localhost, en production : nom du service Docker
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? "http://backend:3000/api"  // ← Nom du service dans docker-compose
  : "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;