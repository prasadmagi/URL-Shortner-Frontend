import axios from "axios";
import { getAuthToken } from "./authService";

const BACKEND_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_BACKEND_URL || "https://url-shortner-backend-beta.vercel.app");

const client = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
