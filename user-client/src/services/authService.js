import api from "./api";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

const authService = {
  register,
  login,
  getCurrentUser,
};

export default authService;