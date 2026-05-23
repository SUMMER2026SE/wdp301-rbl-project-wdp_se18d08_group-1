import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../services/profileService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const res = await getProfile();
      if (res.success && res.data) {
        setUser({ token, ...res.data });
      } else if (res) {
        setUser({ token, ...res });
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      console.error("Error response:", err.response?.data);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    fetchUserData(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await fetchUserData(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);