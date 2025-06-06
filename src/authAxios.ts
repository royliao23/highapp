// authAxios.ts
import axios from "axios";
import { getValidAccessToken } from "./authService";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_NODE
});

instance.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
