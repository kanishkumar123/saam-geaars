import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Building2,
  FolderKanban,
  ListTodo,
  Truck,
  Workflow,
  Users,
  ScrollText,
  BarChart3,
  FileText,
  ShoppingCart,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImg from "../../assets/saam-geaars.png";

const primaryNav = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/job-cards", label: "Job cards", icon: ClipboardList },
  { to: "/admin/raw-materials", label: "Raw materials", icon: Boxes },
  { to: "/admin/quotations", label: "Quotations", icon: FileText },
  { to: "/admin/po-documents", label: "PO Documents", icon: ShoppingCart },
];

const mastersNav = [
  { to: "/admin/companies", label: "Companies", icon: Building2 },
  { to: "/admin/projects", label: "Purchase orders", icon: FolderKanban },
  { to: "/admin/tasks", label: "Items", icon: ListTodo },
  { to: "/admin/supplier-orders", label: "Suppliers", icon: Truck },
  {
    to: "/admin/process-templates",
    label: "Process templates",
    icon: Workflow,
  },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/staff-activity", label: "Staff activity", icon: BarChart3 },
  { to: "/admin/audit-log", label: "Audit log", icon: ScrollText },
];

function NavItem({ to, end, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `admin-nav-item${isActive ? " admin-nav-active" : ""}`
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 14px",
        borderRadius: "999px",
        fontSize: "16px",
        textDecoration: "none",
        color: "var(--a-text-2)",
        fontWeight: 500,
        transition: "background 0.18s ease, color 0.18s ease",
      }}
    >
      <Icon size={17} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onClose }) {
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--a-card)",
        borderRight: "1px solid var(--a-border)",
        padding: "1.25rem 1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          padding: "0 6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={logoImg}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "17px",
              letterSpacing: "-0.01em",
            }}
          >
            Saam<span style={{ color: "var(--a-brand)" }}>Geaars</span>
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: "none",
              border: "none",
              color: "var(--a-text-2)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {primaryNav.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {isAdmin && (
        <>
          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--a-text-3)",
              margin: "1.25rem 14px 6px",
            }}
          >
            Masters
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {mastersNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </>
      )}

      <div style={{ flex: 1 }} />

      <button
        onClick={signOut}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "10px",
          paddingTop: "1rem",
          borderTop: "1px solid var(--a-border)",
          fontSize: "14.5px",
          fontWeight: 500,
          color: "var(--a-text-2)",
          background: "none",
          border: "none",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "var(--a-border)",
          cursor: "pointer",
          textAlign: "left",
          padding: "1rem 4px 4px",
        }}
      >
        <LogOut size={16} /> Sign out
      </button>

      <style>{`
        .admin-nav-item:hover { background: var(--a-bg-elevated); color: var(--a-text-1); }
        .admin-nav-active, .admin-nav-active:hover {
          background: var(--a-brand-grad) !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}
