"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sp_token") : null;
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      // Fake auth: accept any non-empty credentials
      if (email.trim() && password.trim()) {
        localStorage.setItem("sp_token", "demo-token");
        router.replace("/dashboard");
      } else {
        setError("Enter email and password");
      }
      setLoading(false);
    }, 600);
  }

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backgroundColor: "#0a0a0a",
      color: "#eaeaea",
    },
    card: {
      width: "100%",
      maxWidth: "380px",
      padding: "24px",
      background: "linear-gradient(180deg, #0b0b0b, #0a0a0a)",
      border: "1px solid #1f1f1f",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    },
    brand: {
      height: "40px",
      width: "40px",
      borderRadius: "8px",
      backgroundColor: "#111",
      border: "1px solid #222",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 8px auto",
      fontWeight: 600 as const,
    },
    h1: { textAlign: "center" as const, fontSize: "18px", fontWeight: 600 },
    subtitle: { textAlign: "center" as const, fontSize: "12px", color: "#9b9b9b", marginTop: "4px", marginBottom: "16px" },
    group: { display: "grid", gap: "6px" },
    label: { fontSize: "12px", color: "#bdbdbd" },
    input: {
      width: "100%",
      backgroundColor: "#0f0f0f",
      border: "1px solid #232323",
      color: "#eaeaea",
      borderRadius: "10px",
      padding: "10px 12px",
    },
    error: { fontSize: "12px", color: "#fca5a5" },
    button: {
      width: "100%",
      marginTop: "8px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #2a2a2a",
      backgroundColor: "#111111",
      color: "#eaeaea",
      cursor: "pointer",
    },
    form: { display: "grid", gap: "16px" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>SP</div>
        <h1 style={styles.h1}>Sign in to SentinelPro</h1>
        <p style={styles.subtitle}>Modern, dark, Vercel-like UI</p>
        <form onSubmit={onSubmit} style={styles.form as React.CSSProperties}>
          <div style={styles.group as React.CSSProperties}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={styles.group as React.CSSProperties}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <div style={styles.error}>{error}</div> : null}
          <button style={styles.button} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}


