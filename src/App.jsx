import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminNavbar from "./components/AdminNavbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import Sales from "./pages/Sales";
import SalesSummary from "./pages/SalesSummary";
import AdminSettings from "./pages/AdminSettings";

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES (NO PROTECTION NEEDED) ================= */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
              <Footer />
            </>
          }
        />

        <Route
          path="/products"
          element={
            <>
              <Navbar />
              <Products />
              <Footer />
            </>
          }
        />

        <Route
          path="/product/:id"
          element={
            <>
              <Navbar />
              <ProductDetails />
              <Footer />
            </>
          }
        />

        {/* Admin Login - Public */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ================= ADMIN PROTECTED ROUTES (ONLY THESE NEED TOKEN) ================= */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminNavbar />
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/add-product"
          element={
            <ProtectedRoute>
              <AdminNavbar />
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/sales"
          element={
            <ProtectedRoute>
              <AdminNavbar />
              <Sales />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/summary"
          element={
            <ProtectedRoute>
              <AdminNavbar />
              <SalesSummary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/settings"
          element={
            <ProtectedRoute>
              <AdminNavbar />
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found Route */}
        <Route
          path="*"
          element={
            <div className="container text-center py-5">
              <h1 className="display-1">404</h1>
              <h2>Page Not Found</h2>
              <p className="text-muted">The page you are looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary mt-3">Go Home</a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;