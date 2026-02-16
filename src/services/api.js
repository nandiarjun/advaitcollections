import axios from "axios";

/* =========================================
   BASE API CONFIG
========================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://advaitcollections-backend.onrender.com/api";

console.log("🚀 API Base URL:", API_URL);

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

    // Show the exact URL being called
    console.log(`🌐 Calling: ${config.baseURL}${config.url}`);
    console.log("📤 Request Data:", config.data);

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================
   RESPONSE INTERCEPTOR
========================================= */

api.interceptors.response.use(
  (response) => {
    console.log("🟢 Response received:", response.data);
    return response;
  },
  (error) => {
    console.error("🔴 Response error:", error.response?.data || error.message);
    
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

  updateSettings: async (settingsData) => {
    const res = await api.put("/settings", settingsData);
    return res.data;
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

  // ✅ Added for dashboard summary (matches the method name in AdminDashboard)
  getDashboardSummary: async () => {
    const res = await api.get("/products/dashboard-summary");
    return res.data;
  },

  // ✅ Added as alias for getDashboardSummary (in case the dashboard uses this name)
  getProductReport: async () => {
    const res = await api.get("/products/dashboard-summary");
    return res.data;
  },

  // ✅ Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    const res = await api.get(`/products/low-stock?threshold=${threshold}`);
    return res.data;
  },

  // ✅ Get products by category
  getProductsByCategory: async (category) => {
    const res = await api.get(`/products/category/${category}`);
    return res.data;
  },

  // ✅ Search products
  searchProducts: async (query) => {
    const res = await api.get(`/products/search?q=${query}`);
    return res.data;
  },

  // ✅ Update stock
  updateStock: async (id, quantity) => {
    const res = await api.patch(`/products/${id}/stock`, { quantity });
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

  // ✅ Get sales by date range
  getSalesByDateRange: async (startDate, endDate) => {
    const res = await api.get(`/sales/range?start=${startDate}&end=${endDate}`);
    return res.data;
  },

  // ✅ Get today's sales
  getTodaySales: async () => {
    const res = await api.get("/sales/today");
    return res.data;
  },

  // ✅ Get sales by product
  getSalesByProduct: async (productId) => {
    const res = await api.get(`/sales/product/${productId}`);
    return res.data;
  },

  // ✅ Get recent sales
  getRecentSales: async (limit = 10) => {
    const res = await api.get(`/sales/recent?limit=${limit}`);
    return res.data;
  },
};

/* =========================================
   AUTH API
========================================= */

export const authAPI = {
  adminLogin: async (credentials) => {
    // Using the correct endpoint "/auth/login"
    const res = await api.post("/auth/login", credentials);

    if (res.data.token) {
      localStorage.setItem("adminToken", res.data.token);
      
      // Store user data if available
      if (res.data.user) {
        localStorage.setItem("adminUser", JSON.stringify(res.data.user));
      }
    }

    return res.data;
  },

  verifyToken: async () => {
    const res = await api.get("/auth/verify");
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/admin-login";
  },

  // ✅ Change password
  changePassword: async (oldPassword, newPassword) => {
    const res = await api.post("/auth/change-password", { oldPassword, newPassword });
    return res.data;
  },

  // ✅ Forgot password
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  // ✅ Reset password
  resetPassword: async (token, newPassword) => {
    const res = await api.post("/auth/reset-password", { token, newPassword });
    return res.data;
  },
};

/* =========================================
   DASHBOARD API (Combined for convenience)
========================================= */

export const dashboardAPI = {
  getDashboardData: async () => {
    try {
      const [productsSummary, salesSummary, lowStock] = await Promise.all([
        productsAPI.getDashboardSummary(),
        salesAPI.getSummary(),
        productsAPI.getLowStockProducts(),
      ]);

      return {
        products: productsSummary,
        sales: salesSummary,
        lowStock: lowStock,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },
};

export default api;