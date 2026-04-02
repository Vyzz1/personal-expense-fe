import axios from "axios";

// Create a Base Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "", // ensure VITE_API_URL is configured in your .env
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
