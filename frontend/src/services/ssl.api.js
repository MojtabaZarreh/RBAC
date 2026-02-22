import http from "./http";

export const getSSLCertificates = () => http.get("/ssl").then(r => r.data);
export const createSSL = (p) => http.post("/ssl", p).then(r => r.data);
export const updateSSL = (id, p) => http.put(`/ssl/${id}`, p).then(r => r.data);
export const deleteSSL = (id) => http.delete(`/ssl/${id}`);
