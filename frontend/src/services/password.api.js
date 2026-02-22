import http from "./http";

export const getPasswords = () => http.get("/passwords").then(r => r.data);
export const createPassword = (p) => http.post("/passwords", p).then(r => r.data);
export const updatePassword = (id, p) => http.put(`/passwords/${id}`, p).then(r => r.data);
export const deletePassword = (id) => http.delete(`/passwords/${id}`);