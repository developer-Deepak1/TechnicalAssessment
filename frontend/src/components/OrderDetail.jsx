import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, deleteOrder } from "../api/api";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await getOrder(id);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const showToast = (message, severity = "success") => {
    toastRef.current.show({
      severity: severity,
      summary: severity === "success" ? "Success" : "Error",
      detail: message,
      life: 3000,
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await deleteOrder(id);
      showToast("Order cancelled.");
      setTimeout(() => navigate("/orders"), 1000);
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to cancel order.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="pi pi-search" style={{ fontSize: "3rem" }}></i>
        </div>
        <p className="empty-state-text">Order not found.</p>
        <Button label="Back to Orders" icon="pi pi-arrow-left" onClick={() => navigate("/orders")} />
      </div>
    );
  }

  const unitPriceTemplate = (rowData) => {
    return `$${rowData.unit_price.toFixed(2)}`;
  };

  const subtotalTemplate = (rowData) => {
    return `$${rowData.subtotal.toFixed(2)}`;
  };

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <Button
          label="Back to Orders"
          icon="pi pi-arrow-left"
          className="p-button-text p-button-secondary"
          onClick={() => navigate("/orders")}
          style={{ paddingLeft: 0 }}
        />
        <h2 className="modal-title" style={{ margin: "var(--space-2) 0 0 0" }}>
          Order #{order.id}
        </h2>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
          Placed on {new Date(order.created_at).toLocaleString()}
        </span>
      </div>
      <div>
        <Button
          label="Cancel Order"
          icon="pi pi-trash"
          className="p-button-danger p-button-outlined"
          onClick={handleDelete}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Toast ref={toastRef} />

      <Card header={header} style={{ marginTop: "var(--space-4)" }}>
        <div className="order-detail-info">
          <div className="order-detail-field">
            <label>Customer Name</label>
            <span>{order.customer_name || "Unknown Customer"}</span>
          </div>
          <div className="order-detail-field">
            <label>Customer ID</label>
            <span>{order.customer_id}</span>
          </div>
          <div className="order-detail-field">
            <label>Status</label>
            <div>
              <Badge value={order.status.toUpperCase()} severity="success" />
            </div>
          </div>
          <div className="order-detail-field">
            <label>Total Value</label>
            <span style={{ color: "var(--color-accent)", fontSize: "1.25rem" }}>
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        <Divider style={{ margin: "var(--space-6) 0" }} />

        <h3 className="modal-title" style={{ fontSize: "1.1rem", marginBottom: "var(--space-4)" }}>
          Itemized List
        </h3>
        
        <DataTable value={order.items} className="p-datatable-sm" stripedRows>
          <Column
            field="product_name"
            header="Product"
            body={(rowData) => rowData.product_name || `Product ID: ${rowData.product_id}`}
            style={{ fontWeight: 600 }}
          />
          <Column field="quantity" header="Quantity" />
          <Column field="unit_price" header="Unit Price" body={unitPriceTemplate} />
          <Column field="subtotal" header="Subtotal" body={subtotalTemplate} style={{ textAlign: "right" }} />
        </DataTable>
      </Card>
    </div>
  );
}
