import api from "./api";

const updateProfile = async (userData) => {
  const response = await api.put(
    "/users/profile",
    userData
  );

  return response.data;
};

const changePassword = async (passwordData) => {
  const response = await api.put(
    "/users/change-password",
    passwordData
  );

  return response.data;
};

const userService = {
  updateProfile,
  changePassword,
};

export default userService;