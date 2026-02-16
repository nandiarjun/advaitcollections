import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { productsAPI } from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalSaleValue: 0,
    totalPurchaseValue: 0,
    totalProfit: 0,
    todaySaleValue: 0,
    todayProfit: 0
  });
  
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'productName', direction: 'asc' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }

    try {
      await Promise.all([
        fetchSummary(),
        fetchReport()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await productsAPI.getDashboardSummary();
      setSummary(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error("Summary fetch error:", error);
      throw new Error("Failed to load summary data");
    }
  };

  const fetchReport = async () => {
    try {
      const data = await productsAPI.getProductReport();
      setReport(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Report fetch error:", error);
      setReport([]);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (!filteredReport.length) {
      alert("No data to export");
      return;
    }

    const exportData = filteredReport.map(item => ({
      "Product Name": item.productName || 'N/A',
      "Barcode": item.barcode || 'N/A',
      "Current Stock": item.currentStock || 0,
      "Total Sold": item.totalSoldQty || 0,
      "Total Purchased": item.totalPurchasedQty || 0,
      "Purchase Rate": `₹${(item.purchaseRate || 0).toFixed(2)}`,
      "Selling Rate": `₹${(item.sellingRate || 0).toFixed(2)}`,
      "Total Purchase Value": `₹${(item.totalPurchaseValue || 0).toFixed(2)}`,
      "Total Sales Value": `₹${(item.totalSalesValue || 0).toFixed(2)}`,
      "Profit/Loss": `₹${(item.profit || 0).toFixed(2)}`,
      "Profit Margin": `${(item.profitMargin || 0).toFixed(2)}%`
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    const colWidths = [
      { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const date = new Date().toISOString().split('T')[0];
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(file, `Advait_Collections_Report_${date}.xlsx`);
  };

  // Export as CSV
  const exportAsCSV = () => {
    if (!filteredReport.length) {
      alert("No data to export");
      return;
    }

    const exportData = filteredReport.map(item => ({
      Product: item.productName || 'N/A',
      Barcode: item.barcode || 'N/A',
      Stock: item.currentStock || 0,
      Sold: item.totalSoldQty || 0,
      Purchased: item.totalPurchasedQty || 0,
      Purchase_Rate: (item.purchaseRate || 0).toFixed(2),
      Selling_Rate: (item.sellingRate || 0).toFixed(2),
      Purchase_Value: (item.totalPurchaseValue || 0).toFixed(2),
      Sales_Value: (item.totalSalesValue || 0).toFixed(2),
      Profit: (item.profit || 0).toFixed(2),
      Margin: `${(item.profitMargin || 0).toFixed(2)}%`
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const date = new Date().toISOString().split('T')[0];
    saveAs(blob, `Advait_Collections_Report_${date}.csv`);
  };

  // Filter and sort report
  const getFilteredReport = () => {
    if (!Array.isArray(report) || report.length === 0) return [];

    let filtered = [...report];

    // Apply profit/loss filter
    if (dateRange === "profit") {
      filtered = filtered.filter(item => (item.profit || 0) > 0);
    } else if (dateRange === "loss") {
      filtered = filtered.filter(item => (item.profit || 0) < 0);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      aVal = aVal !== undefined ? aVal : '';
      bVal = bVal !== undefined ? bVal : '';
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredReport = getFilteredReport();

  // Calculate totals
  const totals = filteredReport.reduce((acc, item) => ({
    totalSales: acc.totalSales + (item.totalSalesValue || 0),
    totalPurchases: acc.totalPurchases + (item.totalPurchaseValue || 0),
    totalProfit: acc.totalProfit + (item.profit || 0),
    totalStock: acc.totalStock + (item.currentStock || 0),
    totalSold: acc.totalSold + (item.totalSoldQty || 0)
  }), {
    totalSales: 0,
    totalPurchases: 0,
    totalProfit: 0,
    totalStock: 0,
    totalSold: 0
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <i className="bi bi-arrow-down-up adm-dash-sort-icon"></i>;
    return sortConfig.direction === 'asc' 
      ? <i className="bi bi-arrow-up adm-dash-sort-icon"></i>
      : <i className="bi bi-arrow-down adm-dash-sort-icon"></i>;
  };

  if (loading) {
    return (
      <div className="adm-dash-loading">
        <div className="adm-dash-loading-content">
          <div className="adm-dash-spinner"></div>
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adm-dash-error">
        <div className="adm-dash-error-content">
          <div className="adm-dash-error-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h4 className="adm-dash-error-title">Oops! Something went wrong</h4>
          <p className="adm-dash-error-message">{error}</p>
          <div className="adm-dash-error-actions">
            <button className="adm-dash-btn adm-dash-btn-primary" onClick={fetchData}>
              <i className="bi bi-arrow-repeat me-2"></i>
              Retry
            </button>
            <Link to="/admin-login" className="adm-dash-btn adm-dash-btn-outline">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login Again
            </Link>
          </div>
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
            Admin Dashboard
          </h1>
          <p>Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="adm-dash-actions">
          <button className="adm-dash-btn adm-dash-btn-outline" onClick={fetchData}>
            <i className="bi bi-arrow-repeat me-2"></i>
            Refresh
          </button>
          <Link to="/admin/sales/new" className="adm-dash-btn adm-dash-btn-primary">
            <i className="bi bi-cart-plus me-2"></i>
            New Sale
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="adm-dash-stats-grid">
        <div className="adm-dash-stat-card">
          <div className="adm-dash-stat-content">
            <div className="adm-dash-stat-icon primary">
              <i className="bi bi-box-seam"></i>
            </div>
            <div className="adm-dash-stat-info">
              <div className="adm-dash-stat-label">Total Products</div>
              <div className="adm-dash-stat-value">{summary.totalProducts || 0}</div>
              <div className="adm-dash-stat-sub">
                <i className="bi bi-tag"></i>
                Unique items
              </div>
            </div>
          </div>
        </div>

        <div className="adm-dash-stat-card">
          <div className="adm-dash-stat-content">
            <div className="adm-dash-stat-icon success">
              <i className="bi bi-boxes"></i>
            </div>
            <div className="adm-dash-stat-info">
              <div className="adm-dash-stat-label">Total Stock</div>
              <div className="adm-dash-stat-value">{summary.totalStock || 0}</div>
              <div className="adm-dash-stat-sub">
                <i className="bi bi-cube"></i>
                Units available
              </div>
            </div>
          </div>
        </div>

        <div className="adm-dash-stat-card">
          <div className="adm-dash-stat-content">
            <div className="adm-dash-stat-icon info">
              <i className="bi bi-graph-up"></i>
            </div>
            <div className="adm-dash-stat-info">
              <div className="adm-dash-stat-label">Total Sales</div>
              <div className="adm-dash-stat-value">{formatCurrency(summary.totalSaleValue)}</div>
              <div className="adm-dash-stat-sub">
                <i className="bi bi-calendar"></i>
                Today: {formatCurrency(summary.todaySaleValue)}
              </div>
            </div>
          </div>
        </div>

        <div className="adm-dash-stat-card">
          <div className="adm-dash-stat-content">
            <div className="adm-dash-stat-icon warning">
              <i className="bi bi-cash-stack"></i>
            </div>
            <div className="adm-dash-stat-info">
              <div className="adm-dash-stat-label">Total Profit</div>
              <div className={`adm-dash-stat-value ${(summary.totalProfit || 0) >= 0 ? 'adm-dash-stat-success' : 'adm-dash-stat-danger'}`}>
                {formatCurrency(summary.totalProfit)}
              </div>
              <div className="adm-dash-stat-sub">
                <i className="bi bi-calendar"></i>
                Today: {formatCurrency(summary.todayProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="adm-dash-filters-grid">
        <div className="adm-dash-search-wrapper">
          <i className="bi bi-search adm-dash-search-icon"></i>
          <input
            type="text"
            className="adm-dash-search-input"
            placeholder="Search products or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="adm-dash-btn-group">
          <button 
            className={`adm-dash-btn ${dateRange === 'all' ? 'adm-dash-btn-primary' : 'adm-dash-btn-outline'}`}
            onClick={() => setDateRange('all')}
          >
            All Products
          </button>
          <button 
            className={`adm-dash-btn ${dateRange === 'profit' ? 'adm-dash-btn-success' : 'adm-dash-btn-outline-success'}`}
            onClick={() => setDateRange('profit')}
          >
            Profit Only
          </button>
          <button 
            className={`adm-dash-btn ${dateRange === 'loss' ? 'adm-dash-btn-danger' : 'adm-dash-btn-outline'}`}
            onClick={() => setDateRange('loss')}
          >
            Loss Only
          </button>
        </div>
        <div className="adm-dash-btn-group">
          <button className="adm-dash-btn adm-dash-btn-success" onClick={exportToExcel} disabled={!filteredReport.length}>
            <i className="bi bi-file-excel me-2"></i>
            Excel
          </button>
          <button className="adm-dash-btn adm-dash-btn-outline-success" onClick={exportAsCSV} disabled={!filteredReport.length}>
            <i className="bi bi-filetype-csv me-2"></i>
            CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="adm-dash-summary-bar">
        <div className="adm-dash-summary-card">
          <div className="adm-dash-summary-grid">
            <div className="adm-dash-summary-item">
              <div className="adm-dash-summary-label">Total Stock</div>
              <div className="adm-dash-summary-value">{totals.totalStock}</div>
            </div>
            <div className="adm-dash-summary-item">
              <div className="adm-dash-summary-label">Total Sold</div>
              <div className="adm-dash-summary-value">{totals.totalSold}</div>
            </div>
            <div className="adm-dash-summary-item">
              <div className="adm-dash-summary-label">Sales Value</div>
              <div className="adm-dash-summary-value success">{formatCurrency(totals.totalSales)}</div>
            </div>
            <div className="adm-dash-summary-item">
              <div className="adm-dash-summary-label">Purchase Value</div>
              <div className="adm-dash-summary-value danger">{formatCurrency(totals.totalPurchases)}</div>
            </div>
            <div className="adm-dash-summary-item">
              <div className="adm-dash-summary-label">Net Profit</div>
              <div className={`adm-dash-summary-value ${totals.totalProfit >= 0 ? 'success' : 'danger'}`}>
                {formatCurrency(totals.totalProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Report Table */}
      <div className="adm-dash-section-card adm-dash-product-table">
        <div className="adm-dash-product-header">
          <div className="adm-dash-product-title">
            <h3>
              <i className="bi bi-table me-2" style={{ color: '#2563eb' }}></i>
              Product Report
            </h3>
            <span className="adm-dash-count-badge">{filteredReport.length} products</span>
          </div>
          <div className="adm-dash-timestamp">
            <i className="bi bi-clock me-1"></i>
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
        <div className="adm-dash-table-responsive">
          <table className="adm-dash-table">
            <thead>
              <tr>
                <th className="adm-dash-sortable" onClick={() => handleSort('productName')}>
                  Product {getSortIcon('productName')}
                </th>
                <th className="adm-dash-sortable" onClick={() => handleSort('barcode')}>
                  Barcode {getSortIcon('barcode')}
                </th>
                <th className="text-center adm-dash-sortable" onClick={() => handleSort('currentStock')}>
                  Stock {getSortIcon('currentStock')}
                </th>
                <th className="text-center adm-dash-sortable" onClick={() => handleSort('totalSoldQty')}>
                  Sold {getSortIcon('totalSoldQty')}
                </th>
                <th className="text-center">Purchased</th>
                <th className="text-end adm-dash-sortable" onClick={() => handleSort('purchaseRate')}>
                  Purchase Rate {getSortIcon('purchaseRate')}
                </th>
                <th className="text-end adm-dash-sortable" onClick={() => handleSort('sellingRate')}>
                  Selling Rate {getSortIcon('sellingRate')}
                </th>
                <th className="text-end">Purchase Value</th>
                <th className="text-end">Sales Value</th>
                <th className="text-end adm-dash-sortable" onClick={() => handleSort('profit')}>
                  Profit/Loss {getSortIcon('profit')}
                </th>
                <th className="text-center adm-dash-sortable" onClick={() => handleSort('profitMargin')}>
                  Margin {getSortIcon('profitMargin')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="adm-dash-product-badge primary">
                        <i className="bi bi-box"></i>
                      </span>
                      <span>{item.productName || 'N/A'}</span>
                      {(item.profitMargin || 0) > 20 && (
                        <span className="adm-dash-product-badge success">High Margin</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <code className="text-muted">{item.barcode || 'N/A'}</code>
                  </td>
                  <td className="text-center">
                    <span className={`adm-dash-product-badge ${(item.currentStock || 0) > 0 ? 'info' : 'secondary'}`}>
                      {item.currentStock || 0}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="adm-dash-product-badge warning">
                      {item.totalSoldQty || 0}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="adm-dash-product-badge secondary">
                      {item.totalPurchasedQty || 0}
                    </span>
                  </td>
                  <td className="text-end">{formatCurrency(item.purchaseRate)}</td>
                  <td className="text-end">{formatCurrency(item.sellingRate)}</td>
                  <td className="text-end text-danger">{formatCurrency(item.totalPurchaseValue)}</td>
                  <td className="text-end text-success">{formatCurrency(item.totalSalesValue)}</td>
                  <td className={`text-end fw-bold ${(item.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {(item.profit || 0) >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                  </td>
                  <td className="text-center">
                    <span className={`adm-dash-product-badge ${(item.profitMargin || 0) >= 0 ? 'success' : 'danger'}`}>
                      {(item.profitMargin || 0).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: '#f8fafc', fontWeight: 600 }}>
              <tr>
                <td colSpan="2">Totals ({filteredReport.length} products)</td>
                <td className="text-center">{totals.totalStock}</td>
                <td className="text-center">{totals.totalSold}</td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-end text-danger">{formatCurrency(totals.totalPurchases)}</td>
                <td className="text-end text-success">{formatCurrency(totals.totalSales)}</td>
                <td className={`text-end ${totals.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {totals.totalProfit >= 0 ? '+' : ''}{formatCurrency(totals.totalProfit)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {filteredReport.length === 0 && (
            <div className="adm-dash-empty-state">
              <div className="adm-dash-empty-icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h4 className="adm-dash-empty-title">No Products Found</h4>
              <p className="adm-dash-empty-text">
                {searchTerm || dateRange !== 'all' 
                  ? "No products match your filters. Try adjusting your search criteria."
                  : "No products available in the database."}
              </p>
              {(searchTerm || dateRange !== 'all') && (
                <button 
                  className="adm-dash-btn adm-dash-btn-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setDateRange('all');
                  }}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;