import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="admin-layout">
      <aside className="admin-sidebar-desktop" style={{ width: "220px", flexShrink: 0, height: "100vh", position: "sticky", top: 0 }}>
        <Sidebar />
      </aside>

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 40,
          }}
          className="admin-drawer-overlay"
        />
      )}
      <div
        className="admin-drawer"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: drawerOpen ? 0 : "-260px",
          width: "220px",
          zIndex: 50,
          transition: "left 0.25s ease",
        }}
      >
        <Sidebar onClose={() => setDrawerOpen(false)} />
      </div>

      <main style={{ flex: 1, minWidth: 0 }}>
        <div
          className="admin-topbar-mobile"
          style={{
            display: "none",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            borderBottom: "1px solid var(--a-border)",
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--a-text-1)" }}
          >
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Saam Geaars</span>
        </div>
        <TopBar />
        <div style={{ padding: "0 24px 24px" }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar-desktop { display: none; }
          .admin-topbar-mobile { display: flex !important; }
        }
        @media (min-width: 901px) {
          .admin-drawer, .admin-drawer-overlay { display: none; }
        }
      `}</style>
    </div>
  );
}
