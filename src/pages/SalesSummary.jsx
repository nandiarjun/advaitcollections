import { useEffect, useState } from "react";
import { salesAPI } from "../services/api";

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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary mt-3" onClick={fetchSummary}>
          <i className="bi bi-arrow-repeat me-2"></i>
          Retry
        </button>
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
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-graph-up me-2 text-primary"></i>
          Sales Analytics Dashboard
        </h4>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchSummary}>
          <i className="bi bi-arrow-repeat me-2"></i>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-cash-stack fs-4 text-primary"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Sales</h6>
                  <h4 className="mb-0 fw-bold">{formatCurrency(summary.totalSale)}</h4>
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
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-cart-check fs-4 text-warning"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Purchase</h6>
                  <h4 className="mb-0 fw-bold">{formatCurrency(summary.totalPurchase)}</h4>
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
                    <i className={`bi bi-piggy-bank fs-4 ${summary.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Profit</h6>
                  <h4 className={`mb-0 fw-bold ${summary.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(summary.totalProfit)}
                  </h4>
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
                    <i className="bi bi-receipt fs-4 text-info"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Transactions</h6>
                  <h4 className="mb-0 fw-bold">{summary.totalTransactions}</h4>
                  <small className="text-muted">Margin: {profitMargin}%</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-4">
        <div className="btn-group">
          <button 
            className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('overview')}
          >
            <i className="bi bi-pie-chart me-2"></i>
            Overview
          </button>
          <button 
            className={`btn ${viewMode === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('daily')}
          >
            <i className="bi bi-calendar-day me-2"></i>
            Daily Breakdown
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <div className="row g-4">
          {/* Performance Metrics */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-3">
                <h6 className="fw-bold mb-0">Performance Metrics</h6>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Profit Margin</span>
                    <span className={`fw-bold ${profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
                      {profitMargin}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div 
                      className={`progress-bar ${profitMargin >= 0 ? 'bg-success' : 'bg-danger'}`}
                      style={{ width: `${Math.min(Math.abs(profitMargin), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="bg-light rounded p-3">
                      <small className="text-muted d-block mb-1">Average Sale Value</small>
                      <h5 className="mb-0 fw-bold text-primary">{formatCurrency(averageSaleValue)}</h5>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light rounded p-3">
                      <small className="text-muted d-block mb-1">Average Profit</small>
                      <h5 className={`mb-0 fw-bold ${averageProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(averageProfit)}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <span className="text-muted">Total Revenue</span>
                    <span className="fw-bold">{formatCurrency(summary.totalSale)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="text-muted">Total Cost</span>
                    <span className="fw-bold text-danger">{formatCurrency(summary.totalPurchase)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                    <span className="text-muted">Net Profit</span>
                    <span className={`fw-bold ${summary.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(summary.totalProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">Recent Transactions</h6>
                <span className="badge bg-primary">{summary.recentSales?.length || 0} sales</span>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  {summary.recentSales && summary.recentSales.length > 0 ? (
                    summary.recentSales.map((sale, index) => (
                      <div key={index} className="list-group-item border-0 border-bottom">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-semibold mb-1">{sale.productId?.name || 'Unknown Product'}</h6>
                            <small className="text-muted d-block">
                              <i className="bi bi-clock me-1"></i>
                              {formatDate(sale.createdAt)}
                            </small>
                            <small className="text-muted d-block">
                              <i className="bi bi-box me-1"></i>
                              Quantity: {sale.quantitySold}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-primary">{formatCurrency(sale.totalSaleValue)}</div>
                            <div className={`small ${sale.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                              {sale.profit >= 0 ? '+' : ''}{formatCurrency(sale.profit)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <p className="text-muted mt-2">No recent sales</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Daily Breakdown */
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-3">
            <h6 className="fw-bold mb-0">Daily Sales Breakdown</h6>
          </div>
          <div className="card-body">
            {summary.salesByDate && Object.keys(summary.salesByDate).length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
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
                              <span className="fw-medium">{formatShortDate(date)}</span>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-info bg-opacity-10 text-info">
                                {data.count}
                              </span>
                            </td>
                            <td className="text-end fw-medium">
                              {formatCurrency(data.totalSale)}
                            </td>
                            <td className={`text-end fw-medium ${data.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                              {data.totalProfit >= 0 ? '+' : ''}{formatCurrency(data.totalProfit)}
                            </td>
                            <td className="text-center">
                              <span className={`badge ${margin >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                {margin}%
                              </span>
                            </td>
                            <td className="text-center text-muted">
                              {formatCurrency(avgSale)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x fs-1 text-muted"></i>
                <p className="text-muted mt-2">No daily data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesSummary;