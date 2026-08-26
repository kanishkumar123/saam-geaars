import { Pencil, Trash2 } from "lucide-react";

// Shared corner-anchored edit/delete pair used on every master's card —
// edit at bottom-left, delete at bottom-right, consistent positions and
// persistent (not hover-only) color so the affordance reads at rest.
// Inset defaults to 24px to match the card's own content padding (1.5rem
// in CardGrid), so the buttons align flush with the field content above
// them rather than sitting closer to the edge than everything else.
export default function CardCornerActions({ onEdit, onDelete, inset = "24px" }) {
  return (
    <>
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="admin-card-action admin-card-action-edit"
        style={{ position: "absolute", left: inset, bottom: inset }}
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete"
        className="admin-card-action admin-card-action-delete"
        style={{ position: "absolute", right: inset, bottom: inset }}
      >
        <Trash2 size={15} />
      </button>
    </>
  );
}
