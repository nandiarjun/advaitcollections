import axios from "axios";

// Base API URL - Use environment variable with fallback to production URL
const API_URL = import.meta.env.VITE_API_URL || "https://advaitcollections-backend.onrender.com/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Important for cookies/sessions if used
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging (optional)
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log slow requests in development (optional)
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      if (duration > 1000) {
        console.warn(`Slow API call (${duration}ms):`, response.config.url);
      }
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors globally
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("adminToken");
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/admin-login')) {
        window.location.href = '/admin-login';
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data?.message);
    }
    
    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error("Resource not found:", error.config?.url);
    }
    
    // Handle 500 Internal Server errors
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response.data?.message);
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout - server may be slow or unavailable");
    }
    
    if (!error.response) {
      console.error("Network error - check your internet connection");
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors with detailed messages
const handleApiError = (error) => {
  // Log error in development only
  if (import.meta.env.DEV) {
    console.error("API Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
  }

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw {
      success: false,
      status: error.response.status,
      message: error.response.data?.message || getErrorMessage(error.response.status),
      data: error.response.data,
      timestamp: new Date().toISOString()
    };
  } else if (error.request) {
    // The request was made but no response was received
    throw {
      success: false,
      message: "Unable to connect to server. Please check your internet connection.",
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    throw {
      success: false,
      message: error.message || "An unexpected error occurred",
      error: error,
      timestamp: new Date().toISOString()
    };
  }
};

// Helper function to get user-friendly error messages
const getErrorMessage = (status) => {
  switch (status) {
    case 400: return "Bad request. Please check your input.";
    case 401: return "Unauthorized. Please login again.";
    case 403: return "You don't have permission to perform this action.";
    case 404: return "Resource not found.";
    case 409: return "Conflict with existing data.";
    case 422: return "Validation failed. Please check your input.";
    case 429: return "Too many requests. Please try again later.";
    case 500: return "Internal server error. Please try again later.";
    case 502: return "Bad gateway. Server may be down.";
    case 503: return "Service unavailable. Please try again later.";
    case 504: return "Gateway timeout. Server is taking too long to respond.";
    default: return `Error ${status}. Please try again.`;
  }
};

// Settings API
export const settingsAPI = {
  // Get all settings
  getSettings: async () => {
    try {
      const response = await api.get("/settings");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
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
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Logo upload progress: ${percentCompleted}%`);
          }
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
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
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Favicon upload progress: ${percentCompleted}%`);
          }
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
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
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Team image upload progress: ${percentCompleted}%`);
          }
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
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
      throw handleApiError(error);
    }
  },

  // Update business info
  updateBusinessInfo: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/business`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update contact info
  updateContactInfo: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/contact`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update social media
  updateSocialMedia: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/social`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update business hours
  updateBusinessHours: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/hours`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update about content
  updateAboutContent: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/about`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update SEO
  updateSeoSettings: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/seo`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update theme
  updateThemeSettings: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/theme`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update footer
  updateFooterContent: async (data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/footer`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add phone
  addPhone: async (data, token) => {
    try {
      const response = await axios.post(`${API_URL}/settings/phone`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove phone
  removePhone: async (index, token) => {
    try {
      const response = await axios.delete(`${API_URL}/settings/phone/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add email
  addEmail: async (data, token) => {
    try {
      const response = await axios.post(`${API_URL}/settings/email`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove email
  removeEmail: async (index, token) => {
    try {
      const response = await axios.delete(`${API_URL}/settings/email/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add team member
  addTeamMember: async (data, token) => {
    try {
      const response = await axios.post(`${API_URL}/settings/team`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update team member
  updateTeamMember: async (index, data, token) => {
    try {
      const response = await axios.put(`${API_URL}/settings/team/${index}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove team member
  removeTeamMember: async (index, token) => {
    try {
      const response = await axios.delete(`${API_URL}/settings/team/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add core value
  addCoreValue: async (data, token) => {
    try {
      const response = await axios.post(`${API_URL}/settings/values`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Remove core value
  removeCoreValue: async (index, token) => {
    try {
      const response = await axios.delete(`${API_URL}/settings/values/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Products API
export const productsAPI = {
  // Get all products (public)
  getAllProducts: async () => {
    try {
      const response = await api.get("/products");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add product (admin only)
  addProduct: async (data, token) => {
    try {
      const response = await axios.post(`${API_URL}/products/add`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update product (admin only)
  updateProduct: async (id, data, token) => {
    try {
      const response = await axios.put(`${API_URL}/products/update/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete product (admin only)
  deleteProduct: async (id, token, force = false) => {
    try {
      const url = force 
        ? `${API_URL}/products/delete/${id}?force=true`
        : `${API_URL}/products/delete/${id}`;
      
      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get dashboard summary (admin only)
  getDashboardSummary: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/products/dashboard-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get product report (admin only)
  getProductReport: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/products/product-report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get product sales history (admin only)
  getProductSalesHistory: async (id, token) => {
    try {
      const response = await axios.get(`${API_URL}/products/sales-history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Sales API
export const salesAPI = {
  // Process a sale (admin only)
  sellProduct: async (data, token) => {
    try {
      const response = await axios.post(`${API_URL}/sales/sell`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get sales summary (admin only)
  getSummary: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/sales/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get sales history (admin only)
  getSalesHistory: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/sales/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Auth API
export const authAPI = {
  // Admin login
  adminLogin: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin-login`, credentials, {
        timeout: 10000 // 10 seconds timeout for login
      });
      
      // Store token if login successful
      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("adminToken");
    window.location.href = '/admin-login';
  }
};

// Export all APIs as a single object
export default {
  settings: settingsAPI,
  products: productsAPI,
  sales: salesAPI,
  auth: authAPI
};