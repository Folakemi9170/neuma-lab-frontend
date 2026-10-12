"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

interface Booking {
  id: number;
  bookingReference: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  status: string;
  paymentStatus: "Pending" | "HalfPaid" | "FullyPaid" | "Refunded";
  agreedPrice?: number | null;
  amountPaid?: number | null;
  createdAt: string;
  paystackPaymentLink?: string | null;
}
interface Paginated<T> { data: T[]; currentPage: number; totalPages: number; totalCount: number; }

export default function AdminPayments() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"" | "Pending" | "HalfPaid" | "FullyPaid" | "Refunded">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ pageNumber: String(page), pageSize: "15" });
    if (filter) params.set("paymentStatus", filter);

    fetch(`${API_BASE}/api/Booking?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const p: Paginated<Booking> = data.data;
        setBookings(p.data);
        setTotalPages(p.totalPages);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load payments"); setLoading(false); });
  }, [token, page, filter]);

  useEffect(() => { load(); }, [load]);

  const paymentColor: Record<string, string> = {
    Pending: "#8b2a2a", HalfPaid: "#7a5c00", FullyPaid: "#1e5c35", Refunded: "#6b5535",
  };

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)", marginBottom: "20px" }}>
        Payments
      </h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {(["", "Pending", "HalfPaid", "FullyPaid", "Refunded"] as const).map((f) => (
          <button
            key={f || "all"}
            onClick={() => { setFilter(f); setPage(1); }}
            className="btn-gold"
            style={{
              width: "auto", padding: "8px 18px", fontSize: "12px",
              background: filter === f ? "var(--gold)" : "#fff",
              color: filter === f ? "#fff" : "var(--text)",
              border: "0.5px solid var(--border)",
            }}
          >
            {f === "" ? "All" : f}
          </button>
        ))}
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}
      {loading && <div className="spinner" />}

      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Outfit', sans-serif", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Ref</th>
                <th style={{ padding: "10px" }}>Client</th>
                <th style={{ padding: "10px" }}>Service</th>
                <th style={{ padding: "10px" }}>Agreed</th>
                <th style={{ padding: "10px" }}>Paid</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: "0.5px solid var(--border)" }}>
                  <td style={{ padding: "10px" }}>{b.bookingReference}</td>
                  <td style={{ padding: "10px" }}>{b.clientName}</td>
                  <td style={{ padding: "10px" }}>{b.serviceName}</td>
                  <td style={{ padding: "10px" }}>{b.agreedPrice ? `₦${b.agreedPrice.toLocaleString()}` : "—"}</td>
                  <td style={{ padding: "10px" }}>{b.amountPaid ? `₦${b.amountPaid.toLocaleString()}` : "₦0"}</td>
                  <td style={{ padding: "10px", color: paymentColor[b.paymentStatus] }}>{b.paymentStatus}</td>
                  <td style={{ padding: "10px" }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-gold" style={{ width: "auto" }}>Prev</button>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", padding: "8px 0" }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-gold" style={{ width: "auto" }}>Next</button>
        </div>
      )}
    </div>
  );
}