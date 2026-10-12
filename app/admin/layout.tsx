"use client";

import ProtectedRoute from "../components/protected-route";
import AdminSidebar from "../components/admin-sidebar";
import { useIsMobile } from "../hooks/use-is-mobile";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <ProtectedRoute requiredRole="Admin">
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        background: "var(--warm)",
      }}>
        <AdminSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </ProtectedRoute>
  );
}