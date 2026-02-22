import http from "./http";

export const login = async (username, password) => {
  const { data } = await http.post("/login", { username, password });
  localStorage.setItem("api_token", data.key);
  return data;
};

export const register = async (company, email, password, fullname) => {
  const { data } = await http.post("/register", { company, email, password, fullname });
  console.log(data);
  localStorage.setItem("api_token", data.key);
  return data;
};

export const getMe = async () => {
  const { data } = await http.get("/profile");
  return data;
};

export const logout = async() => {
 const { data } = await http.post("/logout");
  return data;
};
