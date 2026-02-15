import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { productsAPI } from "../services/api";

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

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }
      await Promise.all([fetchSummary(), fetchReport()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await productsAPI.getDashboardSummary(token);
      setSummary(data);
    } catch (error) {
      throw error;
    }
  };

  const fetchReport = async () => {
    try {
      const data = await productsAPI.getProductReport(token);
      setReport(data);
    } catch (error) {
      throw error;
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredReport.map(item => ({
      "Product Name": item.productName,
      "Barcode": item.barcode,
      "Current Stock": item.currentStock,
      "Total Sold": item.totalSoldQty,
      "Total Purchased": item.totalPurchasedQty,
      "Purchase Rate": `₹${item.purchaseRate}`,
      "Selling Rate": `₹${item.sellingRate}`,
      "Total Purchase Value": `₹${item.totalPurchaseValue.toFixed(2)}`,
      "Total Sales Value": `₹${item.totalSalesValue.toFixed(2)}`,
      "Profit/Loss": `₹${item.profit.toFixed(2)}`,
      "Profit Margin": `${item.profitMargin}%`
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Set column widths
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
    const exportData = filteredReport.map(item => ({
      Product: item.productName,
      Barcode: item.barcode,
      Stock: item.currentStock,
      Sold: item.totalSoldQty,
      Purchased: item.totalPurchasedQty,
      Purchase_Rate: item.purchaseRate,
      Selling_Rate: item.sellingRate,
      Purchase_Value: item.totalPurchaseValue.toFixed(2),
      Sales_Value: item.totalSalesValue.toFixed(2),
      Profit: item.profit.toFixed(2),
      Margin: `${item.profitMargin}%`
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const date = new Date().toISOString().split('T')[0];
    saveAs(blob, `Advait_Collections_Report_${date}.csv`);
  };

  // Filter and sort report
  const getFilteredReport = () => {
    let filtered = [...report];

    // Apply profit/loss filter
    if (dateRange === "profit") {
      filtered = filtered.filter(item => item.profit > 0);
    } else if (dateRange === "loss") {
      filtered = filtered.filter(item => item.profit < 0);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
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
    totalSales: acc.totalSales + item.totalSalesValue,
    totalPurchases: acc.totalPurchases + item.totalPurchaseValue,
    totalProfit: acc.totalProfit + item.profit,
    totalStock: acc.totalStock + item.currentStock,
    totalSold: acc.totalSold + item.totalSoldQty
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
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <i className="bi bi-arrow-down-up ms-1 text-muted"></i>;
    return sortConfig.direction === 'asc' 
      ? <i className="bi bi-arrow-up ms-1"></i>
      : <i className="bi bi-arrow-down ms-1"></i>;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5 text-center">
        <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
        <h4 className="mt-3">Oops! Something went wrong</h4>
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary mt-3" onClick={fetchData}>
          <i className="bi bi-arrow-repeat me-2"></i>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            Admin Dashboard
          </h4>
          <p className="text-muted small mb-0">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={fetchData}>
            <i className="bi bi-arrow-repeat me-2"></i>
            Refresh
          </button>
          <Link to="/admin-dashboard/sales" className="btn btn-primary btn-sm">
            <i className="bi bi-cart-plus me-2"></i>
            New Sale
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-box-seam fs-4 text-primary"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Products</h6>
                  <h4 className="mb-0 fw-bold">{summary.totalProducts}</h4>
                  <small className="text-muted">Unique items</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-boxes fs-4 text-success"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Stock</h6>
                  <h4 className="mb-0 fw-bold">{summary.totalStock}</h4>
                  <small className="text-muted">Units available</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-graph-up fs-4 text-info"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Sales</h6>
                  <h4 className="mb-0 fw-bold text-info">{formatCurrency(summary.totalSaleValue)}</h4>
                  <small className="text-muted">Today: {formatCurrency(summary.todaySaleValue)}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className={`bg-opacity-10 p-3 rounded ${summary.totalProfit >= 0 ? 'bg-success' : 'bg-danger'}`}>
                    <i className={`bi bi-cash-stack fs-4 ${summary.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Profit</h6>
                  <h4 className={`mb-0 fw-bold ${summary.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(summary.totalProfit)}
                  </h4>
                  <small className="text-muted">Today: {formatCurrency(summary.todayProfit)}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="btn-group w-100">
            <button 
              className={`btn ${dateRange === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateRange('all')}
            >
              All Products
            </button>
            <button 
              className={`btn ${dateRange === 'profit' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setDateRange('profit')}
            >
              Profit Only
            </button>
            <button 
              className={`btn ${dateRange === 'loss' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setDateRange('loss')}
            >
              Loss Only
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="btn-group w-100">
            <button className="btn btn-success" onClick={exportToExcel}>
              <i className="bi bi-file-excel me-2"></i>
              Excel
            </button>
            <button className="btn btn-outline-success" onClick={exportAsCSV}>
              <i className="bi bi-filetype-csv me-2"></i>
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body py-3">
              <div className="row text-center">
                <div className="col">
                  <div className="px-3">
                    <small className="text-muted d-block">Total Stock</small>
                    <span className="fw-bold fs-5">{totals.totalStock}</span>
                  </div>
                </div>
                <div className="col">
                  <div className="px-3 border-start">
                    <small className="text-muted d-block">Total Sold</small>
                    <span className="fw-bold fs-5">{totals.totalSold}</span>
                  </div>
                </div>
                <div className="col">
                  <div className="px-3 border-start">
                    <small className="text-muted d-block">Sales Value</small>
                    <span className="fw-bold fs-5 text-success">{formatCurrency(totals.totalSales)}</span>
                  </div>
                </div>
                <div className="col">
                  <div className="px-3 border-start">
                    <small className="text-muted d-block">Purchase Value</small>
                    <span className="fw-bold fs-5 text-danger">{formatCurrency(totals.totalPurchases)}</span>
                  </div>
                </div>
                <div className="col">
                  <div className="px-3 border-start">
                    <small className="text-muted d-block">Net Profit</small>
                    <span className={`fw-bold fs-5 ${totals.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(totals.totalProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Report Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">
              <i className="bi bi-table me-2 text-primary"></i>
              Product Report
              <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                {filteredReport.length} products
              </span>
            </h6>
            <small className="text-muted">
              Last updated: {new Date().toLocaleString()}
            </small>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="cursor-pointer px-3" onClick={() => handleSort('productName')}>
                    Product {getSortIcon('productName')}
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('barcode')}>
                    Barcode {getSortIcon('barcode')}
                  </th>
                  <th className="text-center cursor-pointer" onClick={() => handleSort('currentStock')}>
                    Stock {getSortIcon('currentStock')}
                  </th>
                  <th className="text-center cursor-pointer" onClick={() => handleSort('totalSoldQty')}>
                    Sold {getSortIcon('totalSoldQty')}
                  </th>
                  <th className="text-center">Purchased</th>
                  <th className="text-end cursor-pointer" onClick={() => handleSort('purchaseRate')}>
                    Purchase Rate {getSortIcon('purchaseRate')}
                  </th>
                  <th className="text-end cursor-pointer" onClick={() => handleSort('sellingRate')}>
                    Selling Rate {getSortIcon('sellingRate')}
                  </th>
                  <th className="text-end">Purchase Value</th>
                  <th className="text-end">Sales Value</th>
                  <th className="text-end cursor-pointer" onClick={() => handleSort('profit')}>
                    Profit/Loss {getSortIcon('profit')}
                  </th>
                  <th className="text-center cursor-pointer" onClick={() => handleSort('profitMargin')}>
                    Margin {getSortIcon('profitMargin')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReport.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded p-1 me-2">
                          <i className="bi bi-box text-primary"></i>
                        </div>
                        <div>
                          <span className="fw-medium">{item.productName}</span>
                          {item.profitMargin > 20 && (
                            <span className="badge bg-success bg-opacity-10 text-success ms-2">High Margin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="text-muted">{item.barcode}</code>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${item.currentStock > 0 ? 'bg-info' : 'bg-secondary'} bg-opacity-10 text-${item.currentStock > 0 ? 'info' : 'secondary'}`}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-warning bg-opacity-10 text-warning">
                        {item.totalSoldQty}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-secondary bg-opacity-10 text-secondary">
                        {item.totalPurchasedQty}
                      </span>
                    </td>
                    <td className="text-end">{formatCurrency(item.purchaseRate)}</td>
                    <td className="text-end">{formatCurrency(item.sellingRate)}</td>
                    <td className="text-end text-danger">{formatCurrency(item.totalPurchaseValue)}</td>
                    <td className="text-end text-success">{formatCurrency(item.totalSalesValue)}</td>
                    <td className={`text-end fw-bold ${item.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${item.profitMargin >= 0 ? 'bg-success' : 'bg-danger'}`}>
                        {item.profitMargin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="2" className="px-3">Totals ({filteredReport.length} products)</td>
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
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="text-muted mt-2">No products found</p>
                {(searchTerm || dateRange !== 'all') && (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      setSearchTerm('');
                      setDateRange('all');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom CSS */}
      <style jsx="true">{`
        .cursor-pointer {
          cursor: pointer;
        }
        .cursor-pointer:hover {
          background-color: #e9ecef;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;