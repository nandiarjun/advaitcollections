import axios from "axios";

/* =========================================
   BASE API CONFIG
========================================= */

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
  
  if (isDevelopment) {
    // Use localhost for development
    return "http://localhost:5000/api";
  }
  
  // Use environment variable or default production URL
  return import.meta.env.VITE_API_URL || "https://advaitcollections-backend.onrender.com/api";
};

const API_URL = getApiUrl();

console.log("🚀 Environment:", import.meta.env.MODE);
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

    // Show the exact URL being called (only in development)
    if (import.meta.env.DEV) {
      console.log(`🌐 Calling: ${config.baseURL}${config.url}`);
      if (config.data) {
        console.log("📤 Request Data:", config.data);
      }
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
    if (import.meta.env.DEV) {
      console.log("🟢 Response received from:", response.config.url);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error("🔴 Response error:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
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
   HELPER FUNCTIONS
========================================= */

const handleApiError = (error, defaultReturn) => {
  if (import.meta.env.DEV) {
    console.error("API Error:", error);
  }
  return defaultReturn;
};

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
          tagline: "Premium Garments & Fashion Accessories",
          address: {
            street: "123 Fashion Street",
            city: "Bengaluru",
            state: "Karnataka",
            country: "India",
            pincode: "560034",
            fullAddress: "123 Fashion Street, Koramangala, Bengaluru - 560034"
          },
          phoneNumbers: [
            { type: "office", number: "+91 98765 43210", isPrimary: true }
          ],
          emails: [
            { type: "general", email: "contact@advaitcollections.com", isPrimary: true }
          ],
          socialMedia: {
            facebook: "#",
            instagram: "#",
            twitter: "#",
            youtube: "#",
            whatsapp: "#",
            linkedin: "#",
            pinterest: "#"
          },
          businessHours: {
            monday: { open: "10:00", close: "21:00", closed: false },
            tuesday: { open: "10:00", close: "21:00", closed: false },
            wednesday: { open: "10:00", close: "21:00", closed: false },
            thursday: { open: "10:00", close: "21:00", closed: false },
            friday: { open: "10:00", close: "21:00", closed: false },
            saturday: { open: "10:00", close: "21:00", closed: false },
            sunday: { open: "11:00", close: "19:00", closed: false }
          }
        } 
      };
    }
  },

  // Upload logo
  uploadLogo: async (file, token) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await axios.post(`${API_URL}/settings/upload/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        timeout: 120000, // 2 minutes for file upload
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  },

  // Upload favicon
  uploadFavicon: async (file, token) => {
    try {
      const formData = new FormData();
      formData.append('favicon', file);
      
      const response = await axios.post(`${API_URL}/settings/upload/favicon`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading favicon:", error);
      throw error;
    }
  },

  // Upload team member image
  uploadTeamImage: async (file, memberIndex, token) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(`${API_URL}/settings/upload/team/${memberIndex}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading team image:", error);
      throw error;
    }
  },

  // Delete image
  deleteImage: async (type, publicId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/settings/image/${type}/${publicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },

  updateSettings: async (settingsData) => {
    const res = await api.put("/settings", settingsData);
    return res.data;
  },

  updateBusinessInfo: async (data) => {
    const res = await api.put("/settings/business", data);
    return res.data;
  },

  updateContactInfo: async (data) => {
    const res = await api.put("/settings/contact", data);
    return res.data;
  },

  updateSocialMedia: async (data) => {
    const res = await api.put("/settings/social", data);
    return res.data;
  },

  updateBusinessHours: async (data) => {
    const res = await api.put("/settings/hours", data);
    return res.data;
  },

  updateAboutContent: async (data) => {
    const res = await api.put("/settings/about", data);
    return res.data;
  },

  updateSeoSettings: async (data) => {
    const res = await api.put("/settings/seo", data);
    return res.data;
  },

  updateThemeSettings: async (data) => {
    const res = await api.put("/settings/theme", data);
    return res.data;
  },

  updateFooterContent: async (data) => {
    const res = await api.put("/settings/footer", data);
    return res.data;
  },

  addPhone: async (data) => {
    const res = await api.post("/settings/phone", data);
    return res.data;
  },

  removePhone: async (index) => {
    const res = await api.delete(`/settings/phone/${index}`);
    return res.data;
  },

  addEmail: async (data) => {
    const res = await api.post("/settings/email", data);
    return res.data;
  },

  removeEmail: async (index) => {
    const res = await api.delete(`/settings/email/${index}`);
    return res.data;
  },

  addTeamMember: async (data) => {
    const res = await api.post("/settings/team", data);
    return res.data;
  },

  removeTeamMember: async (index) => {
    const res = await api.delete(`/settings/team/${index}`);
    return res.data;
  },

  addCoreValue: async (data) => {
    const res = await api.post("/settings/values", data);
    return res.data;
  },

  removeCoreValue: async (index) => {
    const res = await api.delete(`/settings/values/${index}`);
    return res.data;
  }
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

  getDashboardSummary: async () => {
    try {
      console.log("Fetching dashboard summary...");
      const res = await api.get("/products/dashboard-summary");
      console.log("Dashboard summary response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
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

  getProductReport: async () => {
    try {
      console.log("Fetching product report...");
      const res = await api.get("/products/product-report");
      console.log("Product report response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching product report:", error);
      return [];
    }
  },

  getProductSalesHistory: async (id) => {
    try {
      const res = await api.get(`/products/sales-history/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching product sales history:", error);
      return { sales: [], salesCount: 0 };
    }
  },

  getLowStockProducts: async (threshold = 10) => {
    try {
      const res = await api.get(`/products/low-stock?threshold=${threshold}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return [];
    }
  },

  getProductsByCategory: async (category) => {
    try {
      const res = await api.get(`/products/category/${category}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  },

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
   SALES API - UPDATED WITH ENHANCED METHODS
========================================= */

export const salesAPI = {
  // Sell a product
  sellProduct: async (data) => {
    try {
      const res = await api.post("/sales/sell", data);
      return res.data;
    } catch (error) {
      console.error("Error selling product:", error);
      throw error;
    }
  },

  // Get sales summary with enhanced custom price stats
  getSummary: async () => {
    try {
      const res = await api.get("/sales/summary");
      return res.data;
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      return {
        summary: {
          totalSale: 0,
          totalPurchase: 0,
          totalProfit: 0,
          totalTransactions: 0,
          averageProfitMargin: 0
        },
        customPriceStats: {
          count: 0,
          total: 0,
          percentage: 0,
          belowDefault: 0,
          aboveDefault: 0,
          equalDefault: 0,
          details: []
        },
        salesByDate: {},
        recentSales: []
      };
    }
  },

  // Get custom price analytics
  getCustomPriceAnalytics: async () => {
    try {
      const res = await api.get("/sales/custom-price-analytics");
      return res.data;
    } catch (error) {
      console.error("Error fetching custom price analytics:", error);
      return {
        success: false,
        analytics: {
          totalCustomSales: 0,
          totalCustomValue: 0,
          averageCustomPrice: 0,
          byProduct: {},
          byMonth: {}
        }
      };
    }
  },

  // Get sales history with optional filters
  getSalesHistory: async (limit = 50, productId = null, startDate = null, endDate = null) => {
    try {
      let url = `/sales/history?limit=${limit}`;
      if (productId) url += `&productId=${productId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      console.error("Error fetching sales history:", error);
      return { success: false, sales: [] };
    }
  },

  // Get sale by ID
  getSaleById: async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching sale by ID:", error);
      throw error;
    }
  },

  // Get sales by product
  getSalesByProduct: async (productId) => {
    try {
      const res = await api.get(`/sales/product/${productId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching sales by product:", error);
      return { success: false, sales: [] };
    }
  },

  // Get daily sales
  getDailySales: async (date) => {
    try {
      const url = date ? `/sales/daily?date=${date}` : '/sales/daily';
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      return { 
        success: false, 
        totalTransactions: 0,
        totalSale: 0,
        totalProfit: 0,
        customPriceSales: 0,
        sales: [] 
      };
    }
  },

  // Get today's sales
  getTodaySales: async () => {
    try {
      const res = await api.get("/sales/daily");
      return res.data;
    } catch (error) {
      console.error("Error fetching today's sales:", error);
      return { total: 0, count: 0, customPriceCount: 0 };
    }
  },

  // Get sales by date range
  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const res = await api.get(`/sales/range?start=${startDate}&end=${endDate}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching sales by date range:", error);
      return [];
    }
  },

  // Get recent sales with custom price info
  getRecentSales: async (limit = 10) => {
    try {
      const res = await api.get(`/sales/recent?limit=${limit}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching recent sales:", error);
      return [];
    }
  },

  // Get sales statistics with custom price breakdown
  getSalesStatistics: async (period = 'month') => {
    try {
      const res = await api.get(`/sales/statistics?period=${period}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching sales statistics:", error);
      return {
        success: false,
        totalSales: 0,
        totalProfit: 0,
        averageSaleValue: 0,
        customPricePercentage: 0,
        customPriceStats: {
          belowDefault: 0,
          aboveDefault: 0,
          equalDefault: 0
        }
      };
    }
  },

  // Get products with custom prices
  getProductsWithCustomPrices: async () => {
    try {
      const res = await api.get("/sales/products-with-custom-prices");
      return res.data;
    } catch (error) {
      console.error("Error fetching products with custom prices:", error);
      return { success: false, products: [] };
    }
  },

  // Get custom price sales by product
  getCustomPriceSalesByProduct: async (productId) => {
    try {
      const res = await api.get(`/sales/custom-price/product/${productId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching custom price sales by product:", error);
      return { success: false, sales: [] };
    }
  },

  // Get custom price trends
  getCustomPriceTrends: async (months = 6) => {
    try {
      const res = await api.get(`/sales/custom-price-trends?months=${months}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching custom price trends:", error);
      return {
        success: false,
        trends: [],
        summary: {
          totalCustomSales: 0,
          averageCustomPrice: 0,
          mostCommonDeviation: 'none'
        }
      };
    }
  }
};

/* =========================================
   AUTH API
========================================= */

export const authAPI = {
  adminLogin: async (credentials) => {
    try {
      console.log("Attempting login...");
      const res = await api.post("/auth/login", credentials);
      
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
      const [productsSummary, salesSummary, lowStock, customPriceAnalytics] = await Promise.all([
        productsAPI.getDashboardSummary(),
        salesAPI.getSummary(),
        productsAPI.getLowStockProducts(10),
        salesAPI.getCustomPriceAnalytics()
      ]);

      return {
        products: productsSummary,
        sales: salesSummary.summary || { totalSale: 0, totalProfit: 0, totalTransactions: 0 },
        lowStock: lowStock,
        customPriceStats: salesSummary.customPriceStats || {
          count: 0,
          total: 0,
          percentage: 0,
          belowDefault: 0,
          aboveDefault: 0,
          equalDefault: 0
        },
        customPriceAnalytics: customPriceAnalytics.analytics || {
          totalCustomSales: 0,
          totalCustomValue: 0,
          averageCustomPrice: 0,
          byProduct: {},
          byMonth: {}
        },
        recentSales: salesSummary.recentSales || []
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        products: { totalProducts: 0, totalStock: 0 },
        sales: { totalSale: 0, totalProfit: 0, totalTransactions: 0 },
        lowStock: [],
        customPriceStats: { count: 0, total: 0, percentage: 0, belowDefault: 0, aboveDefault: 0, equalDefault: 0 },
        customPriceAnalytics: { totalCustomSales: 0, totalCustomValue: 0, averageCustomPrice: 0, byProduct: {}, byMonth: {} },
        recentSales: []
      };
    }
  },

  // Get comprehensive sales report data
  getComprehensiveReport: async (startDate, endDate) => {
    try {
      const url = startDate && endDate 
        ? `/dashboard/comprehensive-report?start=${startDate}&end=${endDate}`
        : '/dashboard/comprehensive-report';
      
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      console.error("Error fetching comprehensive report:", error);
      return {
        success: false,
        summary: {},
        productWise: [],
        dateWise: [],
        customPriceAnalysis: {
          totalCustomTransactions: 0,
          customValue: 0,
          belowDefault: 0,
          aboveDefault: 0,
          equalDefault: 0,
          byProduct: []
        }
      };
    }
  },

  // Get custom price dashboard
  getCustomPriceDashboard: async () => {
    try {
      const res = await api.get("/dashboard/custom-price");
      return res.data;
    } catch (error) {
      console.error("Error fetching custom price dashboard:", error);
      return {
        success: false,
        overview: {
          totalCustomTransactions: 0,
          totalCustomValue: 0,
          uniqueProducts: 0
        },
        comparison: {
          belowDefault: 0,
          aboveDefault: 0,
          equalDefault: 0
        },
        topProducts: [],
        monthlyTrend: []
      };
    }
  }
};

export default api;