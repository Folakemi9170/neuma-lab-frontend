"use client";

import { useState, Suspense } from "react";
import { useAuth } from "../context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/services";

  // Client-only routes that admins should NOT access
  const clientOnlyRoutes = ["/booking", "/client"];
  const isClientOnlyRedirect = clientOnlyRoutes.some(route => redirectTo.startsWith(route));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const userData = await login(email, password);

      // Admin trying to access a client-only route (e.g., booking)
      if (userData.userRole === "Admin" && isClientOnlyRedirect) {
        // Clear the stored auth data since they shouldn't be logged in for this context
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("User not found");
      }

      // Role-based redirect
      if (userData.userRole === "Admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--warm)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(16px, 4vw, 40px)",
    }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--text)",
            textDecoration: "none",
            letterSpacing: "1px",
            display: "inline-block",
            marginBottom: "24px",
          }}>
            Neuma<span style={{ color: "var(--gold)" }}>Lab</span>
          </Link>
          <p className="eyebrow" style={{ marginBottom: "8px" }}>Welcome back</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 300,
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.1,
          }}>
            Sign in to your account
          </h1>
        </div>

        {/* Card */}
        <div className="card">
          {error && <div className="error-box" style={{ marginBottom: "20px" }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@email.com"
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-gold">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p style={{
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
            color: "var(--muted)",
            marginTop: "20px",
            marginBottom: 0,
          }}>
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${redirectTo !== "/services" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none", borderBottom: "0.5px solid var(--border)" }}
            >
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="spinner-screen"><div className="spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}