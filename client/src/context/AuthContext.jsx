import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

/* ── Axios instance ─────────────────────────── */

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});


api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* ── Provider ───────────────────────────────── */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user,  setUser]  = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  /* keep localStorage in sync */
  useEffect(() => {
    token ? localStorage.setItem("token", token) : localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    user ? localStorage.setItem("user", JSON.stringify(user)) : localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role });
    }
  }, []);

  /* ── Auth helpers ─────────────────────────── */
  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    setUser(data.user);
    setToken(data.token);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setToken(data.token);
    console.log("Logging in with:", email, password);

  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  /* ── Profile helpers ──────────────────────── */
  /**
   * updates: either a plain object (JSON) OR a FormData instance
   * containing fields like `name`, and optional `avatar` file
   */
  const updateProfile = async (updates) => {
    const isForm = updates instanceof FormData;
    const config  = isForm ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const { data } = await api.put("/profile", updates, config);
    setUser(data.user);                 // refresh context
    return data.user;
  };

  const changePassword = async (currentPw, newPw) =>
    api.put("/password", { currentPw, newPw });

  return (
    <AuthContext.Provider
      value={{ user, token, signup, login, logout, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
