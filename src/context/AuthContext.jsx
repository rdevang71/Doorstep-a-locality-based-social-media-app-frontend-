import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const clear = () => {
      localStorage.removeItem("lc_token");
      setUser(null);
    };
    window.addEventListener("localconnect:unauthorized", clear);
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => window.removeEventListener("localconnect:unauthorized", clear);
  }, []);
  const authenticate = async (path, values) => {
    const { data } = await api.post(path, values);
    localStorage.setItem("lc_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const updateMe = async (values) => {
    const { data } = await api.put("/users/me", values);
    setUser(data);
    return data;
  };
  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("lc_token");
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: (v) => authenticate("/auth/login", v),
        register: (v) => authenticate("/auth/register", v),
        logout,
        updateMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

