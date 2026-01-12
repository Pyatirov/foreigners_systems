import { createContext, useContext, useEffect, useState } from "react";

type User = {
  email: string;
}

type AuthContextType = {
  isAuth: boolean;
  user: User | null;
  login: (accessToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const parseJwt = (token: string): any => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User|null>(null)

  const login = (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);

    const payload = parseJwt(accessToken);
    if (payload?.email) {
      setUser({ email: payload.email });
    }
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsAuth(false);
    setUser(null);
  };

   useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const payload = parseJwt(token);
    if (payload?.email) {
      setUser({ email: payload.email });
      setIsAuth(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
