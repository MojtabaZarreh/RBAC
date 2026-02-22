import http from "./http";

export const createUser = async (fullname, email, password, role) => {
  const { data } = await http.post("/create-user", { fullname, email, password, role });
  return data;
};

export const getMe = async () => {
  const { data } = await http.get("/profile");
  return data;
};

export const getUsers = async () => {
  const { data } = await http.get("/users");
  return data;
};

export const updateAdminProfile = async (formData) => {
  const { data } = await http.put("/profile/admin", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateUserProfile = async (payload) => {
  const { data } = await http.put("/profile/user", payload);
  return data;
};

export const editUserRoleByAdmin = async (target_user , new_role) => {
    const { data } = await http.put(`/change-role/${target_user}?new_role=${new_role}`);
  return data;
}

export const deleteUserRoleByAdmin = async (target_user) => {
    const { data } = await http.delete(`/delete-user/${target_user}`);
  return data;
}