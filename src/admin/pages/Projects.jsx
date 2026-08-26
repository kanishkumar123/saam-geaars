import { useEffect, useState } from "react";
import { FolderKanban, Building2, CalendarDays } from "lucide-react";
import MasterTable from "../components/masters/MasterTable";
import { supabase } from "../lib/supabaseClient";
import { formatDate, parseDateFragmentToRange } from "../lib/dateUtils";

const ACCENT = "var(--a-brand)";

export default function Projects() {
  const [clientCompanies, setClientCompanies] = useState([]);

  useEffect(() => {
    supabase
      .from("companies")
      .select("id, name")
      .eq("is_client", true)
      .order("name")
      .then(({ data }) => setClientCompanies(data || []));
  }, []);

  return (
    <MasterTable
      title="Purchase Orders"
      singular="purchase order"
      icon={FolderKanban}
      accent={ACCENT}
      table="projects"
      layout="cards"
      selectQuery="*, companies(name)"
      cardMinWidth={300}
      orderBy={{ column: "order_date", ascending: false }}
      remoteSearch={async (sb, q) => {
        const like = `%${q}%`;
        const dateRange = parseDateFragmentToRange(q);

        const { data: matchedCompanies } = await sb.from("companies").select("id").ilike("name", like);
        const companyIds = (matchedCompanies || []).map((c) => c.id);

        const orParts = [`po_number.ilike.${like}`];
        if (companyIds.length) orParts.push(`company_id.in.(${companyIds.join(",")})`);
        if (dateRange) orParts.push(`and(order_date.gte.${dateRange.gte},order_date.lte.${dateRange.lte})`);

        return sb
          .from("projects")
          .select("*, companies(name)")
          .or(orParts.join(","))
          .order("order_date", { ascending: false });
      }}
      onBeforeSave={(payload, editingRow, rows) => {
        const dupe = rows.some(
          (r) => r.id !== editingRow?.id && (r.po_number || "").trim().toLowerCase() === (payload.po_number || "").trim().toLowerCase(),
        );
        if (dupe) return { error: "A purchase order with this PO number already exists." };
        return { payload };
      }}
      renderCard={(r) => (
        // overflow: hidden + matching border-radius keeps the bled header band's
        // square corners from poking out past the card's rounded corners
        // (that mismatch was the shadow-artifact bug in the top corners).
        <div
          style={{
            margin: "-1.5rem -1.5rem 0",
            borderRadius: "var(--a-radius-card)",
            overflow: "hidden",
          }}
        >
          {/* PO number in a distinct header band — the primary scan target */}
          <div
            style={{
              background: `color-mix(in srgb, ${ACCENT} 12%, transparent)`,
              padding: "1.1rem 1.5rem",
              borderBottom: `2px solid ${ACCENT}`,
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1.3,
                color: ACCENT,
                flexShrink: 0,
              }}
            >
              <div>Purchase</div>
              <div>order</div>
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--a-text-1)",
                flex: 1,
                minWidth: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.po_number}
            </div>
          </div>
          <div style={{ padding: "1.1rem 1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--a-text-2)",
                marginBottom: "9px",
              }}
            >
              <Building2 size={15} /> {r.companies?.name || "—"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14.5px",
                fontWeight: 600,
                color: "var(--a-text-3)",
                marginBottom: "9px",
              }}
            >
              <CalendarDays size={14} /> {formatDate(r.order_date)}
            </div>
          </div>
        </div>
      )}
      fields={[
        {
          key: "company_id",
          label: "Company (client)",
          type: "select",
          required: true,
          options: clientCompanies.map((c) => ({ value: c.id, label: c.name })),
        },
        { key: "po_number", label: "PO number", required: true },
        {
          key: "order_date",
          label: "Order date",
          type: "date",
          required: true,
        },
      ]}
      emptyLabel={
        clientCompanies.length === 0
          ? "Add a client company first."
          : "No purchase orders yet."
      }
    />
  );
}
