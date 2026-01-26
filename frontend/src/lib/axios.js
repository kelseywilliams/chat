import axios from "axios";

export const axiosInstance = axios.create({
  //baseURL: import.meta.env.MODE === "development" ? "http://localhost:3029/api" : "/api",
  baseURL: "https://api.kelseywilliams.co/chat",
//   baseURL: "https://localhost:3028/api/chat",
  withCredentials: true,
});
