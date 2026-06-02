import { useEffect, useState, useCallback, useRef } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/api";
import ProductForm from "./ProductForm";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const toastRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      await createProduct(data);
      showToast("Product created successfully!");
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to create product.",
        "error"
      );
      throw err;
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateProduct(editProduct.id, data);
      showToast("Product updated successfully!");
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to update product.",
        "error"
      );
      throw err;
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"? This cannot be undone.`))
      return;
    try {
      await deleteProduct(id);
      showToast("Product deleted.");
      fetchProducts();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to delete product.",
        "error"
      );
    }
  };

  const priceTemplate = (rowData) => {
    return `$${rowData.price.toFixed(2)}`;
  };

  const stockTemplate = (rowData) => {
    const isOutOfStock = rowData.quantity_in_stock === 0;
    const isLowStock = rowData.quantity_in_stock <= 10;
    
    return (
      <Badge
        value={
          isOutOfStock
            ? "Out of Stock"
            : isLowStock
            ? `Low Stock (${rowData.quantity_in_stock})`
            : `In Stock (${rowData.quantity_in_stock})`
        }
        severity={isOutOfStock ? "danger" : isLowStock ? "warning" : "success"}
      />
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => setEditProduct(rowData)}
          title="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.id, rowData.name)}
          title="Delete"
        />
      </div>
    );
  };

  const skuTemplate = (rowData) => {
    return <code>{rowData.sku}</code>;
  };

  const header = (
    <div className="page-header" style={{ margin: 0, padding: 0 }}>
      <h1 className="page-title" style={{ margin: 0 }}>Products</h1>
      <Button
        label="Add Product"
        icon="pi pi-plus"
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
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="pi pi-box" style={{ fontSize: "3rem" }}></i>
            </div>
            <p className="empty-state-text">No products in inventory.</p>
            <Button label="Add Your First Product" icon="pi pi-plus" onClick={() => setShowForm(true)} />
          </div>
        ) : (
          <DataTable
            value={products}
            responsiveLayout="scroll"
            stripedRows
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="p-datatable-sm"
          >
            <Column field="name" header="Product Name" sortable style={{ fontWeight: 600 }} />
            <Column field="sku" header="SKU" body={skuTemplate} sortable />
            <Column field="price" header="Price" body={priceTemplate} sortable />
            <Column field="quantity_in_stock" header="Status" body={stockTemplate} sortable />
            <Column body={actionTemplate} style={{ textAlign: "right", width: "120px" }} />
          </DataTable>
        )}
      </Card>

      {showForm && (
        <ProductForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editProduct && (
        <ProductForm
          product={editProduct}
          onSubmit={handleUpdate}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  );
}
