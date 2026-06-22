import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401)
      window.dispatchEvent(new Event("localconnect:unauthorized"));
    return Promise.reject(error);
  },
);
export default api;
