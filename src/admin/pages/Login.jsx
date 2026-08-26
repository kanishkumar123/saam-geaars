import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import logoImg from "../../assets/saam-geaars.png";

export default function Login() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) setError(error.message);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "var(--a-card)",
          border: "1px solid var(--a-border)",
          borderRadius: "var(--a-radius-card)",
          boxShadow: "var(--a-shadow-lg)",
          padding: "2.5rem 2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
          <img
            src={logoImg}
            alt="Saam Geaars"
            style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover" }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: "18px" }}>Saam Geaars</div>
            <div style={{ fontSize: "13.5px", color: "var(--a-text-3)" }}>Admin panel</div>
          </div>
        </div>

        <label style={{ display: "block", fontSize: "14.5px", color: "var(--a-text-2)", marginBottom: "6px" }}>
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem" }}
          autoComplete="username"
        />

        <label style={{ display: "block", fontSize: "14.5px", color: "var(--a-text-2)", marginBottom: "6px" }}>
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "1.25rem" }}
          autoComplete="current-password"
        />

        {error && (
          <div
            style={{
              color: "var(--a-danger)",
              fontSize: "14.5px",
              marginBottom: "1rem",
              padding: "8px 10px",
              background: "rgba(220,38,38,0.08)",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        <Button type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
