import { useEffect, useMemo, useState } from "react";
import { ClipboardList, AlertTriangle, CalendarClock, Truck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { DUE_SOON_DAYS } from "../lib/dateUtils";
import { cardStyle } from "../components/masters/adminUiStyles";
import { usePageTitle } from "../context/AdminUIContext";
import JobCardTile from "../components/JobCardTile";
import { SkeletonCardGrid } from "../components/Skeleton";
import { withJobCardInsights, sortByPriority } from "../lib/jobCardInsights";

const PRIORITY_LIMIT = 4;

// Same insight + priority-sort logic as the main Job Cards page (see
// lib/jobCardInsights) — kept in one place so the two stay consistent.
function computeJobCardInsights(jobCards) {
  const withStage = withJobCardInsights(jobCards);
  const active = withStage.filter((jc) => !jc.isFullyComplete);
  const scored = sortByPriority(withStage);
  return { active, scored, dueSoonOrOverdue: active.filter((jc) => jc.daysRemaining <= DUE_SOON_DAYS) };
}

export default function Dashboard() {
  usePageTitle("Dashboard");
  const [jobCards, setJobCards] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [jcRes, rmRes, soRes] = await Promise.all([
        supabase
          .from("job_cards")
          .select(
            "id, order_due_date, quantity, cost_per_unit, projects(po_number), companies(name, is_client, is_supplier), tasks(part_number, item_description), job_card_stages(stage_order, stage_type, status)",
          ),
        supabase.from("raw_materials").select("id, name, stock_count, low_stock_threshold"),
        supabase.from("supplier_orders").select("id", { count: "exact", head: true }).eq("status", "ordered"),
      ]);
      setJobCards(jcRes.data || []);
      setRawMaterials(rmRes.data || []);
      setPendingOrders(soRes.count || 0);
      setLoading(false);
    })();
  }, []);

  const insights = useMemo(() => computeJobCardInsights(jobCards), [jobCards]);
  const lowStock = rawMaterials.filter((m) => Number(m.stock_count) < Number(m.low_stock_threshold));

  const priorityCards = useMemo(() => insights.scored.slice(0, PRIORITY_LIMIT), [insights.scored]);

  const metrics = [
    { label: "Active job cards", value: insights.active.length, icon: ClipboardList },
    { label: "Low stock materials", value: lowStock.length, icon: AlertTriangle, danger: lowStock.length > 0 },
    { label: "Due-soon / overdue", value: insights.dueSoonOrOverdue.length, icon: CalendarClock, danger: insights.dueSoonOrOverdue.length > 0 },
    { label: "Pending supplier orders", value: pendingOrders, icon: Truck },
  ];

  return (
    <div>
      {loading ? (
        <>
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", marginBottom: "2.5rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ ...cardStyle, padding: "1.6rem 1.75rem", height: "100px" }} />
            ))}
          </div>
          <SkeletonCardGrid count={PRIORITY_LIMIT} minWidth={360} cardHeight={300} />
        </>
      ) : (
        <>
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", marginBottom: "2.5rem" }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ ...cardStyle, padding: "1.6rem 1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontSize: "15.5px", color: "var(--a-text-2)", fontWeight: 700 }}>{m.label}</span>
                  <m.icon size={19} color={m.danger ? "var(--a-danger)" : "var(--a-brand)"} />
                </div>
                <div style={{ fontSize: "40px", fontWeight: 800, lineHeight: 1, color: m.danger ? "var(--a-danger)" : "var(--a-text-1)" }}>{m.value}</div>
              </div>
            ))}
          </div>

          <h2 className="admin-heading" style={{ fontSize: "25px", marginBottom: "1.25rem" }}>
            Priority job cards
          </h2>
          {priorityCards.length === 0 ? (
            <div style={{ ...cardStyle, padding: "1.75rem", color: "var(--a-text-3)", fontSize: "16.5px" }}>No active job cards.</div>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 1fr))" }}>
              {priorityCards.map((jc) => (
                <JobCardTile key={jc.id} jc={jc} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
