import { useEffect, useState, useCallback, useRef } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../api/api";
import CustomerForm from "./CustomerForm";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const toastRef = useRef(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
      await createCustomer(data);
      showToast("Customer registered successfully!");
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to create customer.",
        "error"
      );
      throw err;
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Delete customer "${name}" and all their orders? This cannot be undone.`
      )
    )
      return;
    try {
      await deleteCustomer(id);
      showToast("Customer deleted.");
      fetchCustomers();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to delete customer.",
        "error"
      );
    }
  };

  const actionTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.id, rowData.full_name)}
          title="Delete"
        />
      </div>
    );
  };

  const header = (
    <div className="page-header" style={{ margin: 0, padding: 0 }}>
      <h1 className="page-title" style={{ margin: 0 }}>Customers</h1>
      <Button
        label="Add Customer"
        icon="pi pi-user-plus"
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
        {customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="pi pi-users" style={{ fontSize: "3rem" }}></i>
            </div>
            <p className="empty-state-text">No registered customers.</p>
            <Button label="Register First Customer" icon="pi pi-plus" onClick={() => setShowForm(true)} />
          </div>
        ) : (
          <DataTable
            value={customers}
            responsiveLayout="scroll"
            stripedRows
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="p-datatable-sm"
          >
            <Column field="full_name" header="Customer Name" sortable style={{ fontWeight: 600 }} />
            <Column field="email" header="Email Address" sortable />
            <Column field="phone" header="Phone Number" sortable />
            <Column body={actionTemplate} style={{ textAlign: "right", width: "120px" }} />
          </DataTable>
        )}
      </Card>

      {/* Modal */}
      {showForm && (
        <CustomerForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
