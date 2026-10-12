"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

interface Review {
  id: number;
  clientName: string;
  review: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}
interface Paginated<T> { data: T[]; currentPage: number; totalPages: number; totalCount: number; }

export default function AdminReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"" | "pending" | "approved">("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ pageNumber: String(page), pageSize: "10" });
    if (filter === "pending") params.set("isApproved", "false");
    if (filter === "approved") params.set("isApproved", "true");

    fetch(`${API_BASE}/api/Review?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const p: Paginated<Review> = data.data;
        setReviews(p.data);
        setTotalPages(p.totalPages);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load reviews"); setLoading(false); });
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: number) => {
    setActionLoading(true);
    await fetch(`${API_BASE}/api/Review/${id}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setActionLoading(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this review? Use this to reject a pending review or remove an approved one.")) return;
    setActionLoading(true);
    await fetch(`${API_BASE}/api/Review/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setActionLoading(false);
    load();
  };

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)", marginBottom: "20px" }}>
        Reviews
      </h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {(["pending", "approved", ""] as const).map((f) => (
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
            {f === "" ? "All" : f === "pending" ? "Pending" : "Approved"}
          </button>
        ))}
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}
      {loading && <div className="spinner" />}

      {!loading && reviews.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No reviews here.</div>
      )}

      {!loading && reviews.map((r) => (
        <div key={r.id} className="card" style={{ marginBottom: "12px", padding: "16px 20px" }}>
          <div style={{ color: "var(--gold)", fontSize: "13px", marginBottom: "8px" }}>
            {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", color: "var(--text)", fontStyle: "italic", marginBottom: "8px" }}>
            "{r.review}"
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
            {r.clientName} · {new Date(r.createdAt).toLocaleDateString()} · {r.isApproved ? "Approved" : "Pending"}
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            {!r.isApproved && (
              <button onClick={() => approve(r.id)} disabled={actionLoading} className="btn-gold" style={{ width: "auto", padding: "6px 16px", fontSize: "12px" }}>
                Approve
              </button>
            )}
            <button onClick={() => remove(r.id)} disabled={actionLoading} className="btn-gold" style={{ width: "auto", padding: "6px 16px", fontSize: "12px", background: "#b85c5c" }}>
              Delete
            </button>
          </div>
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