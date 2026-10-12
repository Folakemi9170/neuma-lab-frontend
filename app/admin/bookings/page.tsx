"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
type PaymentStatus = "Pending" | "HalfPaid" | "FullyPaid" | "Refunded";

interface Booking {
  id: number;
  bookingReference: string;
  userId?: number | null;
  userFullName?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  notes?: string;
  serviceName: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  agreedPrice?: number | null;
  amountPaid?: number | null;
  createdAt: string;
  paystackPaymentLink?: string | null;
}

interface Paginated<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const statusOptions: BookingStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("");
  const [allowHalf, setAllowHalf] = useState(false);

  const load = useCallback(async () => {
  if (!token) return;
  setLoading(true);

  const params = new URLSearchParams({
    pageNumber: String(page),
    pageSize: "10",
  });

  if (statusFilter) {
    params.set("status", statusFilter);
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/Booking?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load bookings");
    }

    const data = await res.json();
    const p: Paginated<Booking> = data.data;

    setBookings(p.data);
    setTotalPages(p.totalPages);
    } catch (error) {
    console.error(error);
    setError("Failed to load bookings");
    } finally {
    setLoading(false);
    }
    }, [token, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: BookingStatus) => {
    setActionLoading(true);
    await fetch(`${API_BASE}/api/Booking/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setActionLoading(false);
    load();
  };

  const cancelBooking = async (id: number) => {
    if (!confirm("Cancel this booking?")) return;
    setActionLoading(true);
    await fetch(`${API_BASE}/api/Booking/${id}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setActionLoading(false);
    load();
  };

  const setAgreedPrice = async (id: number) => {
  if (!priceInput || Number(priceInput) <= 0) return;

  setActionLoading(true);

  try {
    const amount = Number(priceInput);
    const res = await fetch(
      `${API_BASE}/api/Booking/set-agreed-price/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agreedPrice: amount, allowHalfPayment: allowHalf,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to set agreed price");
    }

    // Immediately update the booking displayed on screen
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              agreedPrice: amount,
              paymentStatus: allowHalf ? "Pending" : booking.paymentStatus,
            }
          : booking
      )
    );

    setPriceInput("");

    // Optional: refresh from backend to make sure UI matches database
    await load();

  } catch (error) {
    console.error("Error setting agreed price:", error);
    setError("Failed to set agreed price");
  } finally {
    setActionLoading(false);
  }
};

  const statusColor: Record<BookingStatus, string> = {
    Pending: "#7a5c00", Confirmed: "#1a3d7a", Completed: "#1e5c35", Cancelled: "#8b2a2a",
  };

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)", marginBottom: "20px" }}>
        Bookings
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as BookingStatus | ""); setPage(1); }}
          className="input-field"
          style={{ maxWidth: "220px" }}
        >
          <option value="">All statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}
      {loading && <div className="spinner" />}

      {!loading && bookings.map((b) => (
        <div key={b.id} className="card" style={{ marginBottom: "12px", padding: "18px 20px" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
          >
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "var(--text)" }}>
                {b.serviceName} . {b.clientName}
              </p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)" }}>
                {b.bookingReference} · {new Date(b.createdAt).toLocaleDateString()} · {b.paymentStatus}
              </p>
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", fontWeight: 500, color: statusColor[b.status] }}>
              {b.status}
            </span>
          </div>

          {expandedId === b.id && (
            <div style={{ marginTop: "16px", borderTop: "0.5px solid var(--border)", paddingTop: "16px", fontFamily: "'Outfit', sans-serif", fontSize: "13px" }}>
              <p><strong>Email:</strong> {b.clientEmail}</p>
              <p><strong>Phone:</strong> {b.clientPhone}</p>
              <p><strong>Address:</strong> {b.address}</p>
              {b.notes && <p><strong>Notes:</strong> {b.notes}</p>}
              <p><strong>Agreed Price:</strong> {b.agreedPrice ? `₦${b.agreedPrice.toLocaleString()}` : "Not set"}</p>
              <p><strong>Amount Paid:</strong> {b.amountPaid ? `₦${b.amountPaid.toLocaleString()}` : "₦0"}</p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                <select
                  defaultValue={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
                  disabled={actionLoading}
                  className="input-field"
                  style={{ maxWidth: "160px" }}
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <button onClick={() => cancelBooking(b.id)} disabled={actionLoading} className="btn-gold" style={{ width: "auto", background: "#b85c5c" }}>
                  Cancel Booking
                </button>
              </div>

              {!b.agreedPrice && (
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "14px", flexWrap: "wrap" }}>
                  <input
                    type="number"
                    placeholder="Set agreed price (₦)"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="input-field"
                    style={{ maxWidth: "180px" }}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}>
                    <input type="checkbox" checked={allowHalf} onChange={(e) => setAllowHalf(e.target.checked)} />
                    Allow half payment
                  </label>
                  <button onClick={() => setAgreedPrice(b.id)} disabled={actionLoading} className="btn-gold" style={{ width: "auto" }}>
                    Set Price
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

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