import { useEffect, useMemo, useState } from "react";
import { UserRound, CheckCircle2, Activity } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { usePageTitle } from "../context/AdminUIContext";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import { SkeletonCardGrid } from "../components/Skeleton";
import { cardStyle } from "../components/masters/adminUiStyles";
import { STAGE_LABELS, STATUS_LABELS } from "../lib/supabaseClient";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString(undefined, { month: "long" }),
}));

function yearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => ({ value: String(current - i), label: String(current - i) }));
}

// Admin-only reporting view aggregating audit_log stage_status_change rows
// per staff member: how many actions, broken down by stage/status, and how
// many now-fully-complete job cards they contributed a completion to.
// Aggregated client-side over a capped fetch — fine at this data volume,
// avoids standing up a dedicated SQL view for a report this simple.
export default function StaffActivity() {
  usePageTitle("Staff activity");
  const [profiles, setProfiles] = useState([]);
  const [auditRows, setAuditRows] = useState([]);
  const [stageToJobCard, setStageToJobCard] = useState({});
  const [completeJobCardIds, setCompleteJobCardIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [rangeMode, setRangeMode] = useState("lifetime");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [profilesRes, stagesRes, jobCardsRes, auditRes] = await Promise.all([
        supabase.from("profiles").select("id, username, full_name, role").order("role").order("username"),
        supabase.from("job_card_stages").select("id, job_card_id"),
        supabase.from("job_cards").select("id, job_card_stages(status)"),
        supabase
          .from("audit_log")
          .select("actor_id, entity_id, stage_type, to_status, created_at")
          .eq("action", "stage_status_change")
          .order("created_at", { ascending: false })
          .limit(5000),
      ]);

      setProfiles(profilesRes.data || []);

      const map = {};
      (stagesRes.data || []).forEach((s) => {
        map[s.id] = s.job_card_id;
      });
      setStageToJobCard(map);

      const completeSet = new Set(
        (jobCardsRes.data || [])
          .filter((jc) => (jc.job_card_stages || []).length > 0 && jc.job_card_stages.every((s) => s.status === "completed"))
          .map((jc) => jc.id),
      );
      setCompleteJobCardIds(completeSet);

      setAuditRows(auditRes.data || []);
      setLoading(false);
    })();
  }, []);

  const filteredAudit = useMemo(() => {
    if (rangeMode === "lifetime") return auditRows;
    if (rangeMode === "custom") {
      const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;
      return auditRows.filter((r) => {
        const d = new Date(r.created_at);
        return (!from || d >= from) && (!to || d <= to);
      });
    }
    return auditRows.filter((r) => {
      const d = new Date(r.created_at);
      return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
    });
  }, [auditRows, rangeMode, month, year, dateFrom, dateTo]);

  const statsByActor = useMemo(() => {
    const byActor = {};
    for (const r of filteredAudit) {
      if (!r.actor_id) continue;
      if (!byActor[r.actor_id]) byActor[r.actor_id] = { total: 0, byStage: {}, completedJobCards: new Set() };
      const bucket = byActor[r.actor_id];
      bucket.total += 1;
      const key = `${r.stage_type}|${r.to_status}`;
      bucket.byStage[key] = (bucket.byStage[key] || 0) + 1;
      if (r.to_status === "completed") {
        const jcId = stageToJobCard[r.entity_id];
        if (jcId && completeJobCardIds.has(jcId)) bucket.completedJobCards.add(jcId);
      }
    }
    return byActor;
  }, [filteredAudit, stageToJobCard, completeJobCardIds]);

  const ranked = useMemo(
    () =>
      profiles
        .map((p) => ({ profile: p, stats: statsByActor[p.id] || { total: 0, byStage: {}, completedJobCards: new Set() } }))
        .sort((a, b) => b.stats.total - a.stats.total),
    [profiles, statsByActor],
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", background: "var(--a-bg-elevated)", borderRadius: "10px", padding: "3px" }}>
          {["lifetime", "month", "custom"].map((m) => (
            <button
              key={m}
              onClick={() => setRangeMode(m)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "capitalize",
                cursor: "pointer",
                background: rangeMode === m ? "var(--a-card)" : "transparent",
                color: rangeMode === m ? "var(--a-text-1)" : "var(--a-text-3)",
                boxShadow: rangeMode === m ? "var(--a-shadow)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {m}
            </button>
          ))}
        </div>
        {rangeMode === "month" && (
          <div style={{ display: "flex", gap: "8px" }}>
            <Dropdown value={month} onChange={setMonth} options={MONTH_OPTIONS} style={{ width: "150px" }} />
            <Dropdown value={year} onChange={setYear} options={yearOptions()} style={{ width: "100px" }} />
          </div>
        )}
        {rangeMode === "custom" && (
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "150px" }}>
              <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From" />
            </div>
            <div style={{ width: "150px" }}>
              <DatePicker value={dateTo} onChange={setDateTo} placeholder="To" />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonCardGrid count={4} minWidth={320} cardHeight={220} />
      ) : ranked.every((r) => r.stats.total === 0) ? (
        <div style={{ ...cardStyle, padding: "2.5rem", textAlign: "center", color: "var(--a-text-3)" }}>
          No stage activity recorded {rangeMode === "month" ? "for this month" : rangeMode === "custom" ? "in this range" : "yet"}.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))" }}>
          {ranked.map(({ profile, stats }) => (
            <StaffCard key={profile.id} profile={profile} stats={stats} />
          ))}
        </div>
      )}
    </div>
  );
}

function StaffCard({ profile, stats }) {
  const isAdminRole = profile.role === "admin";
  const breakdown = Object.entries(stats.byStage).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ ...cardStyle, padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: isAdminRole ? "var(--a-brand-grad)" : "var(--a-brand-tint)",
            color: isAdminRole ? "#fff" : "var(--a-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <UserRound size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "16.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.username || profile.full_name}
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--a-text-3)" }}>{profile.role}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "1.1rem" }}>
        <Metric icon={Activity} value={stats.total} label="Stage updates" />
        <Metric icon={CheckCircle2} value={stats.completedJobCards.size} label="Job cards completed" accent="var(--a-success)" />
      </div>

      {breakdown.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {breakdown.map(([key, count]) => {
            const [stageType, status] = key.split("|");
            return (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span style={{ color: "var(--a-text-2)" }}>
                  {STAGE_LABELS[stageType] || stageType} — {STATUS_LABELS[status] || status}
                </span>
                <span style={{ fontWeight: 700, color: "var(--a-text-1)" }}>{count}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: "13px", color: "var(--a-text-3)" }}>No activity in this period.</div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, value, label, accent }) {
  return (
    <div style={{ flex: 1, background: "var(--a-bg-elevated)", borderRadius: "10px", padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
        <Icon size={13} color={accent || "var(--a-brand)"} />
        <span style={{ fontSize: "24px", fontWeight: 800, color: accent || "var(--a-text-1)" }}>{value}</span>
      </div>
      <div style={{ fontSize: "11px", color: "var(--a-text-3)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
