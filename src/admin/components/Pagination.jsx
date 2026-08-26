import { ChevronLeft, ChevronRight } from "lucide-react";

// Shared pagination control — used by every list/grid screen so paging
// looks and behaves the same everywhere.
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "1.5rem" }}>
      <PageBtn onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft size={16} />
      </PageBtn>
      {start > 1 && (
        <>
          <PageBtn onClick={() => onChange(1)}>1</PageBtn>
          {start > 2 && <span style={{ color: "var(--a-text-3)", padding: "0 4px" }}>…</span>}
        </>
      )}
      {pages.map((p) => (
        <PageBtn key={p} onClick={() => onChange(p)} active={p === page}>
          {p}
        </PageBtn>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: "var(--a-text-3)", padding: "0 4px" }}>…</span>}
          <PageBtn onClick={() => onChange(totalPages)}>{totalPages}</PageBtn>
        </>
      )}
      <PageBtn onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
        <ChevronRight size={16} />
      </PageBtn>
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick, ...rest }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      style={{
        minWidth: "36px",
        height: "36px",
        padding: "0 8px",
        borderRadius: "8px",
        border: "1px solid var(--a-border)",
        background: active ? "var(--a-brand-grad)" : "var(--a-card)",
        color: active ? "#fff" : disabled ? "var(--a-text-3)" : "var(--a-text-2)",
        fontWeight: 700,
        fontSize: "13.5px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

// Slices `items` to the given page. Pair with a `useState(1)` for `page` in
// the consuming component, and reset that state to 1 when the filtered item
// count changes (see usages) so a new search doesn't strand the user on an
// empty page.
export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return { pageItems: items.slice(start, start + pageSize), totalPages, safePage };
}
