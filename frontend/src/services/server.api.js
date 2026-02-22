import http from "./http";

export const getServers = () => http.get("/servers").then(r => r.data);
export const createServer = (p) => http.post("/servers", p).then(r => r.data);
export const updateServer = (id, p) => http.put(`/servers/${id}`, p).then(r => r.data);
export const deleteServer = (id) => http.delete(`/servers/${id}`);
