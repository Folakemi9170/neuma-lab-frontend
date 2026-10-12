"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth, API_BASE } from "../../context/auth-context";

interface Category { id: number; name: string; description: string; }
interface Service {
  id: number;
  name: string;
  shortDescription: string;
  imageUrl: string;
  price: number;
  category: Category;
}
interface Paginated<T> { data: T[]; currentPage: number; totalPages: number; totalCount: number; }

const emptyForm = {
  name: "", shortDescription: "", fullDescription: "", price: "", categoryId: "",
};

export default function AdminServices() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadServices = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/Service?pageNumber=${page}&pageSize=10`)
      .then((res) => res.json())
      .then((data) => {
        const p: Paginated<Service> = data.data;
        setServices(p.data);
        setTotalPages(p.totalPages);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load services"); setLoading(false); });
  }, [page]);

  useEffect(() => { loadServices(); }, [loadServices]);

  useEffect(() => {
    fetch(`${API_BASE}/api/Category`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data ?? []))
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setForm(emptyForm); setImageFile(null); setEditingId(null); setActionError("");
  };

  const startEdit = (s: Service) => {
    setForm({
      name: s.name, shortDescription: s.shortDescription, fullDescription: "",
      price: String(s.price), categoryId: String(s.category?.id ?? ""),
    });
    setImageFile(null);
    setEditingId(s.id);
    setActionError("");
  };

  const save = async () => {
    if (!form.name.trim() || !form.price || !form.categoryId) {
      setActionError("Name, price, and category are required");
      return;
    }
    if (editingId === null && !imageFile) {
      setActionError("An image is required for new services");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const fd = new FormData();
      fd.append("Name", form.name);
      fd.append("ShortDescription", form.shortDescription);
      fd.append("FullDescription", form.fullDescription);
      fd.append("Price", form.price);
      fd.append("CategoryId", form.categoryId);
      if (imageFile) fd.append("ImageFile", imageFile);

      const isEdit = editingId !== null;
      const res = await fetch(`${API_BASE}/api/Service${isEdit ? `/${editingId}` : "/with-image"}`, {
        method: isEdit ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      resetForm();
      loadServices();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/Service/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      loadServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)" }}>
            Services
          </h1>
        </div>
        <Link href="/admin/services/new" className="btn-gold" style={{ width: "auto", textDecoration: "none", display: "inline-block", textAlign: "center" }}>
          New Service
        </Link>
      </div>

      {error && <div className="error-box" style={{ marginBottom: "16px" }}>{error}</div>}

      {(editingId !== null) && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", marginBottom: "16px" }}>
            {editingId !== null ? "Edit Service" : "New Service"}
          </h3>
          {actionError && <div className="error-box" style={{ marginBottom: "14px" }}>{actionError}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label className="label">Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Price (₦)</label>
              <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="label">Category</label>
            <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="label">Short Description</label>
            <input className="input-field" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="label">Full Description</label>
            <textarea className="input-field" rows={4} value={form.fullDescription} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })} />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label className="label">Image {editingId !== null && "(leave empty to keep current)"}</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
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
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {services.map((s) => (
              <div key={s.id} className="card" style={{ padding: "14px" }}>
                <img src={s.imageUrl} alt={s.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "4px", marginBottom: "10px" }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "var(--text)", marginBottom: "4px" }}>{s.name}</h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "6px" }}>{s.category?.name}</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "var(--text)", marginBottom: "10px" }}>₦{s.price.toLocaleString()}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => startEdit(s)} className="btn-gold" style={{ width: "auto", padding: "6px 14px", fontSize: "12px" }}>Edit</button>
                  <button onClick={() => remove(s.id)} className="btn-gold" style={{ width: "auto", padding: "6px 14px", fontSize: "12px", background: "#b85c5c" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-gold" style={{ width: "auto" }}>Prev</button>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", padding: "8px 0" }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-gold" style={{ width: "auto" }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}