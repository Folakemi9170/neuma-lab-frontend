"use client";

import { useAuth } from "../context/auth-context";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Services", href: "/services" },
    { name: "Reviews", href: "/#reviews" },
    { name: "FAQ", href: "/#faq" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px, 4vw, 80px)",
        height: "clamp(64px, 8vh, 96px)",
        background: "rgba(255,255,255,0.97)",
        borderBottom: "0.5px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(8px)",
      }}>
        {/* Logo - matches homepage style */}
        <Link href="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(22px, 2.4vw, 34px)",
          fontWeight: 600,
          color: "var(--text)",
          letterSpacing: "1px",
          textDecoration: "none",
        }}>
          Neuma<span style={{ color: "var(--gold)" }}>Lab</span>
        </Link>

        {/* Hamburger button only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            padding: "6px",
          }}
        >
          <span style={{ width: "22px", height: "1.5px", background: menuOpen ? "var(--gold)" : "var(--text)", display: "block", transition: "background 0.2s" }} />
          <span style={{ width: "22px", height: "1.5px", background: menuOpen ? "var(--gold)" : "var(--text)", display: "block", transition: "background 0.2s" }} />
          <span style={{ width: "14px", height: "1.5px", background: menuOpen ? "var(--gold)" : "var(--text)", display: "block", transition: "background 0.2s" }} />
        </button>
      </nav>

      {/* Menu overlay */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(14,11,8,0.35)",
              zIndex: 150,
            }}
          />
          <div style={{
            position: "fixed",
            top: 0, right: 0,
            width: "min(100%, 360px)",
            height: "100vh",
            background: "#fff",
            zIndex: 200,
            padding: "clamp(60px, 8vh, 100px) clamp(24px, 4vw, 48px)",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.06)",
          }}>
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                position: "absolute",
                top: "clamp(16px, 2vw, 24px)",
                right: "clamp(16px, 2vw, 24px)",
                background: "none",
                border: "0.5px solid var(--border)",
                borderRadius: "50%",
                width: "36px", height: "36px",
                cursor: "pointer",
                fontSize: "16px",
                color: "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>

            <p className="eyebrow" style={{ marginBottom: "28px" }}>Menu</p>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 300,
                  color: "var(--muted)",
                  textDecoration: "none",
                  padding: "clamp(10px, 1.2vw, 16px) 0",
                  borderBottom: "0.5px solid var(--border)",
                  display: "block",
                  transition: "color 0.2s, padding-left 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.paddingLeft = "8px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.paddingLeft = "0";
                }}
              >
                {link.name}
              </Link>
            ))}

            <div style={{ marginTop: "auto", paddingTop: "32px" }}>
              {user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", color: "var(--muted)" }}>
                    Signed in as <strong style={{ color: "var(--text)" }}>{user.fullName}</strong>
                  </p>

                  <Link href={user.userRole === "Admin" ? "/admin/dashboard" : "/client/dashboard"}                    
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text)",
                      textDecoration: "none",
                    }}
                  >
                    {user.userRole === "Admin" ? "Admin " : "My Bookings"}                  
                    </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "13px",
                    color: "#b85c5c",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                  }}>
                    Logout
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p className="eyebrow" style={{ marginBottom: "4px" }}>Ready to start?</p>

                  {/* Sign In | Get Started row - same color */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Link 
                      href="/login" 
                      onClick={() => setMenuOpen(false)} 
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "14px",
                        color: "var(--muted)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    >
                      Sign In
                    </Link>
                    <span style={{ color: "var(--border)", fontSize: "14px" }}>|</span>
                    <Link 
                      href="/register" 
                      onClick={() => setMenuOpen(false)} 
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "14px",
                        color: "var(--muted)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}