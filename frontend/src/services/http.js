// axios instance + interceptor
// api/http.js
import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("api_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("api_token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
