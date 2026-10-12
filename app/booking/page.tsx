"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth, API_BASE } from "../context/auth-context";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface BookingResult {
  bookingId: number;
  serviceName: string;
  whatsAppLink?: string;
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function BookingForm() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const rawServiceName = searchParams.get("serviceName");

  // Properly decode the service name, with fallback
  const serviceName = rawServiceName 
    ? decodeURIComponent(rawServiceName) 
    : "Selected Service";

  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");

  // Only redirect after auth has finished loading
  useEffect(() => {
    if (!isLoading && !user) {
      const bookingPath = `/booking?serviceId=${serviceId}&serviceName=${encodeURIComponent(serviceName)}`;
      router.push(`/login?redirect=${encodeURIComponent(bookingPath)}`);
    }
  }, [isLoading, user, router, serviceId, serviceName]);

  // Show loading while auth initializes
  if (isLoading) {
    return <div className="spinner-screen"><div className="spinner" /></div>;
  }

  // Not logged in — will redirect via useEffect above
  if (!user) {
    return <div className="spinner-screen"><div className="spinner" /></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/Booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: Number(serviceId),
          notes: notes || undefined,
          address: address || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Booking failed");
      setResult(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (result) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "480px" }}>
          <div className="card" style={{ textAlign: "center" }}>
            {/* Check icon */}
            <div style={{
              width: "60px", height: "60px",
              background: "#f0faf4",
              border: "0.5px solid #7ec49a",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="28" height="28" fill="none" stroke="#1e5c35" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="eyebrow" style={{ marginBottom: "8px" }}>Confirmed</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 300,
              color: "var(--text)",
              marginBottom: "12px",
            }}>
              Booking received
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "14px", color: "var(--muted)", marginBottom: "6px" }}>
              Your booking for <strong style={{ color: "var(--text)" }}>{result.serviceName}</strong> has been received.
            </p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "28px" }}>
              Reference ID: <strong style={{ color: "var(--text)" }}>#{result.bookingId}</strong>
            </p>

            {result.whatsAppLink && (
              <a
                href={result.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#25D366",
                  color: "#fff",
                  padding: "12px 28px",
                  borderRadius: "3px",
                  textDecoration: "none",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "20px",
                }}
              >
                <WhatsAppIcon size={18} />
                Continue on WhatsApp
              </a>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
              <Link href="/client/dashboard" style={{
                fontFamily: "'Outfit', sans-serif", fontSize: "13px", fontWeight: 500,
                color: "var(--text)", textDecoration: "none",
              }}>
                View My Bookings
              </Link>
              <Link href="/services" style={{
                fontFamily: "'Outfit', sans-serif", fontSize: "13px",
                color: "var(--muted)", textDecoration: "none",
              }}>
               Back to Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Booking form
  return (
    <div style={{ minHeight: "100vh", background: "var(--warm)", padding: "clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>

        <div style={{ marginBottom: "28px" }}>
          <p className="eyebrow" style={{ marginBottom: "8px" }}>Almost there</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 300,
            color: "var(--text)",
            lineHeight: 1.1,
            margin: 0,
          }}>
            Book a Consultation
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>
            Service: <strong style={{ color: "var(--text)" }}>{serviceName}</strong>
          </p>
        </div>

        <div className="card">
          {error && <div className="error-box" style={{ marginBottom: "20px" }}>{error}</div>}

          {/* User info summary */}
          <div style={{
            background: "var(--warm)",
            border: "0.5px solid var(--border)",
            borderRadius: "4px",
            padding: "14px 16px",
            marginBottom: "24px",
          }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--text)", marginBottom: "4px" }}>
              <span style={{ color: "var(--muted)" }}>Name: </span>{user.fullName}
            </p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--text)", margin: 0 }}>
              <span style={{ color: "var(--muted)" }}>Email: </span>{user.email}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label className="label">Project Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="input-field"
                placeholder="Your project address"
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="label">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="input-field"
                style={{ resize: "none" }}
                placeholder="Any specific requirements or details about your project..."
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-gold">
              {isSubmitting ? "Submitting..." : "Book Consultation"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="spinner-screen"><div className="spinner" /></div>}>
      <BookingForm />
    </Suspense>
  );
}