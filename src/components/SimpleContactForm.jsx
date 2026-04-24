// SimpleContactForm.jsx
// Sends to kanishkumarsj@gmail.com via web3forms
// Access key: a3a6b7a7-b562-4dad-a166-63d076d3b95a
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";

const ACCESS_KEY = "a3a6b7a7-b562-4dad-a166-63d076d3b95a";

function Field({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  multiline = false,
  rows = 4,
}) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: "100%",
    background: "var(--bg-input)",
    border: `1.5px solid ${focused ? "var(--brand)" : "var(--border-2)"}`,
    borderRadius: "12px",
    padding: "14px 18px",
    fontSize: "16px",
    color: "var(--text-1)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text-2)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "8px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--brand)", marginLeft: "4px" }}>*</span>
        )}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...base, resize: "vertical", minHeight: "120px" }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        />
      )}
    </div>
  );
}

export default function SimpleContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `New Enquiry from ${form.name} — Saam Geaars`,
          from_name: "Saam Geaars Website",
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        setForm({ name: "", phone: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 6000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const isBusy = status === "submitting";
  const isDone = status === "success";

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-1)",
        borderRadius: "24px",
        padding: "2.5rem",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "var(--text-1)",
            marginBottom: "6px",
          }}
        >
          Send us an Enquiry
        </h3>
        <p
          style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.6 }}
        >
          Fill in your details and we'll get back to you within one business
          day.
        </p>
      </div>

      <AnimatePresence>
        {isDone && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 2rem",
              gap: "16px",
              background: "color-mix(in srgb, #22c55e 8%, var(--bg-card))",
              border: "1.5px solid rgba(34,197,94,0.25)",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(34,197,94,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle
                style={{ width: "30px", height: "30px", color: "#22c55e" }}
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: "4px",
                }}
              >
                Message sent!
              </p>
              <p style={{ fontSize: "15px", color: "var(--text-2)" }}>
                Our team will reach out to you shortly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isDone && (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          <div
            style={{ display: "grid", gap: "16px" }}
            className="grid-cols-1 sm:grid-cols-2"
          >
            <Field
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            <Field
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              type="tel"
              required
            />
          </div>
          <Field
            label="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@company.com"
            type="email"
          />
          <Field
            label="Your Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your requirement — product type, quantity, specifications…"
            required
            multiline
            rows={5}
          />

          {status === "error" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                background: "rgba(226,75,74,0.08)",
                border: "1px solid rgba(226,75,74,0.25)",
                borderRadius: "10px",
              }}
            >
              <AlertCircle
                style={{
                  width: "16px",
                  height: "16px",
                  color: "#e24b4a",
                  flexShrink: 0,
                }}
              />
              <p style={{ fontSize: "14px", color: "#e24b4a" }}>
                Something went wrong. Please try again or call us directly.
              </p>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isBusy}
            whileHover={!isBusy ? { scale: 1.02 } : {}}
            whileTap={!isBusy ? { scale: 0.97 } : {}}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px 32px",
              borderRadius: "12px",
              background: isBusy ? "var(--brand-muted)" : "var(--brand)",
              border: `1.5px solid ${isBusy ? "var(--brand-border)" : "var(--brand)"}`,
              color: isBusy ? "var(--brand)" : "#fff",
              fontSize: "15px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: isBusy ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: isBusy ? "none" : "0 4px 20px rgba(64,53,135,0.3)",
            }}
          >
            {isBusy ? (
              <>
                <Loader2
                  style={{
                    width: "18px",
                    height: "18px",
                    animation: "scfSpin 1s linear infinite",
                  }}
                />{" "}
                Sending…
              </>
            ) : (
              <>
                <Send style={{ width: "17px", height: "17px" }} /> Send Enquiry
              </>
            )}
          </motion.button>

          <p
            style={{
              fontSize: "13px",
              color: "var(--text-3)",
              textAlign: "center",
            }}
          >
            Or call us at{" "}
            <a
              href="tel:+919843018244"
              style={{
                color: "var(--brand)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              +91 98430 18244
            </a>
          </p>
          <style>{`@keyframes scfSpin { to { transform: rotate(360deg) } }`}</style>
        </form>
      )}
    </div>
  );
}
