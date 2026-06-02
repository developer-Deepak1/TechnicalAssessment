import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function CustomerForm({ onSubmit, onClose }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";
    if (!phone.trim()) errs.phone = "Phone number is required.";
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
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });
    } catch {
      setSubmitting(false);
    }
  };

  const footer = (
    <div>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onClose} disabled={submitting} />
      <Button label="Register Customer" icon="pi pi-check" onClick={handleSubmit} loading={submitting} />
    </div>
  );

  return (
    <Dialog
      header="Register Customer"
      visible={true}
      style={{ width: "450px" }}
      footer={footer}
      onHide={onClose}
    >
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="fullName" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
            Full Name
          </label>
          <InputText
            id="fullName"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
            }}
            placeholder="e.g., Jane Doe"
            className={errors.fullName ? "p-invalid" : ""}
          />
          {errors.fullName && (
            <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
              {errors.fullName}
            </small>
          )}
        </div>

        <div className="field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="email" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
            Email Address
          </label>
          <InputText
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="e.g., jane.doe@example.com"
            className={errors.email ? "p-invalid" : ""}
          />
          {errors.email && (
            <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
              {errors.email}
            </small>
          )}
        </div>

        <div className="field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="phone" className="form-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>
            Phone Number
          </label>
          <InputText
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            placeholder="e.g., +1 (555) 019-2834"
            className={errors.phone ? "p-invalid" : ""}
          />
          {errors.phone && (
            <small className="p-error" style={{ display: "block", marginTop: "var(--space-1)" }}>
              {errors.phone}
            </small>
          )}
        </div>
      </form>
    </Dialog>
  );
}
