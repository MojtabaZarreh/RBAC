import http from "./http";

export const getFinancials = async () => {
  const { data } = await http.get("/financial-records");
  return data;
};

export const createFinancial = async (formData) => {
  const { data } = await http.post("/financial-records", formData);
  return data;
};

export const updateFinancial = async (id, formData) => {
  const { data } = await http.put(`/financial-records/${id}`, formData);
  return data;
};

export const deleteFinancial = async (id) => {
  await http.delete(`/financial-records/${id}`);
};
