import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  isPremium: boolean;
  status: "pending" | "paid" | "cancel";
  premiumStartDate?: Date;
  premiumEndDate?: Date;
  subscriptionMonths?: number;
  paymentType?: "crypto" | "regular";
  paymentAmount?: number;
  transactionId?: string;
  utrNo?: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface SessionConflictError {
  code: 'SESSION_LIMIT_EXCEEDED';
  message: string;
  data: {
    maxSessions: number;
    activeSessions: Array<{
      sessionId: string;
      deviceInfo: {
        userAgent: string;
        platform: string;
        browser: string;
        deviceType: string;
        ipAddress?: string;
      };
      lastActivity: string;
      loginTime: string;
    }>;
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  forceLogin: (email: string, password: string) => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllOtherSessions: () => Promise<void>;
  getActiveSessions: () => Promise<any[]>;
  register: (userData: RegisterData) => Promise<{ requiresEmailVerification?: boolean; user?: User; token?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user on app load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        // Try to get user profile
        const response = await api.get("/auth/me");
        if (response.success) {
          setUser(response.data);
        } else {
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        localStorage.setItem("authToken", token);
        setUser(user);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      // Check if it's a session limit error
      if (error.response?.status === 409 && error.response?.data?.code === 'SESSION_LIMIT_EXCEEDED') {
        const sessionError: SessionConflictError = {
          code: 'SESSION_LIMIT_EXCEEDED',
          message: error.response.data.message,
          data: error.response.data.data
        };
        throw sessionError;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forceLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/force-login", { email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        localStorage.setItem("authToken", token);
        setUser(user);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const terminateAllOtherSessions = async () => {
    try {
      const response = await api.delete('/auth/sessions/others');
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const getActiveSessions = async () => {
    try {
      const response = await api.get('/auth/sessions');
      if (response.success) {
        return response.data.sessions;
      }
      throw new Error(response.message);
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/register", userData);
      
      if (response.success) {
        const responseData = response.data;
        
        // Check if email verification is required
        if (responseData.requiresEmailVerification) {
          return {
            requiresEmailVerification: true,
            user: responseData
          };
        } else {
          // Normal registration with immediate login
          const { user, token } = responseData;
          localStorage.setItem("authToken", token);
          setUser(user);
          return { user, token };
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint which will terminate the current session
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value: UserContextType = {
    user,
    loading,
    login,
    forceLogin,
    terminateSession,
    terminateAllOtherSessions,
    getActiveSessions,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserContextProvider");
  }
  return context;
};