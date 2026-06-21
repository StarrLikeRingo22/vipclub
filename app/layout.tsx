import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIP Club — Loyalty & Rewards",
  description:
    "Join the VIP Club. Earn rewards every visit, get reminders when you're due, and unlock member-only perks.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3A2C30",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-ink">{children}</body>
    </html>
  );
}
