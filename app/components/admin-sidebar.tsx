"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { useIsMobile } from "../hooks/use-is-mobile";

const links = [
  { name: "Overview", href: "/admin/dashboard" },
  { name: "Bookings", href: "/admin/bookings" },
  { name: "Services", href: "/admin/services" },
  { name: "Categories", href: "/admin/categories" },
  { name: "Enquiries", href: "/admin/enquiries" },
  { name: "Reviews", href: "/admin/reviews" },
  { name: "FAQ", href: "/admin/faq" },
  { name: "Users", href: "/admin/users" },
  { name: "Payments", href: "/admin/payments" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const sidebarContent = (
    <>
      <Link href="/admin/dashboard" style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: "22px",
        fontWeight: 600, color: "var(--text)", textDecoration: "none",
        marginBottom: "28px", display: "block",
      }}>
        Dashboard <span style={{ color: "var(--gold)" }}></span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} style={{
              fontFamily: "'Outfit', sans-serif", fontSize: "13px", fontWeight: active ? 500 : 400,
              color: active ? "var(--text)" : "var(--muted)",
              background: active ? "var(--warm)" : "transparent",
              padding: "10px 12px", borderRadius: "4px", textDecoration: "none",
            }}>
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: "16px", marginTop: "16px" }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "8px" }}>
          {user?.fullName} | {user?.userRole}
        </p>
        <button onClick={logout} style={{
          fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "#b85c5c",
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}>
          Logout
        </button>
      </div>
    </>
  );

  if (!isMobile) {
    return (
      <aside style={{
        width: "220px", flexShrink: 0, background: "#fff",
        borderRight: "0.5px solid var(--border)",
        position: "sticky", top: 0, height: "100vh", alignSelf: "flex-start",
        overflowY: "auto",
        padding: "24px 16px", display: "flex", flexDirection: "column",
      }}>
        {sidebarContent}
      </aside>
    );
  }

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", background: "#fff", borderBottom: "0.5px solid var(--border)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "20px",
          fontWeight: 600, color: "var(--text)", textDecoration: "none",
        }}>
          Neuma<span style={{ color: "var(--gold)" }}>Lab</span>
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open admin menu"
          style={{ background: "none", border: "0.5px solid var(--border)", borderRadius: "4px", padding: "8px 12px", cursor: "pointer", fontSize: "13px", fontFamily: "'Outfit', sans-serif", color: "var(--text)" }}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(14,11,8,0.35)", zIndex: 150 }}
          />
          <div style={{
            position: "fixed", top: 0, left: 0, width: "min(80%, 280px)", height: "100vh",
            background: "#fff", zIndex: 200, padding: "24px 16px",
            display: "flex", flexDirection: "column", boxShadow: "8px 0 40px rgba(0,0,0,0.06)",
            overflowY: "auto",
          }}>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{
                alignSelf: "flex-end", background: "none", border: "0.5px solid var(--border)",
                borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer",
                fontSize: "14px", color: "var(--muted)", marginBottom: "16px",
              }}
            >
              ✕
            </button>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}