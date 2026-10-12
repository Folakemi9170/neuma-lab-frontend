"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, API_BASE } from "../../../context/auth-context";

interface Category { id: number; name: string; description: string; }

export default function NewServicePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "", shortDescription: "", fullDescription: "", price: "", categoryId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/Category`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data ?? []))
      .catch(() => {});
  }, []);

  const save = async () => {
    if (!form.name.trim() || !form.price || !form.categoryId) {
      setError("Name, price, and category are required");
      return;
    }
    if (!imageFile) {
      setError("An image is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("Name", form.name);
      fd.append("ShortDescription", form.shortDescription);
      fd.append("FullDescription", form.fullDescription);
      fd.append("Price", form.price);
      fd.append("CategoryId", form.categoryId);
      fd.append("ImageFile", imageFile);

      const res = await fetch(`${API_BASE}/api/Service/with-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      router.push("/admin/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)", maxWidth: "640px" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)", marginBottom: "24px" }}>
        New Service
      </h1>

      <div className="card">
        {error && <div className="error-box" style={{ marginBottom: "14px" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "14px" }}>
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
          <label className="label">Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={save} disabled={saving} className="btn-gold" style={{ width: "auto" }}>
            {saving ? "Saving..." : "Create Service"}
          </button>
          <button onClick={() => router.push("/admin/services")} className="btn-gold" style={{ width: "auto", background: "var(--muted)" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}