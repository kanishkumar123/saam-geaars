import { ListTodo, Hash, Ruler, FileText } from "lucide-react";
import MasterTable from "../components/masters/MasterTable";

const ACCENT = "#0d9488";

function FieldRow({ icon: Icon, label, value, mono }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: `color-mix(in srgb, ${ACCENT} 14%, transparent)`,
          color: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--a-text-3)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--a-text-1)",
            fontFamily: mono
              ? "ui-monospace, 'SF Mono', Consolas, monospace"
              : "inherit",
            lineHeight: 1.4,
          }}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  return (
    <MasterTable
      title="Items"
      icon={ListTodo}
      accent={ACCENT}
      table="tasks"
      layout="cards"
      cardMinWidth={320}
      searchKeys={["part_number", "drawing_number", "item_description"]}
      orderBy={{ column: "part_number", ascending: true }}
      onBeforeSave={(payload, editingRow, rows) => {
        const partDupe = rows.some(
          (r) => r.id !== editingRow?.id && (r.part_number || "").trim().toLowerCase() === (payload.part_number || "").trim().toLowerCase(),
        );
        if (partDupe) return { error: "An item with this part number already exists." };

        const drawing = (payload.drawing_number || "").trim();
        if (drawing) {
          const drawingDupe = rows.some(
            (r) => r.id !== editingRow?.id && (r.drawing_number || "").trim().toLowerCase() === drawing.toLowerCase(),
          );
          if (drawingDupe) return { error: "An item with this drawing number already exists." };
        }
        return { payload };
      }}
      renderCard={(r) => (
        <div style={{ marginBottom: "26px" }}>
          <FieldRow icon={Hash} label="Part no." value={r.part_number} mono />
          <FieldRow
            icon={Ruler}
            label="Drawing no."
            value={r.drawing_number}
            mono
          />
          <FieldRow
            icon={FileText}
            label="Item desc."
            value={r.item_description}
          />
        </div>
      )}
      fields={[
        { key: "part_number", label: "Part number", required: true },
        { key: "drawing_number", label: "Drawing number" },
        { key: "item_description", label: "Item description", required: true },
      ]}
    />
  );
}
