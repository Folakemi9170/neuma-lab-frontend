"use client";

import { useEffect, useState } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";
import ProtectedRoute from "../../components/protected-route";
import Link from "next/link";

interface Booking {
  id: number;
  serviceName: string;
  status: string;
  address: string;
  notes?: string;
  createdAt: string;
}

const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
  Pending:   { bg: "#fefae8", color: "#7a5c00", border: "#e8d48a" },
  Confirmed: { bg: "#eef4fe", color: "#1a3d7a", border: "#9ab4e8" },
  Completed: { bg: "#f0faf4", color: "#1e5c35", border: "#7ec49a" },
  Cancelled: { bg: "#fff5f5", color: "#8b2a2a", border: "#e8a4a4" },
};

function Dashboard() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/Booking/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setBookings(data.data || []);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--warm)" }}>
      <div style={{
        maxWidth: "860px",
        margin: "0 auto",
        padding: "clamp(32px, 5vw, 64px) clamp(16px, 4vw, 48px)",
      }}>

        {/* Page header */}
        <div style={{ marginBottom: "clamp(28px, 4vw, 48px)" }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 300,
            color: "var(--text)",
            lineHeight: 1.1,
            margin: 0,
          }}>
            My Bookings
          </h1>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
            color: "var(--muted)",
            marginTop: "8px",
          }}>
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "48px" }}>
            <div className="spinner" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-box">Failed to load bookings: {error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "clamp(40px, 6vw, 80px) 24px",
            border: "0.5px dashed var(--border)",
            borderRadius: "6px",
            background: "#fff",
          }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(18px, 2vw, 24px)",
              fontWeight: 300,
              color: "var(--muted)",
              marginBottom: "20px",
            }}>
              You have no bookings yet
            </p>
            <Link href="/services" className="btn-gold" style={{
              display: "inline-block",
              padding: "12px 32px",
              textDecoration: "none",
              width: "auto",
            }}>
              Browse Services
            </Link>
          </div>
        )}

        {/* Bookings list */}
        {!loading && !error && bookings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookings.map((booking) => {
              const style = statusStyles[booking.status] || { bg: "var(--warm2)", color: "var(--muted)", border: "var(--border)" };
              return (
                <div key={booking.id} style={{
                  background: "#fff",
                  border: "0.5px solid var(--border)",
                  borderRadius: "6px",
                  padding: "clamp(16px, 2.5vw, 28px)",
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(16px, 1.8vw, 22px)",
                        fontWeight: 400,
                        color: "var(--text)",
                        marginBottom: "6px",
                      }}>
                        {booking.serviceName}
                      </h2>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}>
                        {booking.address}
                      </p>
                      {booking.notes && (
                        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)", fontStyle: "italic", marginBottom: "4px" }}>
                          {booking.notes}
                        </p>
                      )}
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: "var(--muted)", marginTop: "8px" }}>
                        Booked {new Date(booking.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric", month: "long", day: "numeric",
                        })} · Ref #{booking.id}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.5px",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      background: style.bg,
                      color: style.color,
                      border: `0.5px solid ${style.border}`,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "32px" }}>
          <Link href="/services" style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
            color: "var(--muted)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            Book another service
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute requiredRole="Client">
      <Dashboard />
    </ProtectedRoute>
  );
}