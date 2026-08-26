import { Building2, Phone, Mail, User } from "lucide-react";
import MasterTable from "../components/masters/MasterTable";
import FlagBadge from "../components/FlagBadge";

// Read-only badges — client/supplier status is only ever edited via the
// Add/Edit Company form (where AnimatedCheckbox lives). A list card isn't
// the place for an interactive control that implies inline editing.
function CompanyFlags({ row }) {
  if (!row.is_client && !row.is_supplier) return null;
  return (
    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
      {row.is_client && <FlagBadge label="Client" />}
      {row.is_supplier && (
        <FlagBadge
          label="Supplier"
          color="var(--a-success)"
          tint="color-mix(in srgb, var(--a-success) 15%, transparent)"
        />
      )}
    </div>
  );
}

export default function Companies() {
  return (
    <MasterTable
      title="Companies"
      singular="company"
      icon={Building2}
      accent="var(--a-brand)"
      table="companies"
      layout="cards"
      cardMinWidth={320}
      orderBy={{ column: "name", ascending: true }}
      remoteSearch={(sb, q) => {
        const like = `%${q}%`;
        return sb
          .from("companies")
          .select("*")
          .or(`name.ilike.${like},contact_person.ilike.${like},phone.ilike.${like},email.ilike.${like}`)
          .order("name", { ascending: true });
      }}
      renderCard={(r) => (
        <div style={{ marginBottom: "25px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--a-brand-tint)",
                  color: "var(--a-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Building2 size={18} />
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {r.name}
              </div>
            </div>

            <CompanyFlags row={r} />
          </div>

          {r.contact_person && (
            <div
              style={{
                fontSize: "14.5px",
                fontWeight: 600,
                color: "var(--a-text-2)",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "5px",
              }}
            >
              <User size={13} /> {r.contact_person}
            </div>
          )}
          {r.phone && (
            <div
              style={{
                fontSize: "14.5px",
                fontWeight: 600,
                color: "var(--a-text-2)",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "5px",
              }}
            >
              <Phone size={13} /> {r.phone}
            </div>
          )}
          {r.email && (
            <div
              style={{
                fontSize: "14.5px",
                fontWeight: 600,
                color: "var(--a-text-2)",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "5px",
              }}
            >
              <Mail size={13} /> {r.email}
            </div>
          )}
          {r.gst_number && (
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 600,
                color: "var(--a-text-3)",
              }}
            >
              GST: {r.gst_number}
            </div>
          )}
        </div>
      )}
      fields={[
        { key: "name", label: "Company name", required: true },
        { key: "is_client", label: "Client", type: "checkbox" },
        { key: "is_supplier", label: "Supplier", type: "checkbox" },
        { key: "contact_person", label: "Contact person" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email", type: "email" },
        { key: "gst_number", label: "GST number" },
      ]}
    />
  );
}
