import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/admin/batches",
});

export const getBatches = () => API.get("/");
export const createBatch = (data: any) => API.post("/", data);
export const updateBatch = (id: number, data: any) => API.put(`/${id}`, data);
export const deleteBatchApi = (id: number) => API.delete(`/${id}`);