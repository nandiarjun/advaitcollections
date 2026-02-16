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
    if (config.data) {
      console.log("📤 Request Data:", config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================
   RESPONSE INTERCEPTOR
========================================= */

api.interceptors.response.use(
  (response) => {
    console.log("🟢 Response received from:", response.config.url);
    return response;
  },
  (error) => {
    console.error("🔴 Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
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
      console.warn("Settings fetch failed (safe ignore) - using defaults");
      return { 
        success: false, 
        settings: {
          businessName: "Advait Collections",
          tagline: "Premium Garments & Fashion Accessories"
        } 
      };
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
    try {
      const res = await api.get("/products");
      return res.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  getProductById: async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  },

  addProduct: async (data) => {
    const res = await api.post("/products/add", data);
    return res.data;
  },

  updateProduct: async (id, data) => {
    const res = await api.put(`/products/update/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id, force = false) => {
    const url = force 
      ? `/products/delete/${id}?force=true`
      : `/products/delete/${id}`;
    const res = await api.delete(url);
    return res.data;
  },

  // ✅ Dashboard Summary - THIS IS WHAT YOUR DASHBOARD NEEDS
  getDashboardSummary: async () => {
    try {
      console.log("Fetching dashboard summary...");
      const res = await api.get("/products/dashboard-summary");
      console.log("Dashboard summary response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      // Return default values on error
      return {
        totalProducts: 0,
        totalStock: 0,
        totalSaleValue: 0,
        totalPurchaseValue: 0,
        totalProfit: 0,
        todaySaleValue: 0,
        todayProfit: 0
      };
    }
  },

  // ✅ Product Report - Your backend might use a different endpoint
  // Let's try both possibilities
  getProductReport: async () => {
    try {
      console.log("Fetching product report...");
      // First try the correct endpoint
      const res = await api.get("/products/product-report");
      console.log("Product report response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching product report:", error);
      // If that fails, try the dashboard summary as fallback
      try {
        console.log("Trying dashboard summary as fallback...");
        const summary = await productsAPI.getDashboardSummary();
        // Transform summary into report format if needed
        return [{
          productName: "Sample Product",
          currentStock: summary.totalStock || 0,
          totalSoldQty: 0,
          // ... other fields
        }];
      } catch (fallbackError) {
        return [];
      }
    }
  },

  // ✅ Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    try {
      const res = await api.get(`/products/low-stock?threshold=${threshold}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return [];
    }
  },

  // ✅ Get products by category
  getProductsByCategory: async (category) => {
    try {
      const res = await api.get(`/products/category/${category}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  },

  // ✅ Search products
  searchProducts: async (query) => {
    try {
      const res = await api.get(`/products/search?q=${query}`);
      return res.data;
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  },
};

/* =========================================
   SALES API
========================================= */

export const salesAPI = {
  sellProduct: async (data) => {
    try {
      const res = await api.post("/sales/sell", data);
      return res.data;
    } catch (error) {
      console.error("Error selling product:", error);
      throw error;
    }
  },

  getSummary: async () => {
    try {
      const res = await api.get("/sales/summary");
      return res.data;
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      return {
        totalSale: 0,
        totalPurchase: 0,
        totalProfit: 0,
        totalTransactions: 0,
        salesByDate: {},
        recentSales: []
      };
    }
  },

  // ✅ Get sales by date range
  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const res = await api.get(`/sales/range?start=${startDate}&end=${endDate}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching sales by date range:", error);
      return [];
    }
  },

  // ✅ Get today's sales
  getTodaySales: async () => {
    try {
      const res = await api.get("/sales/today");
      return res.data;
    } catch (error) {
      console.error("Error fetching today's sales:", error);
      return { total: 0, count: 0 };
    }
  },

  // ✅ Get sales by product
  getSalesByProduct: async (productId) => {
    try {
      const res = await api.get(`/sales/product/${productId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching sales by product:", error);
      return [];
    }
  },

  // ✅ Get recent sales
  getRecentSales: async (limit = 10) => {
    try {
      const res = await api.get(`/sales/recent?limit=${limit}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching recent sales:", error);
      return [];
    }
  },
};

/* =========================================
   AUTH API
========================================= */

export const authAPI = {
  adminLogin: async (credentials) => {
    try {
      console.log("Attempting login...");
      const res = await api.post("/auth/admin-login", credentials);
      
      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        if (res.data.user) {
          localStorage.setItem("adminUser", JSON.stringify(res.data.user));
        }
        console.log("Login successful");
      }
      return res.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      const res = await api.get("/auth/verify");
      return res.data;
    } catch (error) {
      console.error("Token verification error:", error);
      return { valid: false };
    }
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/admin-login";
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
        productsAPI.getLowStockProducts(10),
      ]);

      return {
        products: productsSummary,
        sales: salesSummary,
        lowStock: lowStock,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        products: { totalProducts: 0, totalStock: 0 },
        sales: { totalSale: 0, totalProfit: 0 },
        lowStock: []
      };
    }
  },
};

export default api;