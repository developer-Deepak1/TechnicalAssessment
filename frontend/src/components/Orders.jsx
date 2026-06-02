import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, createOrder, deleteOrder } from "../api/api";
import OrderForm from "./OrderForm";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const toastRef = useRef(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const showToast = (message, severity = "success") => {
    toastRef.current.show({
      severity: severity,
      summary: severity === "success" ? "Success" : "Error",
      detail: message,
      life: 3000,
    });
  };

  const handleCreate = async (data) => {
    try {
      await createOrder(data);
      showToast("Order created successfully!");
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to create order.",
        "error"
      );
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Cancel order #${id}? Stock will be restored.`))
      return;
    try {
      await deleteOrder(id);
      showToast("Order cancelled successfully.");
      fetchOrders();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to cancel order.",
        "error"
      );
    }
  };

  const orderIdTemplate = (rowData) => {
    return (
      <Button
        label={`#${rowData.id}`}
        className="p-button-text p-button-sm p-button-secondary"
        onClick={() => navigate(`/orders/${rowData.id}`)}
        style={{ fontFamily: "monospace", padding: 0 }}
      />
    );
  };

  const totalItemsTemplate = (rowData) => {
    return rowData.items
      ? rowData.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;
  };

  const totalAmountTemplate = (rowData) => {
    return `$${rowData.total_amount.toFixed(2)}`;
  };

  const statusTemplate = (rowData) => {
    return <Badge value={rowData.status.toUpperCase()} severity="success" />;
  };

  const dateTemplate = (rowData) => {
    return new Date(rowData.created_at).toLocaleString();
  };

  const actionTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => navigate(`/orders/${rowData.id}`)}
          title="View Details"
        />
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.id)}
          title="Cancel Order"
        />
      </div>
    );
  };

  const header = (
    <div className="page-header" style={{ margin: 0, padding: 0 }}>
      <h1 className="page-title" style={{ margin: 0 }}>Orders</h1>
      <Button
        label="New Order"
        icon="pi pi-shopping-cart"
        onClick={() => setShowForm(true)}
        className="p-button-primary"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toastRef} />

      <Card header={header}>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="pi pi-shopping-cart" style={{ fontSize: "3rem" }}></i>
            </div>
            <p className="empty-state-text">No orders placed yet.</p>
            <Button label="Place Your First Order" icon="pi pi-plus" onClick={() => setShowForm(true)} />
          </div>
        ) : (
          <DataTable
            value={orders}
            responsiveLayout="scroll"
            stripedRows
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="p-datatable-sm"
          >
            <Column header="Order ID" body={orderIdTemplate} sortable />
            <Column
              field="customer_name"
              header="Customer"
              body={(rowData) => rowData.customer_name || `Customer ID: ${rowData.customer_id}`}
              sortable
              style={{ fontWeight: 600 }}
            />
            <Column header="Total Items" body={totalItemsTemplate} />
            <Column
              field="total_amount"
              header="Total Value"
              body={totalAmountTemplate}
              sortable
              style={{ color: "var(--color-accent)", fontWeight: 600 }}
            />
            <Column field="status" header="Status" body={statusTemplate} sortable />
            <Column field="created_at" header="Placed At" body={dateTemplate} sortable />
            <Column body={actionTemplate} style={{ textAlign: "right", width: "120px" }} />
          </DataTable>
        )}
      </Card>

      {/* Modal */}
      {showForm && (
        <OrderForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
