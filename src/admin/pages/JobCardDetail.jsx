import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Package,
  Coins,
  Wallet,
  CalendarClock,
  Hash,
  Tag,
  FileText,
  Building2,
  Phone,
  Mail,
  User,
  FileBadge,
  ClipboardList,
} from "lucide-react";
import { supabase, STAGE_LABELS } from "../lib/supabaseClient";
import { formatDate } from "../lib/dateUtils";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../context/AdminUIContext";
import StageStatusPill from "../components/StageStatusPill";
import StageStatusControl from "../components/StageStatusControl";
import { stageIcons } from "../lib/stageIcons";
import { cardStyle } from "../components/masters/adminUiStyles";
import Button from "../components/Button";

const VIEW_KEY = "saam-admin-jc-view";
const CARD_HEIGHT = "calc(100vh - 400px)";
const CARD_MIN_HEIGHT = "420px";

function daysUntil(dateStr) {
  const due = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

export default function JobCardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [jobCard, setJobCard] = useState(null);
  usePageTitle(jobCard?.tasks?.part_number || "Job card");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(localStorage.getItem(VIEW_KEY) || "single");
  const [selectedStageOrder, setSelectedStageOrder] = useState(null);

  async function load() {
    const { data } = await supabase
      .from("job_cards")
      .select(
        "*, companies(name, contact_person, phone, email, gst_number), projects(po_number, order_date), tasks(part_number, item_description, drawing_number), job_card_stages(*)",
      )
      .eq("id", id)
      .single();
    setJobCard(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function setViewMode(v) {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this job card? This cannot be undone.")) return;
    await supabase.from("job_cards").delete().eq("id", id);
    navigate("/admin/job-cards");
  }

  if (loading) return <div style={{ color: "var(--a-text-3)" }}>Loading…</div>;
  if (!jobCard)
    return <div style={{ color: "var(--a-text-3)" }}>Job card not found.</div>;

  const stages = [...(jobCard.job_card_stages || [])].sort(
    (a, b) => a.stage_order - b.stage_order,
  );
  const frontierIndex = stages.findIndex((s) => s.status !== "completed");
  const activeIndex = frontierIndex === -1 ? stages.length - 1 : frontierIndex;
  const focusOrder = selectedStageOrder ?? stages[activeIndex]?.stage_order;
  const focusStage =
    stages.find((s) => s.stage_order === focusOrder) || stages[activeIndex];
  const focusIndex = stages.findIndex(
    (s) => s.stage_order === focusStage?.stage_order,
  );
  // Admin can edit any stage regardless of sequence; staff remain sequential.
  const isUnlockedForRole = (idx) =>
    isAdmin || idx === 0 || stages[idx - 1]?.status === "completed";
  const focusUnlocked = isUnlockedForRole(focusIndex);
  const previousStageEndDate =
    focusIndex > 0 ? stages[focusIndex - 1]?.end_date : null;

  const daysRemaining = daysUntil(jobCard.order_due_date);
  const isOverdue = daysRemaining < 0;
  const isDueSoon = !isOverdue && daysRemaining <= 7;
  const urgencyColor = isOverdue
    ? "var(--a-danger)"
    : isDueSoon
      ? "#d97706"
      : "var(--a-success)";
  const FocusIcon = focusStage
    ? stageIcons[focusStage.stage_type] || Package
    : Package;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <button
          onClick={() => navigate("/admin/job-cards")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "var(--a-text-2)",
            cursor: "pointer",
            fontSize: "14px",
            padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to job cards
        </button>
        {isAdmin && (
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 size={14} /> Delete
          </Button>
        )}
      </div>

      {/* One unified strip — all 8 fields share the same size/weight/icon treatment */}
      <div
        style={{
          ...cardStyle,
          display: "flex",
          flexWrap: "wrap",
          padding: "12px 4px",
          marginBottom: "0.85rem",
        }}
      >
        <MetaChip
          icon={Tag}
          label="PO No."
          value={jobCard.projects?.po_number}
        />
        <MetaChip
          icon={Hash}
          label="Part no."
          value={jobCard.tasks?.part_number}
        />
        <MetaChip
          icon={FileText}
          label="Item desc."
          value={jobCard.tasks?.item_description}
          wrap
        />
        <MetaChip
          icon={Building2}
          label="Company"
          value={jobCard.companies?.name}
        />
        <MetaChip icon={Package} label="Quantity" value={jobCard.quantity} />
        <MetaChip
          icon={Coins}
          label="Cost / unit"
          value={`₹${jobCard.cost_per_unit}`}
        />
        {/* <MetaChip icon={Wallet} label="Order value" value={`₹${(jobCard.quantity * jobCard.cost_per_unit).toLocaleString()}`} accent="var(--a-brand)" /> */}
        <MetaChip
          icon={CalendarClock}
          label="Due date"
          value={formatDate(jobCard.order_due_date)}
          accent={urgencyColor}
          last
        />
      </div>

      {/* Stage info (left) + view switcher (right) — same row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "0.85rem",
        }}
      >
        {/* Single view carries its own stage heading inside the card, so
            this compact header is only shown for Full/Detailed — showing
            both there would just be the same information said twice. */}
        {focusStage && view !== "single" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background: "var(--a-brand-tint)",
                color: "var(--a-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FocusIcon size={19} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--a-text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Stage {focusStage.stage_order} of {stages.length}
              </div>
              <h2
                className="admin-heading admin-heading-shadow"
                style={{
                  fontSize: "24px",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {STAGE_LABELS[focusStage.stage_type]}
              </h2>
            </div>
          </div>
        )}
        {view === "single" && <div />}

        <div
          style={{
            display: "inline-flex",
            background: "var(--a-bg-elevated)",
            borderRadius: "10px",
            padding: "3px",
          }}
        >
          {["single", "full", "detailed"].map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14.5px",
                fontWeight: 700,
                textTransform: "capitalize",
                cursor: "pointer",
                background: view === v ? "var(--a-card)" : "transparent",
                color: view === v ? "var(--a-text-1)" : "var(--a-text-3)",
                boxShadow: view === v ? "var(--a-shadow)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "single" && (
        <SingleView
          stages={stages}
          focusStage={focusStage}
          focusUnlocked={focusUnlocked}
          isAdmin={isAdmin}
          previousStageEndDate={previousStageEndDate}
          isUnlockedForRole={isUnlockedForRole}
          onSelect={setSelectedStageOrder}
          onUpdated={load}
        />
      )}
      {view === "full" && (
        <FullView
          stages={stages}
          isUnlockedForRole={isUnlockedForRole}
          onFocusStage={(order) => {
            setSelectedStageOrder(order);
            setViewMode("single");
          }}
        />
      )}
      {view === "detailed" && (
        <DetailedView jobCard={jobCard} stages={stages} />
      )}
    </div>
  );
}

function MetaChip({ icon: Icon, label, value, accent, last, wrap }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: wrap ? "flex-start" : "center",
        gap: "9px",
        padding: "6px 18px",
        borderRight: last ? "none" : "1px solid var(--a-border)",
        flex: wrap ? "2 1 260px" : "1 1 150px",
        minWidth: 0,
      }}
    >
      <Icon
        size={16}
        color={accent || "var(--a-text-3)"}
        style={{ flexShrink: 0, marginTop: wrap ? "2px" : 0 }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--a-text-3)",
          }}
        >
          {label}
        </div>
        <div
          style={
            wrap
              ? { fontSize: "15px", fontWeight: 700, color: accent || "var(--a-text-1)", whiteSpace: "normal", wordBreak: "break-word" }
              : {
                  fontSize: "15px",
                  fontWeight: 700,
                  color: accent || "var(--a-text-1)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }
          }
        >
          {value ?? "—"}
        </div>
      </div>
    </div>
  );
}

// ── Single view: majority of the screen, one stage in deep focus. Frontier
// auto-advances (AnimatePresence-driven) when selectedStageOrder is left as
// the default "follow the frontier" state — completing a stage smoothly
// transitions into the next one rather than snapping.
function SingleView({
  stages,
  focusStage,
  focusUnlocked,
  isAdmin,
  previousStageEndDate,
  isUnlockedForRole,
  onSelect,
  onUpdated,
}) {
  if (!focusStage) return null;

  const FocusStageIcon = stageIcons[focusStage.stage_type] || Package;
  const isBlocked = focusStage.status === "not_completed";
  const hasRemarks = focusStage.remarks && (isBlocked || focusStage.status === "on_process");

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={focusStage.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--a-radius-card)",
            border: "1px solid var(--a-border)",
            boxShadow: "var(--a-shadow-lg)",
            background: "var(--a-card)",
            height: CARD_HEIGHT,
            minHeight: CARD_MIN_HEIGHT,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Clarity: a plain, high-contrast header — the stage's identity
              is the only thing competing for attention here. */}
          <div style={{ padding: "2.5rem 2.5rem 0", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "18px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: "var(--a-brand-tint)",
                  color: "var(--a-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FocusStageIcon size={28} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "var(--a-text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "4px",
                  }}
                >
                  Stage {focusStage.stage_order} of {stages.length}
                </div>
                <h1
                  className="admin-heading"
                  style={{
                    fontSize: "clamp(28px, 4vw, 40px)",
                    lineHeight: 1.05,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {STAGE_LABELS[focusStage.stage_type]}
                </h1>
              </div>
            </div>

            {hasRemarks && (
              <div
                style={{
                  marginTop: "1.5rem",
                  maxWidth: "560px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: isBlocked
                    ? "color-mix(in srgb, var(--a-danger) 10%, transparent)"
                    : "var(--a-bg-elevated)",
                  border: isBlocked ? "1px solid color-mix(in srgb, var(--a-danger) 30%, transparent)" : "1px solid var(--a-border)",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: isBlocked ? "var(--a-danger)" : "var(--a-text-2)",
                }}
              >
                <strong>{isBlocked ? "Not completed — " : "Remarks — "}</strong>
                {focusStage.remarks}
              </div>
            )}
          </div>

          {/* No decorative band here — it previously matched the strip's
              own active-button color and made the buttons hard to see
              against it. The status strip carries its own contrast now, so
              it just sits directly on the card's plain background. */}
          <div
            style={{
              position: "relative",
              padding: "2rem 2.25rem",
              borderTop: "1px solid var(--a-border)",
            }}
          >
            <StageStatusControl
              key={focusStage.id}
              stage={focusStage}
              unlocked={focusUnlocked}
              isAdmin={isAdmin}
              previousStageEndDate={previousStageEndDate}
              onUpdated={onUpdated}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel-style progress dots — below the card, centered */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "7px",
          marginTop: "1rem",
        }}
      >
        {stages.map((s) => {
          const isFocus = s.stage_order === focusStage.stage_order;
          const idx = stages.findIndex((x) => x.stage_order === s.stage_order);
          const unlocked = isUnlockedForRole(idx);
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.stage_order)}
              title={STAGE_LABELS[s.stage_type]}
              style={{
                width: isFocus ? "28px" : "9px",
                height: "9px",
                borderRadius: "999px",
                border: "none",
                flexShrink: 0,
                cursor: "pointer",
                opacity: unlocked ? 1 : 0.35,
                background:
                  s.status === "completed"
                    ? "var(--a-stage-complete)"
                    : s.status === "on_process"
                      ? "var(--a-stage-active)"
                      : "var(--a-border)",
                transition: "width 0.25s ease, opacity 0.2s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Full view: dense, all-stages-at-once monitoring grid — deliberately not
// a bigger version of Single view. No inline editing here; clicking a tile
// jumps to Single view focused on that stage.
function FullView({ stages, isUnlockedForRole, onFocusStage }) {
  const statusBg = {
    acquired: "var(--a-stage-pending-fill)",
    on_process: "var(--a-stage-active)",
    completed: "rgba(184,135,61,0.14)",
    not_completed: "transparent",
  };

  return (
    <div
      style={{
        height: CARD_HEIGHT,
        minHeight: CARD_MIN_HEIGHT,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "18px",
          marginBottom: "1.25rem",
          fontSize: "13.5px",
          color: "var(--a-text-2)",
          flexWrap: "wrap",
        }}
      >
        <LegendItem
          color="var(--a-stage-pending-fill)"
          border="var(--a-stage-pending-border)"
          label="Acquired"
        />
        <LegendItem gradient="var(--a-stage-active)" label="On-process" />
        <LegendItem color="var(--a-stage-complete)" label="Completed" />
        <LegendItem border="var(--a-stage-blocked)" label="Not completed" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: "12px",
        }}
      >
        {stages.map((s, i) => {
          const Icon = stageIcons[s.stage_type] || Package;
          const unlocked = isUnlockedForRole(i);
          const isBlocked = s.status === "not_completed";
          return (
            <button
              key={s.id}
              onClick={() => onFocusStage(s.stage_order)}
              style={{
                textAlign: "left",
                border: isBlocked
                  ? "2px solid var(--a-stage-blocked)"
                  : "1px solid var(--a-border)",
                borderRadius: "12px",
                padding: "14px",
                cursor: "pointer",
                opacity: unlocked ? 1 : 0.5,
                background:
                  s.status === "on_process"
                    ? "var(--a-stage-active)"
                    : s.status === "completed"
                      ? statusBg.completed
                      : "var(--a-card)",
                color: s.status === "on_process" ? "#fff" : "var(--a-text-1)",
                transition: "transform 0.15s ease",
              }}
              className="admin-full-tile"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Icon size={18} />
                <span
                  style={{ fontSize: "11px", fontWeight: 800, opacity: 0.7 }}
                >
                  {s.stage_order}
                </span>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                {STAGE_LABELS[s.stage_type]}
              </div>
              <StageStatusPill status={s.status} />
              {(s.start_date || s.end_date) && (
                <div
                  style={{
                    fontSize: "11.5px",
                    marginTop: "6px",
                    opacity: 0.75,
                  }}
                >
                  {s.start_date && `Started ${formatDate(s.start_date)}`}
                  {s.start_date && s.end_date && " · "}
                  {s.end_date && `Done ${formatDate(s.end_date)}`}
                </div>
              )}
              {isBlocked && s.remarks && (
                <div
                  style={{
                    fontSize: "11.5px",
                    marginTop: "6px",
                    color: "var(--a-stage-blocked)",
                    lineHeight: 1.4,
                  }}
                >
                  {s.remarks}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <style>{`.admin-full-tile:hover { transform: translateY(-2px); }`}</style>
    </div>
  );
}

function LegendItem({ color, border, gradient, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: gradient || color || "transparent",
          border: border ? `2px solid ${border}` : "1px solid var(--a-border)",
        }}
      />
      {label}
    </div>
  );
}

// ── Detailed view: comprehensive, professional summary of everything
// related to this job card in one place — replaces the old Blueprint view.
function DetailedView({ jobCard, stages }) {
  return (
    <div
      style={{
        height: CARD_HEIGHT,
        minHeight: CARD_MIN_HEIGHT,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        <InfoPanel icon={ClipboardList} title="Purchase Order" accent="var(--a-brand)">
          <InfoRow label="PO number" value={jobCard.projects?.po_number} />
          <InfoRow
            label="Order date"
            value={formatDate(jobCard.projects?.order_date)}
          />
          <InfoRow label="Company" value={jobCard.companies?.name} />
        </InfoPanel>

        <InfoPanel icon={Hash} title="Task" accent="#0d9488">
          <InfoRow label="Part number" value={jobCard.tasks?.part_number} />
          <InfoRow
            label="Drawing number"
            value={jobCard.tasks?.drawing_number}
          />
          <InfoRow
            label="Item description"
            value={jobCard.tasks?.item_description}
          />
        </InfoPanel>

        <InfoPanel icon={Building2} title="Company" accent="#2563eb">
          <InfoRow
            icon={User}
            label="Contact person"
            value={jobCard.companies?.contact_person}
          />
          <InfoRow
            icon={Phone}
            label="Phone"
            value={jobCard.companies?.phone}
          />
          <InfoRow icon={Mail} label="Email" value={jobCard.companies?.email} />
          <InfoRow
            icon={FileBadge}
            label="GST number"
            value={jobCard.companies?.gst_number}
          />
        </InfoPanel>

        <InfoPanel icon={Wallet} title="Order" accent="#d97706">
          <InfoRow label="Quantity" value={jobCard.quantity} />
          <InfoRow label="Cost / unit" value={`₹${jobCard.cost_per_unit}`} />
          <InfoRow
            label="Order value"
            value={`₹${(jobCard.quantity * jobCard.cost_per_unit).toLocaleString()}`}
          />
          <InfoRow
            label="Due date"
            value={formatDate(jobCard.order_due_date)}
          />
        </InfoPanel>
      </div>

      <div style={{ ...cardStyle, padding: "1.5rem" }}>
        <h3
          className="admin-heading"
          style={{ fontSize: "20px", marginBottom: "1rem" }}
        >
          Process stages
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "10px",
          }}
        >
          {stages.map((s) => {
            const Icon = stageIcons[s.stage_type] || Package;
            return (
              <div
                key={s.id}
                style={{
                  border: "1px solid var(--a-border)",
                  borderRadius: "10px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <Icon size={15} color="var(--a-text-3)" />
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>
                    {STAGE_LABELS[s.stage_type]}
                  </span>
                </div>
                <StageStatusPill status={s.status} />
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "var(--a-text-3)",
                    marginTop: "6px",
                  }}
                >
                  {s.start_date
                    ? `Started ${formatDate(s.start_date)}`
                    : "Not started"}
                  {s.end_date && ` · Done ${formatDate(s.end_date)}`}
                </div>
                {s.remarks && s.status === "completed" && s.stage_type === "raw_material" && (
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "var(--a-text-2)",
                      marginTop: "6px",
                    }}
                  >
                    <strong>Raw material:</strong> {s.remarks}
                  </div>
                )}
                {s.remarks && (s.status === "not_completed" || s.status === "on_process") && (
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: s.status === "not_completed" ? "var(--a-danger)" : "var(--a-text-2)",
                      marginTop: "6px",
                    }}
                  >
                    <strong>Remarks:</strong> {s.remarks}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ icon: Icon, title, accent, children }) {
  return (
    <div style={{ ...cardStyle, padding: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            background: `color-mix(in srgb, ${accent} 16%, transparent)`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} />
        </div>
        <h3 className="admin-heading" style={{ fontSize: "18px", margin: 0 }}>
          {title}
        </h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "var(--a-text-3)",
        }}
      >
        {Icon && <Icon size={12} />} {label}
      </div>
      <div
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--a-text-1)",
          textAlign: "right",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}
