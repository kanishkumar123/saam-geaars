import { useEffect, useState } from "react";
import { Workflow } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { STAGE_LABELS } from "../lib/supabaseClient";
import { stageIcons } from "../lib/stageIcons";
import { cardStyle } from "../components/masters/adminUiStyles";
import { usePageTitle } from "../context/AdminUIContext";

export default function ProcessTemplates() {
  usePageTitle("Process templates");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("process_templates")
      .select("id, name, process_template_stages(stage_order, stage_type)")
      .order("name")
      .then(({ data }) => {
        setTemplates(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* <p style={{ color: "var(--a-text-2)", fontSize: "16px", marginBottom: "2rem", maxWidth: "640px" }}>
        Fixed, ordered stage sequences used when creating a job card. Editable only at the database level to avoid
        retroactively changing job cards already in progress.
      </p> */}

      {loading ? (
        <div style={{ color: "var(--a-text-3)" }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {templates.map((t) => {
            const stages = [...t.process_template_stages].sort(
              (a, b) => a.stage_order - b.stage_order,
            );
            return (
              <div key={t.id} style={{ ...cardStyle, padding: "1.75rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "9px",
                      background: "var(--a-brand-tint)",
                      color: "var(--a-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Workflow size={16} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{ fontSize: "13.5px", color: "var(--a-text-3)" }}
                    >
                      {stages.length} stages, in order
                    </div>
                  </div>
                </div>

                {/* Connected chain — same timeline language as the job card Full view */}
                <div
                  className="admin-pt-chain"
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    paddingBottom: "6px",
                  }}
                >
                  {stages.map((s, i) => {
                    const Icon = stageIcons[s.stage_type] || Workflow;
                    return (
                      <div
                        key={s.stage_order}
                        className="admin-pt-node"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: "0 0 auto",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            width: "104px",
                          }}
                        >
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              background: "var(--a-bg-elevated)",
                              border: "2px solid var(--a-brand-border)",
                              color: "var(--a-brand)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: "12.5px",
                              fontWeight: 800,
                              position: "relative",
                            }}
                          >
                            <Icon size={19} />
                            <span
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: "var(--a-brand-grad)",
                                color: "#fff",
                                fontSize: "10.5px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {i + 1}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              textAlign: "center",
                              color: "var(--a-text-2)",
                              lineHeight: 1.3,
                            }}
                          >
                            {STAGE_LABELS[s.stage_type] || s.stage_type}
                          </span>
                        </div>
                        {i < stages.length - 1 && (
                          <div
                            style={{
                              width: "28px",
                              height: "2px",
                              background: "var(--a-brand-border)",
                              flexShrink: 0,
                              marginBottom: "26px",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
