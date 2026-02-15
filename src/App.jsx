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

// ================= PUBLIC LAYOUT =================
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

// ================= ADMIN LAYOUT =================
function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        <Route
          path="/products"
          element={
            <PublicLayout>
              <Products />
            </PublicLayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <PublicLayout>
              <ProductDetails />
            </PublicLayout>
          }
        />

        {/* ================= ADMIN LOGIN (PUBLIC) ================= */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ================= ADMIN PROTECTED ROUTES ================= */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/add-product"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddProduct />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/sales"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Sales />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/summary"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SalesSummary />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={
            <PublicLayout>
              <div className="container text-center py-5">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for doesn't exist.</p>
              </div>
            </PublicLayout>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
