import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";
const PYTHON_API_BASE_URL = import.meta.env.VITE_PYTHON_API_BASE_URL || "http://127.0.0.1:5000/api";

// Main API instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Python API instance
const pythonAxiosInstance = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login or password reset request
    const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                         error.config?.url?.includes('/auth/send-reset-otp') ||
                         error.config?.url?.includes('/auth/verify-otp-reset');
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Simple API service
export const api = {
  async get(endpoint: string) {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async post(endpoint: string, data?: any) {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async put(endpoint: string, data?: any) {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
};

// Python API service
export const pythonApi = {
  async get(endpoint: string) {
    try {
      const response = await pythonAxiosInstance.get(endpoint);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async post(endpoint: string, data?: any) {
    try {
      const response = await pythonAxiosInstance.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;