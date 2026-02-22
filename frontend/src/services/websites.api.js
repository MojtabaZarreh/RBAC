
import http from "./http";

export const getWebsites = () => http.get("/websites").then(r => r.data);
export const createWebsite = (p) => http.post("/websites", p).then(r => r.data);
export const updateWebsites = (id, p) => http.put(`/websites/${id}`, p).then(r => r.data);
export const deleteWebsite = (id) => http.delete(`/websites/${id}`);
export const checkSite = (id) => http.patch(`/websites/${id}`);
