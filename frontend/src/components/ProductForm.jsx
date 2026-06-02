import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

export default function ProductForm({ product, onSubmit, onClose }) {
  const [name, setName] = useState(product?.name || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [price, setPrice] = useState(product?.price || null);
  const [quantity, setQuantity] = useState(product?.quantity_in_stock ?? null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Product name is required.";
    if (!sku.trim()) errs.sku = "SKU/Code is required.";
    if (price === null || price <= 0) errs.price = "Price must be greater than 0.";
    if (quantity === null || quantity < 0) errs.quantity = "Quantity cannot be negative.";
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
      await onSubmit({
        name: name.trim(),
        sku: sku.trim(),
        price: parseFloat(price),
        quantity_in_stock: parseInt(quantity),
      });
    } catch {
      setSubmitting(false);
    }
  };

  const footer = (
    <div>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onClose} disabled={submitting} />
      <Button label={product ? "Save Changes" : "Save Product"} icon="pi pi-check" onClick={handleSubmit} loading={submitting} />
    </div>
  );

  return (
    <Dialog
      header={product ? "Edit Product" : "Add Product"}
      visible={true}
      style={{ width: "450px" }}
      footer={footer}
      onHide={onClose}
    >
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="name" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
            Product Name
          </label>
          <InputText
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g., Wireless Mouse"
            className={errors.name ? "p-invalid" : ""}
          />
          {errors.name && (
            <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
              {errors.name}
            </small>
          )}
        </div>

        <div className="field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="sku" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
            SKU / Code
          </label>
          <InputText
            id="sku"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              if (errors.sku) setErrors((prev) => ({ ...prev, sku: "" }));
            }}
            placeholder="e.g., MOUSE-WRLS-01"
            disabled={!!product}
            className={errors.sku ? "p-invalid" : ""}
          />
          {errors.sku && (
            <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
              {errors.sku}
            </small>
          )}
        </div>

        <div className="form-grid" style={{ gap: "var(--space-4)" }}>
          <div className="field" style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="price" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
              Price ($)
            </label>
            <InputNumber
              id="price"
              value={price}
              onValueChange={(e) => {
                setPrice(e.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
              }}
              mode="decimal"
              minFractionDigits={2}
              maxFractionDigits={2}
              placeholder="0.00"
              className={errors.price ? "p-invalid" : ""}
            />
            {errors.price && (
              <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
                {errors.price}
              </small>
            )}
          </div>

          <div className="field" style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="quantity" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
              Quantity in Stock
            </label>
            <InputNumber
              id="quantity"
              value={quantity}
              onValueChange={(e) => {
                setQuantity(e.value);
                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: "" }));
              }}
              useGrouping={false}
              placeholder="0"
              className={errors.quantity ? "p-invalid" : ""}
            />
            {errors.quantity && (
              <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
                {errors.quantity}
              </small>
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
