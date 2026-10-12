import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/auth-context";
import NavbarWrapper from "./components/navbar-wrapper";

export const metadata: Metadata = {
  title: "NeumaLab",
  description: "We design and build stunning residential and commercial spaces from concept to completion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}