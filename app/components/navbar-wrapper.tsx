"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  // Home page has its own built-in navbar; admin pages have their own sidebar
  if (pathname === "/" || pathname.startsWith("/admin")) return null;
  return <Navbar />;
}