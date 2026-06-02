import { useEffect, useState } from "react";
import { getDashboard } from "../api/api";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "primereact/badge";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="pi pi-exclamation-triangle" style={{ fontSize: "3rem" }}></i>
        </div>
        <p className="empty-state-text">Failed to load dashboard data.</p>
      </div>
    );
  }

  const statusBodyTemplate = (rowData) => {
    const isOutOfStock = rowData.quantity_in_stock === 0;
    return (
      <Badge
        value={isOutOfStock ? "Out of Stock" : "Low Stock"}
        severity={isOutOfStock ? "danger" : "warning"}
      />
    );
  };

  const skuTemplate = (rowData) => {
    return <code>{rowData.sku}</code>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card" style={{ overflow: "hidden" }}>
          <div className="stat-card-icon" style={{ color: "var(--color-primary)" }}>
            <i className="pi pi-box" style={{ fontSize: "2rem" }}></i>
          </div>
          <div className="stat-card-value">{data.total_products}</div>
          <div className="stat-card-label">Total Products</div>
        </Card>

        <Card className="stat-card" style={{ overflow: "hidden" }}>
          <div className="stat-card-icon" style={{ color: "var(--color-accent)" }}>
            <i className="pi pi-users" style={{ fontSize: "2rem" }}></i>
          </div>
          <div className="stat-card-value">{data.total_customers}</div>
          <div className="stat-card-label">Total Customers</div>
        </Card>

        <Card className="stat-card" style={{ overflow: "hidden" }}>
          <div className="stat-card-icon" style={{ color: "var(--color-info)" }}>
            <i className="pi pi-shopping-cart" style={{ fontSize: "2rem" }}></i>
          </div>
          <div className="stat-card-value">{data.total_orders}</div>
          <div className="stat-card-label">Total Orders</div>
        </Card>

        <Card className="stat-card" style={{ overflow: "hidden" }}>
          <div className="stat-card-icon" style={{ color: "var(--color-warning)" }}>
            <i className="pi pi-exclamation-triangle" style={{ fontSize: "2rem" }}></i>
          </div>
          <div className="stat-card-value">{data.low_stock_products.length}</div>
          <div className="stat-card-label">Low Stock Items</div>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card title="Low Stock Alerts" style={{ marginTop: "var(--space-6)" }}>
        {data.low_stock_products.length === 0 ? (
          <p className="empty-state-text" style={{ fontSize: "0.875rem", margin: 0 }}>
            🎉 All products have sufficient stock.
          </p>
        ) : (
          <DataTable
            value={data.low_stock_products}
            responsiveLayout="scroll"
            className="p-datatable-sm"
            stripedRows
          >
            <Column field="name" header="Product" sortable />
            <Column field="sku" header="SKU" body={skuTemplate} sortable />
            <Column field="quantity_in_stock" header="Quantity Left" sortable />
            <Column header="Status" body={statusBodyTemplate} />
          </DataTable>
        )}
      </Card>
    </div>
  );
}
