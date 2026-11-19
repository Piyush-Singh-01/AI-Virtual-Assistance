import axios from "axios";

const api = axios.create({
  // baseURL: "https://ai-virtual-assistance-1.onrender.com/api",
  baseURL: "https://backend-ai-virtual-assistance.onrender.com/api",
  // baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export default api;
