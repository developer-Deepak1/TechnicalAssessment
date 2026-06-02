import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/", icon: "pi pi-chart-bar", label: "Dashboard" },
    { to: "/products", icon: "pi pi-box", label: "Products" },
    { to: "/customers", icon: "pi pi-users", label: "Customers" },
    { to: "/orders", icon: "pi pi-shopping-cart", label: "Orders" },
  ];

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <button
        className="mobile-toggle p-button p-component"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="mobile-menu-toggle"
      >
        <i className={sidebarOpen ? "pi pi-times" : "pi pi-bars"}></i>
      </button>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <i className="pi pi-box" style={{ fontSize: "1.3rem", color: "#fff" }}></i>
          </div>
          <div>
            <div className="sidebar-brand-text">InvenTrack</div>
            <div className="sidebar-brand-sub">Management System</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <i className={`${item.icon} sidebar-link-icon`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
