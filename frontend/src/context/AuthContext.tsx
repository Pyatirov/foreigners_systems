import { createContext, useContext, useEffect, useRef, useState } from "react";
import { setAccessToken, clearAccessToken } from "../store/auth.store";
import { refreshRequest } from "../api/auth.api";

type User = {
  email: string;
  role: "user" | "admin"; // ← добавили
}

type AuthContextType = {
  isAuth: boolean;
  user: User | null;
  role: "user" | "admin" | null; // ← добавили для удобного доступа
  login: (accessToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const parseJwt = (token: string): { email?: string; role?: "user" | "admin" } | null => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (accessToken: string) => {
    setAccessToken(accessToken);
    const payload = parseJwt(accessToken);
    if (payload?.email) {
      setUser({
        email: payload.email,
        role: payload.role ?? "user", // ← достаём роль из payload
      });
    }
    setIsAuth(true);
  };

  const logout = () => {
    clearAccessToken();
    setIsAuth(false);
    setUser(null);
  };

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    refreshRequest()
      .then((accessToken) => {
        login(accessToken);
      })
      .catch((err) => {
        console.log("AuthProvider: refresh провалился", err?.response?.status);
        setIsAuth(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <AuthContext.Provider value={{ isAuth, user, role: user?.role ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};