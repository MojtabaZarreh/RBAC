import http from "./http";

export const getCompanyProfile = async () => {
  const { data } = await http.get("/profile");
  return data;
};
