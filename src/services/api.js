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
   RESPONSE INTERCEPTOR (FIXED VERSION)
========================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    const isAdminRoute = currentPath.startsWith("/admin");

    // ✅ Only redirect if user is inside admin route
    if (status === 401 && isAdminRoute) {
      console.warn("Unauthorized admin access. Redirecting to login...");
      localStorage.removeItem("adminToken");
      window.location.href = "/admin-login";
    }

    return Promise.reject(error);
  }
);

/* =========================================
   ERROR HANDLER
========================================= */

const handleApiError = (error) => {
  if (error.response) {
    throw {
      success: false,
      status: error.response.status,
      message:
        error.response.data?.message ||
        `Error ${error.response.status}`,
    };
  } else if (error.request) {
    throw {
      success: false,
      message: "Unable to connect to server.",
    };
  } else {
    throw {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================
   SETTINGS API (PUBLIC + ADMIN SAFE)
========================================= */

export const settingsAPI = {
  getSettings: async () => {
    try {
      const res = await api.get("/settings");
      return res.data;
    } catch (error) {
      // 🔥 IMPORTANT: Don't break public pages
      if (error.response?.status === 401) {
        return { success: false };
      }
      throw handleApiError(error);
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

  addProduct: async (data, token) => {
    const res = await axios.post(
      `${API_URL}/products/add`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  updateProduct: async (id, data, token) => {
    const res = await axios.put(
      `${API_URL}/products/update/${id}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  deleteProduct: async (id, token) => {
    const res = await axios.delete(
      `${API_URL}/products/delete/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  getDashboardSummary: async (token) => {
    const res = await axios.get(
      `${API_URL}/products/dashboard-summary`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },
};

/* =========================================
   SALES API
========================================= */

export const salesAPI = {
  sellProduct: async (data, token) => {
    const res = await axios.post(
      `${API_URL}/sales/sell`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  getSummary: async (token) => {
    const res = await axios.get(
      `${API_URL}/sales/summary`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },
};

/* =========================================
   AUTH API
========================================= */

export const authAPI = {
  adminLogin: async (credentials) => {
    const res = await axios.post(
      `${API_URL}/auth/admin-login`,
      credentials
    );

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
