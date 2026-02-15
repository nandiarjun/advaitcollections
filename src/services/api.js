import axios from "axios";

/* =========================================
   BASE API CONFIG
========================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://advaitcollections-backend.onrender.com/api";

console.log("🚀 API Base URL:", API_URL); // Add this line

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/* =========================================
   REQUEST INTERCEPTOR - ADD DEBUGGING
========================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ THIS WILL SHOW YOU THE EXACT URL BEING CALLED
    console.log(`🌐 Calling: ${config.baseURL}${config.url}`);

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================
   RESPONSE INTERCEPTOR
========================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    const isAdminRoute = currentPath.startsWith("/admin-dashboard");

    if (status === 401 && isAdminRoute) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin-login";
    }

    return Promise.reject(error);
  }
);

/* =========================================
   SETTINGS API
========================================= */

export const settingsAPI = {
  getSettings: async () => {
    try {
      const res = await api.get("/settings");
      return res.data;
    } catch (error) {
      console.warn("Settings fetch failed (safe ignore).");
      return { success: false, settings: {} };
    }
  },
};

/* =========================================
   PRODUCTS API
========================================= */

export const productsAPI = {
  getAllProducts: async () => {
    const res = await api.get("/products");
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  addProduct: async (data) => {
    const res = await api.post("/products/add", data);
    return res.data;
  },

  updateProduct: async (id, data) => {
    const res = await api.put(`/products/update/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/delete/${id}`);
    return res.data;
  },

  getDashboardSummary: async () => {
    const res = await api.get("/products/dashboard-summary");
    return res.data;
  },
};

/* =========================================
   SALES API
========================================= */

export const salesAPI = {
  sellProduct: async (data) => {
    const res = await api.post("/sales/sell", data);
    return res.data;
  },

  getSummary: async () => {
    const res = await api.get("/sales/summary");
    return res.data;
  },
};

/* =========================================
   AUTH API
========================================= */

export const authAPI = {
  adminLogin: async (credentials) => {
    // ✅ THIS IS CORRECT - just "/auth/admin-login", not "/api/auth/admin-login"
    const res = await api.post("/auth/admin-login", credentials);

    if (res.data.token) {
      localStorage.setItem("adminToken", res.data.token);
    }

    return res.data;
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  },
};

export default api;