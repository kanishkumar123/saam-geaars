import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdminUI } from "../context/AdminUIContext";
import ThemeToggle from "./ThemeToggle";
import NotificationsBell from "./NotificationsBell";
import GlobalSearch from "./GlobalSearch";

export default function TopBar() {
  const { profile, isAdmin } = useAuth();
  const { pageTitle, searchQuery, setSearchQuery } = useAdminUI();
  const location = useLocation();
  const isDashboard = location.pathname === "/admin";

  const initials = (profile?.username || profile?.full_name || profile?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 24px",
        marginBottom: "24px",
        background: "var(--a-card)",
        borderBottom: "1px solid var(--a-border)",
        boxShadow: "var(--a-shadow)",
      }}
      className="admin-topbar"
    >
      <h1
        className="admin-heading"
        style={{ fontSize: "23px", margin: 0, flex: "0 1 auto", minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {pageTitle}
      </h1>

      {/* True cross-app search lives only on the Dashboard; every other page
          gets a simple local search that just filters what's already on
          that page (wired through the same shared searchQuery it always
          used, matching each page's own MasterTable/JobCards filtering). */}
      <div className="admin-topbar-search" style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
        {isDashboard ? (
          <GlobalSearch />
        ) : (
          <div style={{ position: "relative", width: "100%", maxWidth: "440px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--a-text-3)", zIndex: 1 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search this page…"
              style={{ width: "100%", paddingLeft: "38px", fontWeight: 500 }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: "0 0 auto" }}>
        {isAdmin && <NotificationsBell />}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="admin-topbar-user">
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "var(--a-brand-tint)",
              color: "var(--a-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "13.5px",
              flexShrink: 0,
              border: "1px solid var(--a-brand-border)",
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: "14.5px", fontWeight: 600, whiteSpace: "nowrap" }}>{profile?.username || profile?.full_name}</span>
        </div>
        <ThemeToggle />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-topbar-user span { display: none; }
        }
        @media (max-width: 480px) {
          .admin-topbar-search { display: none; }
        }
      `}</style>
    </div>
  );
}
