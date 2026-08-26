import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenLoader />;
  if (!session) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function FullscreenLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--a-text-3)", fontSize: "16px" }}>Loading…</span>
    </div>
  );
}
