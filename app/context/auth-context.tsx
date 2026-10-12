"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  userId: number;
  fullName: string;
  email: string;
  userRole: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded as fallback — ensures fetch works even if .env.local isn't loaded
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7221";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // Handle error response FIRST — before touching any fields
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Now safely read fields — but check they exist
    if (!data.token) {
      throw new Error("Login failed — no token received");
    }

    // Handle both PascalCase and camelCase from backend
    const userData: User = {
      userId: data.userId ?? data.UserId,
      fullName: data.fullName ?? data.FullName,
      email: data.email ?? data.Email,
      userRole: data.userRole ?? data.UserRole ?? "",
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);

    return userData;
  };

  const register = async (data: RegisterData) => {
    const res = await fetch(`${API_BASE}/api/Auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
        address: data.address,
      }),
    });

    // Try to parse JSON, but handle empty/non-JSON responses
    let result: any = {};
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      try {
        result = await res.json();
      } catch {
        result = {};
      }
    } else {
      const text = await res.text();
      if (text) {
        console.error("Non-JSON register response:", text);
      }
    }

    if (!res.ok) {
      throw new Error(result.message || `Registration failed (${res.status})`);
    }

    // Auto-login after successful registration
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { API_BASE };