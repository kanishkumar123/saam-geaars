import { Boxes, Gauge } from "lucide-react";
import MasterTable from "../components/masters/MasterTable";
import { useAuth } from "../context/AuthContext";

const ACCENT = "#d97706";

function StockRing({ stock, threshold }) {
  const size = 78;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const target = Math.max(threshold * 2, 1);
  const ratio = Math.max(0, Math.min(1, stock / target));
  const isLow = stock < threshold;
  const isMid = !isLow && stock < threshold * 1.5;
  const color = isLow ? "var(--a-danger)" : isMid ? ACCENT : "var(--a-success)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--a-bg-elevated)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: 800,
          color,
          textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
        }}
      >
        {stock}
      </div>
    </div>
  );
}

export default function RawMaterials() {
  const { isStaff } = useAuth();

  return (
    <MasterTable
      title="Raw materials"
      icon={Boxes}
      accent={ACCENT}
      table="raw_materials"
      layout="cards"
      cardMinWidth={300}
      readOnly={isStaff}
      searchKeys={["name"]}
      orderBy={{ column: "name", ascending: true }}
      remoteSearch={async (sb, q) => {
        const like = `%${q}%`;

        // Raw materials no longer carry a direct company link — "search by
        // company" means: materials that have been ordered from a supplier
        // whose name matches, via their supplier_orders history.
        const { data: matchedCompanies } = await sb.from("companies").select("id").ilike("name", like);
        const companyIds = (matchedCompanies || []).map((c) => c.id);

        let materialIdsFromOrders = [];
        if (companyIds.length) {
          const { data: orders } = await sb.from("supplier_orders").select("raw_material_id").in("company_id", companyIds);
          materialIdsFromOrders = [...new Set((orders || []).map((o) => o.raw_material_id).filter(Boolean))];
        }

        const orParts = [`name.ilike.${like}`];
        if (materialIdsFromOrders.length) orParts.push(`id.in.(${materialIdsFromOrders.join(",")})`);

        return sb.from("raw_materials").select("*").or(orParts.join(",")).order("name", { ascending: true });
      }}
      renderCard={(r) => {
        const stock = Number(r.stock_count);
        const threshold = Number(r.low_stock_threshold);
        const isLow = stock < threshold;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px" }}>
            <StockRing stock={stock} threshold={threshold} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "19px",
                  textTransform: "uppercase",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "6px",
                }}
              >
                {r.name}
              </div>
              {isLow ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: 700, color: "var(--a-danger)" }}>
                  <Gauge size={13} /> Low stock · below {threshold}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: 600, color: "var(--a-text-2)" }}>
                  <Gauge size={13} /> Threshold: {threshold}
                </div>
              )}
            </div>
          </div>
        );
      }}
      fields={[
        { key: "name", label: "Material name", required: true },
        { key: "low_stock_threshold", label: "Low stock threshold", type: "number", min: 0, step: "any", required: true },
      ]}
      emptyLabel="No raw materials yet."
    />
  );
}
