import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsAPI, salesAPI } from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalSaleValue: 0,
    totalPurchaseValue: 0,
    totalProfit: 0,
    todaySaleValue: 0,
    todayProfit: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      navigate('/admin-login');
      return;
    }

    try {
      console.log("Fetching dashboard data...");
      const [summaryData, salesData] = await Promise.all([
        productsAPI.getDashboardSummary(),
        salesAPI.getSummary()
      ]);
      
      console.log("Summary data:", summaryData);
      console.log("Sales data:", salesData);
      
      // Fetch products for low stock calculation
      const products = await productsAPI.getAllProducts();
      const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
      const outOfStockCount = products.filter(p => p.quantity === 0).length;
      
      setSummary({
        totalProducts: summaryData?.totalProducts || 0,
        totalStock: summaryData?.totalStock || 0,
        totalSaleValue: summaryData?.totalSaleValue || 0,
        totalPurchaseValue: summaryData?.totalPurchaseValue || 0,
        totalProfit: summaryData?.totalProfit || 0,
        todaySaleValue: summaryData?.todaySaleValue || 0,
        todayProfit: summaryData?.todayProfit || 0,
        lowStockCount,
        outOfStockCount
      });
      
      setRecentSales(salesData?.recentSales?.slice(0, 4) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Navigation functions
  const goToProducts = () => navigate('/admin-dashboard/products');
  const goToAddProduct = () => navigate('/admin-dashboard/add-product');
  const goToSales = () => navigate('/admin-dashboard/sales');
  const goToSalesReport = () => navigate('/admin-dashboard/sales-report');
  const goToSalesSummary = () => navigate('/admin-dashboard/summary');
  const goToSettings = () => navigate('/admin-dashboard/settings');

  if (loading) {
    return (
      <div className="adm-dash-loading">
        <div className="adm-dash-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adm-dash-error">
        <div className="adm-dash-error-content">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h4>Oops! Something went wrong</h4>
          <p>{error}</p>
          <button className="adm-dash-btn adm-dash-btn-primary" onClick={fetchData}>
            <i className="bi bi-arrow-repeat"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-dash-container">
      {/* Header */}
      <div className="adm-dash-header">
        <div className="adm-dash-title-section">
          <h1>
            <i className="bi bi-speedometer2"></i>
            Dashboard
          </h1>
          <p>Welcome back! Here's your store overview</p>
        </div>
        <div className="adm-dash-actions">
          <button className="adm-dash-btn adm-dash-btn-outline" onClick={fetchData}>
            <i className="bi bi-arrow-repeat"></i> Refresh
          </button>
          <button className="adm-dash-btn adm-dash-btn-primary" onClick={goToSales}>
            <i className="bi bi-cart-plus"></i> New Sale
          </button>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="adm-dash-stats-grid">
        <div className="adm-dash-stat-card clickable" onClick={goToProducts}>
          <div className="adm-dash-stat-icon primary">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="adm-dash-stat-info">
            <div className="adm-dash-stat-label">Total Products</div>
            <div className="adm-dash-stat-value">{summary.totalProducts}</div>
            <div className="adm-dash-stat-footer">Click to manage →</div>
          </div>
        </div>

        <div className="adm-dash-stat-card clickable" onClick={goToProducts}>
          <div className="adm-dash-stat-icon success">
            <i className="bi bi-boxes"></i>
          </div>
          <div className="adm-dash-stat-info">
            <div className="adm-dash-stat-label">Total Stock</div>
            <div className="adm-dash-stat-value">{summary.totalStock}</div>
            <div className="adm-dash-stat-footer">
              {summary.lowStockCount > 0 && (
                <span className="text-warning">{summary.lowStockCount} low stock</span>
              )}
            </div>
          </div>
        </div>

        <div className="adm-dash-stat-card clickable" onClick={goToSalesReport}>
          <div className="adm-dash-stat-icon info">
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="adm-dash-stat-info">
            <div className="adm-dash-stat-label">Total Sales</div>
            <div className="adm-dash-stat-value">{formatCurrency(summary.totalSaleValue)}</div>
            <div className="adm-dash-stat-footer">Today: {formatCurrency(summary.todaySaleValue)}</div>
          </div>
        </div>

        <div className="adm-dash-stat-card clickable" onClick={goToSalesReport}>
          <div className="adm-dash-stat-icon warning">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="adm-dash-stat-info">
            <div className="adm-dash-stat-label">Total Profit</div>
            <div className={`adm-dash-stat-value ${summary.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(summary.totalProfit)}
            </div>
            <div className="adm-dash-stat-footer">Today: {formatCurrency(summary.todayProfit)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="adm-dash-quick-actions">
        <h3>Quick Actions</h3>
        <div className="adm-dash-action-grid">
          <div className="adm-dash-action-card" onClick={goToAddProduct}>
            <div className="adm-dash-action-icon add">
              <i className="bi bi-plus-circle"></i>
            </div>
            <div className="adm-dash-action-info">
              <h4>Add Product</h4>
              <p>Create new product</p>
            </div>
          </div>
          
          <div className="adm-dash-action-card" onClick={goToSales}>
            <div className="adm-dash-action-icon sale">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="adm-dash-action-info">
              <h4>New Sale</h4>
              <p>Process sale</p>
            </div>
          </div>
          
          <div className="adm-dash-action-card" onClick={goToSalesReport}>
            <div className="adm-dash-action-icon report">
              <i className="bi bi-bar-chart"></i>
            </div>
            <div className="adm-dash-action-info">
              <h4>Sales Report</h4>
              <p>View analytics</p>
            </div>
          </div>
          
          <div className="adm-dash-action-card" onClick={goToSettings}>
            <div className="adm-dash-action-icon settings">
              <i className="bi bi-gear"></i>
            </div>
            <div className="adm-dash-action-info">
              <h4>Settings</h4>
              <p>Store settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <div className="adm-dash-recent-sales">
          <div className="adm-dash-section-header">
            <h3>Recent Transactions</h3>
            <Link to="/admin-dashboard/sales-report" className="adm-dash-view-all">
              View Full Report <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="adm-dash-recent-grid">
            {recentSales.map((sale, index) => (
              <div key={sale._id || index} className="adm-dash-recent-card">
                <div className="adm-dash-recent-header">
                  <span className="adm-dash-recent-product">
                    {sale.productId?.name || sale.productName || 'Product'}
                  </span>
                  <span className={`adm-dash-recent-profit ${sale.profit >= 0 ? 'profit' : 'loss'}`}>
                    {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                  </span>
                </div>
                <div className="adm-dash-recent-details">
                  <span><i className="bi bi-sort-numeric-up"></i> {sale.quantitySold}</span>
                  <span className="adm-dash-recent-amount">{formatCurrency(sale.totalSaleValue)}</span>
                </div>
                <div className="adm-dash-recent-time">
                  <i className="bi bi-clock"></i> {formatDate(sale.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {(summary.lowStockCount > 0 || summary.outOfStockCount > 0) && (
        <div className="adm-dash-alerts">
          <h3>Alerts</h3>
          <div className="adm-dash-alerts-list">
            {summary.lowStockCount > 0 && (
              <div className="adm-dash-alert-item warning">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{summary.lowStockCount} products are low on stock (less than 10 units)</span>
                <button className="adm-dash-alert-btn" onClick={goToProducts}>View</button>
              </div>
            )}
            {summary.outOfStockCount > 0 && (
              <div className="adm-dash-alert-item danger">
                <i className="bi bi-x-circle-fill"></i>
                <span>{summary.outOfStockCount} products are out of stock</span>
                <button className="adm-dash-alert-btn" onClick={goToProducts}>Restock</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;