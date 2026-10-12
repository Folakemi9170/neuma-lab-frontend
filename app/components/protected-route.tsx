"use client";

import { useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Admin" | "Client";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requiredRole && user.userRole !== requiredRole) {
      router.push("/");
      return;
    }
  }, [user, isLoading, router, pathname, requiredRole]);

  if (isLoading) {
    return (
      <div className="spinner-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && user.userRole !== requiredRole) return null;

  return <>{children}</>;
}