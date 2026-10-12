"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

interface User {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  userRole: string;
  createdAt: string;
}

interface Booking {
  id: number;
  serviceName: string;
  status: string;
  paymentStatus: string;
  agreedPrice?: number | null;
  amountPaid?: number | null;
  createdAt: string;
}

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [bookingsByUser, setBookingsByUser] = useState<Record<number, Booking[]>>({});
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"" | "Client" | "Admin">("");

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/Auth/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setUsers(data.data ?? []); setLoading(false); })
      .catch(() => { setError("Failed to load users"); setLoading(false); });
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (u: User) => {
    if (expandedId === u.userId) { setExpandedId(null); return; }
    setExpandedId(u.userId);
    if (!bookingsByUser[u.userId]) {
      setBookingsLoading(true);
      const res = await fetch(`${API_BASE}/api/Auth/${u.userId}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setBookingsByUser((prev) => ({ ...prev, [u.userId]: data.data ?? [] }));
      setBookingsLoading(false);
    }
  };

  const filtered = roleFilter ? users.filter((u) => u.userRole === roleFilter) : users;

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)", marginBottom: "20px" }}>
        Users
      </h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {(["", "Client", "Admin"] as const).map((r) => (
          <button
            key={r || "all"}
            onClick={() => setRoleFilter(r)}
            className="btn-gold"
            style={{
              width: "auto", padding: "8px 18px", fontSize: "12px",
              background: roleFilter === r ? "var(--gold)" : "#fff",
              color: roleFilter === r ? "#fff" : "var(--text)",
              border: "0.5px solid var(--border)",
            }}
          >
            {r === "" ? "All" : r}
          </button>
        ))}
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}
      {loading && <div className="spinner" />}

      {!loading && filtered.map((u) => (
        <div key={u.userId} className="card" style={{ marginBottom: "10px", padding: "16px 20px", cursor: "pointer" }} onClick={() => toggleExpand(u)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "var(--text)" }}>{u.fullName}</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)" }}>
                {u.email} · {u.phoneNumber} · joined {new Date(u.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span style={{
              fontFamily: "'Outfit', sans-serif", fontSize: "11px", fontWeight: 500,
              padding: "4px 12px", borderRadius: "20px",
              background: u.userRole === "Admin" ? "#eef4fe" : "#f0faf4",
              color: u.userRole === "Admin" ? "#1a3d7a" : "#1e5c35",
            }}>
              {u.userRole}
            </span>
          </div>

          {expandedId === u.userId && (
            <div style={{ marginTop: "14px", borderTop: "0.5px solid var(--border)", paddingTop: "14px" }} onClick={(e) => e.stopPropagation()}>
              {bookingsLoading && <div className="spinner" />}
              {!bookingsLoading && (bookingsByUser[u.userId]?.length ?? 0) === 0 && (
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--muted)" }}>No bookings.</p>
              )}
              {!bookingsLoading && bookingsByUser[u.userId]?.map((b) => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--border)", fontFamily: "'Outfit', sans-serif", fontSize: "13px" }}>
                  <span>{b.serviceName} — #{b.id}</span>
                  <span style={{ color: "var(--muted)" }}>{b.status} · {b.paymentStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}