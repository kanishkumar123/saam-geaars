import { useState } from "react";
import { PlayCircle, XCircle, CheckCircle2 } from "lucide-react";
import { supabase, STAGE_LABELS } from "../lib/supabaseClient";
import { formatDate } from "../lib/dateUtils";
import Modal from "./Modal";
import DatePicker from "./DatePicker";
import Button from "./Button";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Horizontal glassmorphic status strip: On-process / Not completed /
// Completed (labeled "Acquired" for the raw material stage). Every
// transition is confirmed through a modal that also captures the date (or
// remarks, for Not completed) rather than changing status on a bare click.
export default function StageStatusControl({ stage, unlocked, isAdmin, previousStageEndDate, onUpdated }) {
  const [modalType, setModalType] = useState(null); // 'on_process' | 'completed' | 'not_completed'
  const isRawMaterial = stage.stage_type === "raw_material";
  const isDone = stage.status === "completed";
  const disabled = !unlocked || (isDone && !isAdmin);
  const canComplete = stage.status === "on_process" || (isAdmin && isDone);
  const completeLabel = isRawMaterial ? "Acquired" : "Completed";

  const relevantDate =
    stage.status === "on_process" ? stage.start_date : stage.status === "completed" ? stage.end_date : null;
  const relevantDateLabel = stage.status === "on_process" ? "Started" : stage.status === "completed" ? completeLabel : null;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "999px",
            background: "var(--a-bg-elevated)",
            border: "1px solid var(--a-border)",
          }}
          className="admin-status-strip"
        >
          <StripButton icon={PlayCircle} label="On-process" active={stage.status === "on_process"} disabled={disabled} onClick={() => setModalType("on_process")} />
          <StripButton icon={XCircle} label="Not completed" active={stage.status === "not_completed"} disabled={disabled} onClick={() => setModalType("not_completed")} />
          <StripButton icon={CheckCircle2} label={completeLabel} active={isDone} disabled={disabled || !canComplete} onClick={() => setModalType("completed")} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {relevantDate && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--a-text-3)" }}>
                {relevantDateLabel}
              </div>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--a-text-1)" }}>{formatDate(relevantDate)}</div>
            </div>
          )}
        </div>
      </div>

      {modalType === "on_process" && (
        <OnProcessModal stage={stage} previousStageEndDate={previousStageEndDate} onClose={() => setModalType(null)} onUpdated={onUpdated} />
      )}
      {modalType === "completed" && (
        <CompletedModal stage={stage} isRawMaterial={isRawMaterial} completeLabel={completeLabel} onClose={() => setModalType(null)} onUpdated={onUpdated} />
      )}
      {modalType === "not_completed" && (
        <NotCompletedModal stage={stage} onClose={() => setModalType(null)} onUpdated={onUpdated} />
      )}

      <style>{`
        .admin-status-strip button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function StripButton({ icon: Icon, label, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        padding: "13px 22px",
        borderRadius: "999px",
        border: active ? "none" : "1px solid var(--a-border)",
        fontSize: "16px",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        background: active ? "var(--a-brand-grad)" : "var(--a-card)",
        color: active ? "#fff" : "var(--a-text-2)",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={18} /> {label}
    </button>
  );
}

function OnProcessModal({ stage, previousStageEndDate, onClose, onUpdated }) {
  const [date, setDate] = useState(todayISO());
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setSaving(true);
    setError("");
    const { error } = await supabase.rpc("update_job_card_stage_status", {
      p_stage_id: stage.id,
      p_status: "on_process",
      p_date: date,
      p_remarks: remarks.trim() || null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onUpdated();
    onClose();
  }

  return (
    <Modal title="Start this stage" icon={PlayCircle} accent="var(--a-brand)" onClose={onClose} maxWidth="460px">
      <p style={{ fontSize: "15px", color: "var(--a-text-2)", marginTop: 0 }}>
        Enter {STAGE_LABELS[stage.stage_type]}'s start date to change status to On-process.
      </p>
      {previousStageEndDate && (
        <div style={{ fontSize: "13.5px", color: "var(--a-text-3)", marginBottom: "1rem" }}>
          Previous stage completed on <strong style={{ color: "var(--a-text-2)" }}>{formatDate(previousStageEndDate)}</strong>
        </div>
      )}
      <div style={{ marginBottom: "1rem" }}>
        <DatePicker value={date} onChange={setDate} required />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "14.5px", color: "var(--a-text-2)", marginBottom: "6px" }}>Remarks (optional)</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          placeholder="Add an optional note about starting this stage…"
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>
      {error && <div style={{ color: "var(--a-danger)", fontSize: "14px", marginBottom: "1rem" }}>{error}</div>}
      <Button onClick={handleConfirm} disabled={saving} style={{ width: "100%" }}>
        {saving ? "Saving…" : "Save & continue"}
      </Button>
    </Modal>
  );
}

function CompletedModal({ stage, isRawMaterial, completeLabel, onClose, onUpdated }) {
  const [date, setDate] = useState(todayISO());
  const [materialNote, setMaterialNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setError("");
    setSaving(true);
    const { error } = await supabase.rpc("update_job_card_stage_status", {
      p_stage_id: stage.id,
      p_status: "completed",
      p_date: date,
      p_remarks: isRawMaterial ? materialNote.trim() || null : null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onUpdated();
    onClose();
  }

  return (
    <Modal title={`Confirm ${completeLabel.toLowerCase()}`} icon={CheckCircle2} accent="var(--a-success)" onClose={onClose} maxWidth="460px">
      <p style={{ fontSize: "15px", color: "var(--a-text-2)", marginTop: 0 }}>
        Are you sure {STAGE_LABELS[stage.stage_type]} is {completeLabel.toLowerCase()}?
      </p>

      {isRawMaterial && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "14.5px", color: "var(--a-text-2)", marginBottom: "6px" }}>Raw material (optional)</label>
          <input
            type="text"
            value={materialNote}
            onChange={(e) => setMaterialNote(e.target.value)}
            placeholder="e.g. EN8 round bar, 20 kg"
            style={{ width: "100%" }}
          />
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "14.5px", color: "var(--a-text-2)", marginBottom: "6px" }}>Completion date *</label>
        <DatePicker value={date} onChange={setDate} required />
      </div>

      {error && <div style={{ color: "var(--a-danger)", fontSize: "14px", marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "10px" }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
          No
        </Button>
        <Button onClick={handleConfirm} disabled={saving} style={{ flex: 1 }}>
          {saving ? "Saving…" : "Yes"}
        </Button>
      </div>
    </Modal>
  );
}

function NotCompletedModal({ stage, onClose, onUpdated }) {
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setError("");
    if (!remarks.trim()) {
      setError("Remarks are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("update_job_card_stage_status", {
      p_stage_id: stage.id,
      p_status: "not_completed",
      p_date: todayISO(),
      p_remarks: remarks.trim(),
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onUpdated();
    onClose();
  }

  return (
    <Modal title="Mark as not completed" icon={XCircle} accent="var(--a-danger)" onClose={onClose} maxWidth="460px">
      <p style={{ fontSize: "15px", color: "var(--a-text-2)", marginTop: 0 }}>
        Are you sure this process is not completed?
      </p>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "14.5px", color: "var(--a-text-2)", marginBottom: "6px" }}>Remarks *</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          placeholder="Explain why this stage isn't completed…"
          style={{ width: "100%", resize: "vertical" }}
          required
        />
      </div>
      {error && <div style={{ color: "var(--a-danger)", fontSize: "14px", marginBottom: "1rem" }}>{error}</div>}
      <div style={{ display: "flex", gap: "10px" }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
          No
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={saving} style={{ flex: 1 }}>
          {saving ? "Saving…" : "Yes"}
        </Button>
      </div>
    </Modal>
  );
}
