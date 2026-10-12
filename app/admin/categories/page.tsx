"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/Category`)
      .then((res) => res.json())
      .then((data) => { setCategories(data.data ?? []); setLoading(false); })
      .catch(() => { setError("Failed to load categories"); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ name: "", description: "" }); setEditingId(null); setShowCreate(false); setActionError(""); };

  const startEdit = (c: Category) => {
    setForm({ name: c.name, description: c.description });
    setEditingId(c.id);
    setShowCreate(false);
    setActionError("");
  };

  const save = async () => {
    if (!form.name.trim()) { setActionError("Name is required"); return; }
    setSaving(true);
    setActionError("");
    try {
      const isEdit = editingId !== null;
      const res = await fetch(`${API_BASE}/api/Category${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
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
    if (!confirm("Delete this category? This will fail if services are still linked to it.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/Category/${id}`, {
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
            Categories
          </h1>
        </div>
        <button onClick={() => { setShowCreate(true); setEditingId(null); setForm({ name: "", description: "" }); }} className="btn-gold" style={{ width: "auto" }}>
          + New Category
        </button>
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}

      {(showCreate || editingId !== null) && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", marginBottom: "16px" }}>
            {editingId !== null ? "Edit Category" : "New Category"}
          </h3>
          {actionError && <div className="error-box" style={{ marginBottom: "14px" }}>{actionError}</div>}
          <div style={{ marginBottom: "14px" }}>
            <label className="label">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="label">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          {categories.map((c) => (
            <div key={c.id} className="card" style={{ padding: "18px" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "var(--text)", marginBottom: "6px" }}>{c.name}</h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--muted)", marginBottom: "14px" }}>{c.description}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => startEdit(c)} className="btn-gold" style={{ width: "auto", padding: "6px 16px", fontSize: "12px" }}>
                  Edit
                </button>
                <button onClick={() => remove(c.id)} className="btn-gold" style={{ width: "auto", padding: "6px 16px", fontSize: "12px", background: "#b85c5c" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}