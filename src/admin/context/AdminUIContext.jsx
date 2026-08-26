import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const AdminUIContext = createContext(null);

export function AdminUIProvider({ children }) {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastPathname, setLastPathname] = useState(null);
  const location = useLocation();

  // Reset the top-bar search whenever the route changes so it doesn't leak
  // between pages (e.g. a Companies search staying active on Job cards).
  // Adjusted during render (React's recommended pattern for resetting state
  // in response to a prop/route change) rather than in an effect, so the
  // reset is applied in the same render pass — before the newly-mounted
  // page's own data-fetch effect ever reads searchQuery. Doing this in an
  // effect instead let the new page's mount-effect race the reset, briefly
  // loading with the previous page's stale search term and then reloading
  // moments later, which flashed the skeleton back in over live data.
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setSearchQuery("");
  }

  return (
    <AdminUIContext.Provider
      value={{ pageTitle, setPageTitle, searchQuery, setSearchQuery }}
    >
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext);
  if (!ctx) throw new Error("useAdminUI must be used within AdminUIProvider");
  return ctx;
}

// Declarative helper: call at the top of a page component to set the
// top-bar title for as long as that page is mounted.
export function usePageTitle(title) {
  const { setPageTitle } = useAdminUI();
  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);
}
