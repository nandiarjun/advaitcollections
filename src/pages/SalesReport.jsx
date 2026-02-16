import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { productsAPI, salesAPI } from "../services/api";
import "./SalesReport.css";

function SalesReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'productName', direction: 'asc' });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalProfit: 0,
    totalTransactions: 0,
    profitMargin: 0,
    customPriceCount: 0,
    customPriceTotal: 0,
    customPricePercentage: 0
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      window.location.href = '/admin-login';
      return;
    }

    try {
      console.log("Fetching sales report...");
      const [reportData, salesData] = await Promise.all([
        productsAPI.getProductReport(),
        salesAPI.getSummary()
      ]);
      
      console.log("Report data:", reportData);
      
      const products = Array.isArray(reportData) ? reportData : [];
      setReport(products);
      
      // Calculate stats manually from report data
      if (products.length > 0) {
        let totalSales = 0;
        let totalPurchase = 0;
        let totalProfit = 0;
        let totalTransactions = 0;
        let customPriceCount = 0;
        let customPriceTotal = 0;
        
        // Use a Map to track unique products and their total purchase values
        const productPurchaseMap = new Map();
        
        products.forEach(item => {
          // Sum up totals
          totalSales += safeNumber(item.totalSalesValue);
          totalProfit += safeNumber(item.profit);
          totalTransactions += safeNumber(item.totalSoldQty);
          
          // Track purchase value per product (only once per product)
          const productKey = item.productName;
          if (!productPurchaseMap.has(productKey)) {
            // For the first row of each product, add its totalPurchaseValue
            // This should be the full purchase value (e.g., 100 units × ₹100 = ₹10,000)
            productPurchaseMap.set(productKey, safeNumber(item.totalPurchaseValue));
          }
          
          // Custom price stats
          if (item.customSellingPrice) {
            customPriceCount++;
            customPriceTotal += safeNumber(item.totalSalesValue);
          }
        });
        
        // Sum up unique product purchase values
        productPurchaseMap.forEach(value => {
          totalPurchase += value;
        });
        
        const customPricePercentage = totalTransactions > 0 
          ? ((customPriceCount / totalTransactions) * 100).toFixed(1) 
          : 0;
        
        const profitMargin = totalSales > 0 
          ? ((totalProfit / totalSales) * 100).toFixed(2) 
          : 0;
        
        setStats({
          totalSales,
          totalPurchase,
          totalProfit,
          totalTransactions,
          profitMargin,
          customPriceCount,
          customPriceTotal,
          customPricePercentage
        });
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setError(error.message || "Failed to load sales report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Safe number formatter
  const safeNumber = (value) => {
    if (value === undefined || value === null) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Safe string formatter
  const safeString = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return String(value);
  };

  const formatPercentage = (value) => {
    const num = safeNumber(value);
    return `${num.toFixed(2)}%`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeNumber(amount));
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      if (!filteredReport.length) {
        alert("No data to export");
        return;
      }

      const exportData = filteredReport.map(item => ({
        "Product Name": safeString(item.productName),
        "Total Purchased QTY": safeNumber(item.totalPurchasedQty),
        "Purchase Price/QTY": safeNumber(item.purchasePrice).toFixed(2),
        "Total Purchase Value": safeNumber(item.totalPurchaseValue).toFixed(2),
        "Current Stock": safeNumber(item.currentStock),
        "Total Sold QTY": safeNumber(item.totalSoldQty),
        "Selling Price": safeNumber(item.sellingPrice).toFixed(2),
        "Custom Selling Price": item.customSellingPrice ? safeNumber(item.customSellingPrice).toFixed(2) : "",
        "Total Sales Value": safeNumber(item.totalSalesValue).toFixed(2),
        "Profit": safeNumber(item.profit).toFixed(2),
        "Profit Margin": formatPercentage(item.profitMargin),
        "Custom Price Used": item.customSellingPrice ? "Yes" : "No"
      }));

      // Add total row
      if (filteredReport.length > 0) {
        const firstItem = filteredReport[0];
        exportData.push({
          "Product Name": "TOTAL",
          "Total Purchased QTY": safeNumber(firstItem.totalPurchasedQty),
          "Purchase Price/QTY": safeNumber(firstItem.purchasePrice).toFixed(2),
          "Total Purchase Value": safeNumber(firstItem.totalPurchaseValue).toFixed(2),
          "Current Stock": totals.finalStock,
          "Total Sold QTY": totals.totalSold,
          "Selling Price": totals.totalSellingPrice.toFixed(2),
          "Custom Selling Price": totals.totalCustomPrice > 0 ? totals.totalCustomPrice.toFixed(2) : "",
          "Total Sales Value": totals.totalSales.toFixed(2),
          "Profit": totals.totalProfit.toFixed(2),
          "Profit Margin": "",
          "Custom Price Used": ""
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();

      const colWidths = [
        { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
        { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 12 }
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
      });

      const date = new Date().toISOString().split('T')[0];
      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      saveAs(file, `Advait_Sales_Report_${date}.xlsx`);
    } catch (error) {
      console.error("Excel export error:", error);
      alert("Failed to export Excel file. Please try again.");
    }
  };

  // Export as CSV
  const exportAsCSV = () => {
    try {
      if (!filteredReport.length) {
        alert("No data to export");
        return;
      }

      const exportData = filteredReport.map(item => ({
        Product_Name: safeString(item.productName),
        Total_Purchased_QTY: safeNumber(item.totalPurchasedQty),
        Purchase_Price_QTY: safeNumber(item.purchasePrice).toFixed(2),
        Total_Purchase_Value: safeNumber(item.totalPurchaseValue).toFixed(2),
        Current_Stock: safeNumber(item.currentStock),
        Total_Sold_QTY: safeNumber(item.totalSoldQty),
        Selling_Price: safeNumber(item.sellingPrice).toFixed(2),
        Custom_Selling_Price: item.customSellingPrice ? safeNumber(item.customSellingPrice).toFixed(2) : "",
        Total_Sales_Value: safeNumber(item.totalSalesValue).toFixed(2),
        Profit: safeNumber(item.profit).toFixed(2),
        Profit_Margin: formatPercentage(item.profitMargin),
        Custom_Price_Used: item.customSellingPrice ? "Yes" : "No"
      }));

      // Add total row
      if (filteredReport.length > 0) {
        const firstItem = filteredReport[0];
        exportData.push({
          Product_Name: "TOTAL",
          Total_Purchased_QTY: safeNumber(firstItem.totalPurchasedQty),
          Purchase_Price_QTY: safeNumber(firstItem.purchasePrice).toFixed(2),
          Total_Purchase_Value: safeNumber(firstItem.totalPurchaseValue).toFixed(2),
          Current_Stock: totals.finalStock,
          Total_Sold_QTY: totals.totalSold,
          Selling_Price: totals.totalSellingPrice.toFixed(2),
          Custom_Selling_Price: totals.totalCustomPrice > 0 ? totals.totalCustomPrice.toFixed(2) : "",
          Total_Sales_Value: totals.totalSales.toFixed(2),
          Profit: totals.totalProfit.toFixed(2),
          Profit_Margin: "",
          Custom_Price_Used: ""
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const date = new Date().toISOString().split('T')[0];
      saveAs(blob, `Advait_Sales_Report_${date}.csv`);
    } catch (error) {
      console.error("CSV export error:", error);
      alert("Failed to export CSV file. Please try again.");
    }
  };

  // Filter and sort report
  const getFilteredReport = () => {
    if (!Array.isArray(report) || report.length === 0) return [];

    let filtered = [...report];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        safeString(item.productName).toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (typeof aVal === 'number' || typeof bVal === 'number') {
        aVal = safeNumber(aVal);
        bVal = safeNumber(bVal);
      } else {
        aVal = safeString(aVal).toLowerCase();
        bVal = safeString(bVal).toLowerCase();
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredReport = getFilteredReport();

  // Calculate totals for the report table
  const totals = filteredReport.reduce((acc, item, index) => {
    const isLastItem = index === filteredReport.length - 1;
    
    return {
      totalPurchasedQty: index === 0 ? safeNumber(item.totalPurchasedQty) : acc.totalPurchasedQty,
      purchasePrice: index === 0 ? safeNumber(item.purchasePrice) : acc.purchasePrice,
      totalPurchaseValue: index === 0 ? safeNumber(item.totalPurchaseValue) : acc.totalPurchaseValue,
      finalStock: isLastItem ? safeNumber(item.currentStock) : acc.finalStock,
      totalSold: acc.totalSold + safeNumber(item.totalSoldQty),
      totalSellingPrice: acc.totalSellingPrice + safeNumber(item.sellingPrice),
      totalCustomPrice: acc.totalCustomPrice + (safeNumber(item.customSellingPrice) || 0),
      totalSales: acc.totalSales + safeNumber(item.totalSalesValue),
      totalProfit: acc.totalProfit + safeNumber(item.profit),
      customPriceCount: acc.customPriceCount + (item.customSellingPrice ? 1 : 0)
    };
  }, {
    totalPurchasedQty: 0,
    purchasePrice: 0,
    totalPurchaseValue: 0,
    finalStock: 0,
    totalSold: 0,
    totalSellingPrice: 0,
    totalCustomPrice: 0,
    totalSales: 0,
    totalProfit: 0,
    customPriceCount: 0
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <i className="bi bi-arrow-down-up sr-sort-icon"></i>;
    return sortConfig.direction === 'asc' 
      ? <i className="bi bi-arrow-up sr-sort-icon"></i>
      : <i className="bi bi-arrow-down sr-sort-icon"></i>;
  };

  if (loading) {
    return (
      <div className="sr-loading">
        <div className="sr-spinner"></div>
        <p>Loading sales report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sr-error">
        <div className="sr-error-content">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h4>Error Loading Report</h4>
          <p>{error}</p>
          <button className="sr-btn sr-btn-primary" onClick={fetchReport}>
            <i className="bi bi-arrow-repeat"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-container">
      {/* Header */}
      <div className="sr-header">
        <div className="sr-title-section">
          <h1>
            <i className="bi bi-bar-chart-line"></i>
            Sales Report
          </h1>
          <p>Product-wise sales analysis with running stock</p>
        </div>
        <Link to="/admin-dashboard" className="sr-back-btn">
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </Link>
      </div>

      {/* Main Stats Cards */}
      <div className="sr-stats-grid">
        <div className="sr-stat-card">
          <div className="sr-stat-icon primary">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="sr-stat-content">
            <span className="sr-stat-label">Total Sales</span>
            <span className="sr-stat-value">{formatCurrency(stats.totalSales)}</span>
          </div>
        </div>

        <div className="sr-stat-card">
          <div className="sr-stat-icon warning">
            <i className="bi bi-cart-check"></i>
          </div>
          <div className="sr-stat-content">
            <span className="sr-stat-label">Total Purchase</span>
            <span className="sr-stat-value">{formatCurrency(stats.totalPurchase)}</span>
          </div>
        </div>

        <div className="sr-stat-card">
          <div className="sr-stat-icon success">
            <i className="bi bi-piggy-bank"></i>
          </div>
          <div className="sr-stat-content">
            <span className="sr-stat-label">Total Profit</span>
            <span className={`sr-stat-value ${stats.totalProfit >= 0 ? 'success' : 'danger'}`}>
              {formatCurrency(stats.totalProfit)}
            </span>
          </div>
        </div>

        <div className="sr-stat-card">
          <div className="sr-stat-icon info">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="sr-stat-content">
            <span className="sr-stat-label">Transactions</span>
            <span className="sr-stat-value">{stats.totalTransactions}</span>
            <span className="sr-stat-sub">Margin: {stats.profitMargin}%</span>
          </div>
        </div>
      </div>

      {/* Custom Price Stats */}
      {stats.customPriceCount > 0 && (
        <div className="sr-custom-price-section">
          <div className="sr-custom-price-header">
            <i className="bi bi-tags-fill"></i>
            <h3>Custom Price Analysis</h3>
          </div>
          <div className="sr-custom-price-grid">
            <div className="sr-custom-price-item">
              <span className="sr-custom-price-label">Custom Price Sales</span>
              <span className="sr-custom-price-value">{stats.customPriceCount}</span>
            </div>
            <div className="sr-custom-price-item">
              <span className="sr-custom-price-label">Custom Price Total</span>
              <span className="sr-custom-price-value success">
                {formatCurrency(stats.customPriceTotal)}
              </span>
            </div>
            <div className="sr-custom-price-item">
              <span className="sr-custom-price-label">% of Total</span>
              <span className="sr-custom-price-value info">{stats.customPricePercentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="sr-filters-grid">
        <div className="sr-search-wrapper">
          <i className="bi bi-search sr-search-icon"></i>
          <input
            type="text"
            className="sr-search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sr-btn-group">
          <button className="sr-btn sr-btn-success" onClick={exportToExcel} disabled={!filteredReport.length}>
            <i className="bi bi-file-excel"></i> Excel
          </button>
          <button className="sr-btn sr-btn-outline-success" onClick={exportAsCSV} disabled={!filteredReport.length}>
            <i className="bi bi-filetype-csv"></i> CSV
          </button>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="sr-table-container">
        <div className="sr-table-header">
          <h3>
            <i className="bi bi-table"></i>
            Product Sales Report
          </h3>
          <span className="sr-count-badge">{filteredReport.length} entries</span>
        </div>
        <div className="sr-table-responsive">
          <table className="sr-table">
            <thead>
              <tr>
                <th className="sr-sortable" onClick={() => handleSort('productName')}>
                  Product Name {getSortIcon('productName')}
                </th>
                <th className="text-center sr-sortable" onClick={() => handleSort('totalPurchasedQty')}>
                  Total Purchased QTY {getSortIcon('totalPurchasedQty')}
                </th>
                <th className="text-end sr-sortable" onClick={() => handleSort('purchasePrice')}>
                  Purchase Price/QTY {getSortIcon('purchasePrice')}
                </th>
                <th className="text-end sr-sortable" onClick={() => handleSort('totalPurchaseValue')}>
                  Total Purchase Value {getSortIcon('totalPurchaseValue')}
                </th>
                <th className="text-center sr-sortable" onClick={() => handleSort('currentStock')}>
                  Current Stock {getSortIcon('currentStock')}
                </th>
                <th className="text-center sr-sortable" onClick={() => handleSort('totalSoldQty')}>
                  Total Sold QTY {getSortIcon('totalSoldQty')}
                </th>
                <th className="text-end sr-sortable" onClick={() => handleSort('sellingPrice')}>
                  Selling Price {getSortIcon('sellingPrice')}
                </th>
                <th className="text-end sr-sortable" onClick={() => handleSort('customSellingPrice')}>
                  Custom Selling Price {getSortIcon('customSellingPrice')}
                </th>
                <th className="text-end sr-sortable" onClick={() => handleSort('totalSalesValue')}>
                  Total Sales Value {getSortIcon('totalSalesValue')}
                </th>
                <th className="text-end sr-sortable" onClick={() => handleSort('profit')}>
                  Profit {getSortIcon('profit')}
                </th>
                <th className="text-center sr-sortable" onClick={() => handleSort('profitMargin')}>
                  Profit Margin {getSortIcon('profitMargin')}
                </th>
                <th className="text-center">Custom Price Used</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((item, index) => (
                <tr key={index} className={item.customSellingPrice ? 'sr-row-custom' : ''}>
                  <td>
                    <div className="sr-product-name">
                      <span className="sr-badge primary">
                        <i className="bi bi-box"></i>
                      </span>
                      <span className="fw-medium">{safeString(item.productName)}</span>
                    </div>
                  </td>
                  <td className="text-center fw-bold">{safeNumber(item.totalPurchasedQty)}</td>
                  <td className="text-end">{formatCurrency(item.purchasePrice)}</td>
                  <td className="text-end text-danger">{formatCurrency(item.totalPurchaseValue)}</td>
                  <td className="text-center">
                    <span className={`sr-badge ${safeNumber(item.currentStock) > 0 ? 'info' : 'secondary'}`}>
                      {safeNumber(item.currentStock)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="sr-badge warning">
                      {safeNumber(item.totalSoldQty)}
                    </span>
                  </td>
                  <td className="text-end">{formatCurrency(item.sellingPrice)}</td>
                  <td className="text-end">
                    {item.customSellingPrice ? (
                      <span className="sr-badge success">
                        {formatCurrency(item.customSellingPrice)}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-end text-success fw-bold">{formatCurrency(item.totalSalesValue)}</td>
                  <td className={`text-end fw-bold ${safeNumber(item.profit) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {safeNumber(item.profit) >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                  </td>
                  <td className="text-center">
                    <span className={`sr-badge ${safeNumber(item.profitMargin) >= 0 ? 'success' : 'danger'}`}>
                      {formatPercentage(item.profitMargin)}
                    </span>
                  </td>
                  <td className="text-center">
                    {item.customSellingPrice ? (
                      <span className="sr-badge success">Yes</span>
                    ) : (
                      <span className="sr-badge secondary">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* TOTAL ROW */}
            {filteredReport.length > 0 && (
              <tfoot>
                <tr className="sr-table-footer">
                  <td><strong>TOTAL</strong></td>
                  <td className="text-center"><strong>{totals.totalPurchasedQty}</strong></td>
                  <td className="text-end"><strong>{totals.purchasePrice.toFixed(2)}</strong></td>
                  <td className="text-end text-danger"><strong>{formatCurrency(totals.totalPurchaseValue)}</strong></td>
                  <td className="text-center"><strong>{totals.finalStock}</strong></td>
                  <td className="text-center"><strong>{totals.totalSold}</strong></td>
                  <td className="text-end"><strong>{totals.totalSellingPrice.toFixed(2)}</strong></td>
                  <td className="text-end">
                    {totals.totalCustomPrice > 0 ? (
                      <strong>{totals.totalCustomPrice.toFixed(2)}</strong>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="text-end text-success"><strong>{formatCurrency(totals.totalSales)}</strong></td>
                  <td className={`text-end ${totals.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                    <strong>{totals.totalProfit >= 0 ? '+' : ''}{formatCurrency(totals.totalProfit)}</strong>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>

          {filteredReport.length === 0 && (
            <div className="sr-empty-state">
              <i className="bi bi-inbox sr-empty-icon"></i>
              <h4>No Data Found</h4>
              <p>No sales data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesReport;