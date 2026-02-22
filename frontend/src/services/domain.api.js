import http from "./http";

export const getDomains = async () => {
  const { data } = await http.get("/domains");
  return data;
};

export const createDomain = async (payload) => {
  const { data } = await http.post("/domains", payload);
  return data;
};

export const updateDomain = async (id, payload) => {
  const { data } = await http.put(`/domains/${id}`, payload);
  return data;
};

export const deleteDomain = async (id) => {
  await http.delete(`/domains/${id}`);
};
