"use client";

import { useEffect, useState } from "react";
import { useAuth, API_BASE } from "../../context/auth-context";

interface Stats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalBookings: number;
  unreadEnquiries: number;
  totalEnquiries: number;
  totalServices: number;
}

async function getCount(url: string, token: string): Promise<number> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  return data?.data?.totalCount ?? 0;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const [pending, confirmed, completed, cancelled, totalBookings, unreadEnquiries, totalEnquiries, servicesRes, paidRes] =
        await Promise.all([
          getCount(`${API_BASE}/api/Booking?status=Pending&pageSize=1`, token),
          getCount(`${API_BASE}/api/Booking?status=Confirmed&pageSize=1`, token),
          getCount(`${API_BASE}/api/Booking?status=Completed&pageSize=1`, token),
          getCount(`${API_BASE}/api/Booking?status=Cancelled&pageSize=1`, token),
          getCount(`${API_BASE}/api/Booking?pageSize=1`, token),
          getCount(`${API_BASE}/api/Enquiry?isRead=false&pageSize=1`, token),
          getCount(`${API_BASE}/api/Enquiry?pageSize=1`, token),
          fetch(`${API_BASE}/api/Service?pageSize=1`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
          fetch(`${API_BASE}/api/Booking?paymentStatus=FullyPaid&pageSize=20`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        ]);

      const recentRevenue = (paidRes?.data?.data ?? []).reduce(
        (sum: number, b: { amountPaid?: number }) => sum + (b.amountPaid ?? 0), 0
      );

      setStats({
        pending, confirmed, completed, cancelled, totalBookings,
        unreadEnquiries, totalEnquiries,
        totalServices: servicesRes?.data?.totalCount ?? 0,
      });
      setLoading(false);
    };
    load();
  }, [token]);

  const cards = stats ? [
    { label: "Total Bookings", value: stats.totalBookings },
    { label: "Pending Orders", value: stats.pending },
    { label: "Confirmed Orders", value: stats.confirmed },
    { label: "Completed Orders", value: stats.completed },
    { label: "Cancelled Orders", value: stats.cancelled },
    { label: "Unread Enquiries", value: `${stats.unreadEnquiries} / ${stats.totalEnquiries}` },
    { label: "Active Services", value: stats.totalServices },
  ] : [];

  return (
    <div style={{ padding: "clamp(24px, 3vw, 48px)" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, color: "var(--text)", marginBottom: "28px" }}>
        Overview
      </h1>

      {loading && <div className="spinner" />}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {cards.map((c) => (
            <div key={c.label} className="card" style={{ padding: "20px" }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
                {c.label}
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "var(--text)" }}>
                {c.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}