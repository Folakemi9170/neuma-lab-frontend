"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
}

const emptyForm = { question: "", answer: "", category: "", displayOrder: "0" };

export default function AdminFAQ() {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/FAQ`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...(data.data ?? [])].sort((a: FAQ, b: FAQ) => a.displayOrder - b.displayOrder);
        setFaqs(sorted);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load FAQs"); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowCreate(false); setActionError(""); };

  const startEdit = (f: FAQ) => {
    setForm({ question: f.question, answer: f.answer, category: f.category, displayOrder: String(f.displayOrder) });
    setEditingId(f.id);
    setShowCreate(false);
    setActionError("");
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setActionError("Question and answer are required");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const isEdit = editingId !== null;
      const body = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        displayOrder: Number(form.displayOrder) || 0,
      };
      const res = await fetch(`${API_BASE}/api/FAQ${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      resetForm();
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/FAQ/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)" }}>
            FAQ
          </h1>
        </div>
        <button onClick={() => { setShowCreate(true); setEditingId(null); setForm(emptyForm); }} className="btn-gold" style={{ width: "auto" }}>
          New FAQ
        </button>
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}

      {(showCreate || editingId !== null) && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", marginBottom: "16px" }}>
            {editingId !== null ? "Edit FAQ" : "New FAQ"}
          </h3>
          {actionError && <div className="error-box" style={{ marginBottom: "14px" }}>{actionError}</div>}

          <div style={{ marginBottom: "14px" }}>
            <label className="label">Question</label>
            <input className="input-field" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="label">Answer</label>
            <textarea className="input-field" rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
            <div>
              <label className="label">Category</label>
              <input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="label">Display Order</label>
              <input type="number" className="input-field" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={save} disabled={saving} className="btn-gold" style={{ width: "auto" }}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={resetForm} className="btn-gold" style={{ width: "auto", background: "var(--muted)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <div className="spinner" />}

      {!loading && faqs.map((f) => (
        <div key={f.id} className="card" style={{ marginBottom: "10px", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "var(--text)", marginBottom: "4px" }}>
                {f.question}
              </p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--muted)", marginBottom: "6px" }}>
                {f.answer}
              </p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: "var(--muted)" }}>
                {f.category} · order {f.displayOrder}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button onClick={() => startEdit(f)} className="btn-gold" style={{ width: "auto", padding: "6px 14px", fontSize: "12px" }}>Edit</button>
              <button onClick={() => remove(f.id)} className="btn-gold" style={{ width: "auto", padding: "6px 14px", fontSize: "12px", background: "#b85c5c" }}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}