"use client";

import { useState, Suspense } from "react";
import { useAuth } from "../context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/services";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        address: formData.address || undefined,
      });
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: { label: string; name: keyof typeof formData; type: string; placeholder: string; required: boolean }[] = [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "John Doe", required: true },
    { label: "Phone Number", name: "phoneNumber", type: "tel", placeholder: "+234 801 234 5678", required: true },
    { label: "Email", name: "email", type: "email", placeholder: "you@email.com", required: true },
    { label: "Address (optional)", name: "address", type: "text", placeholder: "Lagos, Nigeria", required: false },
    { label: "Password", name: "password", type: "password", placeholder: "••••••••", required: true },
    { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "••••••••", required: true },
  ];

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
          <p className="eyebrow" style={{ marginBottom: "8px" }}>Join NeumaLab</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 300,
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.1,
          }}>
            Create your account
          </h1>
        </div>

        {/* Card */}
        <div className="card">
          {error && <div className="error-box" style={{ marginBottom: "20px" }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.name} style={{ marginBottom: "16px" }}>
                <label className="label">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  minLength={field.name === "password" ? 6 : undefined}
                  className="input-field"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <div style={{ marginTop: "8px" }}>
              <button type="submit" disabled={isSubmitting} className="btn-gold">
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>

          <p style={{
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
            color: "var(--muted)",
            marginTop: "20px",
            marginBottom: 0,
          }}>
            Already have an account?{" "}
            <Link
              href={`/login${redirectTo !== "/services" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none", borderBottom: "0.5px solid var(--border)" }}
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="spinner-screen"><div className="spinner" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}