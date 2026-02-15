import axios from "axios";

/* =========================================
   BASE API CONFIG
========================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://advaitcollections-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/* =========================================
   REQUEST INTERCEPTOR
========================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================
   RESPONSE INTERCEPTOR (SAFE VERSION)
========================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // 🚀 Only redirect if inside admin dashboard area
    const isAdminDashboard =
      currentPath.startsWith("/admin-dashboard");

    if (status === 401 && isAdminDashboard) {
      console.warn("Unauthorized admin access. Redirecting...");
      localStorage.removeItem("adminToken");
      window.location.href = "/admin-login";
    }

    return Promise.reject(error);
  }
);

/* =========================================
   SAFE ERROR HANDLER
========================================= */

const handleApiError = (error) => {
  return {
    success: false,
    status: error.response?.status,
    message:
      error.response?.data?.message ||
      error.message ||
      "Something went wrong",
  };
};

/* =========================================
   SETTINGS API (PUBLIC SAFE)
========================================= */

export const settingsAPI = {
  getSettings: async () => {
    try {
      const res = await api.get("/settings");
      return res.data;
    } catch (error) {
      // ⚠️ Do NOT break public pages
      console.warn("Settings fetch failed (safe ignore).");
      return {
        success: false,
        settings: {},
      };
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

/* =========================================
   EXPORT
========================================= */

export default {
  settings: settingsAPI,
  products: productsAPI,
  sales: salesAPI,
  auth: authAPI,
};
