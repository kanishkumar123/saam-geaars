// ═══════════════════════════════════════════════════════════
// QuoteForm.jsx  (violet, CSS-var themed)
// ═══════════════════════════════════════════════════════════

import {
  ChevronRight,
  ChevronLeft,
  Send,
  CheckCircle,
  Loader2,
} from "lucide-react";

const PRODUCTS = ["Precision Gears", "Gear Box Units", "Sprockets"];

const SPECS = {
  "Precision Gears": [
    {
      name: "module",
      label: "Module (1–30)",
      type: "text",
      placeholder: "e.g. 4",
    },
    {
      name: "teeth",
      label: "Number of Teeth",
      type: "number",
      placeholder: "e.g. 40",
    },
    {
      name: "material",
      label: "Material / Grade",
      type: "text",
      placeholder: "e.g. EN36 Case Hardened",
    },
    {
      name: "quantity",
      label: "Quantity Required",
      type: "number",
      placeholder: "e.g. 10",
    },
  ],
  "Gear Box Units": [
    {
      name: "power",
      label: "Power Required (HP)",
      type: "number",
      placeholder: "e.g. 50",
    },
    {
      name: "ratio",
      label: "Required Ratio",
      type: "text",
      placeholder: "e.g. 20:1",
    },
    {
      name: "mounting",
      label: "Mounting Type",
      type: "text",
      placeholder: "e.g. Flange / Foot",
    },
    {
      name: "quantity",
      label: "Quantity Required",
      type: "number",
      placeholder: "e.g. 2",
    },
  ],
  Sprockets: [
    {
      name: "pitch",
      label: "Chain Pitch",
      type: "text",
      placeholder: 'e.g. 1" / 25.4mm',
    },
    {
      name: "teeth",
      label: "Number of Teeth",
      type: "number",
      placeholder: "e.g. 24",
    },
    {
      name: "bore",
      label: "Bore Diameter (mm)",
      type: "number",
      placeholder: "e.g. 40",
    },
    {
      name: "quantity",
      label: "Quantity Required",
      type: "number",
      placeholder: "e.g. 4",
    },
  ],
};

const slideV = {
  enter: (d) => ({ x: d > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -56 : 56, opacity: 0 }),
};
const trans = { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

const inputStyle = {
  width: "100%",
  background: "var(--bg-input)",
  border: "1px solid var(--border-2)",
  borderRadius: "10px",
  padding: "13px 16px",
  fontSize: "16px",
  color: "var(--text-1)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};
const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  marginBottom: "8px",
};

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [product, setProduct] = useState("");
  const [specs, setSpecs] = useState({});
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [status, setStatus] = useState("idle");

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };
  const specFields = product ? SPECS[product] : [];
  const specsFilled = specFields.every((f) => specs[f.name]?.trim());
  const contactFilled = contact.name.trim() && contact.phone.trim();

  const handleSubmit = async () => {
    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env?.VITE_WEB3FORMS_KEY ?? "YOUR_KEY",
          subject: `Quote — ${product} — ${contact.name}`,
          product,
          ...specs,
          ...contact,
        }),
      });
      const json = await res.json();
      setStatus(json.success ? "success" : "error");
      if (json.success)
        setTimeout(() => {
          setStatus("idle");
          setStep(0);
          setProduct("");
          setSpecs({});
          setContact({ name: "", phone: "", email: "" });
        }, 5000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-1)",
        borderRadius: "20px",
        padding: "2.5rem",
        boxShadow: "var(--shadow)",
      }}
    >
      {/* Step dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "2rem",
        }}
      >
        {["Product", "Specs", "Contact"].map((label, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                background:
                  step > i
                    ? "#22c55e"
                    : step === i
                      ? "var(--brand)"
                      : "var(--bg-elevated)",
                color: step >= i ? "#fff" : "var(--text-3)",
                transition: "background 0.3s",
              }}
            >
              {step > i ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: step === i ? "var(--text-1)" : "var(--text-3)",
              }}
            >
              {label}
            </span>
            {i < 2 && (
              <div
                style={{
                  width: "24px",
                  height: "1px",
                  background: "var(--border-1)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", minHeight: "280px" }}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              custom={dir}
              variants={slideV}
              initial="enter"
              animate="center"
              exit="exit"
              transition={trans}
            >
              <p
                style={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1.25rem",
                  color: "var(--text-1)",
                  fontSize: "16px",
                }}
              >
                What do you need?
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {PRODUCTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProduct(p)}
                    style={{
                      textAlign: "left",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      border: `1.5px solid ${product === p ? "var(--brand)" : "var(--border-1)"}`,
                      background:
                        product === p ? "var(--brand-muted)" : "var(--bg-card)",
                      color: product === p ? "var(--brand)" : "var(--text-2)",
                      fontSize: "16px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => go(1)}
                disabled={!product}
                style={{
                  marginTop: "1.5rem",
                  width: "100%",
                  background: "var(--brand)",
                  color: "#fff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: product ? "pointer" : "not-allowed",
                  opacity: product ? 1 : 0.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s",
                }}
              >
                Next — Specifications{" "}
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              custom={dir}
              variants={slideV}
              initial="enter"
              animate="center"
              exit="exit"
              transition={trans}
            >
              <p
                style={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1.25rem",
                  color: "var(--text-1)",
                  fontSize: "16px",
                }}
              >
                {product} — Specifications
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {specFields.map((f) => (
                  <div key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={specs[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) =>
                        setSpecs({ ...specs, [e.target.name]: e.target.value })
                      }
                      style={inputStyle}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--brand)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-2)";
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}
              >
                <button
                  onClick={() => go(0)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    border: "1px solid var(--border-2)",
                    borderRadius: "12px",
                    background: "transparent",
                    color: "var(--text-2)",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <ChevronLeft style={{ width: "16px", height: "16px" }} /> Back
                </button>
                <button
                  onClick={() => go(2)}
                  disabled={!specsFilled}
                  style={{
                    flex: 2,
                    background: "var(--brand)",
                    color: "#fff",
                    border: "none",
                    padding: "14px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: specsFilled ? "pointer" : "not-allowed",
                    opacity: specsFilled ? 1 : 0.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Next — Contact{" "}
                  <ChevronRight style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              custom={dir}
              variants={slideV}
              initial="enter"
              animate="center"
              exit="exit"
              transition={trans}
            >
              <p
                style={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1.25rem",
                  color: "var(--text-1)",
                  fontSize: "16px",
                }}
              >
                Your Contact Details
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {[
                  {
                    key: "name",
                    label: "Full Name",
                    type: "text",
                    ph: "John Doe",
                  },
                  {
                    key: "phone",
                    label: "Phone Number",
                    type: "tel",
                    ph: "+91 98765 43210",
                  },
                  {
                    key: "email",
                    label: "Email (optional)",
                    type: "email",
                    ph: "john@example.com",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type}
                      value={contact[f.key]}
                      placeholder={f.ph}
                      onChange={(e) =>
                        setContact({ ...contact, [f.key]: e.target.value })
                      }
                      style={inputStyle}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--brand)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-2)";
                      }}
                    />
                  </div>
                ))}
              </div>
              {status === "error" && (
                <p
                  style={{
                    color: "#e24b4a",
                    fontSize: "14px",
                    marginTop: "12px",
                  }}
                >
                  Something went wrong. Please try again.
                </p>
              )}
              {status === "success" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#22c55e",
                    fontSize: "15px",
                    marginTop: "12px",
                  }}
                >
                  <CheckCircle style={{ width: "16px", height: "16px" }} />{" "}
                  Sent! We'll be in touch shortly.
                </div>
              )}
              <div
                style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}
              >
                <button
                  onClick={() => go(1)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    border: "1px solid var(--border-2)",
                    borderRadius: "12px",
                    background: "transparent",
                    color: "var(--text-2)",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <ChevronLeft style={{ width: "16px", height: "16px" }} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !contactFilled ||
                    status === "submitting" ||
                    status === "success"
                  }
                  style={{
                    flex: 2,
                    background:
                      status === "success" ? "#22c55e" : "var(--brand)",
                    color: "#fff",
                    border: "none",
                    padding: "14px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: contactFilled ? "pointer" : "not-allowed",
                    opacity: contactFilled ? 1 : 0.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {status === "submitting" && (
                    <>
                      <Loader2
                        style={{
                          width: "16px",
                          height: "16px",
                          animation: "spin 1s linear infinite",
                        }}
                      />{" "}
                      Sending...
                    </>
                  )}
                  {status === "success" && (
                    <>
                      <CheckCircle style={{ width: "16px", height: "16px" }} />{" "}
                      Sent!
                    </>
                  )}
                  {(status === "idle" || status === "error") && (
                    <>
                      <Send style={{ width: "16px", height: "16px" }} /> Send
                      Quote
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// WhatsAppButton.jsx  (green stays green — it's WhatsApp branding)
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WA = "919843018244";
const WA_MSG =
  "Hello, I'd like to enquire about your gear and gearbox products.";

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-1)",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-1)",
              whiteSpace: "nowrap",
              boxShadow: "var(--shadow)",
            }}
          >
            Chat on WhatsApp
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href={`https://wa.me/${WA}?text=${encodeURIComponent(WA_MSG)}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
        }}
        aria-label="Chat on WhatsApp"
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "#22c55e",
            opacity: 0.2,
            animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: "-6px",
            borderRadius: "50%",
            border: "1px solid rgba(34,197,94,0.35)",
            animation: "waPulse 2s ease-out infinite",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
            transition: "background 0.2s",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="white"
            style={{ width: "28px", height: "28px" }}
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
      </a>
      <style>{`@keyframes ping{75%,100%{transform:scale(1.8);opacity:0}}@keyframes waPulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.5);opacity:0}}`}</style>
    </div>
  );
}

export default QuoteForm;
