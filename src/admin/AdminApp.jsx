import { Routes, Route } from "react-router-dom";
import { AdminThemeProvider } from "./context/AdminThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AdminUIProvider } from "./context/AdminUIContext";
import { RequireAuth, RequireAdmin } from "./components/RequireAuth";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import JobCards from "./pages/JobCards";
import JobCardDetail from "./pages/JobCardDetail";
import Quotations from "./pages/Quotations";
import PODocuments from "./pages/PODocuments";
import RawMaterials from "./pages/RawMaterials";
import Companies from "./pages/Companies";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import SupplierOrders from "./pages/SupplierOrders";
import ProcessTemplates from "./pages/ProcessTemplates";
import Users from "./pages/Users";
import AuditLog from "./pages/AuditLog";
import StaffActivity from "./pages/StaffActivity";

export default function AdminApp() {
  return (
    <AdminThemeProvider>
      <AuthProvider>
        <AdminUIProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="job-cards" element={<JobCards />} />
            <Route path="job-cards/:id" element={<JobCardDetail />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="po-documents" element={<PODocuments />} />
            <Route path="raw-materials" element={<RawMaterials />} />
            <Route
              path="companies"
              element={
                <RequireAdmin>
                  <Companies />
                </RequireAdmin>
              }
            />
            <Route
              path="projects"
              element={
                <RequireAdmin>
                  <Projects />
                </RequireAdmin>
              }
            />
            <Route
              path="tasks"
              element={
                <RequireAdmin>
                  <Tasks />
                </RequireAdmin>
              }
            />
            <Route
              path="supplier-orders"
              element={
                <RequireAdmin>
                  <SupplierOrders />
                </RequireAdmin>
              }
            />
            <Route
              path="process-templates"
              element={
                <RequireAdmin>
                  <ProcessTemplates />
                </RequireAdmin>
              }
            />
            <Route
              path="users"
              element={
                <RequireAdmin>
                  <Users />
                </RequireAdmin>
              }
            />
            <Route
              path="audit-log"
              element={
                <RequireAdmin>
                  <AuditLog />
                </RequireAdmin>
              }
            />
            <Route
              path="staff-activity"
              element={
                <RequireAdmin>
                  <StaffActivity />
                </RequireAdmin>
              }
            />
          </Route>
        </Routes>
        </AdminUIProvider>
      </AuthProvider>
    </AdminThemeProvider>
  );
}
