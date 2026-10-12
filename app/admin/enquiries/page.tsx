"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

interface Enquiry {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
interface Paginated<T> { data: T[]; currentPage: number; totalPages: number; totalCount: number; }

export default function AdminEnquiries() {
  const { token } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState<"" | "unread" | "read">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ pageNumber: String(page), pageSize: "10" });
    if (filter === "unread") params.set("isRead", "false");
    if (filter === "read") params.set("isRead", "true");

    fetch(`${API_BASE}/api/Enquiry?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const p: Paginated<Enquiry> = data.data;
        setEnquiries(p.data);
        setTotalPages(p.totalPages);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load enquiries"); setLoading(false); });
  }, [token, page, filter]);

  useEffect(() => { load(); }, [load]);

  const openEnquiry = async (e: Enquiry) => {
    setExpandedId(expandedId === e.id ? null : e.id);
    if (!e.isRead) {
      await fetch(`${API_BASE}/api/Enquiry/${e.id}/mark-as-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnquiries((prev) => prev.map((x) => (x.id === e.id ? { ...x, isRead: true } : x)));
    }
  };

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)", marginBottom: "20px" }}>
        Enquiries
      </h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {(["", "unread", "read"] as const).map((f) => (
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
            {f === "" ? "All" : f === "unread" ? "Unread" : "Read"}
          </button>
        ))}
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}
      {loading && <div className="spinner" />}

      {!loading && enquiries.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No enquiries here.</div>
      )}

      {!loading && enquiries.map((e) => (
        <div
          key={e.id}
          className="card"
          style={{
            marginBottom: "10px", padding: "16px 20px", cursor: "pointer",
            borderLeft: e.isRead ? "0.5px solid var(--border)" : "3px solid var(--gold)",
          }}
          onClick={() => openEnquiry(e)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "14px", fontWeight: e.isRead ? 400 : 600, color: "var(--text)" }}>
                {e.subject || "(No subject)"} — {e.fullName}
              </p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)" }}>
                {e.email} · {new Date(e.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!e.isRead && (
              <span style={{ fontSize: "10px", background: "var(--gold)", color: "#fff", padding: "3px 10px", borderRadius: "12px" }}>
                NEW
              </span>
            )}
          </div>

          {expandedId === e.id && (
            <div style={{ marginTop: "14px", borderTop: "0.5px solid var(--border)", paddingTop: "14px", fontFamily: "'Outfit', sans-serif", fontSize: "13px" }}>
              <p><strong>Phone:</strong> {e.phoneNumber || "—"}</p>
              <p style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>{e.message}</p>
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