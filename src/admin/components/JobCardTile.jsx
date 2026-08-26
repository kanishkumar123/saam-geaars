import { Link } from "react-router-dom";
import { AlertTriangle, Building2, CheckCircle2, Tag, Hash } from "lucide-react";
import { STAGE_LABELS } from "../lib/supabaseClient";
import { daysUntil, DUE_SOON_DAYS } from "../lib/dateUtils";
import { stageIcons } from "../lib/stageIcons";
import ProgressRing from "./ProgressRing";

// Job Card list tile — Apple HIG-inspired: clarity (a restrained type scale,
// generous space, high-contrast data), deference (the job's data leads, the
// card chrome recedes to a hairline + soft shadow), depth (a gentle hover
// lift instead of decoration). Shared by the Job Cards list and the
// Dashboard's priority preview, so both surfaces show the same design.
export default function JobCardTile({ jc }) {
  const stages = [...(jc.job_card_stages || [])].sort((a, b) => a.stage_order - b.stage_order);
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const current = stages.find((s) => s.status !== "completed");
  const isFullyComplete = !current;
  const isBlocked = current?.status === "not_completed";
  const daysRemaining = daysUntil(jc.order_due_date);
  const isOverdue = !isFullyComplete && daysRemaining < 0;
  const isDueSoon = !isFullyComplete && !isOverdue && daysRemaining <= DUE_SOON_DAYS;
  const urgencyColor = isFullyComplete
    ? "var(--a-success)"
    : isOverdue
      ? "var(--a-danger)"
      : isDueSoon
        ? "#d97706"
        : "var(--a-text-3)";
  const StageIcon = stageIcons[current?.stage_type] || stageIcons.packaging_dispatch;

  return (
    <Link
      to={`/admin/job-cards/${jc.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: "var(--a-radius-card)",
        border: isBlocked ? "1.5px solid var(--a-danger)" : "1px solid var(--a-border)",
        background: "var(--a-card)",
        boxShadow: "var(--a-shadow)",
        padding: "1.4rem 1.5rem 1.25rem",
      }}
      className="admin-jc-card"
    >
      {/* Company name — top-left, now bigger/bolder per feedback (was too
          deferential relative to the rest of the card). */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "1.1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0, fontSize: "17px", fontWeight: 800, color: "var(--a-text-1)" }}>
            <Building2 size={16} color="var(--a-text-3)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{jc.companies?.name}</span>
          </div>
        </div>
        <ProgressRing
          value={completedCount}
          max={stages.length}
          size={44}
          stroke={4.5}
          color={isBlocked ? "var(--a-danger)" : "var(--a-brand)"}
          trackColor="var(--a-bg-elevated)"
          textColor="var(--a-text-1)"
        />
      </div>

      {/* PO number + part number — label and value share one row (the label
          leads, set larger/bolder; the value sits beside it, deliberately
          smaller — the label is the more prominent element here). */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1.15rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", minWidth: 0 }}>
          <Tag size={13} color="var(--a-text-3)" style={{ flexShrink: 0, position: "relative", top: "1px" }} />
          <span style={fieldLabelStyle}>PO no.</span>
          <span className="admin-heading" style={fieldValueStyle}>
            {jc.projects?.po_number}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", minWidth: 0 }}>
          <Hash size={13} color="var(--a-text-3)" style={{ flexShrink: 0, position: "relative", top: "1px" }} />
          <span style={fieldLabelStyle}>Part no.</span>
          <span className="admin-heading" style={fieldValueStyle}>
            {jc.tasks?.part_number}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          padding: "9px 13px",
          borderRadius: "10px",
          background: "var(--a-bg-elevated)",
        }}
      >
        <StageIcon size={16} color="var(--a-brand)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: "14.5px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current ? STAGE_LABELS[current.stage_type] : "All stages complete"}
        </span>
      </div>

      {isBlocked && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "color-mix(in srgb, var(--a-danger) 10%, transparent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--a-danger)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: current?.remarks ? "4px" : 0 }}>
            <AlertTriangle size={12} /> Not completed
          </div>
          {current?.remarks && (
            <div style={{ fontSize: "13.5px", color: "var(--a-text-2)", lineHeight: 1.4 }}>{current.remarks}</div>
          )}
        </div>
      )}

      {/* Spacer pushes the due date to the bottom, so it stays anchored
          bottom-right no matter how much content is above it. */}
      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginTop: "14px", fontSize: "13.5px", fontWeight: 700, color: urgencyColor }}>
        {isFullyComplete ? (
          <>
            <CheckCircle2 size={14} /> Completed
          </>
        ) : (
          <>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: urgencyColor, flexShrink: 0 }} />
            {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : isDueSoon ? `Due soon · ${daysRemaining}d` : `Due in ${daysRemaining}d`}
          </>
        )}
      </div>
    </Link>
  );
}

// The label is the more prominent element here (bigger, bolder) — the
// value sits beside it, deliberately smaller. Intentional, not a mistake.
const fieldLabelStyle = {
  fontSize: "15.5px",
  fontWeight: 800,
  color: "var(--a-text-1)",
  flexShrink: 0,
};

const fieldValueStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--a-text-2)",
  lineHeight: 1.3,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
};
