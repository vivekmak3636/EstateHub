import { createContext, useContext, useEffect, useState } from "react";

import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userUser");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("userToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();

        const currentUser = response.user || response;

        setUser(currentUser);

        localStorage.setItem(
          "userUser",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.error("Auth check error:", error);

        localStorage.removeItem("userToken");
        localStorage.removeItem("userUser");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const response = await authService.login(
      email,
      password
    );

    const token = response.token;
    const loggedInUser = response.user || response;

    localStorage.setItem("userToken", token);

    localStorage.setItem(
      "userUser",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return response;
  };

  // REGISTER
  const register = async (userData) => {
    const response = await authService.register(
      userData
    );

    const token = response.token;
    const registeredUser =
      response.user || response;

    if (token) {
      localStorage.setItem("userToken", token);
    }

    localStorage.setItem(
      "userUser",
      JSON.stringify(registeredUser)
    );

    setUser(registeredUser);

    return response;
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userUser");

    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};