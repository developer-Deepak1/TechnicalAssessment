import { useEffect, useState } from "react";
import { getProducts, getCustomers } from "../api/api";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

export default function OrderForm({ onSubmit, onClose }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [items, setItems] = useState([{ product_id: null, quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          getCustomers(),
          getProducts(),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error("Failed to load form data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: null, quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    if (errors.items) setErrors((prev) => ({ ...prev, items: "" }));
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.product_id));
      if (product && item.quantity > 0) {
        return sum + product.price * item.quantity;
      }
      return sum;
    }, 0);
  };

  const validate = () => {
    const errs = {};
    if (!customerId) errs.customer = "Please select a customer.";
    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) errs.items = "Add at least one product.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_id: parseInt(customerId),
        items: items
          .filter((i) => i.product_id && i.quantity > 0)
          .map((i) => ({
            product_id: parseInt(i.product_id),
            quantity: parseInt(i.quantity),
          })),
      };
      await onSubmit(payload);
    } catch {
      setSubmitting(false);
    }
  };

  const footer = (
    <div>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onClose} disabled={submitting} />
      <Button label="Place Order" icon="pi pi-shopping-bag" onClick={handleSubmit} loading={submitting} />
    </div>
  );

  const customerOptions = customers.map((c) => ({
    label: `${c.full_name} (${c.email})`,
    value: c.id,
  }));

  const productOptions = products.map((p) => ({
    label: `${p.name} ($${p.price.toFixed(2)} - ${p.quantity_in_stock} available)`,
    value: p.id,
  }));

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Dialog
      header="Create Order"
      visible={true}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="field" style={{ marginBottom: "var(--space-6)" }}>
          <label htmlFor="customer" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
            Select Customer
          </label>
          <Dropdown
            id="customer"
            options={customerOptions}
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.value);
              if (errors.customer) setErrors((prev) => ({ ...prev, customer: "" }));
            }}
            placeholder="Select a Customer"
            filter
            className={errors.customer ? "p-invalid" : ""}
          />
          {errors.customer && (
            <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
              {errors.customer}
            </small>
          )}
        </div>

        <div className="field" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <label className="form-label">Order Items</label>
            <Button
              type="button"
              label="Add Item"
              icon="pi pi-plus"
              className="p-button-outlined p-button-sm"
              onClick={addItem}
              style={{ width: "auto" }}
            />
          </div>

          {errors.items && (
            <small className="p-error" style={{ display: "block", marginBottom: "var(--space-3)" }}>
              {errors.items}
            </small>
          )}

          <div className="order-items-list" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {items.map((item, idx) => (
              <div key={idx} className="order-item-row" style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <Dropdown
                    options={productOptions}
                    value={item.product_id}
                    onChange={(e) => updateItem(idx, "product_id", e.value)}
                    placeholder="Select Product"
                    filter
                  />
                </div>

                <div style={{ width: "100px" }}>
                  <InputNumber
                    value={item.quantity}
                    onValueChange={(e) => updateItem(idx, "quantity", e.value)}
                    min={1}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-secondary"
                    incrementButtonClassName="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                  />
                </div>

                <Button
                  type="button"
                  icon="pi pi-trash"
                  className="p-button-danger p-button-text"
                  onClick={() => removeItem(idx)}
                  disabled={items.length <= 1}
                  style={{ width: "auto" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--color-border)",
            marginTop: "var(--space-6)",
          }}
        >
          <span style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Total Order Amount:</span>
          <span
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: 800,
              color: "var(--color-accent)",
            }}
          >
            ${getTotal().toFixed(2)}
          </span>
        </div>
      </form>
    </Dialog>
  );
}
