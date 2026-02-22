import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/user.api";
// import http from "../services/http"; 
import React from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = async () => {
    const token = localStorage.getItem("api_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getMe();
      setUser(res.data || res); 
    } catch (e) {
      console.error("Sync Error:", e);
      localStorage.removeItem("api_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncUser();
  }, []);

  const loginAction = async (token) => {
    localStorage.setItem("api_token", token);
    
    await syncUser();
  };

  const logout = () => {
    localStorage.removeItem("api_token");
    sessionStorage.clear();
    setUser(null);
    setLoading(false);
    
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuth: !!user,
        syncUser,
        loginAction, 
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
