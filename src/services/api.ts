import axios from "axios";

export const api = axios.create({
  baseURL: "https://mschat-one.vercel.app/api",
});
