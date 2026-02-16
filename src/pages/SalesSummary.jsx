import { useEffect, useState } from "react";
import { salesAPI } from "../services/api";
import "./SalesSummary.css";

function SalesSummary() {
  const [summary, setSummary] = useState({
    totalSale: 0,
    totalPurchase: 0,
    totalProfit: 0,
    totalTransactions: 0,
    salesByDate: {},
    recentSales: []
  });
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("overview");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      const data = await salesAPI.getSummary(token);
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError(error.message || "Failed to load sales summary");
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatShortDate = (dateString) => {
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

  if (loading) {
    return (
      <div className="slsm-loading">
        <div className="slsm-loading-content">
          <div className="slsm-spinner"></div>
          <p className="slsm-text-muted">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="slsm-error">
        <div className="slsm-error-content">
          <div className="slsm-error-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h4 className="slsm-error-title">Oops! Something went wrong</h4>
          <p className="slsm-error-message">{error}</p>
          <div className="slsm-error-actions">
            <button className="slsm-refresh-btn" onClick={fetchSummary}>
              <i className="bi bi-arrow-repeat me-2"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profitMargin = summary.totalSale > 0 
    ? ((summary.totalProfit / summary.totalSale) * 100).toFixed(2) 
    : 0;

  const averageSaleValue = summary.totalTransactions > 0 
    ? summary.totalSale / summary.totalTransactions 
    : 0;

  const averageProfit = summary.totalTransactions > 0 
    ? summary.totalProfit / summary.totalTransactions 
    : 0;

  return (
    <div className="slsm-container">
      {/* Header */}
      <div className="slsm-header">
        <div className="slsm-title-section">
          <i className="bi bi-graph-up slsm-title-icon"></i>
          <h1 className="slsm-title">Sales Analytics Dashboard</h1>
        </div>
        <button className="slsm-refresh-btn" onClick={fetchSummary}>
          <i className="bi bi-arrow-repeat"></i>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="slsm-stats-grid">
        <div className="slsm-stat-card">
          <div className="slsm-stat-content">
            <div className="slsm-stat-icon-wrapper primary">
              <i className="bi bi-cash-stack slsm-stat-icon primary"></i>
            </div>
            <div className="slsm-stat-info">
              <div className="slsm-stat-label">Total Sales</div>
              <div className="slsm-stat-value">{formatCurrency(summary.totalSale)}</div>
            </div>
          </div>
        </div>

        <div className="slsm-stat-card">
          <div className="slsm-stat-content">
            <div className="slsm-stat-icon-wrapper warning">
              <i className="bi bi-cart-check slsm-stat-icon warning"></i>
            </div>
            <div className="slsm-stat-info">
              <div className="slsm-stat-label">Total Purchase</div>
              <div className="slsm-stat-value">{formatCurrency(summary.totalPurchase)}</div>
            </div>
          </div>
        </div>

        <div className="slsm-stat-card">
          <div className="slsm-stat-content">
            <div className="slsm-stat-icon-wrapper success">
              <i className="bi bi-piggy-bank slsm-stat-icon success"></i>
            </div>
            <div className="slsm-stat-info">
              <div className="slsm-stat-label">Total Profit</div>
              <div className={`slsm-stat-value ${summary.totalProfit >= 0 ? 'success' : 'danger'}`}>
                {formatCurrency(summary.totalProfit)}
              </div>
            </div>
          </div>
        </div>

        <div className="slsm-stat-card">
          <div className="slsm-stat-content">
            <div className="slsm-stat-icon-wrapper info">
              <i className="bi bi-receipt slsm-stat-icon info"></i>
            </div>
            <div className="slsm-stat-info">
              <div className="slsm-stat-label">Transactions</div>
              <div className="slsm-stat-value">{summary.totalTransactions}</div>
              <div className="slsm-stat-sub">Margin: {profitMargin}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="slsm-view-toggle">
        <div className="slsm-toggle-group">
          <button 
            className={`slsm-toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            <i className="bi bi-pie-chart"></i>
            Overview
          </button>
          <button 
            className={`slsm-toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            <i className="bi bi-calendar-day"></i>
            Daily Breakdown
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <div className="slsm-overview-grid">
          {/* Performance Metrics */}
          <div className="slsm-card">
            <div className="slsm-card-header">
              <h6 className="slsm-card-title">Performance Metrics</h6>
            </div>
            <div className="slsm-card-body">
              <div className="slsm-progress-section">
                <div className="slsm-progress-header">
                  <span className="slsm-progress-label">Profit Margin</span>
                  <span className={`slsm-progress-value ${profitMargin >= 0 ? 'success' : 'danger'}`}>
                    {profitMargin}%
                  </span>
                </div>
                <div className="slsm-progress-bar">
                  <div 
                    className={`slsm-progress-fill ${profitMargin >= 0 ? 'success' : 'danger'}`}
                    style={{ width: `${Math.min(Math.abs(profitMargin), 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="slsm-metrics-grid">
                <div className="slsm-metric-card">
                  <span className="slsm-metric-label">Average Sale Value</span>
                  <h5 className="slsm-metric-value primary">{formatCurrency(averageSaleValue)}</h5>
                </div>
                <div className="slsm-metric-card">
                  <span className="slsm-metric-label">Average Profit</span>
                  <h5 className={`slsm-metric-value ${averageProfit >= 0 ? 'success' : 'danger'}`}>
                    {formatCurrency(averageProfit)}
                  </h5>
                </div>
              </div>

              <div className="slsm-breakdown">
                <div className="slsm-breakdown-item">
                  <span className="slsm-breakdown-label">Total Revenue</span>
                  <span className="slsm-breakdown-value">{formatCurrency(summary.totalSale)}</span>
                </div>
                <div className="slsm-breakdown-item">
                  <span className="slsm-breakdown-label">Total Cost</span>
                  <span className="slsm-breakdown-value slsm-text-danger">{formatCurrency(summary.totalPurchase)}</span>
                </div>
                <div className="slsm-breakdown-total">
                  <span className="slsm-breakdown-label">Net Profit</span>
                  <span className={`slsm-breakdown-value ${summary.totalProfit >= 0 ? 'slsm-text-success' : 'slsm-text-danger'}`}>
                    {formatCurrency(summary.totalProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="slsm-card">
            <div className="slsm-card-header">
              <div className="slsm-card-header-flex">
                <h6 className="slsm-card-title">Recent Transactions</h6>
                <span className="slsm-card-badge">{summary.recentSales?.length || 0} sales</span>
              </div>
            </div>
            <div className="slsm-card-body-no-padding">
              <div className="slsm-recent-list">
                {summary.recentSales && summary.recentSales.length > 0 ? (
                  summary.recentSales.map((sale, index) => (
                    <div key={index} className="slsm-recent-item">
                      <div className="slsm-recent-content">
                        <div className="slsm-recent-info">
                          <h6>{sale.productId?.name || 'Unknown Product'}</h6>
                          <div className="slsm-recent-meta">
                            <span className="slsm-recent-meta-item">
                              <i className="bi bi-clock"></i>
                              {formatDate(sale.createdAt)}
                            </span>
                            <span className="slsm-recent-meta-item">
                              <i className="bi bi-box"></i>
                              Quantity: {sale.quantitySold}
                            </span>
                          </div>
                        </div>
                        <div className="slsm-recent-amount">
                          <div className="slsm-recent-sale">{formatCurrency(sale.totalSaleValue)}</div>
                          <div className={`slsm-recent-profit ${sale.profit >= 0 ? 'success' : 'danger'}`}>
                            {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="slsm-empty-state">
                    <i className="bi bi-inbox slsm-empty-icon"></i>
                    <p className="slsm-empty-title">No recent sales</p>
                    <p className="slsm-empty-text">Complete your first sale to see it here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Daily Breakdown */
        <div className="slsm-card">
          <div className="slsm-card-header">
            <h6 className="slsm-card-title">Daily Sales Breakdown</h6>
          </div>
          <div className="slsm-card-body">
            {summary.salesByDate && Object.keys(summary.salesByDate).length > 0 ? (
              <div className="slsm-table-responsive">
                <table className="slsm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="text-center">Transactions</th>
                      <th className="text-end">Total Sales</th>
                      <th className="text-end">Total Profit</th>
                      <th className="text-center">Margin</th>
                      <th className="text-center">Avg Sale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.salesByDate)
                      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                      .map(([date, data]) => {
                        const margin = ((data.totalProfit / data.totalSale) * 100).toFixed(2);
                        const avgSale = data.totalSale / data.count;
                        return (
                          <tr key={date}>
                            <td>
                              <span className="slsm-text-muted">{formatShortDate(date)}</span>
                            </td>
                            <td className="text-center">
                              <span className="slsm-badge info">{data.count}</span>
                            </td>
                            <td className="text-end slsm-text-primary">
                              {formatCurrency(data.totalSale)}
                            </td>
                            <td className={`text-end ${data.totalProfit >= 0 ? 'slsm-text-success' : 'slsm-text-danger'}`}>
                              {data.totalProfit >= 0 ? '+' : ''}{formatCurrency(data.totalProfit)}
                            </td>
                            <td className="text-center">
                              <span className={`slsm-badge ${margin >= 0 ? 'success' : 'danger'}`}>
                                {margin}%
                              </span>
                            </td>
                            <td className="text-center slsm-text-muted">
                              {formatCurrency(avgSale)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="slsm-empty-state">
                <i className="bi bi-calendar-x slsm-empty-icon"></i>
                <p className="slsm-empty-title">No daily data available</p>
                <p className="slsm-empty-text">Complete some sales to see daily breakdown</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesSummary;